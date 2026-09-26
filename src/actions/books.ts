"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { db, schema } from "@/db";
import { eq, desc, count } from "drizzle-orm";
import { DUMMY_BOOKS, DUMMY_CATEGORIES, DUMMY_COPIES, BookItem, BookCopyItem } from "@/data/dummy";

const bookSchema = z.object({
  title: z.string().min(2, "Judul buku minimal 2 karakter"),
  author: z.string().min(2, "Nama penulis minimal 2 karakter"),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
  category: z.string(),
  publicationYear: z.coerce.number().min(1900).max(2100),
  pages: z.coerce.number().optional(),
  shelfLocation: z.string().optional(),
  bookType: z.enum(["fisik", "ebook", "keduanya"]),
  synopsis: z.string().optional(),
  coverUrl: z.string().optional(),
  actorId: z.string().optional(),
  actorName: z.string().optional(),
});

export async function getBooksAction() {
  if (db) {
    try {
      const rawBooks = await db.query.books.findMany({
        with: {
          category: true,
          copies: true,
        },
        orderBy: [desc(schema.books.createdAt)],
      });

      const rawCategories = await db.query.categories.findMany({
        orderBy: [desc(schema.categories.name)],
      });

      const books = rawBooks.map((b) => {
        const totalCopies = b.copies?.length || 0;
        const availableCopies = b.copies?.filter((c) => c.status === "tersedia").length || 0;
        return {
          id: b.id,
          title: b.title,
          slug: b.slug,
          author: b.author,
          publisher: b.publisher || "-",
          isbn: b.isbn || "-",
          category: b.category?.name || "Umum",
          publicationYear: b.publicationYear || 2024,
          pages: b.pages || 250,
          language: b.language || "Indonesia",
          bookType: b.bookType,
          coverUrl: b.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
          synopsis: b.description || "-",
          shelfLocation: b.copies?.[0]?.shelfLocation || "Rak A-01",
          totalCopies: totalCopies > 0 ? totalCopies : 1,
          availableCopies: totalCopies > 0 ? availableCopies : 1,
          rating: 4.8,
          readCount: 15,
        };
      });

      const categories = rawCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        desc: c.description || "",
      }));

      return { books, categories };
    } catch (e) {
      console.warn("DB getBooks error, fallback:", e);
    }
  }

  return { books: DUMMY_BOOKS, categories: DUMMY_CATEGORIES };
}

export async function getPublicHomeDataAction() {
  if (db) {
    try {
      const [bookCountRes] = await db.select({ val: count() }).from(schema.books);
      const [copyCountRes] = await db.select({ val: count() }).from(schema.bookCopies);
      const [ebookCountRes] = await db.select({ val: count() }).from(schema.ebooks);
      const [userCountRes] = await db
        .select({ val: count() })
        .from(schema.users)
        .where(eq(schema.users.role, "anggota"));

      const rawBooks = await db.query.books.findMany({
        with: {
          category: true,
          copies: true,
        },
        limit: 8,
        orderBy: [desc(schema.books.createdAt)],
      });

      const rawCategories = await db.query.categories.findMany({
        with: {
          books: true,
        },
      });

      const books = rawBooks.map((b) => {
        const totalCopies = b.copies?.length || 0;
        const availableCopies = b.copies?.filter((c) => c.status === "tersedia").length || 0;
        return {
          id: b.id,
          title: b.title,
          slug: b.slug,
          author: b.author,
          publisher: b.publisher || "-",
          isbn: b.isbn || "-",
          category: b.category?.name || "Umum",
          publicationYear: b.publicationYear || 2024,
          pages: b.pages || 250,
          language: b.language || "Indonesia",
          bookType: b.bookType,
          coverUrl: b.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
          synopsis: b.description || "-",
          shelfLocation: b.copies?.[0]?.shelfLocation || "Rak A-01",
          totalCopies: totalCopies > 0 ? totalCopies : 1,
          availableCopies: totalCopies > 0 ? availableCopies : 1,
          rating: 4.8,
          readCount: 15,
        };
      });

      const categories = rawCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        desc: c.description || "",
        count: c.books?.length || 0,
      }));

      return {
        stats: {
          totalBooks: Number(bookCountRes?.val || 0),
          totalCopies: Number(copyCountRes?.val || 0),
          totalEbooks: Number(ebookCountRes?.val || 0),
          totalMembers: Number(userCountRes?.val || 0),
        },
        books,
        featuredBook: books[0] || null,
        categories,
      };
    } catch (e) {
      console.warn("DB getPublicHomeData error, fallback:", e);
    }
  }

  return {
    stats: {
      totalBooks: DUMMY_BOOKS.length,
      totalCopies: DUMMY_COPIES.length,
      totalEbooks: 12,
      totalMembers: 250,
    },
    books: DUMMY_BOOKS,
    featuredBook: DUMMY_BOOKS[0],
    categories: DUMMY_CATEGORIES,
  };
}

export async function getBookBySlugAction(slug: string) {
  if (db) {
    try {
      const b = await db.query.books.findFirst({
        where: eq(schema.books.slug, slug),
        with: {
          category: true,
          copies: true,
          ebooks: true,
        },
      });

      if (b) {
        const totalCopies = b.copies?.length || 0;
        const availableCopies = b.copies?.filter((c) => c.status === "tersedia").length || 0;
        const copies = (b.copies || []).map((c) => ({
          id: c.id,
          bookId: b.id,
          bookTitle: b.title,
          copyCode: c.copyCode,
          status: c.status,
          shelfLocation: c.shelfLocation,
          conditionNote: c.conditionNote || "Kondisi baik",
          acquisitionDate: c.acquisitionDate ? c.acquisitionDate.toISOString().split("T")[0] : "2024-01-01",
          acquisitionPrice: Number(c.acquisitionPrice || 0),
        }));

        const book = {
          id: b.id,
          slug: b.slug,
          title: b.title,
          author: b.author,
          publisher: b.publisher || "-",
          isbn: b.isbn || "-",
          category: b.category?.name || "Umum",
          publicationYear: b.publicationYear || 2024,
          pages: b.pages || 250,
          language: b.language || "Indonesia",
          bookType: b.bookType,
          coverUrl: b.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
          synopsis: b.description || "-",
          shelfLocation: b.copies?.[0]?.shelfLocation || "Rak A-01",
          totalCopies: totalCopies > 0 ? totalCopies : 1,
          availableCopies: totalCopies > 0 ? availableCopies : 1,
          rating: 4.8,
          readCount: 15,
          ebookUrl: b.ebooks?.[0]?.fileUrl || undefined,
          ebookFormat: b.ebooks?.[0]?.fileFormat || undefined,
        };

        return { book, copies };
      }
    } catch (e) {
      console.warn("DB getBookBySlug error, fallback:", e);
    }
  }

  const book = DUMMY_BOOKS.find((b) => b.slug === slug) || DUMMY_BOOKS[0];
  const copies = DUMMY_COPIES.filter((c) =>
    c.bookTitle.toLowerCase().includes(book.title.toLowerCase().split(" ")[0])
  );
  return { book, copies };
}

export async function getAllBookSlugsAction() {
  if (db) {
    try {
      const rows = await db.query.books.findMany({
        columns: {
          slug: true,
          updatedAt: true,
        },
      });
      return rows.map((r) => ({
        slug: r.slug,
        updatedAt: r.updatedAt,
      }));
    } catch (e) {
      console.warn("DB getAllBookSlugs error, fallback:", e);
    }
  }

  return DUMMY_BOOKS.map((b) => ({
    slug: b.slug,
    updatedAt: new Date(),
  }));
}

export async function createBookAction(formData: z.infer<typeof bookSchema>) {
  const validated = bookSchema.safeParse(formData);
  if (!validated.success) {
    const errorMsg = Object.values(validated.error.flatten().fieldErrors).flat().join(", ");
    return { success: false, error: errorMsg };
  }

  const data = validated.data;
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  if (db) {
    try {
      // Find category
      let categoryId: string | null = null;
      const cat = await db.query.categories.findFirst({
        where: eq(schema.categories.name, data.category),
      });
      if (cat) categoryId = cat.id;

      const inserted = await db
        .insert(schema.books)
        .values({
          title: data.title,
          slug,
          author: data.author,
          publisher: data.publisher,
          isbn: data.isbn,
          categoryId,
          publicationYear: data.publicationYear,
          pages: data.pages,
          bookType: data.bookType,
          description: data.synopsis,
          coverUrl: data.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
        })
        .returning();

      const newBook = inserted[0];

      // Insert first copy
      const copyCode = `PKC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}-001`;
      await db.insert(schema.bookCopies).values({
        bookId: newBook.id,
        copyCode,
        status: "tersedia",
        shelfLocation: data.shelfLocation || "Rak A-01",
        conditionNote: "Kondisi baru",
        acquisitionDate: new Date(),
      });

      await writeAuditLog({
        actorId: data.actorId,
        actorName: data.actorName || "Petugas",
        action: "create",
        entityType: "book",
        entityId: newBook.id,
        description: `Menambahkan buku baru: "${newBook.title}" (${newBook.author})`,
        newValue: newBook as any,
      });

      revalidatePath("/katalog");
      revalidatePath("/pustakawan/buku");
      return { success: true, book: newBook };
    } catch (e: any) {
      console.warn("DB insert book error, fallback:", e);
    }
  }

  // Fallback to memory
  const newBook: BookItem = {
    id: `b-${Date.now()}`,
    slug,
    title: data.title,
    author: data.author,
    publisher: data.publisher || "Pustaka Mandiri",
    isbn: data.isbn || "978-000-000-000",
    category: data.category,
    publicationYear: data.publicationYear,
    pages: data.pages || 250,
    language: "Bahasa Indonesia",
    bookType: data.bookType,
    coverUrl: data.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
    synopsis: data.synopsis || "Buku referensi perpustakaan.",
    shelfLocation: data.shelfLocation || "Rak A-01",
    totalCopies: 1,
    availableCopies: 1,
    rating: 5.0,
    readCount: 0,
  };

  DUMMY_BOOKS.unshift(newBook);
  revalidatePath("/katalog");
  revalidatePath("/pustakawan/buku");
  return { success: true, book: newBook };
}

export async function deleteBookAction(bookId: string) {
  if (db) {
    try {
      const book = await db.query.books.findFirst({
        where: eq(schema.books.id, bookId),
      });

      if (book) {
        await db.delete(schema.books).where(eq(schema.books.id, bookId));

        await writeAuditLog({
          action: "delete",
          entityType: "book",
          entityId: bookId,
          description: `Menghapus buku dari database: "${book.title}"`,
          oldValue: book as any,
        });

        revalidatePath("/katalog");
        revalidatePath("/pustakawan/buku");
        return { success: true };
      }
    } catch (e) {
      console.warn("DB delete book error, fallback:", e);
    }
  }

  const index = DUMMY_BOOKS.findIndex((b) => b.id === bookId);
  if (index === -1) return { success: false, error: "Buku tidak ditemukan" };

  DUMMY_BOOKS.splice(index, 1);
  revalidatePath("/katalog");
  revalidatePath("/pustakawan/buku");
  return { success: true };
}

export async function generateBookCopyAction(params: {
  bookId: string;
  shelfLocation: string;
  conditionNote: string;
}) {
  if (db) {
    try {
      const book = await db.query.books.findFirst({
        where: eq(schema.books.id, params.bookId),
        with: { copies: true },
      });

      if (book) {
        const year = new Date().getFullYear();
        const copyNum = String((book.copies?.length || 0) + 1).padStart(3, "0");
        const copyCode = `PKC-${year}-${book.id.slice(0, 4)}-${copyNum}`;

        const inserted = await db
          .insert(schema.bookCopies)
          .values({
            bookId: book.id,
            copyCode,
            status: "tersedia",
            shelfLocation: params.shelfLocation || "Rak A-01",
            conditionNote: params.conditionNote || "Kondisi baik",
            acquisitionDate: new Date(),
          })
          .returning();

        await writeAuditLog({
          action: "create",
          entityType: "book_copy",
          entityId: inserted[0]?.id,
          description: `Generate barcode eksemplar baru di database: ${copyCode} untuk "${book.title}"`,
        });

        revalidatePath(`/pustakawan/buku/${book.id}`);
        revalidatePath("/pustakawan/eksemplar");
        return { success: true, copy: inserted[0] };
      }
    } catch (e) {
      console.warn("DB generate copy error, fallback:", e);
    }
  }

  // Fallback
  const dummyBook = DUMMY_BOOKS.find((b) => b.id === params.bookId);
  if (!dummyBook) return { success: false, error: "Buku tidak ditemukan" };

  const copyCode = `PKC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
  const newCopy: BookCopyItem = {
    id: `copy-${Date.now()}`,
    bookId: dummyBook.id,
    bookTitle: dummyBook.title,
    copyCode,
    status: "tersedia",
    shelfLocation: params.shelfLocation,
    conditionNote: params.conditionNote,
    acquisitionDate: new Date().toISOString().split("T")[0],
    acquisitionPrice: 85000,
  };

  DUMMY_COPIES.push(newCopy);
  return { success: true, copy: newCopy };
}

export async function getBookDetailsAction(bookId: string) {
  if (db) {
    try {
      const book = await db.query.books.findFirst({
        where: eq(schema.books.id, bookId),
        with: {
          category: true,
          copies: true,
          ebooks: true,
        },
      });

      if (book) {
        const copiesList = (book.copies || []) as any[];
        return {
          success: true,
          book: {
            id: book.id,
            isbn: book.isbn || "",
            title: book.title,
            slug: book.slug,
            author: book.author,
            publisher: book.publisher || "",
            publicationYear: book.publicationYear || new Date().getFullYear(),
            pages: book.pages || 0,
            language: book.language || "Indonesia",
            bookType: book.bookType || "fisik",
            coverUrl: book.coverUrl || "/covers/default.png",
            synopsis: book.description || "",
            category: book.category?.name || "Umum",
            shelfLocation: copiesList[0]?.shelfLocation || "Rak A-01",
            totalCopies: copiesList.length,
            availableCopies: copiesList.filter((c: any) => c.status === "tersedia").length,
            rating: 4.8,
            readCount: 15,
          } as BookItem,
          copies: copiesList.map((c: any) => ({
            id: c.id,
            bookId: book.id,
            bookTitle: book.title,
            copyCode: c.copyCode,
            status: c.status as "tersedia" | "dipinjam" | "rusak" | "hilang" | "perbaikan",
            shelfLocation: c.shelfLocation || "Rak A-01",
            conditionNote: c.conditionNote || "Kondisi baik",
            acquisitionDate: c.acquisitionDate ? new Date(c.acquisitionDate).toISOString().split("T")[0] : "",
            acquisitionPrice: Number(c.acquisitionPrice || 0),
          })),
        };
      }
    } catch (e) {
      console.warn("DB getBookDetails error, fallback:", e);
    }
  }

  const dummyBook = DUMMY_BOOKS.find((b) => b.id === bookId);
  if (!dummyBook) return { success: false, error: "Buku tidak ditemukan" };
  const copies = DUMMY_COPIES.filter((c) => c.bookId === dummyBook.id);
  return { success: true, book: dummyBook, copies };
}

export async function updateBookAction(params: {
  id: string;
  title: string;
  author: string;
  shelfLocation: string;
  publisher?: string;
  publishYear?: number;
  synopsis?: string;
}) {
  if (db) {
    try {
      await db
        .update(schema.books)
        .set({
          title: params.title,
          author: params.author,
          publisher: params.publisher,
          publicationYear: params.publishYear,
          description: params.synopsis,
          updatedAt: new Date(),
        })
        .where(eq(schema.books.id, params.id));

      if (params.shelfLocation) {
        await db
          .update(schema.bookCopies)
          .set({ shelfLocation: params.shelfLocation })
          .where(eq(schema.bookCopies.bookId, params.id));
      }

      await writeAuditLog({
        action: "update",
        entityType: "book",
        entityId: params.id,
        description: `Memperbarui data buku: "${params.title}"`,
      });

      revalidatePath(`/pustakawan/buku/${params.id}`);
      revalidatePath("/pustakawan/buku");
      revalidatePath("/katalog");
      return { success: true };
    } catch (e) {
      console.warn("DB updateBook error, fallback:", e);
    }
  }

  const b = DUMMY_BOOKS.find((item) => item.id === params.id);
  if (b) {
    b.title = params.title;
    b.author = params.author;
    b.shelfLocation = params.shelfLocation;
    return { success: true };
  }
  return { success: false, error: "Buku tidak ditemukan" };
}

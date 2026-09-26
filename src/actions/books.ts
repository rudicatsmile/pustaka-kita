"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { DUMMY_BOOKS, DUMMY_COPIES, BookItem, BookCopyItem } from "@/data/dummy";

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

export async function createBookAction(formData: z.infer<typeof bookSchema>) {
  const validated = bookSchema.safeParse(formData);
  if (!validated.success) {
    const errorMsg = Object.values(validated.error.flatten().fieldErrors).flat().join(", ");
    return { success: false, error: errorMsg };
  }

  const data = validated.data;
  const newBook: BookItem = {
    id: `b-${Date.now()}`,
    slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
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

  // Auto audit log entry
  await writeAuditLog({
    action: "create",
    entityType: "book",
    entityId: newBook.id,
    description: `Menambahkan buku baru: "${newBook.title}" (${newBook.author})`,
    newValue: newBook as any,
  });

  revalidatePath("/katalog");
  revalidatePath("/pustakawan/buku");
  return { success: true, book: newBook };
}

export async function deleteBookAction(bookId: string) {
  const index = DUMMY_BOOKS.findIndex((b) => b.id === bookId);
  if (index === -1) return { success: false, error: "Buku tidak ditemukan" };

  const removedBook = DUMMY_BOOKS.splice(index, 1)[0];

  // Auto audit log
  await writeAuditLog({
    action: "delete",
    entityType: "book",
    entityId: bookId,
    description: `Menghapus buku dari katalog: "${removedBook.title}"`,
    oldValue: removedBook as any,
  });

  revalidatePath("/katalog");
  revalidatePath("/pustakawan/buku");
  return { success: true };
}

export async function generateBookCopyAction(params: {
  bookId: string;
  shelfLocation: string;
  conditionNote: string;
}) {
  const book = DUMMY_BOOKS.find((b) => b.id === params.bookId);
  if (!book) return { success: false, error: "Buku tidak ditemukan" };

  const year = new Date().getFullYear();
  const existingCount = DUMMY_COPIES.filter((c) => c.bookId === params.bookId).length;
  const copyNumber = String(existingCount + 1).padStart(3, "0");
  const copyCode = `PKC-${year}-${book.id.replace(/\D/g, "").padStart(3, "0") || "001"}-${copyNumber}`;

  const newCopy: BookCopyItem = {
    id: `copy-${Date.now()}`,
    bookId: book.id,
    bookTitle: book.title,
    copyCode,
    status: "tersedia",
    shelfLocation: params.shelfLocation || book.shelfLocation,
    conditionNote: params.conditionNote || "Kondisi baru, siap dipinjam",
    acquisitionDate: new Date().toISOString().split("T")[0],
    acquisitionPrice: 85000,
  };

  DUMMY_COPIES.push(newCopy);
  book.totalCopies += 1;
  book.availableCopies += 1;

  await writeAuditLog({
    action: "create",
    entityType: "book_copy",
    entityId: newCopy.id,
    description: `Generate barcode eksemplar baru: ${newCopy.copyCode} untuk "${book.title}"`,
    newValue: newCopy as any,
  });

  revalidatePath(`/pustakawan/buku/${book.id}`);
  revalidatePath("/pustakawan/eksemplar");
  return { success: true, copy: newCopy };
}

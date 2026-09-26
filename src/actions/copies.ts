"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { db, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import { DUMMY_COPIES, DUMMY_BOOKS, BookCopyItem } from "@/data/dummy";

export async function getAllCopiesAction() {
  if (db) {
    try {
      const rows = await db.query.bookCopies.findMany({
        with: {
          book: true,
        },
        orderBy: [desc(schema.bookCopies.createdAt)],
      });

      return rows.map((c) => ({
        id: c.id,
        bookId: c.bookId,
        bookTitle: c.book?.title || "Buku",
        copyCode: c.copyCode,
        status: c.status,
        shelfLocation: c.shelfLocation,
        conditionNote: c.conditionNote || "Kondisi baik",
        acquisitionDate: c.acquisitionDate ? c.acquisitionDate.toISOString().split("T")[0] : "2024-01-01",
        acquisitionPrice: Number(c.acquisitionPrice || 75000),
      }));
    } catch (e) {
      console.warn("DB getAllCopies error, fallback:", e);
    }
  }

  return DUMMY_COPIES;
}

export async function createBookCopyAction(params: {
  bookId: string;
  shelfLocation?: string;
  conditionNote?: string;
  acquisitionPrice?: number;
}) {
  if (db) {
    try {
      const book = await db.query.books.findFirst({
        where: eq(schema.books.id, params.bookId),
        with: { copies: true },
      });

      if (!book) return { success: false, error: "Buku tidak ditemukan." };

      const copyIndex = (book.copies?.length || 0) + 1;
      const copyCode = `PKC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}-${copyIndex.toString().padStart(3, "0")}`;

      const [newCopy] = await db
        .insert(schema.bookCopies)
        .values({
          bookId: book.id,
          copyCode,
          status: "tersedia",
          shelfLocation: params.shelfLocation || "Rak A-01",
          conditionNote: params.conditionNote || "Kondisi baru",
          acquisitionPrice: params.acquisitionPrice ? params.acquisitionPrice.toString() : "75000",
          acquisitionDate: new Date(),
        })
        .returning();

      await writeAuditLog({
        action: "create",
        entityType: "book_copy",
        entityId: newCopy.id,
        description: `Penambahan eksemplar baru [${newCopy.copyCode}] untuk buku "${book.title}"`,
        newValue: newCopy,
      });

      revalidatePath("/pustakawan/eksemplar");
      revalidatePath("/pustakawan/buku");
      revalidatePath(`/pustakawan/buku/${book.id}`);
      return { success: true, copy: newCopy };
    } catch (e: any) {
      console.warn("DB create copy error, fallback:", e);
    }
  }

  const book = DUMMY_BOOKS.find((b) => b.id === params.bookId) || DUMMY_BOOKS[0];
  const newCopy: BookCopyItem = {
    id: `copy-${Date.now()}`,
    bookId: book.id,
    bookTitle: book.title,
    copyCode: `PKC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}-001`,
    status: "tersedia",
    shelfLocation: params.shelfLocation || "Rak A-01",
    conditionNote: params.conditionNote || "Kondisi baru",
    acquisitionDate: new Date().toISOString().split("T")[0],
    acquisitionPrice: params.acquisitionPrice || 75000,
  };

  DUMMY_COPIES.unshift(newCopy);
  revalidatePath("/pustakawan/eksemplar");
  return { success: true, copy: newCopy };
}

export async function updateBookCopyStatusAction(
  copyId: string,
  newStatus: "tersedia" | "dipinjam" | "rusak" | "hilang" | "perbaikan"
) {
  if (db) {
    try {
      const copy = await db.query.bookCopies.findFirst({
        where: eq(schema.bookCopies.id, copyId),
        with: { book: true },
      });

      if (!copy) return { success: false, error: "Eksemplar tidak ditemukan." };

      const oldStatus = copy.status;
      await db
        .update(schema.bookCopies)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(schema.bookCopies.id, copyId));

      await writeAuditLog({
        action: "update",
        entityType: "book_copy",
        entityId: copy.id,
        description: `Perubahan status eksemplar [${copy.copyCode}] dari "${oldStatus}" menjadi "${newStatus}"`,
        oldValue: { status: oldStatus },
        newValue: { status: newStatus },
      });

      revalidatePath("/pustakawan/eksemplar");
      revalidatePath("/pustakawan/buku");
      return { success: true };
    } catch (e: any) {
      console.warn("DB update copy status error, fallback:", e);
    }
  }

  const copy = DUMMY_COPIES.find((c) => c.id === copyId);
  if (!copy) return { success: false, error: "Eksemplar tidak ditemukan." };
  copy.status = newStatus;
  revalidatePath("/pustakawan/eksemplar");
  return { success: true };
}

export async function deleteBookCopyAction(copyId: string) {
  if (db) {
    try {
      const copy = await db.query.bookCopies.findFirst({
        where: eq(schema.bookCopies.id, copyId),
        with: { book: true },
      });

      if (!copy) return { success: false, error: "Eksemplar tidak ditemukan." };
      if (copy.status === "dipinjam") {
        return { success: false, error: "Eksemplar sedang dalam masa peminjaman aktif dan tidak dapat dihapus." };
      }

      await db.delete(schema.bookCopies).where(eq(schema.bookCopies.id, copyId));

      await writeAuditLog({
        action: "delete",
        entityType: "book_copy",
        entityId: copy.id,
        description: `Penghapusan eksemplar [${copy.copyCode}] buku "${copy.book?.title}"`,
        oldValue: copy,
      });

      revalidatePath("/pustakawan/eksemplar");
      revalidatePath("/pustakawan/buku");
      return { success: true };
    } catch (e: any) {
      console.warn("DB delete copy error, fallback:", e);
    }
  }

  const index = DUMMY_COPIES.findIndex((c) => c.id === copyId);
  if (index !== -1) DUMMY_COPIES.splice(index, 1);
  revalidatePath("/pustakawan/eksemplar");
  return { success: true };
}

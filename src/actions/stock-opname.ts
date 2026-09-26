"use server";

import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { eq, sql, desc, inArray } from "drizzle-orm";
import { DUMMY_COPIES, DUMMY_BOOKS } from "@/data/dummy";
import { writeAuditLog } from "@/lib/audit";

export interface ShelfSummary {
  shelfName: string;
  totalCopies: number;
  availableCount: number;
  borrowedCount: number;
}

export interface ShelfCopyItem {
  id: string;
  copyCode: string;
  title: string;
  author: string;
  shelfLocation: string;
  status: string;
  conditionNote: string | null;
  coverUrl: string | null;
}

export interface AuditScanResult {
  status: "MATCH" | "MISPLACED" | "NOT_FOUND";
  scannedCode: string;
  copy?: ShelfCopyItem;
  actualShelf?: string;
  message: string;
}

export interface BeritaAcaraReport {
  reportNumber: string;
  date: string;
  shelfName: string;
  auditorName: string;
  totalRegistered: number;
  totalFound: number;
  totalMisplaced: number;
  totalMissing: number;
  accuracyPercentage: number;
  foundItems: ShelfCopyItem[];
  misplacedItems: Array<ShelfCopyItem & { actualShelf: string }>;
  missingItems: ShelfCopyItem[];
  notes?: string;
}

/**
 * Mengambil daftar seluruh rak unik dari database beserta total eksemplar.
 */
export async function getShelvesListAction(): Promise<ShelfSummary[]> {
  if (db) {
    try {
      const copies = await db.query.bookCopies.findMany({
        columns: {
          id: true,
          shelfLocation: true,
          status: true,
        },
      });

      if (copies.length > 0) {
        const shelfMap = new Map<string, { total: number; available: number; borrowed: number }>();

        for (const c of copies) {
          const shelf = c.shelfLocation?.trim() || "Rak Tanpa Label";
          const current = shelfMap.get(shelf) || { total: 0, available: 0, borrowed: 0 };
          current.total += 1;
          if (c.status === "tersedia") current.available += 1;
          if (c.status === "dipinjam") current.borrowed += 1;
          shelfMap.set(shelf, current);
        }

        const result: ShelfSummary[] = [];
        shelfMap.forEach((val, key) => {
          result.push({
            shelfName: key,
            totalCopies: val.total,
            availableCount: val.available,
            borrowedCount: val.borrowed,
          });
        });

        return result.sort((a, b) => a.shelfName.localeCompare(b.shelfName));
      }
    } catch (e) {
      console.warn("DB getShelvesListAction error, fallback to dummy:", e);
    }
  }

  // Fallback ke dummy copies
  const shelfMap = new Map<string, { total: number; available: number; borrowed: number }>();
  for (const c of DUMMY_COPIES) {
    const shelf = c.shelfLocation || "Rak A-01";
    const current = shelfMap.get(shelf) || { total: 0, available: 0, borrowed: 0 };
    current.total += 1;
    if (c.status === "tersedia") current.available += 1;
    if (c.status === "dipinjam") current.borrowed += 1;
    shelfMap.set(shelf, current);
  }

  const result: ShelfSummary[] = [];
  shelfMap.forEach((val, key) => {
    result.push({
      shelfName: key,
      totalCopies: val.total,
      availableCount: val.available,
      borrowedCount: val.borrowed,
    });
  });

  return result.sort((a, b) => a.shelfName.localeCompare(b.shelfName));
}

/**
 * Mengambil daftar eksemplar yang terdaftar pada rak tertentu.
 */
export async function getShelfTargetCopiesAction(shelfName: string): Promise<ShelfCopyItem[]> {
  const cleanShelf = shelfName.trim();

  if (db) {
    try {
      const copies = await db.query.bookCopies.findMany({
        where: sql`lower(${schema.bookCopies.shelfLocation}) = lower(${cleanShelf})`,
        with: {
          book: true,
        },
        orderBy: [desc(schema.bookCopies.createdAt)],
      });

      if (copies.length > 0) {
        return copies.map((c) => ({
          id: c.id,
          copyCode: c.copyCode,
          title: c.book?.title || "Judul Buku",
          author: c.book?.author || "Penulis",
          shelfLocation: c.shelfLocation || cleanShelf,
          status: c.status,
          conditionNote: c.conditionNote,
          coverUrl: c.book?.coverUrl || null,
        }));
      }
    } catch (e) {
      console.warn("DB getShelfTargetCopiesAction error, fallback:", e);
    }
  }

  // Fallback ke dummy copies
  return DUMMY_COPIES
    .filter((c) => (c.shelfLocation || "").toLowerCase() === cleanShelf.toLowerCase())
    .map((c) => {
      const b = DUMMY_BOOKS.find((book) => book.id === c.bookId);
      return {
        id: c.id,
        copyCode: c.copyCode,
        title: c.bookTitle,
        author: b?.author || "Penulis",
        shelfLocation: c.shelfLocation,
        status: c.status,
        conditionNote: c.conditionNote,
        coverUrl: b?.coverUrl || null,
      };
    });
}

/**
 * Memeriksa satu barcode hasil scan terhadap rak yang sedang diaudit.
 */
export async function auditScanCopyAction(
  currentAuditedShelf: string,
  scannedCode: string
): Promise<AuditScanResult> {
  const cleanCode = scannedCode.trim();
  const cleanShelf = currentAuditedShelf.trim().toLowerCase();

  if (db) {
    try {
      const copy = await db.query.bookCopies.findFirst({
        where: sql`lower(${schema.bookCopies.copyCode}) = lower(${cleanCode})`,
        with: { book: true },
      });

      if (copy) {
        const copyShelf = (copy.shelfLocation || "").trim().toLowerCase();
        const copyItem: ShelfCopyItem = {
          id: copy.id,
          copyCode: copy.copyCode,
          title: copy.book?.title || "Judul Buku",
          author: copy.book?.author || "Penulis",
          shelfLocation: copy.shelfLocation || "Tanpa Lokasi",
          status: copy.status,
          conditionNote: copy.conditionNote,
          coverUrl: copy.book?.coverUrl || null,
        };

        if (copyShelf === cleanShelf) {
          return {
            status: "MATCH",
            scannedCode: cleanCode,
            copy: copyItem,
            message: `Buku "${copyItem.title}" terverifikasi cocok di ${copy.shelfLocation}.`,
          };
        } else {
          return {
            status: "MISPLACED",
            scannedCode: cleanCode,
            copy: copyItem,
            actualShelf: copy.shelfLocation || "Rak Lain",
            message: `PERINGATAN: Buku "${copyItem.title}" salah rak! Seharusnya berada di ${copy.shelfLocation}.`,
          };
        }
      }
    } catch (e) {
      console.warn("DB auditScanCopyAction error, fallback:", e);
    }
  }

  // Fallback dummy
  const dummy = DUMMY_COPIES.find((c) => c.copyCode.toLowerCase() === cleanCode.toLowerCase());
  if (dummy) {
    const b = DUMMY_BOOKS.find((book) => book.id === dummy.bookId);
    const copyItem: ShelfCopyItem = {
      id: dummy.id,
      copyCode: dummy.copyCode,
      title: dummy.bookTitle,
      author: b?.author || "Penulis",
      shelfLocation: dummy.shelfLocation,
      status: dummy.status,
      conditionNote: dummy.conditionNote,
      coverUrl: b?.coverUrl || null,
    };

    if (dummy.shelfLocation.toLowerCase() === cleanShelf) {
      return {
        status: "MATCH",
        scannedCode: cleanCode,
        copy: copyItem,
        message: `Buku "${copyItem.title}" cocok di rak ini.`,
      };
    } else {
      return {
        status: "MISPLACED",
        scannedCode: cleanCode,
        copy: copyItem,
        actualShelf: dummy.shelfLocation,
        message: `PERINGATAN: Buku "${copyItem.title}" seharusnya di ${dummy.shelfLocation}.`,
      };
    }
  }

  return {
    status: "NOT_FOUND",
    scannedCode: cleanCode,
    message: `Barcode "${cleanCode}" tidak terdaftar di sistem perpustakaan.`,
  };
}

/**
 * Memindahkan lokasi rak eksemplar di database secara instan (1-klik relokasi).
 */
export async function updateCopyShelfAction(params: {
  copyId: string;
  newShelfLocation: string;
  copyCode: string;
}) {
  const { copyId, newShelfLocation, copyCode } = params;

  if (db) {
    try {
      await db
        .update(schema.bookCopies)
        .set({
          shelfLocation: newShelfLocation,
          updatedAt: new Date(),
        })
        .where(eq(schema.bookCopies.id, copyId));

      await writeAuditLog({
        actorName: "Pustakawan (Stock Opname)",
        action: "update",
        entityType: "book_copy",
        entityId: copyId,
        description: `Relokasi otomatis eksemplar ${copyCode} ke rak "${newShelfLocation}"`,
        newValue: { shelfLocation: newShelfLocation },
      });

      revalidatePath("/pustakawan/stock-opname");
      revalidatePath("/pustakawan/eksemplar");

      return {
        success: true,
        message: `Lokasi eksemplar ${copyCode} berhasil dipindahkan ke "${newShelfLocation}".`,
      };
    } catch (e: any) {
      console.warn("DB updateCopyShelfAction error:", e);
      return { success: false, error: e.message };
    }
  }

  // Dummy fallback
  const found = DUMMY_COPIES.find((c) => c.id === copyId);
  if (found) {
    found.shelfLocation = newShelfLocation;
  }
  return {
    success: true,
    message: `Lokasi eksemplar ${copyCode} berhasil dipindahkan ke "${newShelfLocation}" (Simulasi).`,
  };
}

/**
 * Menyelesaikan sesi Stock Opname dan menerbitkan Berita Acara Resmi.
 */
export async function finalizeStockOpnameSessionAction(params: {
  shelfName: string;
  targetCopies: ShelfCopyItem[];
  scannedMatchedCodes: string[];
  misplacedItems: Array<ShelfCopyItem & { actualShelf: string }>;
  auditorName?: string;
  notes?: string;
}): Promise<{ success: boolean; report: BeritaAcaraReport }> {
  const {
    shelfName,
    targetCopies,
    scannedMatchedCodes,
    misplacedItems,
    auditorName = "Ibu Dewi Anggraini, S.IP.",
    notes,
  } = params;

  const foundItems = targetCopies.filter((c) =>
    scannedMatchedCodes.some((code) => code.toLowerCase() === c.copyCode.toLowerCase())
  );

  const missingItems = targetCopies.filter(
    (c) =>
      c.status === "tersedia" &&
      !scannedMatchedCodes.some((code) => code.toLowerCase() === c.copyCode.toLowerCase())
  );

  const totalRegistered = targetCopies.length;
  const totalFound = foundItems.length;
  const accuracy =
    totalRegistered > 0 ? Math.round((totalFound / totalRegistered) * 100) : 100;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const reportNumber = `BA-SO/${now.getFullYear()}/${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${Math.floor(1000 + Math.random() * 9000)}`;

  // Log Audit
  if (db) {
    await writeAuditLog({
      actorName: auditorName,
      action: "create",
      entityType: "book_copy",
      description: `Stock Opname pada ${shelfName}: ${totalFound}/${totalRegistered} buku cocok (${accuracy}% akurasi)`,
      newValue: {
        reportNumber,
        shelfName,
        totalRegistered,
        totalFound,
        totalMissing: missingItems.length,
        totalMisplaced: misplacedItems.length,
        accuracy,
      },
    });
  }

  const report: BeritaAcaraReport = {
    reportNumber,
    date: dateFormatted,
    shelfName,
    auditorName,
    totalRegistered,
    totalFound,
    totalMisplaced: misplacedItems.length,
    totalMissing: missingItems.length,
    accuracyPercentage: accuracy,
    foundItems,
    misplacedItems,
    missingItems,
    notes: notes || "Stock Opname fisik berkala perpustakaan.",
  };

  return {
    success: true,
    report,
  };
}

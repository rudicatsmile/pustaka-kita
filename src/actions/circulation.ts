"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { db, schema } from "@/db";
import { eq, and, inArray, sql, desc } from "drizzle-orm";
import {
  DUMMY_LOANS,
  DUMMY_COPIES,
  DUMMY_MEMBERS,
  DUMMY_FINES,
  SYSTEM_CONFIG,
  LoanItem,
  FineItem,
} from "@/data/dummy";

/**
 * Mencari detail buku dan eksemplar dari barcode secara real-time dari database.
 */
export async function lookupBookCopyAction(code: string) {
  const cleanCode = code.trim();
  if (!cleanCode) return { success: false, error: "Kode barcode tidak boleh kosong." };

  if (db) {
    try {
      const copy = await db.query.bookCopies.findFirst({
        where: sql`lower(${schema.bookCopies.copyCode}) = lower(${cleanCode})`,
        with: {
          book: true,
        },
      });

      if (copy) {
        return {
          success: true,
          copy: {
            id: copy.id,
            copyCode: copy.copyCode,
            title: copy.book?.title || "Judul Buku",
            author: copy.book?.author || "Penulis",
            shelf: copy.shelfLocation || "Rak Koleksi",
            status: copy.status,
          },
        };
      }
    } catch (e) {
      console.warn("DB lookup error, checking fallback:", e);
    }
  }

  // Fallback ke dummy copies
  const dummyCopy = DUMMY_COPIES.find((c) => c.copyCode.toLowerCase() === cleanCode.toLowerCase());
  if (dummyCopy) {
    return {
      success: true,
      copy: {
        id: dummyCopy.id,
        copyCode: dummyCopy.copyCode,
        title: dummyCopy.bookTitle,
        author: "Penulis",
        shelf: dummyCopy.shelfLocation,
        status: dummyCopy.status,
      },
    };
  }

  return { success: false, error: `Eksemplar dengan barcode "${cleanCode}" tidak ditemukan.` };
}

export async function borrowBookAction(params: {
  memberNisNim: string;
  copyCode: string;
  isSelfCheckout?: boolean;
}) {
  const nisNimClean = params.memberNisNim.trim();
  const copyCodeClean = params.copyCode.trim();

  if (db) {
    try {
      // 1. Check member
      const member = await db.query.users.findFirst({
        where: eq(schema.users.nisNim, nisNimClean),
      });

      if (!member) {
        return { success: false, error: "Anggota dengan NIS/NIM tersebut tidak terdaftar di sistem." };
      }

      // 2. Check unpaid fines >= threshold (50.000)
      const unpaidFines = await db.query.fines.findMany({
        where: and(
          eq(schema.fines.memberId, member.id),
          eq(schema.fines.status, "belum_bayar")
        ),
      });
      const totalUnpaid = unpaidFines.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
      if (totalUnpaid >= SYSTEM_CONFIG.fineBlockThreshold) {
        return {
          success: false,
          error: `Peminjaman diblokir! Akumulasi denda Rp ${totalUnpaid.toLocaleString("id-ID")} melampaui batas Rp ${SYSTEM_CONFIG.fineBlockThreshold.toLocaleString("id-ID")}. Harap lunasi denda terlebih dahulu.`,
        };
      }

      // 3. Check quota (maksimal 3 buku aktif)
      const activeLoans = await db.query.loans.findMany({
        where: and(
          eq(schema.loans.memberId, member.id),
          inArray(schema.loans.status, ["dipinjam", "terlambat"])
        ),
      });
      if (activeLoans.length >= SYSTEM_CONFIG.maxBooksPerMember) {
        return {
          success: false,
          error: `Kuota pinjam penuh! Anda sudah meminjam ${activeLoans.length} dari maksimal ${SYSTEM_CONFIG.maxBooksPerMember} buku.`,
        };
      }

      // 4. Check copy
      const copy = await db.query.bookCopies.findFirst({
        where: sql`lower(${schema.bookCopies.copyCode}) = lower(${copyCodeClean})`,
        with: { book: true },
      });

      if (!copy) {
        return { success: false, error: "Kode barcode eksemplar tidak ditemukan di database." };
      }

      if (copy.status !== "tersedia") {
        return { success: false, error: `Eksemplar sedang berstatus '${copy.status}' dan tidak dapat dipinjam.` };
      }

      const now = new Date();
      const dueDate = new Date();
      dueDate.setDate(now.getDate() + SYSTEM_CONFIG.loanDurationDays);

      const inserted = await db
        .insert(schema.loans)
        .values({
          memberId: member.id,
          copyId: copy.id,
          borrowedAt: now,
          dueDate: dueDate,
          status: "dipinjam",
          renewedCount: 0,
          isSelfCheckout: params.isSelfCheckout || false,
          notes: params.isSelfCheckout ? "Scan Mandiri oleh Anggota" : "Sirkulasi Petugas",
        })
        .returning();

      // Update copy status
      await db
        .update(schema.bookCopies)
        .set({ status: "dipinjam", updatedAt: now })
        .where(eq(schema.bookCopies.id, copy.id));

      // Auto Audit Log
      await writeAuditLog({
        actorId: member.id,
        actorName: member.name,
        action: "create",
        entityType: "loan",
        entityId: inserted[0]?.id,
        description: `${params.isSelfCheckout ? "[Scan Mandiri]" : "[Sirkulasi Petugas]"} ${member.name} meminjam "${copy.book?.title}" (${copy.copyCode})`,
      });

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/riwayat");
      revalidatePath("/pustakawan/sirkulasi");
      return { success: true, loan: inserted[0] };
    } catch (e: any) {
      console.warn("DB borrow error, fallback:", e);
    }
  }

  // Fallback to in-memory if offline
  const fallbackMember = DUMMY_MEMBERS.find((m) => m.nisNim === nisNimClean);
  if (!fallbackMember) return { success: false, error: "Anggota tidak ditemukan." };
  const fallbackCopy = DUMMY_COPIES.find((c) => c.copyCode.toLowerCase() === copyCodeClean.toLowerCase());
  if (!fallbackCopy) return { success: false, error: "Barcode tidak ditemukan." };

  const now = new Date();
  const dueDate = new Date();
  dueDate.setDate(now.getDate() + 7);

  const newLoan: LoanItem = {
    id: `loan-${Date.now()}`,
    memberId: fallbackMember.id,
    memberName: fallbackMember.name,
    memberNisNim: fallbackMember.nisNim,
    memberClass: fallbackMember.classOrMajor,
    memberPhone: fallbackMember.phoneWa,
    bookId: fallbackCopy.bookId,
    bookTitle: fallbackCopy.bookTitle,
    copyCode: fallbackCopy.copyCode,
    shelfLocation: fallbackCopy.shelfLocation,
    borrowedAt: now.toISOString().split("T")[0],
    dueDate: dueDate.toISOString().split("T")[0],
    status: "dipinjam",
    renewedCount: 0,
    daysLate: 0,
    fineAmount: 0,
  };

  DUMMY_LOANS.unshift(newLoan);
  fallbackCopy.status = "dipinjam";
  return { success: true, loan: newLoan };
}

export async function returnBookAction(params: {
  copyCode: string;
  waive?: boolean;
  waiveReason?: string;
}) {
  const copyCodeClean = params.copyCode.trim();

  if (db) {
    try {
      const copy = await db.query.bookCopies.findFirst({
        where: sql`lower(${schema.bookCopies.copyCode}) = lower(${copyCodeClean})`,
        with: { book: true },
      });

      if (!copy) {
        return { success: false, error: "Barcode eksemplar tidak ditemukan." };
      }

      const activeLoan = await db.query.loans.findFirst({
        where: and(
          eq(schema.loans.copyId, copy.id),
          inArray(schema.loans.status, ["dipinjam", "terlambat"])
        ),
        with: { member: true },
      });

      if (!activeLoan) {
        return { success: false, error: "Tidak ada transaksi peminjaman aktif untuk eksemplar ini." };
      }

      const now = new Date();
      const dueDate = new Date(activeLoan.dueDate);
      const isLate = now.getTime() > dueDate.getTime();
      const diffDays = isLate ? Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      const fineAmount = diffDays * SYSTEM_CONFIG.finePerDay;

      // Update loan status
      await db
        .update(schema.loans)
        .set({
          status: "dikembalikan",
          returnedAt: now,
          updatedAt: now,
        })
        .where(eq(schema.loans.id, activeLoan.id));

      // Update copy status back to available
      await db
        .update(schema.bookCopies)
        .set({ status: "tersedia", updatedAt: now })
        .where(eq(schema.bookCopies.id, copy.id));

      // Create fine if late and not waived
      if (diffDays > 0 && !params.waive) {
        await db.insert(schema.fines).values({
          loanId: activeLoan.id,
          memberId: activeLoan.memberId,
          amount: fineAmount.toString(),
          daysLate: diffDays,
          status: "belum_bayar",
          paymentMethod: "transfer_manual",
          reason: `Keterlambatan pengembalian ${diffDays} hari (Rp 1.000 / hari)`,
        });
      }

      // Audit Log
      await writeAuditLog({
        actorId: activeLoan.memberId,
        actorName: activeLoan.member?.name || "Anggota",
        action: params.waive ? "waive" : "update",
        entityType: "loan",
        entityId: activeLoan.id,
        description: `Pengembalian buku: "${copy.book?.title}" (${copy.copyCode}). ${diffDays > 0 ? `Denda: Rp ${fineAmount.toLocaleString("id-ID")}` : "Tepat waktu."}`,
      });

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/riwayat");
      revalidatePath("/dashboard/denda");
      revalidatePath("/pustakawan/sirkulasi");
      return { success: true, fineAmount: params.waive ? 0 : fineAmount, daysLate: diffDays };
    } catch (e: any) {
      console.warn("DB return error, fallback:", e);
    }
  }

  // Fallback to memory
  const loan = DUMMY_LOANS.find(
    (l) => l.copyCode.toLowerCase() === copyCodeClean.toLowerCase() && l.status !== "dikembalikan"
  );
  if (!loan) return { success: false, error: "Tidak ada pinjaman aktif untuk eksemplar ini." };

  loan.status = "dikembalikan";
  loan.returnedAt = new Date().toISOString().split("T")[0];
  const copy = DUMMY_COPIES.find((c) => c.copyCode === loan.copyCode);
  if (copy) copy.status = "tersedia";

  return { success: true, loan };
}

export async function getAllLoansAction(statusFilter: string = "semua") {
  if (db) {
    try {
      const allLoans = await db.query.loans.findMany({
        with: {
          member: true,
          copy: {
            with: {
              book: true,
            },
          },
          fines: true,
        },
        orderBy: [desc(schema.loans.borrowedAt)],
      });

      const now = new Date();

      const formatted = allLoans.map((l) => {
        const dueDate = new Date(l.dueDate);
        const isLate =
          l.status === "terlambat" ||
          (l.status === "dipinjam" && now.getTime() > dueDate.getTime());
        const daysLate = isLate
          ? Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        const totalFine =
          l.fines?.reduce((acc, f) => acc + Number(f.amount || 0), 0) || daysLate * 1000;

        return {
          id: l.id,
          memberId: l.memberId,
          memberName: l.member?.name || "Anggota",
          memberNisNim: l.member?.nisNim || "-",
          memberClass: l.member?.classOrMajor || "-",
          memberPhone: l.member?.phoneWa || "-",
          bookId: l.copy?.bookId || "",
          bookTitle: l.copy?.book?.title || "Buku",
          copyCode: l.copy?.copyCode || "-",
          shelfLocation: l.copy?.shelfLocation || "-",
          borrowedAt: l.borrowedAt ? l.borrowedAt.toISOString().split("T")[0] : "-",
          dueDate: l.dueDate ? l.dueDate.toISOString().split("T")[0] : "-",
          returnedAt: l.returnedAt ? l.returnedAt.toISOString().split("T")[0] : undefined,
          status: (l.status === "dipinjam" && isLate ? "terlambat" : l.status) as any,
          renewedCount: l.renewedCount || 0,
          daysLate,
          fineAmount: totalFine,
        };
      });

      if (statusFilter !== "semua") {
        return formatted.filter((l) => l.status === statusFilter);
      }
      return formatted;
    } catch (e) {
      console.warn("DB getAllLoans error, fallback:", e);
    }
  }

  if (statusFilter !== "semua") {
    return DUMMY_LOANS.filter((l) => l.status === statusFilter);
  }
  return DUMMY_LOANS;
}

export async function lookupMemberAction(nisNim: string) {
  const cleanNis = nisNim.trim();
  if (!cleanNis) return { success: false, error: "NIS/NIM tidak boleh kosong." };

  if (db) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.nisNim, cleanNis),
        with: {
          loans: {
            where: inArray(schema.loans.status, ["dipinjam", "terlambat"]),
          },
          fines: {
            where: eq(schema.fines.status, "belum_bayar"),
          },
        },
      });

      if (user) {
        const activeLoansCount = user.loans?.length || 0;
        const totalUnpaidFines =
          user.fines?.reduce((acc, f) => acc + Number(f.amount || 0), 0) || 0;

        return {
          success: true,
          member: {
            id: user.id,
            nisNim: user.nisNim,
            name: user.name,
            classOrMajor: user.classOrMajor || "-",
            phoneWa: user.phoneWa,
            memberStatus: user.memberStatus,
            activeLoansCount,
            totalUnpaidFines,
            isBlocked: activeLoansCount >= 3 || totalUnpaidFines > 10000,
          },
        };
      }
    } catch (e) {
      console.warn("DB lookupMember error, fallback:", e);
    }
  }

  const dummy = DUMMY_MEMBERS.find((m) => m.nisNim === cleanNis);
  if (dummy) {
    return {
      success: true,
      member: {
        id: dummy.id,
        nisNim: dummy.nisNim,
        name: dummy.name,
        classOrMajor: dummy.classOrMajor,
        phoneWa: dummy.phoneWa,
        memberStatus: dummy.memberStatus,
        activeLoansCount: dummy.activeLoansCount,
        totalUnpaidFines: dummy.totalFinesUnpaid,
        isBlocked: dummy.activeLoansCount >= 3 || dummy.totalFinesUnpaid > 10000,
      },
    };
  }

  return { success: false, error: "Anggota dengan NIS/NIM tersebut tidak ditemukan." };
}

export async function lookupActiveLoanByCopyCodeAction(code: string) {
  const cleanCode = code.trim();
  if (!cleanCode) return { success: false, error: "Kode eksemplar tidak boleh kosong." };

  if (db) {
    try {
      const copy = await db.query.bookCopies.findFirst({
        where: sql`lower(${schema.bookCopies.copyCode}) = lower(${cleanCode})`,
        with: {
          book: true,
        },
      });

      if (!copy) {
        return { success: false, error: `Eksemplar dengan kode "${cleanCode}" tidak terdaftar.` };
      }

      const activeLoan = await db.query.loans.findFirst({
        where: and(
          eq(schema.loans.copyId, copy.id),
          inArray(schema.loans.status, ["dipinjam", "terlambat"])
        ),
        with: {
          member: true,
          fines: true,
        },
        orderBy: [desc(schema.loans.borrowedAt)],
      });

      if (!activeLoan) {
        return {
          success: false,
          error: `Buku "${copy.book?.title}" (${copy.copyCode}) tidak sedang dalam masa pinjam aktif.`,
        };
      }

      const now = new Date();
      const dueDate = new Date(activeLoan.dueDate);
      const isLate = now.getTime() > dueDate.getTime();
      const diffDays = isLate
        ? Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      const fineAmount = diffDays * 1000;

      return {
        success: true,
        loan: {
          id: activeLoan.id,
          memberId: activeLoan.memberId,
          memberName: activeLoan.member?.name || "Anggota",
          memberNisNim: activeLoan.member?.nisNim || "-",
          memberClass: activeLoan.member?.classOrMajor || "-",
          memberPhone: activeLoan.member?.phoneWa || "-",
          bookId: copy.bookId,
          bookTitle: copy.book?.title || "Buku",
          copyCode: copy.copyCode,
          shelfLocation: copy.shelfLocation,
          borrowedAt: activeLoan.borrowedAt.toISOString().split("T")[0],
          dueDate: activeLoan.dueDate.toISOString().split("T")[0],
          status: (isLate ? "terlambat" : activeLoan.status) as any,
          renewedCount: activeLoan.renewedCount || 0,
          daysLate: diffDays,
          fineAmount,
        },
      };
    } catch (e: any) {
      console.warn("DB lookup loan by code error, fallback:", e);
    }
  }

  const found = DUMMY_LOANS.find(
    (l) => l.copyCode.toLowerCase() === cleanCode.toLowerCase() && l.status !== "dikembalikan"
  );
  if (found) return { success: true, loan: found };
  return { success: false, error: `Tidak ada peminjaman aktif untuk kode eksemplar "${cleanCode}".` };
}



"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { db, schema } from "@/db";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { DUMMY_LOANS, DUMMY_FINES, DUMMY_BOOKS, DUMMY_MEMBERS, MemberItem } from "@/data/dummy";

export async function getPustakawanDashboardStats() {
  if (db) {
    try {
      const now = new Date();

      // 1. Total pinjaman aktif
      const [activeLoansCount] = await db
        .select({ val: count() })
        .from(schema.loans)
        .where(eq(schema.loans.status, "dipinjam"));

      // 2. Total pinjaman terlambat
      const [overdueLoansCount] = await db
        .select({ val: count() })
        .from(schema.loans)
        .where(eq(schema.loans.status, "terlambat"));

      // 3. Total denda belum bayar
      const [unpaidFinesCount] = await db
        .select({ val: count() })
        .from(schema.fines)
        .where(eq(schema.fines.status, "belum_bayar"));

      // 4. Total denda menunggu verifikasi
      const [waitingFinesCount] = await db
        .select({ val: count() })
        .from(schema.fines)
        .where(eq(schema.fines.status, "menunggu_verifikasi"));

      // 5. Total reservasi antrean menunggu
      const [waitingResCount] = await db
        .select({ val: count() })
        .from(schema.reservations)
        .where(eq(schema.reservations.status, "menunggu"));

      // 6. Recent Loans (5 data terbaru)
      const recentLoansRaw = await db.query.loans.findMany({
        with: {
          member: true,
          copy: {
            with: { book: true },
          },
          fines: true,
        },
        orderBy: [desc(schema.loans.borrowedAt)],
        limit: 5,
      });

      const recentLoans = recentLoansRaw.map((l) => ({
        id: l.id,
        memberId: l.memberId,
        memberName: l.member?.name || "Anggota",
        memberNisNim: l.member?.nisNim || "-",
        memberClass: l.member?.classOrMajor || "-",
        memberPhone: l.member?.phoneWa || "-",
        bookId: l.copy?.bookId || "",
        bookTitle: l.copy?.book?.title || "Buku Perpustakaan",
        copyCode: l.copy?.copyCode || "-",
        shelfLocation: l.copy?.shelfLocation || "-",
        borrowedAt: l.borrowedAt.toISOString().split("T")[0],
        dueDate: l.dueDate.toISOString().split("T")[0],
        status: l.status,
        renewedCount: l.renewedCount || 0,
        daysLate: 0,
        fineAmount: l.fines?.[0] ? Number(l.fines[0].amount || 0) : 0,
      }));

      return {
        activeLoansCount: Number(activeLoansCount?.val || 0),
        overdueLoansCount: Number(overdueLoansCount?.val || 0),
        unpaidFinesCount: Number(unpaidFinesCount?.val || 0),
        waitingFinesCount: Number(waitingFinesCount?.val || 0),
        waitingResCount: Number(waitingResCount?.val || 0),
        recentLoans,
      };
    } catch (e) {
      console.warn("DB pustakawan stats error, fallback:", e);
    }
  }

  return {
    activeLoansCount: DUMMY_LOANS.filter((l) => l.status === "dipinjam").length,
    overdueLoansCount: DUMMY_LOANS.filter((l) => l.status === "terlambat").length,
    unpaidFinesCount: DUMMY_FINES.filter((f) => f.status === "belum_bayar").length,
    waitingFinesCount: DUMMY_FINES.filter((f) => f.status === "menunggu_verifikasi").length,
    waitingResCount: 2,
    recentLoans: DUMMY_LOANS.slice(0, 5),
  };
}

export async function getMembersAction() {
  if (db) {
    try {
      const users = await db.query.users.findMany({
        where: eq(schema.users.role, "anggota"),
        with: {
          loans: true,
          fines: true,
        },
        orderBy: [desc(schema.users.createdAt)],
      });

      return users.map((u) => {
        const activeLoansCount = u.loans?.filter((l) => l.status === "dipinjam" || l.status === "terlambat").length || 0;
        const totalLoansCount = u.loans?.length || 0;
        const totalFinesUnpaid = u.fines
          ?.filter((f) => f.status === "belum_bayar")
          .reduce((acc, f) => acc + Number(f.amount || 0), 0) || 0;

        return {
          id: u.id,
          nisNim: u.nisNim,
          name: u.name,
          email: u.email || "",
          phoneWa: u.phoneWa,
          role: u.role,
          memberStatus: u.memberStatus,
          classOrMajor: u.classOrMajor || "-",
          joinDate: u.joinDate ? u.joinDate.toISOString().split("T")[0] : "2024-01-01",
          activeLoansCount,
          totalLoansCount,
          totalFinesUnpaid,
          isVerified: u.isVerified,
        };
      });
    } catch (e) {
      console.warn("DB getMembers error, fallback:", e);
    }
  }

  return DUMMY_MEMBERS;
}

export async function updateMemberStatusAction(
  userId: string,
  newStatus: "aktif" | "nonaktif" | "ditangguhkan" | "lulus" | "keluar"
) {
  if (db) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, userId),
      });

      if (!user) return { success: false, error: "Anggota tidak ditemukan." };

      const oldStatus = user.memberStatus;
      await db
        .update(schema.users)
        .set({ memberStatus: newStatus, updatedAt: new Date() })
        .where(eq(schema.users.id, userId));

      await writeAuditLog({
        action: "update",
        entityType: "user",
        entityId: user.id,
        description: `Pustakawan mengubah status anggota ${user.name} (${user.nisNim}) dari "${oldStatus}" menjadi "${newStatus}"`,
        oldValue: { memberStatus: oldStatus },
        newValue: { memberStatus: newStatus },
      });

      revalidatePath("/pustakawan/anggota");
      revalidatePath("/admin/pengguna");
      return { success: true };
    } catch (e: any) {
      console.warn("DB updateMemberStatus error, fallback:", e);
    }
  }

  const m = DUMMY_MEMBERS.find((u) => u.id === userId);
  if (m) m.memberStatus = newStatus;
  revalidatePath("/pustakawan/anggota");
  return { success: true };
}

export async function getPustakawanReportsAction() {
  if (db) {
    try {
      const [totalLoans] = await db.select({ val: count() }).from(schema.loans);
      const [returnedLoans] = await db.select({ val: count() }).from(schema.loans).where(eq(schema.loans.status, "dikembalikan"));
      const [overdueLoans] = await db.select({ val: count() }).from(schema.loans).where(eq(schema.loans.status, "terlambat"));

      const finesRes = await db.select({ totalAmount: sql`sum(amount)` }).from(schema.fines).where(eq(schema.fines.status, "lunas"));

      return {
        totalLoans: Number(totalLoans?.val || 0),
        returnedLoans: Number(returnedLoans?.val || 0),
        overdueLoans: Number(overdueLoans?.val || 0),
        totalFinesRevenue: Number(finesRes?.[0]?.totalAmount || 0),
      };
    } catch (e) {
      console.warn("DB getReports error, fallback:", e);
    }
  }

  return {
    totalLoans: DUMMY_LOANS.length,
    returnedLoans: DUMMY_LOANS.filter((l) => l.status === "dikembalikan").length,
    overdueLoans: DUMMY_LOANS.filter((l) => l.status === "terlambat").length,
    totalFinesRevenue: 15000,
  };
}

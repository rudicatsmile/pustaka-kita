"use server";

import { auth } from "@/auth";
import { db, schema } from "@/db";
import { eq, and, inArray, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";

/**
 * Mendapatkan sesi anggota yang sedang login.
 * Jika sesi NextAuth belum ada (misal mode demo belum login),
 * fallback ke user pertama di DB agar halaman tetap dapat diakses.
 */
export async function getActiveMemberUser() {
  let session = null;
  try {
    session = await auth();
  } catch {
    // Sesi dipanggil di luar konteks request Next.js (misal script atau static render)
  }

  if (session?.user?.id && db) {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, (session.user as any).id),
    });
    if (user) return user;
  }

  // Fallback: ambil user pertama bertipe "anggota" dari DB
  if (db) {
    const fallbackUser = await db.query.users.findFirst({
      where: eq(schema.users.role, "anggota"),
    });
    if (fallbackUser) return fallbackUser;
  }

  return null;
}

/**
 * Mengambil ringkasan dasbor anggota: pinjaman aktif, denda tertunggak, e-book
 */
export async function getMemberDashboardSummary() {
  const user = await getActiveMemberUser();
  if (!user || !db) {
    return {
      user: null,
      activeLoans: [],
      overdueLoans: [],
      totalUnpaidFines: 0,
      ebooks: [],
    };
  }

  // 1. Ambil pinjaman anggota
  const userLoans = await db.query.loans.findMany({
    where: and(
      eq(schema.loans.memberId, user.id),
      inArray(schema.loans.status, ["dipinjam", "terlambat"])
    ),
    with: {
      copy: {
        with: {
          book: true,
        },
      },
    },
    orderBy: [desc(schema.loans.dueDate)],
  });

  const activeLoans = userLoans.map((l) => ({
    id: l.id,
    bookTitle: l.copy?.book?.title || "Judul Buku",
    author: l.copy?.book?.author || "Penulis",
    coverUrl: l.copy?.book?.coverUrl || "",
    copyCode: l.copy?.copyCode || "-",
    shelfLocation: l.copy?.shelfLocation || "Rak Koleksi",
    borrowedAt: l.borrowedAt ? l.borrowedAt.toISOString().split("T")[0] : "-",
    dueDate: l.dueDate ? l.dueDate.toISOString().split("T")[0] : "-",
    status: l.status,
    renewedCount: l.renewedCount,
  }));

  const overdueLoans = activeLoans.filter((l) => l.status === "terlambat");

  // 2. Ambil total denda belum bayar
  const userFines = await db.query.fines.findMany({
    where: and(
      eq(schema.fines.memberId, user.id),
      eq(schema.fines.status, "belum_bayar")
    ),
  });

  const totalUnpaidFines = userFines.reduce(
    (acc, curr) => acc + Number(curr.amount || 0),
    0
  );

  // 3. Ambil rekomendasi e-book
  const rawEbooks = await db.query.ebooks.findMany({
    with: {
      book: true,
    },
    limit: 4,
  });

  const ebooks = rawEbooks.map((eb) => ({
    id: eb.id,
    title: eb.book?.title || "E-Book",
    author: eb.book?.author || "Penulis",
    category: "Buku Digital",
    coverUrl: eb.book?.coverUrl || "",
    fileUrl: eb.fileUrl,
    fileFormat: eb.fileFormat,
    fileSizeBytes: eb.fileSizeBytes || 5000000,
  }));

  return {
    user: {
      id: user.id,
      name: user.name,
      nisNim: user.nisNim,
      email: user.email,
      phoneWa: user.phoneWa,
      classOrMajor: user.classOrMajor || "-",
      memberStatus: user.memberStatus,
    },
    activeLoans,
    overdueLoans,
    totalUnpaidFines,
    ebooks,
  };
}

/**
 * Mengambil riwayat lengkap peminjaman anggota
 */
export async function getMemberLoansHistory(filterTab: "semua" | "dipinjam" | "dikembalikan" | "terlambat" = "semua") {
  const user = await getActiveMemberUser();
  if (!user || !db) return [];

  const rawLoans = await db.query.loans.findMany({
    where: eq(schema.loans.memberId, user.id),
    with: {
      copy: {
        with: {
          book: true,
        },
      },
    },
    orderBy: [desc(schema.loans.createdAt)],
  });

  const formatted = rawLoans.map((l) => ({
    id: l.id,
    bookTitle: l.copy?.book?.title || "Judul Buku",
    author: l.copy?.book?.author || "Penulis",
    coverUrl: l.copy?.book?.coverUrl || "",
    copyCode: l.copy?.copyCode || "-",
    shelfLocation: l.copy?.shelfLocation || "Rak Koleksi",
    borrowedAt: l.borrowedAt ? l.borrowedAt.toISOString().split("T")[0] : "-",
    dueDate: l.dueDate ? l.dueDate.toISOString().split("T")[0] : "-",
    returnedAt: l.returnedAt ? l.returnedAt.toISOString().split("T")[0] : null,
    status: l.status,
    renewedCount: l.renewedCount,
  }));

  if (filterTab === "semua") return formatted;
  return formatted.filter((l) => l.status === filterTab);
}

/**
 * Mengambil data denda anggota
 */
export async function getMemberFines() {
  const user = await getActiveMemberUser();
  if (!user || !db) return { fines: [], totalUnpaid: 0, totalWaiting: 0 };

  const rawFines = await db.query.fines.findMany({
    where: eq(schema.fines.memberId, user.id),
    with: {
      loan: {
        with: {
          copy: {
            with: {
              book: true,
            },
          },
        },
      },
    },
    orderBy: [desc(schema.fines.createdAt)],
  });

  const fines = rawFines.map((f) => ({
    id: f.id,
    bookTitle: f.loan?.copy?.book?.title || "Buku Perpustakaan",
    copyCode: f.loan?.copy?.copyCode || "-",
    amount: Number(f.amount || 0),
    daysLate: f.daysLate,
    reason: f.reason || `Keterlambatan ${f.daysLate} hari`,
    status: f.status,
    paymentMethod: f.paymentMethod || "transfer_manual",
    proofUrl: f.proofUrl,
    paidAt: f.paidAt ? f.paidAt.toISOString().replace("T", " ").substring(0, 16) : null,
    createdAt: f.createdAt.toISOString().replace("T", " ").substring(0, 16),
  }));

  const totalUnpaid = fines
    .filter((f) => f.status === "belum_bayar")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalWaiting = fines
    .filter((f) => f.status === "menunggu_verifikasi")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return { fines, totalUnpaid, totalWaiting };
}

/**
 * Mengambil daftar koleksi e-book digital
 */
export async function getMemberEbooks() {
  if (!db) return [];

  const rawEbooks = await db.query.ebooks.findMany({
    with: {
      book: true,
    },
    orderBy: [desc(schema.ebooks.createdAt)],
  });

  return rawEbooks.map((eb) => ({
    id: eb.id,
    title: eb.book?.title || "Judul E-Book",
    author: eb.book?.author || "Penulis",
    category: "Buku Digital",
    coverUrl: eb.book?.coverUrl || "",
    fileUrl: eb.fileUrl,
    fileFormat: eb.fileFormat,
    fileSizeBytes: eb.fileSizeBytes || 5000000,
    readCount: eb.readCount,
  }));
}

/**
 * Mengambil daftar reservasi anggota
 */
export async function getMemberReservations() {
  const user = await getActiveMemberUser();
  if (!user || !db) return [];

  const rawReservations = await db.query.reservations.findMany({
    where: eq(schema.reservations.memberId, user.id),
    with: {
      book: true,
    },
    orderBy: [desc(schema.reservations.reservedAt)],
  });

  return rawReservations.map((r) => ({
    id: r.id,
    bookTitle: r.book?.title || "Buku",
    author: r.book?.author || "Penulis",
    coverUrl: r.book?.coverUrl || "",
    reservedAt: r.reservedAt.toISOString().split("T")[0],
    status: r.status,
    queuePosition: r.queuePosition || 1,
    readyAt: r.readyAt ? r.readyAt.toISOString().split("T")[0] : null,
  }));
}

/**
 * Memperpanjang masa pinjam buku di database
 */
export async function renewMemberLoanAction(loanId: string) {
  if (!db) return { success: false, error: "Database tidak tersedia." };

  const loan = await db.query.loans.findFirst({
    where: eq(schema.loans.id, loanId),
    with: {
      copy: {
        with: {
          book: true,
        },
      },
      member: true,
    },
  });

  if (!loan) return { success: false, error: "Transaksi peminjaman tidak ditemukan." };

  if (loan.status === "terlambat") {
    return {
      success: false,
      error: "Buku sudah melewati jatuh tempo (terlambat) dan tidak dapat diperpanjang secara mandiri. Harap kembalikan di meja sirkulasi.",
    };
  }

  if (loan.renewedCount >= 1) {
    return {
      success: false,
      error: "Maksimal perpanjangan mandiri adalah 1 kali per peminjaman.",
    };
  }

  // Tambah 7 hari dari due date saat ini
  const currentDueDate = new Date(loan.dueDate);
  const newDueDate = new Date(currentDueDate);
  newDueDate.setDate(currentDueDate.getDate() + 7);

  await db
    .update(schema.loans)
    .set({
      renewedCount: loan.renewedCount + 1,
      dueDate: newDueDate,
      updatedAt: new Date(),
    })
    .where(eq(schema.loans.id, loanId));

  await writeAuditLog({
    actorId: loan.memberId,
    actorName: loan.member?.name || "Anggota",
    action: "update",
    entityType: "loan",
    entityId: loan.id,
    description: `Perpanjangan mandiri masa pinjam buku: "${loan.copy?.book?.title}" (+7 hari)`,
    oldValue: { dueDate: loan.dueDate.toISOString().split("T")[0], renewedCount: loan.renewedCount },
    newValue: { dueDate: newDueDate.toISOString().split("T")[0], renewedCount: loan.renewedCount + 1 },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/riwayat");
  return { success: true, newDueDate: newDueDate.toISOString().split("T")[0] };
}

/**
 * Memperbarui profil akun anggota di database
 */
export async function updateMemberProfileAction(data: {
  name: string;
  email: string;
  phoneWa: string;
  classOrMajor: string;
}) {
  const user = await getActiveMemberUser();
  if (!user || !db) return { success: false, error: "Pengguna tidak terautentikasi." };

  await db
    .update(schema.users)
    .set({
      name: data.name,
      email: data.email,
      phoneWa: data.phoneWa,
      classOrMajor: data.classOrMajor,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, user.id));

  await writeAuditLog({
    actorId: user.id,
    actorName: data.name,
    action: "update",
    entityType: "user",
    entityId: user.id,
    description: `Pembaruan profil anggota mandiri (${user.nisNim} - ${data.name})`,
    newValue: data,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profil");
  revalidatePath("/dashboard/kartu");
  return { success: true };
}

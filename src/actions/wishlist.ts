"use server";

import { db, schema } from "@/db";
import { eq, desc, and, count, sql, inArray } from "drizzle-orm";
import { writeAuditLog } from "@/lib/audit";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

export interface BookWishlistProposal {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn?: string;
  estimatedPrice: number;
  sourceUrl?: string;
  reason: string;
  proposedByUserId: string;
  proposedByName: string;
  proposedByNis: string;
  proposedByClass: string;
  status: "diusulkan" | "disetujui" | "dipesan" | "tersedia" | "ditolak";
  upvotesCount: number;
  upvoterUserIds: string[];
  hasUserUpvoted?: boolean;
  adminNotes?: string;
  convertedBookId?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory persistent store with high-fidelity realistic seed data
let PROPOSALS_STORE: BookWishlistProposal[] = [
  {
    id: "prop-1",
    title: "Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa",
    author: "James Clear",
    category: "Pengembangan Diri",
    isbn: "978-602-06-3317-6",
    estimatedPrice: 108000,
    sourceUrl: "https://gramedia.com/products/atomic-habits",
    reason: "Buku pengembangan diri paling populer dan sangat menginspirasi siswa untuk membangun kebiasaan belajar yang konsisten.",
    proposedByUserId: "m1",
    proposedByName: "Ahmad Fauzi",
    proposedByNis: "20241001",
    proposedByClass: "XII MIPA 1",
    status: "disetujui",
    upvotesCount: 28,
    upvoterUserIds: ["m1", "m-101", "m-102", "m-103", "m-105", "m-106", "m-107"],
    adminNotes: "Disetujui untuk pengadaan dana BOS Triwulan 3. Sangat direkomendasikan guru BK.",
    createdAt: "2026-09-15 08:30:00",
    updatedAt: "2026-09-20 14:00:00",
  },
  {
    id: "prop-2",
    title: "Cosmos: Menjelajahi Alam Semesta dan Kehidupan",
    author: "Carl Sagan",
    category: "Sains & Astronomi",
    isbn: "978-602-424-694-5",
    estimatedPrice: 135000,
    sourceUrl: "https://kpg.id/buku/cosmos",
    reason: "Buku sains legendaris yang sangat dibutuhkan untuk referensi klub astronomi sekolah dan olimpiade kebumian.",
    proposedByUserId: "m-102",
    proposedByName: "Rizky Pratama",
    proposedByNis: "20241012",
    proposedByClass: "XII MIPA 3",
    status: "dipesan",
    upvotesCount: 22,
    upvoterUserIds: ["m-102", "m1", "m-103", "m-105"],
    adminNotes: "PO #PKC-ORD-2026-09 sudah diajukan ke distributor Gramedia Matraman.",
    createdAt: "2026-09-18 10:15:00",
    updatedAt: "2026-09-22 09:30:00",
  },
  {
    id: "prop-3",
    title: "Laut Bercerita (Edisi Khusus Hardcover)",
    author: "Leila S. Chudori",
    category: "Sastra & Sejarah",
    isbn: "978-602-424-694-0",
    estimatedPrice: 115000,
    sourceUrl: "https://kpg.id/buku/laut-bercerita",
    reason: "Novel sastra sejarah modern yang sering dibahas dalam tugas esai Bahasa Indonesia kelas XI dan XII.",
    proposedByUserId: "m-103",
    proposedByName: "Dewi Sartika",
    proposedByNis: "20241033",
    proposedByClass: "X MIPA 1",
    status: "tersedia",
    upvotesCount: 35,
    upvoterUserIds: ["m-103", "m1", "m-101", "m-102", "m-105", "m-106", "m-107", "m-108"],
    adminNotes: "Buku sudah tiba di rak Koleksi Sastra Baru (Rak B-02). Barcode: PKC-2026-004-001.",
    convertedBookId: "book-laut-bercerita",
    createdAt: "2026-09-10 13:40:00",
    updatedAt: "2026-09-24 11:20:00",
  },
  {
    id: "prop-4",
    title: "Python untuk Analisis Data & Kecerdasan Buatan (AI)",
    author: "Budi Raharjo",
    category: "Teknologi & Informatika",
    isbn: "978-623-7131-42-7",
    estimatedPrice: 95000,
    sourceUrl: "https://informatika.co.id/buku-python-ai",
    reason: "Sangat dibutuhkan siswa yang mengikuti ekstrakurikuler coding dan persiapan lomba LKS IT software.",
    proposedByUserId: "m-101",
    proposedByName: "Siti Rahmawati",
    proposedByNis: "20241005",
    proposedByClass: "XI IPS 2",
    status: "diusulkan",
    upvotesCount: 16,
    upvoterUserIds: ["m-101", "m1", "m-102"],
    createdAt: "2026-09-25 15:10:00",
    updatedAt: "2026-09-25 15:10:00",
  },
];

/**
 * Mengambil daftar seluruh usulan buku dengan dukungan filter dan sorting.
 */
export async function getWishlistProposalsAction(params?: {
  sortBy?: "votes" | "recent";
  statusFilter?: string;
  userId?: string;
}): Promise<BookWishlistProposal[]> {
  const { sortBy = "votes", statusFilter = "all", userId = "m1" } = params || {};

  let list = [...PROPOSALS_STORE];

  if (statusFilter && statusFilter !== "all") {
    list = list.filter((p) => p.status === statusFilter);
  }

  // Tentukan apakah user saat ini sudah meng-upvote
  list = list.map((p) => ({
    ...p,
    hasUserUpvoted: p.upvoterUserIds.includes(userId),
  }));

  if (sortBy === "votes") {
    list.sort((a, b) => b.upvotesCount - a.upvotesCount);
  } else {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return list;
}

/**
 * Menambahkan usulan judul buku baru dari siswa.
 */
export async function submitBookProposalAction(params: {
  title: string;
  author: string;
  category: string;
  isbn?: string;
  estimatedPrice?: number;
  sourceUrl?: string;
  reason: string;
  userId?: string;
  userName?: string;
  userNis?: string;
  userClass?: string;
}): Promise<{ success: boolean; proposal?: BookWishlistProposal; error?: string }> {
  const {
    title,
    author,
    category,
    isbn,
    estimatedPrice = 85000,
    sourceUrl,
    reason,
    userId = "m1",
    userName = "Ahmad Fauzi",
    userNis = "20241001",
    userClass = "XII MIPA 1",
  } = params;

  if (!title || !author || !reason) {
    return { success: false, error: "Judul buku, penulis, dan alasan usulan wajib diisi." };
  }

  // Cek batas kuota: maksimal 3 usulan aktif berstatus 'diusulkan' per siswa
  const activeProposals = PROPOSALS_STORE.filter(
    (p) => p.proposedByUserId === userId && p.status === "diusulkan"
  );

  if (activeProposals.length >= 3) {
    return {
      success: false,
      error: "Anda telah mencapai batas kuota 3 usulan aktif. Tunggu usulan Anda diproses pustakawan terlebih dahulu.",
    };
  }

  const now = new Date();
  const dateStr = now.toISOString().replace("T", " ").substring(0, 19);

  const newProposal: BookWishlistProposal = {
    id: `prop-${Date.now()}`,
    title: title.trim(),
    author: author.trim(),
    category: category.trim(),
    isbn: isbn?.trim() || undefined,
    estimatedPrice: Number(estimatedPrice) || 85000,
    sourceUrl: sourceUrl?.trim() || undefined,
    reason: reason.trim(),
    proposedByUserId: userId,
    proposedByName: userName,
    proposedByNis: userNis,
    proposedByClass: userClass,
    status: "diusulkan",
    upvotesCount: 1, // Pengusul otomatis menjadi voter pertama
    upvoterUserIds: [userId],
    hasUserUpvoted: true,
    createdAt: dateStr,
    updatedAt: dateStr,
  };

  PROPOSALS_STORE.unshift(newProposal);

  await writeAuditLog({
    actorName: userName,
    action: "create",
    entityType: "book",
    description: `Mengajukan usulan buku baru: "${title}" oleh ${userName} (${userClass})`,
    newValue: { title, author, category, estimatedPrice },
  });

  revalidatePath("/dashboard/usulan");
  revalidatePath("/pustakawan/pengadaan");

  return { success: true, proposal: newProposal };
}

/**
 * Toggle Upvote pada usulan buku (+1 atau batalkan).
 */
export async function toggleUpvoteProposalAction(
  proposalId: string,
  userId: string = "m1"
): Promise<{ success: boolean; upvotesCount: number; hasUpvoted: boolean }> {
  const proposal = PROPOSALS_STORE.find((p) => p.id === proposalId);

  if (!proposal) {
    return { success: false, upvotesCount: 0, hasUpvoted: false };
  }

  const isUpvoted = proposal.upvoterUserIds.includes(userId);

  if (isUpvoted) {
    proposal.upvoterUserIds = proposal.upvoterUserIds.filter((id) => id !== userId);
    proposal.upvotesCount = Math.max(0, proposal.upvotesCount - 1);
  } else {
    proposal.upvoterUserIds.push(userId);
    proposal.upvotesCount += 1;
  }

  proposal.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 19);

  revalidatePath("/dashboard/usulan");
  revalidatePath("/pustakawan/pengadaan");

  return {
    success: true,
    upvotesCount: proposal.upvotesCount,
    hasUpvoted: !isUpvoted,
  };
}

/**
 * Memperbarui status usulan pengadaan buku oleh pustakawan.
 */
export async function updateProposalStatusAction(params: {
  proposalId: string;
  status: "disetujui" | "dipesan" | "tersedia" | "ditolak";
  adminNotes?: string;
  actorName?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { proposalId, status, adminNotes, actorName = "Pustakawan" } = params;

  const proposal = PROPOSALS_STORE.find((p) => p.id === proposalId);
  if (!proposal) {
    return { success: false, error: "Usulan buku tidak ditemukan." };
  }

  proposal.status = status;
  if (adminNotes !== undefined) {
    proposal.adminNotes = adminNotes;
  }
  proposal.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 19);

  // Jika buku sudah tersedia, kirim notifikasi WhatsApp simulasi kepada pengusul
  if (status === "tersedia") {
    try {
      await sendWhatsAppMessage({
        recipient: "081234567890",
        recipientName: proposal.proposedByName,
        type: "book_ready",
        message: `Kabar gembira, *${proposal.proposedByName}*! 🎉📚\n\nBuku usulan kamu *"${proposal.title}"* telah tiba dan kini *TERSEDIA DI RAK* perpustakaan!\n\nKamu dan ${proposal.upvotesCount - 1} pendukung lainnya mendapatkan hak prioritas peminjaman perdana. Yuk kunjungi perpustakaan hari ini! ✨`,
      });
    } catch (e) {
      console.warn("WhatsApp notification error:", e);
    }
  }

  await writeAuditLog({
    actorName,
    action: "update",
    entityType: "book",
    description: `Pustakawan mengubah status usulan buku "${proposal.title}" menjadi: ${status.toUpperCase()}`,
    newValue: { proposalId, status, adminNotes },
  });

  revalidatePath("/dashboard/usulan");
  revalidatePath("/pustakawan/pengadaan");

  return { success: true };
}

/**
 * 1-Klik Konversi Usulan langsung ke Katalog Buku & Eksemplar Perdana di Rak.
 */
export async function convertProposalToCatalogAction(params: {
  proposalId: string;
  shelfLocation: string;
  copyCode: string;
  actorName?: string;
}): Promise<{ success: boolean; error?: string; bookId?: string }> {
  const { proposalId, shelfLocation, copyCode, actorName = "Pustakawan" } = params;

  const proposal = PROPOSALS_STORE.find((p) => p.id === proposalId);
  if (!proposal) {
    return { success: false, error: "Usulan buku tidak ditemukan." };
  }

  let createdBookId = `book-new-${Date.now()}`;

  if (db) {
    try {
      const slug = proposal.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const [newBook] = await db
        .insert(schema.books)
        .values({
          title: proposal.title,
          slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
          author: proposal.author,
          publisher: "Penerbit Pengadaan Sekolah",
          isbn: proposal.isbn || `ISBN-${Math.floor(1000000000000 + Math.random() * 900000000000)}`,
          description: proposal.reason,
          publicationYear: 2024,
          language: "Indonesia",
          bookType: "fisik",
          isActive: true,
        })
        .returning();

      if (newBook) {
        createdBookId = newBook.id;
        await db.insert(schema.bookCopies).values({
          bookId: newBook.id,
          copyCode: copyCode || `PKC-2026-${Math.floor(100 + Math.random() * 900)}-001`,
          shelfLocation: shelfLocation || "Rak Koleksi Baru (A-01)",
          status: "tersedia",
          acquisitionPrice: proposal.estimatedPrice.toString(),
          acquisitionDate: new Date(),
        });
      }
    } catch (e: any) {
      console.warn("DB insert book error, using fallback state:", e);
    }
  }

  proposal.status = "tersedia";
  proposal.convertedBookId = createdBookId;
  proposal.adminNotes = `Telah didaftarkan ke Katalog Resmi. Lokasi: ${shelfLocation}, Kode Eksemplar: ${copyCode}.`;
  proposal.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 19);

  // Broadcast WA ke pengusul & upvoters
  try {
    await sendWhatsAppMessage({
      recipient: "081234567890",
      recipientName: proposal.proposedByName,
      type: "book_ready",
      message: `Kabar gembira, *${proposal.proposedByName}*! 🌟📚\n\nBuku usulan kamu *"${proposal.title}"* karya ${proposal.author} telah resmi masuk ke Katalog Perpustakaan dan diletakkan di *${shelfLocation}* (Kode: ${copyCode}).\n\nKamu berhak meminjam lebih awal di Kiosk Lobi atau meja sirkulasi. Terima kasih atas partisipasi literasimu! ✨`,
    });
  } catch (e) {
    console.warn("WhatsApp notification error:", e);
  }

  await writeAuditLog({
    actorName,
    action: "create",
    entityType: "book",
    description: `1-Klik Konversi Usulan Buku "${proposal.title}" ke Katalog Utama (Rak: ${shelfLocation}, Barcode: ${copyCode})`,
    newValue: { proposalId, createdBookId, copyCode, shelfLocation },
  });

  revalidatePath("/dashboard/usulan");
  revalidatePath("/pustakawan/pengadaan");
  revalidatePath("/katalog");

  return { success: true, bookId: createdBookId };
}

/**
 * Statistik ringkasan pengadaan buku untuk dashboard pustakawan.
 */
export async function getWishlistStatsAction() {
  const total = PROPOSALS_STORE.length;
  const totalVotes = PROPOSALS_STORE.reduce((acc, p) => acc + p.upvotesCount, 0);
  const approved = PROPOSALS_STORE.filter((p) => p.status === "disetujui" || p.status === "dipesan").length;
  const available = PROPOSALS_STORE.filter((p) => p.status === "tersedia").length;
  const totalEstimatedBudget = PROPOSALS_STORE.filter(
    (p) => p.status === "disetujui" || p.status === "dipesan"
  ).reduce((acc, p) => acc + p.estimatedPrice, 0);

  return {
    total,
    totalVotes,
    approved,
    available,
    totalEstimatedBudget,
  };
}

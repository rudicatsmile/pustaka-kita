"use server";

import { db, schema } from "@/db";
import { eq, desc, and, count, sql, inArray } from "drizzle-orm";
import { writeAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export interface BookReviewItem {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCoverUrl?: string;
  userId: string;
  userName: string;
  userNis: string;
  userClass: string;
  rating: number; // 1 - 5
  reviewText: string;
  favoriteQuote?: string;
  hasSpoiler: boolean;
  likesCount: number;
  likedByUserIds: string[];
  hasUserLiked?: boolean;
  isPinnedBestReview: boolean;
  repliesCount: number;
  createdAt: string;
}

export interface ReadingClubChallenge {
  month: string;
  theme: string;
  featuredBookTitle: string;
  featuredBookAuthor: string;
  featuredBookCover: string;
  featuredBookSlug: string;
  description: string;
  targetParticipants: number;
  activeParticipants: number;
  discussionThreadsCount: number;
}

// In-memory persistent reviews store with realistic seed data
let REVIEWS_STORE: BookReviewItem[] = [
  {
    id: "rev-1",
    bookId: "b-001",
    bookTitle: "Laskar Pelangi",
    bookCoverUrl: "/images/books/laskar-pelangi.jpg",
    userId: "m-101",
    userName: "Siti Rahmawati",
    userNis: "20241005",
    userClass: "XI IPS 2",
    rating: 5,
    reviewText:
      "Buku yang selalu sukses membuat saya terharu dan bersemangat belajar. Kisah perjuangan Ikal dan kawan-kawan di Belitung mengajarkan bahwa keterbatasan sarana tidak boleh membatasi mimpi besar kita.",
    favoriteQuote:
      "Hiduplah untuk memberi sebanyak-banyaknya, bukan untuk menerima sebanyak-banyaknya.",
    hasSpoiler: false,
    likesCount: 24,
    likedByUserIds: ["m1", "m-102", "m-103", "m-105"],
    isPinnedBestReview: true,
    repliesCount: 6,
    createdAt: "2026-09-20 14:15:00",
  },
  {
    id: "rev-2",
    bookId: "b-002",
    bookTitle: "Bumi Manusia",
    bookCoverUrl: "/images/books/bumi-manusia.jpg",
    userId: "m1",
    userName: "Ahmad Fauzi",
    userNis: "20241001",
    userClass: "XII MIPA 1",
    rating: 5,
    reviewText:
      "Karya sastra luar biasa berlatar sejarah kolonial Hindia Belanda. Karakter Nyai Ontosoroh sangat tangguh dan inspiratif dalam memperjuangkan hak asasi serta martabat keluarganya di tengah diskriminasi hukum.",
    favoriteQuote:
      "Berterimakasihlah pada segala yang memberi kehidupan, bahkan pada rasa sakit yang membuatmu tumbuh.",
    hasSpoiler: false,
    likesCount: 19,
    likedByUserIds: ["m-101", "m-102", "m-103"],
    isPinnedBestReview: true,
    repliesCount: 4,
    createdAt: "2026-09-22 09:30:00",
  },
  {
    id: "rev-3",
    bookId: "b-003",
    bookTitle: "Filosofi Teras",
    bookCoverUrl: "/images/books/filosofi-teras.jpg",
    userId: "m-102",
    userName: "Rizky Pratama",
    userNis: "20241012",
    userClass: "XII MIPA 3",
    rating: 4,
    reviewText:
      "Buku pengantar stoisisme yang ditulis dengan bahasa santai dan relevan untuk anak muda zaman sekarang yang sering overthinking soal masa depan atau ujian sekolah.",
    favoriteQuote:
      "Kamu punya kendali atas pikiranmu sendiri, bukan peristiwa di luar dirimu. Sadarilah ini, dan kamu akan menemukan ketenangan sejati.",
    hasSpoiler: false,
    likesCount: 15,
    likedByUserIds: ["m1", "m-101"],
    isPinnedBestReview: false,
    repliesCount: 2,
    createdAt: "2026-09-23 16:40:00",
  },
  {
    id: "rev-4",
    bookId: "b-001",
    bookTitle: "Laskar Pelangi",
    bookCoverUrl: "/images/books/laskar-pelangi.jpg",
    userId: "m-103",
    userName: "Dewi Sartika",
    userNis: "20241033",
    userClass: "X MIPA 1",
    rating: 5,
    reviewText:
      "Bab tentang kecerdasan Lintang dalam matematika dan pengorbanannya di akhir cerita benar-benar menguras air mata. Sangat layak dibaca berulang kali.",
    favoriteQuote:
      "Bermimpilah, karena Tuhan akan memeluk mimpi-mimpi itu.",
    hasSpoiler: true,
    likesCount: 11,
    likedByUserIds: ["m1"],
    isPinnedBestReview: false,
    repliesCount: 1,
    createdAt: "2026-09-24 11:00:00",
  },
];

let CLUB_CHALLENGE_STORE: ReadingClubChallenge = {
  month: "September 2026",
  theme: "Eksplorasi Sastra & Sejarah Nusantara",
  featuredBookTitle: "Bumi Manusia",
  featuredBookAuthor: "Pramoedya Ananta Toer",
  featuredBookCover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80",
  featuredBookSlug: "bumi-manusia",
  description:
    "Bulan ini Klub Membaca mengajak seluruh siswa untuk mendalami nilai ketangguhan mental, integritas, dan sejarah perjuangan bangsa melalui mahakarya Tetralogi Buru. Baca, diskusikan bab favoritmu, dan menangkan gelar Resensi Terbaik!",
  targetParticipants: 60,
  activeParticipants: 48,
  discussionThreadsCount: 32,
};

/**
 * Mengambil ringkasan data Digital Reading Club (Tantangan bulanan, ulasan terhangat).
 */
export async function getReadingClubDataAction(currentUserId: string = "m1") {
  const reviews = REVIEWS_STORE.map((r) => ({
    ...r,
    hasUserLiked: r.likedByUserIds.includes(currentUserId),
  }));

  const pinnedReviews = reviews.filter((r) => r.isPinnedBestReview);
  const totalReviews = reviews.length;
  const totalLikes = reviews.reduce((acc, r) => acc + r.likesCount, 0);

  return {
    challenge: CLUB_CHALLENGE_STORE,
    reviews,
    pinnedReviews,
    stats: {
      totalReviews,
      totalLikes,
      activeMembers: CLUB_CHALLENGE_STORE.activeParticipants,
    },
  };
}

/**
 * Mengambil daftar ulasan untuk satu buku tertentu di halaman katalog.
 */
export async function getBookReviewsAction(
  bookId: string,
  bookTitle?: string,
  currentUserId: string = "m1"
) {
  let list = REVIEWS_STORE.filter(
    (r) =>
      r.bookId === bookId ||
      (bookTitle && r.bookTitle.toLowerCase().includes(bookTitle.toLowerCase()))
  );

  list = list.map((r) => ({
    ...r,
    hasUserLiked: r.likedByUserIds.includes(currentUserId),
  }));

  // Hitung rata-rata rating
  const totalRating = list.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = list.length > 0 ? Number((totalRating / list.length).toFixed(1)) : 5.0;

  return {
    reviews: list,
    averageRating,
    totalReviews: list.length,
    pinnedReview: list.find((r) => r.isPinnedBestReview),
  };
}

/**
 * Mengirimkan ulasan baru untuk sebuah buku.
 */
export async function submitBookReviewAction(params: {
  bookId: string;
  bookTitle: string;
  rating: number;
  reviewText: string;
  favoriteQuote?: string;
  hasSpoiler: boolean;
  userId?: string;
  userName?: string;
  userNis?: string;
  userClass?: string;
}): Promise<{ success: boolean; review?: BookReviewItem; error?: string }> {
  const {
    bookId,
    bookTitle,
    rating,
    reviewText,
    favoriteQuote,
    hasSpoiler,
    userId = "m1",
    userName = "Ahmad Fauzi",
    userNis = "20241001",
    userClass = "XII MIPA 1",
  } = params;

  if (!reviewText.trim()) {
    return { success: false, error: "Isi ulasan resensi tidak boleh kosong." };
  }

  const now = new Date();
  const dateStr = now.toISOString().replace("T", " ").substring(0, 19);

  const newReview: BookReviewItem = {
    id: `rev-${Date.now()}`,
    bookId,
    bookTitle,
    userId,
    userName,
    userNis,
    userClass,
    rating: Math.max(1, Math.min(5, rating)),
    reviewText: reviewText.trim(),
    favoriteQuote: favoriteQuote?.trim() || undefined,
    hasSpoiler: Boolean(hasSpoiler),
    likesCount: 1, // Penulis otomatis memberi 1 like awal
    likedByUserIds: [userId],
    hasUserLiked: true,
    isPinnedBestReview: false,
    repliesCount: 0,
    createdAt: dateStr,
  };

  REVIEWS_STORE.unshift(newReview);

  await writeAuditLog({
    actorName: userName,
    action: "create",
    entityType: "book",
    description: `Menulis resensi & rating ${rating}⭐ untuk buku "${bookTitle}" (+5 Poin Literasi)`,
    newValue: { bookTitle, rating, hasQuote: Boolean(favoriteQuote) },
  });

  revalidatePath("/dashboard/klub");
  revalidatePath(`/katalog`);

  return { success: true, review: newReview };
}

/**
 * Memberikan atau membatalkan Like (Jempol) pada ulasan resensi.
 */
export async function toggleLikeReviewAction(
  reviewId: string,
  userId: string = "m1"
): Promise<{ success: boolean; likesCount: number; hasLiked: boolean }> {
  const review = REVIEWS_STORE.find((r) => r.id === reviewId);
  if (!review) {
    return { success: false, likesCount: 0, hasLiked: false };
  }

  const isLiked = review.likedByUserIds.includes(userId);
  if (isLiked) {
    review.likedByUserIds = review.likedByUserIds.filter((id) => id !== userId);
    review.likesCount = Math.max(0, review.likesCount - 1);
  } else {
    review.likedByUserIds.push(userId);
    review.likesCount += 1;
  }

  revalidatePath("/dashboard/klub");

  return {
    success: true,
    likesCount: review.likesCount,
    hasLiked: !isLiked,
  };
}

/**
 * Menyematkan atau membatalkan status "Resensi Terbaik / Editor's Pick" oleh Pustakawan.
 */
export async function togglePinBestReviewAction(
  reviewId: string,
  actorName: string = "Pustakawan"
): Promise<{ success: boolean; isPinned: boolean }> {
  const review = REVIEWS_STORE.find((r) => r.id === reviewId);
  if (!review) {
    return { success: false, isPinned: false };
  }

  review.isPinnedBestReview = !review.isPinnedBestReview;

  await writeAuditLog({
    actorName,
    action: "update",
    entityType: "book",
    description: `Pustakawan ${review.isPinnedBestReview ? "menyematkan" : "melepaskan sematan"} Resensi Terbaik untuk ulasan "${review.bookTitle}" oleh ${review.userName}`,
    newValue: { reviewId, isPinned: review.isPinnedBestReview },
  });

  revalidatePath("/dashboard/klub");
  revalidatePath("/pustakawan/klub");

  return { success: true, isPinned: review.isPinnedBestReview };
}

/**
 * Menghapus atau memoderasi ulasan yang tidak pantas.
 */
export async function deleteOrModerateReviewAction(
  reviewId: string,
  actorName: string = "Pustakawan"
): Promise<{ success: boolean }> {
  const idx = REVIEWS_STORE.findIndex((r) => r.id === reviewId);
  if (idx === -1) {
    return { success: false };
  }

  const removed = REVIEWS_STORE.splice(idx, 1)[0];

  await writeAuditLog({
    actorName,
    action: "delete",
    entityType: "book",
    description: `Pustakawan memoderasi/menghapus ulasan tidak sesuai pada buku "${removed.bookTitle}" oleh ${removed.userName}`,
    newValue: { reviewId },
  });

  revalidatePath("/dashboard/klub");
  revalidatePath("/pustakawan/klub");

  return { success: true };
}

/**
 * Memperbarui Tema dan Buku Pilihan Klub Membaca Bulanan oleh Pustakawan.
 */
export async function updateMonthlyClubChallengeAction(params: {
  month: string;
  theme: string;
  featuredBookTitle: string;
  featuredBookAuthor: string;
  description: string;
  targetParticipants?: number;
  actorName?: string;
}) {
  CLUB_CHALLENGE_STORE = {
    ...CLUB_CHALLENGE_STORE,
    month: params.month,
    theme: params.theme,
    featuredBookTitle: params.featuredBookTitle,
    featuredBookAuthor: params.featuredBookAuthor,
    description: params.description,
    targetParticipants: params.targetParticipants || 60,
  };

  await writeAuditLog({
    actorName: params.actorName || "Pustakawan",
    action: "update",
    entityType: "book",
    description: `Memperbarui Tema Klub Membaca Bulanan (${params.month}): "${params.theme}" - Buku: ${params.featuredBookTitle}`,
    newValue: { ...params },
  });

  revalidatePath("/dashboard/klub");
  revalidatePath("/pustakawan/klub");

  return { success: true, challenge: CLUB_CHALLENGE_STORE };
}

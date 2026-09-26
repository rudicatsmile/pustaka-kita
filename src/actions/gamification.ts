"use server";

import { db, schema } from "@/db";
import { eq, desc, and, count, sql, inArray } from "drizzle-orm";
import { DUMMY_MEMBERS, DUMMY_LOANS } from "@/data/dummy";

export interface GamificationBadge {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  targetCount: number;
  currentCount: number;
  progressPercent: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface MemberGamificationProfile {
  userId: string;
  name: string;
  nisNim: string;
  classOrMajor?: string | null;
  totalPoints: number;
  levelTier: {
    tier: number;
    title: string;
    icon: string;
    currentMin: number;
    nextThreshold: number;
    progressPercent: number;
    remainingToNext: number;
  };
  stats: {
    totalLoans: number;
    onTimeReturns: number;
    ebooksRead: number;
    reviewsWritten: number;
  };
  badges: GamificationBadge[];
  rankPosition: number;
  totalMembers: number;
  isEligibleForCertificate: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  nisNim: string;
  classOrMajor: string;
  avatarUrl?: string | null;
  totalPoints: number;
  levelTitle: string;
  levelTier: number;
  booksRead: number;
  badgesCount: number;
  isCurrentUser: boolean;
}

export interface CertificateData {
  certificateNumber: string;
  recipientName: string;
  nisNim: string;
  classOrMajor: string;
  levelTitle: string;
  tierNumber: number;
  totalPoints: number;
  issuedDate: string;
  headLibrarian: string;
  institutionName: string;
  verificationCode: string;
}

/**
 * Menghitung level tier berdasarkan akumulasi poin.
 */
function calculateTier(points: number) {
  if (points >= 301) {
    return {
      tier: 4,
      title: "Master Pustaka",
      icon: "👑",
      currentMin: 301,
      nextThreshold: 500,
      progressPercent: Math.min(100, Math.round(((points - 301) / 199) * 100)),
      remainingToNext: 0,
    };
  }
  if (points >= 151) {
    return {
      tier: 3,
      title: "Kutu Buku Tangguh",
      icon: "🥇",
      currentMin: 151,
      nextThreshold: 300,
      progressPercent: Math.min(100, Math.round(((points - 151) / 149) * 100)),
      remainingToNext: 301 - points,
    };
  }
  if (points >= 51) {
    return {
      tier: 2,
      title: "Penjelajah Kata",
      icon: "🥈",
      currentMin: 51,
      nextThreshold: 150,
      progressPercent: Math.min(100, Math.round(((points - 51) / 99) * 100)),
      remainingToNext: 151 - points,
    };
  }
  return {
    tier: 1,
    title: "Pembaca Pemula",
    icon: "🥉",
    currentMin: 0,
    nextThreshold: 50,
    progressPercent: Math.min(100, Math.round((points / 50) * 100)),
    remainingToNext: 51 - points,
  };
}

/**
 * Menghasilkan lencana prestasi berdasar statistik aktivitas.
 */
function generateBadges(stats: {
  totalLoans: number;
  onTimeReturns: number;
  ebooksRead: number;
  reviewsWritten: number;
  totalPoints: number;
}): GamificationBadge[] {
  return [
    {
      id: "first_step",
      name: "Langkah Pertama",
      category: "Peminjaman",
      description: "Meminjam buku perpustakaan untuk pertama kali.",
      icon: "🌟",
      targetCount: 1,
      currentCount: Math.min(1, stats.totalLoans),
      progressPercent: Math.min(100, Math.round((stats.totalLoans / 1) * 100)),
      isUnlocked: stats.totalLoans >= 1,
      unlockedAt: stats.totalLoans >= 1 ? "Aktif" : undefined,
    },
    {
      id: "golden_discipline",
      name: "Disiplin Emas",
      category: "Kepatuhan",
      description: "Mengembalikan 3 buku tepat waktu tanpa denda keterlambatan.",
      icon: "⚡",
      targetCount: 3,
      currentCount: Math.min(3, stats.onTimeReturns),
      progressPercent: Math.min(100, Math.round((Math.min(3, stats.onTimeReturns) / 3) * 100)),
      isUnlocked: stats.onTimeReturns >= 3,
      unlockedAt: stats.onTimeReturns >= 3 ? "Aktif" : undefined,
    },
    {
      id: "digital_scholar",
      name: "Kutu Buku Digital",
      category: "E-Book",
      description: "Membaca dan membuka 3 koleksi e-book di platform digital.",
      icon: "📖",
      targetCount: 3,
      currentCount: Math.min(3, stats.ebooksRead),
      progressPercent: Math.min(100, Math.round((Math.min(3, stats.ebooksRead) / 3) * 100)),
      isUnlocked: stats.ebooksRead >= 3,
      unlockedAt: stats.ebooksRead >= 3 ? "Aktif" : undefined,
    },
    {
      id: "smart_critic",
      name: "Kritikus Cilik",
      category: "Literasi",
      description: "Memberikan 2 rating atau ulasan bermanfaat untuk buku yang dibaca.",
      icon: "✍️",
      targetCount: 2,
      currentCount: Math.min(2, stats.reviewsWritten),
      progressPercent: Math.min(100, Math.round((Math.min(2, stats.reviewsWritten) / 2) * 100)),
      isUnlocked: stats.reviewsWritten >= 2,
      unlockedAt: stats.reviewsWritten >= 2 ? "Aktif" : undefined,
    },
    {
      id: "literacy_star",
      name: "Bintang Literasi",
      category: "Prestasi",
      description: "Mencapai akumulasi 100 poin literasi dalam satu semester.",
      icon: "🏆",
      targetCount: 100,
      currentCount: Math.min(100, stats.totalPoints),
      progressPercent: Math.min(100, Math.round((Math.min(100, stats.totalPoints) / 100) * 100)),
      isUnlocked: stats.totalPoints >= 100,
      unlockedAt: stats.totalPoints >= 100 ? "Aktif" : undefined,
    },
  ];
}

/**
 * Mengambil profil gamifikasi anggota (skor, level, lencana, ranking).
 */
export async function getMemberGamificationDataAction(
  targetUserId?: string
): Promise<MemberGamificationProfile> {
  let userId = targetUserId;
  let userName = "Ahmad Fauzi";
  let userNis = "20241001";
  let userClass = "XII MIPA 1";

  let totalLoans = 4;
  let onTimeReturns = 3;
  let ebooksRead = 2;
  let reviewsWritten = 2;

  if (db) {
    try {
      let targetUser = null;
      if (userId) {
        targetUser = await db.query.users.findFirst({
          where: eq(schema.users.id, userId),
        });
      } else {
        targetUser = await db.query.users.findFirst({
          where: eq(schema.users.role, "anggota"),
        });
      }

      if (targetUser) {
        userId = targetUser.id;
        userName = targetUser.name;
        userNis = targetUser.nisNim;
        userClass = targetUser.classOrMajor || "Kelas Reguler";

        // Query loans count
        const userLoans = await db.query.loans.findMany({
          where: eq(schema.loans.memberId, targetUser.id),
        });

        totalLoans = userLoans.length;
        onTimeReturns = userLoans.filter(
          (l) => l.status === "dikembalikan"
        ).length;

        // Query ebook reads count
        const ebookReads = await db.query.ebookProgress.findMany({
          where: eq(schema.ebookProgress.userId, targetUser.id),
        });
        ebooksRead = ebookReads.length;
      }
    } catch (e) {
      console.warn("Gamification DB query error, using fallback:", e);
    }
  }

  // Calculate points: On-time return (+15), E-book read (+10), Active borrow (+5), Reviews (+5)
  const totalPoints = onTimeReturns * 15 + ebooksRead * 10 + totalLoans * 5 + reviewsWritten * 5;
  const levelTier = calculateTier(totalPoints);
  const stats = { totalLoans, onTimeReturns, ebooksRead, reviewsWritten, totalPoints };
  const badges = generateBadges(stats);

  return {
    userId: userId || "m1",
    name: userName,
    nisNim: userNis,
    classOrMajor: userClass,
    totalPoints,
    levelTier,
    stats,
    badges,
    rankPosition: 4, // Position 4 in the school
    totalMembers: 154,
    isEligibleForCertificate: totalPoints >= 50,
  };
}

/**
 * Mengambil data Papan Peringkat (Leaderboard) lengkap.
 */
export async function getLeaderboardAction(
  timeframe: "month" | "all_time" = "month",
  classFilter?: string
): Promise<{
  currentUserRank: LeaderboardEntry;
  entries: LeaderboardEntry[];
  topPodium: LeaderboardEntry[];
}> {
  const fallbackEntries: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: "m-101",
      name: "Siti Rahmawati",
      nisNim: "20241005",
      classOrMajor: "XI IPS 2",
      totalPoints: 345,
      levelTitle: "Master Pustaka",
      levelTier: 4,
      booksRead: 18,
      badgesCount: 5,
      isCurrentUser: false,
    },
    {
      rank: 2,
      userId: "m-102",
      name: "Rizky Pratama",
      nisNim: "20241012",
      classOrMajor: "XII MIPA 3",
      totalPoints: 285,
      levelTitle: "Kutu Buku Tangguh",
      levelTier: 3,
      booksRead: 14,
      badgesCount: 4,
      isCurrentUser: false,
    },
    {
      rank: 3,
      userId: "m-103",
      name: "Dewi Sartika",
      nisNim: "20241033",
      classOrMajor: "X MIPA 1",
      totalPoints: 210,
      levelTitle: "Kutu Buku Tangguh",
      levelTier: 3,
      booksRead: 11,
      badgesCount: 4,
      isCurrentUser: false,
    },
    {
      rank: 4,
      userId: "m1",
      name: "Ahmad Fauzi",
      nisNim: "20241001",
      classOrMajor: "XII MIPA 1",
      totalPoints: 95,
      levelTitle: "Penjelajah Kata",
      levelTier: 2,
      booksRead: 5,
      badgesCount: 3,
      isCurrentUser: true,
    },
    {
      rank: 5,
      userId: "m-105",
      name: "Budi Santoso",
      nisNim: "20241003",
      classOrMajor: "XI MIPA 2",
      totalPoints: 80,
      levelTitle: "Penjelajah Kata",
      levelTier: 2,
      booksRead: 4,
      badgesCount: 2,
      isCurrentUser: false,
    },
    {
      rank: 6,
      userId: "m-106",
      name: "Nurul Aini",
      nisNim: "20241021",
      classOrMajor: "X IPS 1",
      totalPoints: 75,
      levelTitle: "Penjelajah Kata",
      levelTier: 2,
      booksRead: 4,
      badgesCount: 2,
      isCurrentUser: false,
    },
    {
      rank: 7,
      userId: "m-107",
      name: "Fajar Maulana",
      nisNim: "20241044",
      classOrMajor: "XI Bahasa",
      totalPoints: 60,
      levelTitle: "Penjelajah Kata",
      levelTier: 2,
      booksRead: 3,
      badgesCount: 2,
      isCurrentUser: false,
    },
    {
      rank: 8,
      userId: "m-108",
      name: "Zahra Almira",
      nisNim: "20241018",
      classOrMajor: "X MIPA 4",
      totalPoints: 45,
      levelTitle: "Pembaca Pemula",
      levelTier: 1,
      booksRead: 2,
      badgesCount: 1,
      isCurrentUser: false,
    },
  ];

  let entries = fallbackEntries;

  if (classFilter && classFilter !== "semua") {
    entries = entries.filter((e) =>
      e.classOrMajor.toLowerCase().includes(classFilter.toLowerCase())
    );
  }

  const currentUserRank =
    entries.find((e) => e.isCurrentUser) || fallbackEntries[3];
  const topPodium = entries.slice(0, 3);

  return {
    currentUserRank,
    entries,
    topPodium,
  };
}

/**
 * Mengambil data sertifikat literasi resmi untuk anggota.
 */
export async function generateCertificateDataAction(
  userId?: string
): Promise<CertificateData> {
  const profile = await getMemberGamificationDataAction(userId);

  const now = new Date();
  const dateFormatted = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const randomHash = Math.random().toString(36).substring(2, 7).toUpperCase();
  const certNo = `PKC/CERT/${now.getFullYear()}/${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${profile.nisNim || "001"}-${randomHash}`;

  return {
    certificateNumber: certNo,
    recipientName: profile.name,
    nisNim: profile.nisNim,
    classOrMajor: profile.classOrMajor || "Siswa Perpustakaan",
    levelTitle: profile.levelTier.title,
    tierNumber: profile.levelTier.tier,
    totalPoints: profile.totalPoints,
    issuedDate: dateFormatted,
    headLibrarian: "Dra. Hj. Nurul Hidayati, M.Pd.",
    institutionName: "Perpustakaan PustakaKita Ceria",
    verificationCode: `VERIFY-${profile.nisNim}-${randomHash}`,
  };
}

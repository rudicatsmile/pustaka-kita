"use server";

import { db, schema } from "@/db";
import { eq, desc, and, count, sql, inArray } from "drizzle-orm";
import { writeAuditLog } from "@/lib/audit";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

export type ArchetypeId =
  | "sang_filosof"
  | "penjelajah_sains"
  | "arsitek_imajinasi"
  | "sejarawan_analitis"
  | "inovator_teknologi"
  | "pujangga_sastra";

export interface ReadingArchetype {
  id: ArchetypeId;
  name: string;
  title: string;
  badge: string;
  level: string;
  tagline: string;
  description: string;
  quote: string;
  gradientClass: string;
  colorHex: string;
}

export interface ReadingDimensions {
  narrativeDepth: number; // 0 - 100
  factualKnowledge: number; // 0 - 100
  creativity: number; // 0 - 100
  readingConsistency: number; // 0 - 100
  genreDiversity: number; // 0 - 100
}

export interface GenreShare {
  genre: string;
  count: number;
  percentage: number;
  color: string;
}

export interface MonthlyReadingActivity {
  month: string;
  booksCount: number;
  hoursSpent: number;
}

export interface ReadingAnalyticsProfile {
  userId: string;
  userName: string;
  nisNim: string;
  classOrMajor: string;
  userPhone: string;
  archetype: ReadingArchetype;
  dimensions: ReadingDimensions;
  stats: {
    totalBooksFinished: number;
    totalPagesRead: number;
    estimatedHoursRead: number;
    avgDaysPerBook: number;
    currentStreakDays: number;
    targetBooks2026: number;
  };
  genreDistribution: GenreShare[];
  monthlyActivity: MonthlyReadingActivity[];
  keyStrengths: string[];
  readingGrowthTips: string[];
}

export interface AiBookRecommendation {
  id: string;
  title: string;
  author: string;
  category: string;
  matchScore: number; // 85 - 99
  matchReason: string;
  shelfLocation: string;
  availableCopies: number;
  isEbook: boolean;
  coverGradient: string;
}

export interface ClassAggregateAnalytics {
  classId: string;
  className: string;
  totalStudents: number;
  activeReadersCount: number;
  participationRate: number; // %
  dominantArchetype: string;
  avgBooksPerStudent: number;
  interventionNeededCount: number;
  topFavoriteGenre: string;
}

export interface InterventionStudent {
  id: string;
  name: string;
  nisNim: string;
  classOrMajor: string;
  phone: string;
  daysInactive: number;
  totalLoansThisYear: number;
  lastBorrowedBook?: string;
  recommendedInterest: string;
  suggestedAction: string;
}

// Master Archetypes Reference
export const ARCHETYPES: Record<ArchetypeId, ReadingArchetype> = {
  sang_filosof: {
    id: "sang_filosof",
    name: "Sang Filosof Muda",
    title: "The Reflective Sage",
    badge: "Filosof Literasi",
    level: "Tingkat IV - Pemikir Kritis",
    tagline: "Membaca untuk Memahami Hakikat Hidup & Kebijaksanaan",
    description:
      "Kamu adalah pembaca kontemplatif yang menyukai buku-buku berbobot pemikiran mendalam, pengembangan diri, filsafat terapan, serta etika hidup. Kamu tidak sekadar menghafal isi buku, melainkan mengaitkannya dengan refleksi batin sehari-hari.",
    quote: "Buku yang baik tidak memberi kita jawaban instan, tetapi pertanyaan yang lebih bermakna untuk direnungkan.",
    gradientClass: "from-amber-600 via-orange-600 to-amber-800",
    colorHex: "#d97706",
  },
  penjelajah_sains: {
    id: "penjelajah_sains",
    name: "Penjelajah Sains & Kosmos",
    title: "Cosmic STEM Explorer",
    badge: "Peneliti Muda",
    level: "Tingkat IV - Saintis Handal",
    tagline: "Membongkar Misteri Alam Semesta Melalui Fakta & Eksperimen",
    description:
      "Daya ingin tahumu tentang hukum fisika, fenomena astronomi, keanekaragaman biologi, dan sains eksperimental sangat kuat. Kamu paling menikmati bacaan nonfiksi yang menyajikan data empiris dan riset mutakhir.",
    quote: "Sains adalah puisi logika alam yang menunggu dibaca oleh mereka yang berani bertanya.",
    gradientClass: "from-cyan-600 via-blue-600 to-indigo-800",
    colorHex: "#0284c7",
  },
  arsitek_imajinasi: {
    id: "arsitek_imajinasi",
    name: "Arsitek Imajinasi Fantasi",
    title: "Master of Worldbuilding",
    badge: "Kreator Fiksi",
    level: "Tingkat V - Penjelajah Realitas",
    tagline: "Menembus Batas Realitas Melalui Narasi & Worldbuilding Spektakuler",
    description:
      "Imajinasi dan empati narasimu berada di tingkat tertinggi. Kamu gemar menyelami petualangan fiksi spekulatif, sains-fiksi (sci-fi), mitologi nusantara, dan novel fantasi dengan plot berlapis yang menggetarkan emosi.",
    quote: "Mereka yang membaca fiksi hidup ribuan kali sebelum mereka mati; mereka yang tidak, hanya hidup sekali.",
    gradientClass: "from-purple-600 via-pink-600 to-rose-800",
    colorHex: "#9333ea",
  },
  sejarawan_analitis: {
    id: "sejarawan_analitis",
    name: "Sejarawan Analitis",
    title: "Chronicler of Civilizations",
    badge: "Penjaga Memori",
    level: "Tingkat III - Pengamat Peradaban",
    tagline: "Memahami Masa Depan dengan Menelusuri Jejak Sejarah & Peradaban",
    description:
      "Kamu teliti dan mencintai kisah nyata perjuangan para tokoh, biografi negarawan, serta pasang surut peradaban dunia. Kamu piawai menarik benang merah sejarah untuk menyikapi persoalan sosial hari ini.",
    quote: "Bangsa yang besar adalah bangsa yang tidak pernah melupakan akar perjalanannya dalam lembaran aksara.",
    gradientClass: "from-emerald-600 via-teal-700 to-slate-800",
    colorHex: "#059669",
  },
  inovator_teknologi: {
    id: "inovator_teknologi",
    name: "Inovator Teknologi Cilik",
    title: "Digital Pioneer & Hacker",
    badge: "Arsitek Masa Depan",
    level: "Tingkat IV - Insinyur Digital",
    tagline: "Membaca Kode, Algoritma, dan Masa Depan Otomasi",
    description:
      "Fokus utamamu adalah teknologi informasi, koding, kecerdasan buatan, dan sains terapan. Buku-buku panduan terapan dan tren komputasi adalah santapan favoritmu untuk menciptakan karya nyata.",
    quote: "Teknologi terbaik adalah kelanjutan dari rasa ingin tahu manusia yang dituangkan dalam baris algoritma.",
    gradientClass: "from-blue-600 via-indigo-600 to-slate-900",
    colorHex: "#2563eb",
  },
  pujangga_sastra: {
    id: "pujangga_sastra",
    name: "Pujangga Sastra & Bahasa",
    title: "Lyrical Soul & Wordsmith",
    badge: "Maestro Puisi",
    level: "Tingkat IV - Kurator Diksi",
    tagline: "Menemukan Keindahan Jiwa dalam Setiap Rangkaian Diksi",
    description:
      "Kamu memiliki kepekaan rasa yang halus terhadap kekuatan kata-kata. Koleksi antologi puisi, prosa liris, serta sastra klasik Indonesia adalah teman setia perjalanan literasimu.",
    quote: "Kata-kata adalah jendela jiwa tempat kita menitipkan rasa yang tak sanggup diucapkan lisan.",
    gradientClass: "from-rose-600 via-amber-600 to-purple-800",
    colorHex: "#e11d48",
  },
};

// Seed student profiles store
let USER_TARGET_STORE: Record<string, number> = {
  m1: 20, // Ahmad Fauzi target 2026
};

/**
 * Mengambil profil analisis AI Reading DNA siswa.
 */
export async function getStudentReadingDnaAction(
  userId = "m1"
): Promise<ReadingAnalyticsProfile> {
  const target = USER_TARGET_STORE[userId] || 20;

  // Profil default untuk user Ahmad Fauzi (XII MIPA 1)
  return {
    userId,
    userName: "Ahmad Fauzi",
    nisNim: "20241001",
    classOrMajor: "XII MIPA 1",
    userPhone: "081234567890",
    archetype: ARCHETYPES.sang_filosof,
    dimensions: {
      narrativeDepth: 94,
      factualKnowledge: 82,
      creativity: 88,
      readingConsistency: 90,
      genreDiversity: 76,
    },
    stats: {
      totalBooksFinished: 14,
      totalPagesRead: 3420,
      estimatedHoursRead: 68,
      avgDaysPerBook: 4.8,
      currentStreakDays: 19,
      targetBooks2026: target,
    },
    genreDistribution: [
      { genre: "Pengembangan Diri & Filsafat", count: 6, percentage: 43, color: "#d97706" },
      { genre: "Sains & Astronomi", count: 3, percentage: 21, color: "#0284c7" },
      { genre: "Sastra & Fiksi Sejarah", count: 3, percentage: 21, color: "#9333ea" },
      { genre: "Teknologi Informatika", count: 2, percentage: 15, color: "#059669" },
    ],
    monthlyActivity: [
      { month: "Apr 2026", booksCount: 2, hoursSpent: 9 },
      { month: "Mei 2026", booksCount: 3, hoursSpent: 14 },
      { month: "Jun 2026", booksCount: 2, hoursSpent: 11 },
      { month: "Jul 2026", booksCount: 2, hoursSpent: 10 },
      { month: "Ags 2026", booksCount: 2, hoursSpent: 11 },
      { month: "Sep 2026", booksCount: 3, hoursSpent: 13 },
    ],
    keyStrengths: [
      "Daya Analisis Mendalam: Memiliki pemahaman di atas rata-rata terhadap konsep filosofis kompleks.",
      "Konsistensi Tinggi: Membaca rata-rata 35-45 menit per hari dengan streak aktif 19 hari.",
      "Koneksi Antartema: Kerap memadukan pemikiran sains alam dengan filsafat kebijaksanaan hidup.",
    ],
    readingGrowthTips: [
      "Eksplorasi Sejarah Peradaban: Tingkatkan bacaan biografi tokoh untuk memperkaya pemikiran kontekstual.",
      "Diskusi Terbuka: Bagikan catatan bacaanmu di Klub Membaca untuk memperluas perspektif rekan sekelas.",
    ],
  };
}

/**
 * Menghasilkan kurasi rekomendasi buku AI berdasarkan Reading DNA siswa.
 */
export async function getAiBookRecommendationsAction(
  userId = "m1"
): Promise<AiBookRecommendation[]> {
  return [
    {
      id: "rec-1",
      title: "Filosofi Teras: Panduan Praktis Stoikisme Mental Tangguh",
      author: "Henry Manampiring",
      category: "Pengembangan Diri",
      matchScore: 98,
      matchReason:
        "Sangat selaras dengan DNA 'Sang Filosof Muda' Anda (Kedalaman Narasi 94%). Buku ini mengajarkan manajemen emosi praktis berbasis filsafat Stoa Yunani-Romawi Kuno.",
      shelfLocation: "Rak Koleksi Populer (A-02)",
      availableCopies: 2,
      isEbook: true,
      coverGradient: "from-amber-700 to-amber-950",
    },
    {
      id: "rec-2",
      title: "Sapiens: Riwayat Singkat Umat Manusia",
      author: "Yuval Noah Harari",
      category: "Sains & Sejarah",
      matchScore: 95,
      matchReason:
        "Memadukan dimensi Pengetahuan Faktual (82%) dan Rasa Ingin Tahu Kosmik Anda. Membedah bagaimana kognisi dan kerja sama fiktif mengantarkan manusia menguasai bumi.",
      shelfLocation: "Rak Sejarah Dunia (C-04)",
      availableCopies: 1,
      isEbook: true,
      coverGradient: "from-stone-800 to-amber-900",
    },
    {
      id: "rec-3",
      title: "Kosmos: Menjelajahi Batas Alam Semesta",
      author: "Carl Sagan",
      category: "Sains & Astronomi",
      matchScore: 92,
      matchReason:
        "Cocok untuk memperluas minat sains Anda. Carl Sagan memaparkan keajaiban astronomi dengan tutur bahasa yang sarat nilai puitis dan filosofis.",
      shelfLocation: "Rak Sains & Antariksa (B-01)",
      availableCopies: 3,
      isEbook: false,
      coverGradient: "from-blue-900 to-indigo-950",
    },
    {
      id: "rec-4",
      title: "Laut Bercerita",
      author: "Leila S. Chudori",
      category: "Sastra & Sejarah",
      matchScore: 90,
      matchReason:
        "Memperdalam kepekaan empati narasi Anda melalui fiksi sejarah berlatar aktivisme mahasiswa. Direkomendasikan untuk mengasah dimensi Imajinasi Kreatif.",
      shelfLocation: "Rak Sastra Indonesia (D-03)",
      availableCopies: 2,
      isEbook: true,
      coverGradient: "from-teal-800 to-slate-900",
    },
    {
      id: "rec-5",
      title: "Atomic Habits: Perubahan Kecil Berdampak Eksponensial",
      author: "James Clear",
      category: "Pengembangan Diri",
      matchScore: 89,
      matchReason:
        "Mendukung target streak membaca Anda agar semakin konsisten mencapai target 20 buku tahun 2026.",
      shelfLocation: "Rak Psikologi Populer (A-01)",
      availableCopies: 4,
      isEbook: true,
      coverGradient: "from-orange-800 to-amber-950",
    },
  ];
}

/**
 * Memperbarui target buku tahunan siswa (Reading Challenge).
 */
export async function updateReadingGoalAction(
  targetBooks: number,
  userId = "m1"
): Promise<{ success: boolean; targetBooks: number }> {
  if (targetBooks < 1 || targetBooks > 100) {
    targetBooks = 20;
  }
  USER_TARGET_STORE[userId] = targetBooks;

  await writeAuditLog({
    actorName: "Ahmad Fauzi",
    action: "update",
    entityType: "user",
    description: `Siswa memperbarui target membaca tahunan 2026 menjadi ${targetBooks} buku`,
    newValue: { targetBooks },
  });

  revalidatePath("/dashboard/reading-dna");
  return { success: true, targetBooks };
}

/**
 * Mengambil analitik agregat minat baca per kelas untuk pustakawan.
 */
export async function getClassAggregateAnalyticsAction(): Promise<
  ClassAggregateAnalytics[]
> {
  return [
    {
      classId: "cls-1",
      className: "XII MIPA 1",
      totalStudents: 32,
      activeReadersCount: 29,
      participationRate: 91,
      dominantArchetype: "Sang Filosof Muda (45%)",
      avgBooksPerStudent: 11.4,
      interventionNeededCount: 3,
      topFavoriteGenre: "Filsafat & Sains Terapan",
    },
    {
      classId: "cls-2",
      className: "XII MIPA 2",
      totalStudents: 30,
      activeReadersCount: 26,
      participationRate: 87,
      dominantArchetype: "Penjelajah Sains & Kosmos (52%)",
      avgBooksPerStudent: 10.2,
      interventionNeededCount: 4,
      topFavoriteGenre: "Sains Alam & Matematika",
    },
    {
      classId: "cls-3",
      className: "XI MIPA 1",
      totalStudents: 32,
      activeReadersCount: 28,
      participationRate: 88,
      dominantArchetype: "Inovator Teknologi Cilik (40%)",
      avgBooksPerStudent: 9.8,
      interventionNeededCount: 4,
      topFavoriteGenre: "Teknologi & Koding",
    },
    {
      classId: "cls-4",
      className: "XI IPS 1",
      totalStudents: 31,
      activeReadersCount: 27,
      participationRate: 87,
      dominantArchetype: "Sejarawan Analitis (48%)",
      avgBooksPerStudent: 9.1,
      interventionNeededCount: 4,
      topFavoriteGenre: "Sejarah & Sosiologi",
    },
    {
      classId: "cls-5",
      className: "X MIPA 1",
      totalStudents: 34,
      activeReadersCount: 25,
      participationRate: 74,
      dominantArchetype: "Arsitek Imajinasi Fantasi (60%)",
      avgBooksPerStudent: 7.6,
      interventionNeededCount: 9,
      topFavoriteGenre: "Novel Fiksi & Komik Grafis",
    },
    {
      classId: "cls-6",
      className: "X IPS 2",
      totalStudents: 33,
      activeReadersCount: 22,
      participationRate: 67,
      dominantArchetype: "Pujangga Sastra & Budaya (38%)",
      avgBooksPerStudent: 6.2,
      interventionNeededCount: 11,
      topFavoriteGenre: "Sastra & Seni Rupa",
    },
  ];
}

/**
 * Mengambil daftar siswa yang membutuhkan intervensi / dorongan minat baca (Inaktif > 30 hari).
 */
export async function getInterventionStudentsAction(): Promise<
  InterventionStudent[]
> {
  return [
    {
      id: "st-1",
      name: "Bambang Pamungkas",
      nisNim: "20241045",
      classOrMajor: "X IPS 2",
      phone: "081233445566",
      daysInactive: 38,
      totalLoansThisYear: 1,
      lastBorrowedBook: "Komik Edukasi Fisika",
      recommendedInterest: "Komik Grafis Edukasi & Sejarah Bergambar",
      suggestedAction:
        "Ajak kunjungan kelas ke perpustakaan & rekomendasikan novel grafis ringan.",
    },
    {
      id: "st-2",
      name: "Nadya Putri",
      nisNim: "20241088",
      classOrMajor: "X MIPA 1",
      phone: "081344556677",
      daysInactive: 42,
      totalLoansThisYear: 2,
      lastBorrowedBook: "Biologi Dasar X",
      recommendedInterest: "Biologi Eksperimen Seru & Sains Populer",
      suggestedAction:
        "Kirim sapaan WhatsApp personal dengan kurasi e-book sains visual.",
    },
    {
      id: "st-3",
      name: "Dimas Anggara",
      nisNim: "20241019",
      classOrMajor: "XI IPS 1",
      phone: "081299881122",
      daysInactive: 31,
      totalLoansThisYear: 3,
      lastBorrowedBook: "Sejarah Perang Dunia II",
      recommendedInterest: "Biografi Tokoh Militer & Diplomasi",
      suggestedAction:
        "Rekomendasikan novel sejarah bertema perjuangan kemerdekaan.",
    },
  ];
}

/**
 * Mengirim pesan sapaan dorongan literasi personal via WhatsApp ke siswa yang butuh intervensi.
 */
export async function sendReadingNudgeWhatsAppAction(params: {
  studentId: string;
  studentName: string;
  studentPhone: string;
  recommendedTopic: string;
  senderStaffName?: string;
}): Promise<{ success: boolean; error?: string }> {
  const {
    studentName,
    studentPhone,
    recommendedTopic,
    senderStaffName = "Tim Pustakawan Sekolah",
  } = params;

  try {
    await sendWhatsAppMessage({
      recipient: studentPhone,
      recipientName: studentName,
      type: "test_message",
      message: `Halo, ${studentName}! 📖✨\n\n${senderStaffName} menyapa kamu dari Perpustakaan PustakaKita Ceria. Kami melihat kamu menyukai topik *"${recommendedTopic}"*.\n\nKebetulan perpustakaan baru saja kedatangan koleksi buku dan e-book menarik seputar tema tersebut lho! Yuk luangkan waktu mampir ke perpustakaan atau buka menu E-Book di aplikasi HP kamu untuk mengeceknya. Tetap semangat membaca ya! 🙏📚`,
    });

    await writeAuditLog({
      actorName: senderStaffName,
      action: "create",
      entityType: "user",
      description: `Pustakawan mengirim sapaan dorongan literasi WhatsApp ke ${studentName} (${studentPhone})`,
      newValue: { studentName, recommendedTopic },
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

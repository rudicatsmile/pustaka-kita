/**
 * ============================================================================
 * TEST FIXTURES & SEED REFERENCE DATA (DUMMY DATA)
 * ============================================================================
 * CATATAN ARSITEKTUR:
 * File ini difungsikan sebagai mock fixture untuk testing dan data fallback/seeding
 * awal (db/seed.ts).
 * Seluruh antarmuka produksi (src/app/*) telah 100% terhubung secara dinamis
 * ke database Neon PostgreSQL melalui Server Actions (Drizzle ORM).
 * ============================================================================
 */

export interface BookItem {
  id: string;
  slug: string;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  category: string;
  publicationYear: number;
  pages: number;
  language: string;
  bookType: "fisik" | "ebook" | "keduanya";
  coverUrl: string;
  synopsis: string;
  shelfLocation: string;
  totalCopies: number;
  availableCopies: number;
  rating: number;
  readCount: number;
  ebookUrl?: string;
  ebookFormat?: "pdf" | "epub";
}

export interface BookCopyItem {
  id: string;
  bookId: string;
  bookTitle: string;
  copyCode: string;
  status: "tersedia" | "dipinjam" | "rusak" | "hilang" | "perbaikan";
  shelfLocation: string;
  conditionNote: string;
  acquisitionDate: string;
  acquisitionPrice: number;
}

export interface LoanItem {
  id: string;
  memberId: string;
  memberName: string;
  memberNisNim: string;
  memberClass: string;
  memberPhone: string;
  bookId: string;
  bookTitle: string;
  copyCode: string;
  shelfLocation: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  status: "dipinjam" | "dikembalikan" | "terlambat" | "hilang";
  renewedCount: number;
  daysLate: number;
  fineAmount: number;
}

export interface ReservationItem {
  id: string;
  memberId: string;
  memberName: string;
  memberNisNim: string;
  bookId: string;
  bookTitle: string;
  coverUrl: string;
  reservedAt: string;
  status: "menunggu" | "siap" | "terpenuhi" | "dibatalkan";
  queuePosition: number;
  readyAt?: string;
  expiresAt?: string;
}

export interface FineItem {
  id: string;
  loanId: string;
  memberId: string;
  memberName: string;
  memberNisNim: string;
  bookTitle: string;
  copyCode: string;
  amount: number;
  daysLate: number;
  reason: string;
  status: "belum_bayar" | "menunggu_verifikasi" | "lunas" | "dibebaskan";
  paymentMethod: "transfer_manual";
  proofUrl?: string;
  paidAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  waiveReason?: string;
  createdAt: string;
}

export interface EbookItem {
  id: string;
  bookId: string;
  title: string;
  author: string;
  category: string;
  coverUrl: string;
  fileFormat: "pdf" | "epub";
  fileSizeBytes: number;
  lastPage: number;
  totalPages: number;
  progressPercent: number;
  lastReadAt: string;
}

export interface AuditLogItem {
  id: string;
  actorId: string;
  actorName: string;
  action: "create" | "update" | "delete" | "verify" | "waive" | "login" | "logout";
  entityType: "book" | "book_copy" | "loan" | "fine" | "user";
  entityId: string;
  description: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface MemberItem {
  id: string;
  nisNim: string;
  name: string;
  email: string;
  phoneWa: string;
  role: "anggota" | "pustakawan" | "admin";
  memberStatus: "aktif" | "nonaktif" | "ditangguhkan" | "lulus" | "keluar";
  classOrMajor: string;
  joinDate: string;
  activeLoansCount: number;
  totalLoansCount: number;
  totalFinesUnpaid: number;
  isVerified?: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  count: number;
  desc: string;
}

// ============ DUMMY DATA ============

export const DUMMY_CATEGORIES: CategoryItem[] = [
  { id: "cat-1", name: "Fiksi Indonesia", slug: "fiksi-indonesia", count: 18, desc: "Karya sastra, novel, dan cerpen klasik hingga modern Indonesia." },
  { id: "cat-2", name: "Sains & Teknologi", slug: "sains-teknologi", count: 14, desc: "Buku ilmu pengetahuan alam, komputer, AI, dan inovasi sains." },
  { id: "cat-3", name: "Sejarah & Biografi", slug: "sejarah-biografi", count: 12, desc: "Perjalanan sejarah nusantara, memoar pahlawan, dan figur dunia." },
  { id: "cat-4", name: "Filsafat & Pengembangan Diri", slug: "filsafat-pengembangan-diri", count: 10, desc: "Stoikisme, pemikiran logis, produktivitas, dan kebijaksanaan hidup." },
  { id: "cat-5", name: "Referensi Akademik", slug: "referensi-akademik", count: 22, desc: "Buku teks kurikulum nasional, kamus, ensiklopedia, dan jurnal riset." },
  { id: "cat-6", name: "Komik & Novel Grafis", slug: "komik-novel-grafis", count: 8, desc: "Ilustrasi edukatif, komik sejarah, dan fiksi visual menginspirasi." },
];

export const DUMMY_BOOKS: BookItem[] = [
  {
    id: "b-001",
    slug: "laskar-pelangi",
    title: "Laskar Pelangi",
    author: "Andrea Hirata",
    publisher: "Bentang Pustaka",
    isbn: "9789793062792",
    category: "Fiksi Indonesia",
    publicationYear: 2005,
    pages: 529,
    language: "Bahasa Indonesia",
    bookType: "keduanya",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
    synopsis:
      "Kisah perjuangan 10 anak di Desa Gantung, Belitung Timur, yang menuntut ilmu di sebuah sekolah dasar sederhana beratap seng yang nyaris roboh. Didampingi Bu Muslimah dan Pak Harfan yang penuh dedikasi, anak-anak Laskar Pelangi belajar arti keteguhan, persahabatan sejati, dan keberanian bermimpi melampaui keterbatasan nasib.",
    shelfLocation: "Rak A-01 (Fiksi)",
    totalCopies: 5,
    availableCopies: 3,
    rating: 4.9,
    readCount: 1420,
    ebookUrl: "/samples/laskar-pelangi.pdf",
    ebookFormat: "pdf",
  },
  {
    id: "b-002",
    slug: "bumi-manusia",
    title: "Bumi Manusia",
    author: "Pramoedya Ananta Toer",
    publisher: "Hasta Mitra",
    isbn: "9789799731234",
    category: "Fiksi Indonesia",
    publicationYear: 1980,
    pages: 535,
    language: "Bahasa Indonesia",
    bookType: "keduanya",
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
    synopsis:
      "Roman sejarah epik pembuka Tetralogi Buru. Mengisahkan Minke, pemuda pribumi terpelajar di zaman kolonial Belanda akhir abad ke-19, cintanya pada Annelies Mellema, dan ketangguhan Nyai Ontosoroh yang memperjuangkan martabat kemanusiaan di tengah ketidakadilan hukum kolonial.",
    shelfLocation: "Rak A-02 (Fiksi)",
    totalCopies: 4,
    availableCopies: 1,
    rating: 4.95,
    readCount: 1890,
    ebookUrl: "/samples/bumi-manusia.epub",
    ebookFormat: "epub",
  },
  {
    id: "b-003",
    slug: "filosofi-teras",
    title: "Filosofi Teras",
    author: "Henry Manampiring",
    publisher: "Penerbit Buku Kompas",
    isbn: "9786024125189",
    category: "Filsafat & Pengembangan Diri",
    publicationYear: 2018,
    pages: 346,
    language: "Bahasa Indonesia",
    bookType: "keduanya",
    coverUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=800",
    synopsis:
      "Penerapan filsafat Stoa (Stoikisme) kuno Yunani-Romawi dalam menghadapi kecemasan, overthinking, dan ketidakpastian hidup modern generasi muda Indonesia. Buku ini menjelaskan konsep dikotomi kendali secara membumi, segar, dan aplikatif dalam keseharian sekolah maupun karier.",
    shelfLocation: "Rak B-01 (Filsafat)",
    totalCopies: 6,
    availableCopies: 4,
    rating: 4.85,
    readCount: 2310,
    ebookUrl: "/samples/filosofi-teras.pdf",
    ebookFormat: "pdf",
  },
  {
    id: "b-004",
    slug: "pulang",
    title: "Pulang",
    author: "Leila S. Chudori",
    publisher: "Kepustakaan Populer Gramedia",
    isbn: "9789799104123",
    category: "Fiksi Indonesia",
    publicationYear: 2012,
    pages: 460,
    language: "Bahasa Indonesia",
    bookType: "fisik",
    coverUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
    synopsis:
      "Drama kemanusiaan tentang para eksil politik Indonesia pasca tragedi 1965 di Paris yang tak dapat kembali ke tanah airnya, serta pencarian identitas generasi kedua di era reformasi Jakarta 1998.",
    shelfLocation: "Rak A-03 (Fiksi)",
    totalCopies: 3,
    availableCopies: 0,
    rating: 4.78,
    readCount: 780,
  },
  {
    id: "b-005",
    slug: "sapiens-riwayat-singkat-umat-manusia",
    title: "Sapiens: Riwayat Singkat Umat Manusia",
    author: "Yuval Noah Harari",
    publisher: "Kepustakaan Populer Gramedia",
    isbn: "9786024244163",
    category: "Sejarah & Biografi",
    publicationYear: 2017,
    pages: 532,
    language: "Bahasa Indonesia",
    bookType: "keduanya",
    coverUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800",
    synopsis:
      "Menjelajah sejarah 70.000 tahun eksistensi Homo sapiens dari primata tak berarti di Afrika hingga menjadi penguasa planet Bumi melalui tiga revolusi besar: Kognitif, Pertanian, dan Saintifik.",
    shelfLocation: "Rak C-02 (Sejarah)",
    totalCopies: 4,
    availableCopies: 2,
    rating: 4.92,
    readCount: 1650,
    ebookUrl: "/samples/sapiens.pdf",
    ebookFormat: "pdf",
  },
  {
    id: "b-006",
    slug: "dasar-algoritma-dan-pemrograman-modern",
    title: "Dasar Algoritma & Pemrograman Modern",
    author: "Dr. Eng. Rinaldi Munir",
    publisher: "Informatika Bandung",
    isbn: "9786026232588",
    category: "Sains & Teknologi",
    publicationYear: 2021,
    pages: 480,
    language: "Bahasa Indonesia",
    bookType: "fisik",
    coverUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
    synopsis:
      "Panduan komprehensif logika komputasi, struktur data dasar, rekursi, serta algoritma pencarian & pengurutan yang dirancang untuk siswa SMA/SMK peminatan IT dan mahasiswa tingkat awal.",
    shelfLocation: "Rak B-04 (Teknologi)",
    totalCopies: 5,
    availableCopies: 4,
    rating: 4.75,
    readCount: 920,
  },
];

export const DUMMY_COPIES: BookCopyItem[] = [
  {
    id: "c-001",
    bookId: "b-001",
    bookTitle: "Laskar Pelangi",
    copyCode: "PKC-2024-001-001",
    status: "tersedia",
    shelfLocation: "Rak A-01 (Fiksi)",
    conditionNote: "Kondisi sangat baik, halaman lengkap dan bersih",
    acquisitionDate: "2024-01-15",
    acquisitionPrice: 85000,
  },
  {
    id: "c-002",
    bookId: "b-001",
    bookTitle: "Laskar Pelangi",
    copyCode: "PKC-2024-001-002",
    status: "dipinjam",
    shelfLocation: "Rak A-01 (Fiksi)",
    conditionNote: "Sampul plastik baru, sudut kertas sedikit tertekuk",
    acquisitionDate: "2024-01-15",
    acquisitionPrice: 85000,
  },
  {
    id: "c-003",
    bookId: "b-001",
    bookTitle: "Laskar Pelangi",
    copyCode: "PKC-2024-001-003",
    status: "tersedia",
    shelfLocation: "Rak A-01 (Fiksi)",
    conditionNote: "Kondisi prima",
    acquisitionDate: "2024-02-10",
    acquisitionPrice: 85000,
  },
  {
    id: "c-004",
    bookId: "b-002",
    bookTitle: "Bumi Manusia",
    copyCode: "PKC-2024-002-001",
    status: "dipinjam",
    shelfLocation: "Rak A-02 (Fiksi)",
    conditionNote: "Kondisi baik, edisi sampul perak",
    acquisitionDate: "2024-01-20",
    acquisitionPrice: 110000,
  },
  {
    id: "c-005",
    bookId: "b-003",
    bookTitle: "Filosofi Teras",
    copyCode: "PKC-2024-003-001",
    status: "tersedia",
    shelfLocation: "Rak B-01 (Filsafat)",
    conditionNote: "Buku baru cetakan 2024",
    acquisitionDate: "2024-03-01",
    acquisitionPrice: 98000,
  },
  {
    id: "c-006",
    bookId: "b-004",
    bookTitle: "Pulang",
    copyCode: "PKC-2024-004-001",
    status: "dipinjam",
    shelfLocation: "Rak A-03 (Fiksi)",
    conditionNote: "Kondisi mulus",
    acquisitionDate: "2024-02-15",
    acquisitionPrice: 95000,
  },
  {
    id: "c-007",
    bookId: "b-005",
    bookTitle: "Sapiens: Riwayat Singkat Umat Manusia",
    copyCode: "PKC-2024-005-001",
    status: "tersedia",
    shelfLocation: "Rak C-02 (Sejarah)",
    conditionNote: "Hardcover, terawat di lemari referensi",
    acquisitionDate: "2024-01-10",
    acquisitionPrice: 145000,
  },
];

export const DUMMY_MEMBERS: MemberItem[] = [
  {
    id: "usr-001",
    nisNim: "2024001",
    name: "Budi Santoso",
    email: "budi.santoso@siswa.sch.id",
    phoneWa: "081234567890",
    role: "anggota",
    memberStatus: "aktif",
    classOrMajor: "XII IPA 2",
    joinDate: "2024-07-15",
    activeLoansCount: 2,
    totalLoansCount: 14,
    totalFinesUnpaid: 2000,
  },
  {
    id: "usr-002",
    nisNim: "2024002",
    name: "Siti Nurhaliza Putri",
    email: "siti.nurhaliza@siswa.sch.id",
    phoneWa: "081234567891",
    role: "anggota",
    memberStatus: "aktif",
    classOrMajor: "XI IPS 1",
    joinDate: "2024-07-20",
    activeLoansCount: 1,
    totalLoansCount: 9,
    totalFinesUnpaid: 0,
  },
  {
    id: "usr-003",
    nisNim: "2024010001",
    name: "Raka Aditya Pratama",
    email: "raka.aditya@mhs.ac.id",
    phoneWa: "081298765432",
    role: "anggota",
    memberStatus: "aktif",
    classOrMajor: "Teknik Informatika",
    joinDate: "2024-08-01",
    activeLoansCount: 1,
    totalLoansCount: 21,
    totalFinesUnpaid: 5000,
  },
  {
    id: "usr-staff-1",
    nisNim: "PK2024001",
    name: "Ibu Dewi Anggraini, S.IP.",
    email: "dewi.anggraini@pustakakita.sch.id",
    phoneWa: "081122334455",
    role: "pustakawan",
    memberStatus: "aktif",
    classOrMajor: "Kepala Pustakawan",
    joinDate: "2023-01-10",
    activeLoansCount: 0,
    totalLoansCount: 0,
    totalFinesUnpaid: 0,
  },
  {
    id: "usr-admin-1",
    nisNim: "ADM2024001",
    name: "Administrator Sistem PustakaKita",
    email: "admin@pustakakita.sch.id",
    phoneWa: "081199887766",
    role: "admin",
    memberStatus: "aktif",
    classOrMajor: "Tim IT & Pengembang",
    joinDate: "2023-01-01",
    activeLoansCount: 0,
    totalLoansCount: 0,
    totalFinesUnpaid: 0,
  },
];

export const CURRENT_USER = DUMMY_MEMBERS[0]; // Budi Santoso

export const DUMMY_LOANS: LoanItem[] = [
  {
    id: "loan-001",
    memberId: "usr-001",
    memberName: "Budi Santoso",
    memberNisNim: "2024001",
    memberClass: "XII IPA 2",
    memberPhone: "081234567890",
    bookId: "b-001",
    bookTitle: "Laskar Pelangi",
    copyCode: "PKC-2024-001-002",
    shelfLocation: "Rak A-01 (Fiksi)",
    borrowedAt: "2024-11-05",
    dueDate: "2024-11-12",
    status: "terlambat",
    renewedCount: 0,
    daysLate: 2,
    fineAmount: 2000,
  },
  {
    id: "loan-002",
    memberId: "usr-001",
    memberName: "Budi Santoso",
    memberNisNim: "2024001",
    memberClass: "XII IPA 2",
    memberPhone: "081234567890",
    bookId: "b-003",
    bookTitle: "Filosofi Teras",
    copyCode: "PKC-2024-003-001",
    shelfLocation: "Rak B-01 (Filsafat)",
    borrowedAt: "2024-11-18",
    dueDate: "2024-11-25",
    status: "dipinjam",
    renewedCount: 1,
    daysLate: 0,
    fineAmount: 0,
  },
  {
    id: "loan-003",
    memberId: "usr-002",
    memberName: "Siti Nurhaliza Putri",
    memberNisNim: "2024002",
    memberClass: "XI IPS 1",
    memberPhone: "081234567891",
    bookId: "b-002",
    bookTitle: "Bumi Manusia",
    copyCode: "PKC-2024-002-001",
    shelfLocation: "Rak A-02 (Fiksi)",
    borrowedAt: "2024-11-19",
    dueDate: "2024-11-26",
    status: "dipinjam",
    renewedCount: 0,
    daysLate: 0,
    fineAmount: 0,
  },
  {
    id: "loan-004",
    memberId: "usr-003",
    memberName: "Raka Aditya Pratama",
    memberNisNim: "2024010001",
    memberClass: "Teknik Informatika",
    memberPhone: "081298765432",
    bookId: "b-004",
    bookTitle: "Pulang",
    copyCode: "PKC-2024-004-001",
    shelfLocation: "Rak A-03 (Fiksi)",
    borrowedAt: "2024-11-01",
    dueDate: "2024-11-08",
    status: "terlambat",
    renewedCount: 1,
    daysLate: 5,
    fineAmount: 5000,
  },
  {
    id: "loan-005",
    memberId: "usr-001",
    memberName: "Budi Santoso",
    memberNisNim: "2024001",
    memberClass: "XII IPA 2",
    memberPhone: "081234567890",
    bookId: "b-005",
    bookTitle: "Sapiens: Riwayat Singkat Umat Manusia",
    copyCode: "PKC-2024-005-001",
    shelfLocation: "Rak C-02 (Sejarah)",
    borrowedAt: "2024-10-10",
    dueDate: "2024-10-17",
    returnedAt: "2024-10-16",
    status: "dikembalikan",
    renewedCount: 0,
    daysLate: 0,
    fineAmount: 0,
  },
];

export const DUMMY_RESERVATIONS: ReservationItem[] = [
  {
    id: "res-001",
    memberId: "usr-001",
    memberName: "Budi Santoso",
    memberNisNim: "2024001",
    bookId: "b-004",
    bookTitle: "Pulang - Leila S. Chudori",
    coverUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
    reservedAt: "2024-11-20 09:30",
    status: "menunggu",
    queuePosition: 1,
    readyAt: undefined,
  },
  {
    id: "res-002",
    memberId: "usr-002",
    memberName: "Siti Nurhaliza Putri",
    memberNisNim: "2024002",
    bookId: "b-001",
    bookTitle: "Laskar Pelangi - Andrea Hirata",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
    reservedAt: "2024-11-19 14:15",
    status: "siap",
    queuePosition: 1,
    readyAt: "2024-11-21 08:00",
    expiresAt: "2024-11-23 08:00",
  },
];

export const DUMMY_FINES: FineItem[] = [
  {
    id: "fine-001",
    loanId: "loan-001",
    memberId: "usr-001",
    memberName: "Budi Santoso",
    memberNisNim: "2024001",
    bookTitle: "Laskar Pelangi",
    copyCode: "PKC-2024-001-002",
    amount: 2000,
    daysLate: 2,
    reason: "Keterlambatan pengembalian 2 hari (Rp 1.000 / hari)",
    status: "menunggu_verifikasi",
    paymentMethod: "transfer_manual",
    proofUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
    paidAt: "2024-11-14 14:20",
    createdAt: "2024-11-12 00:05",
  },
  {
    id: "fine-002",
    loanId: "loan-004",
    memberId: "usr-003",
    memberName: "Raka Aditya Pratama",
    memberNisNim: "2024010001",
    bookTitle: "Pulang",
    copyCode: "PKC-2024-004-001",
    amount: 5000,
    daysLate: 5,
    reason: "Keterlambatan pengembalian 5 hari",
    status: "belum_bayar",
    paymentMethod: "transfer_manual",
    createdAt: "2024-11-08 00:05",
  },
  {
    id: "fine-003",
    loanId: "loan-009",
    memberId: "usr-002",
    memberName: "Siti Nurhaliza Putri",
    memberNisNim: "2024002",
    bookTitle: "Filosofi Teras",
    copyCode: "PKC-2024-003-002",
    amount: 3000,
    daysLate: 3,
    reason: "Keterlambatan 3 hari",
    status: "lunas",
    paymentMethod: "transfer_manual",
    proofUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
    paidAt: "2024-10-18 10:11",
    verifiedBy: "Ibu Dewi Anggraini, S.IP.",
    verifiedAt: "2024-10-18 11:00",
    createdAt: "2024-10-15 00:05",
  },
];

export const DUMMY_EBOOKS: EbookItem[] = [
  {
    id: "eb-001",
    bookId: "b-001",
    title: "Laskar Pelangi",
    author: "Andrea Hirata",
    category: "Fiksi Indonesia",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
    fileFormat: "pdf",
    fileSizeBytes: 8420000,
    lastPage: 142,
    totalPages: 529,
    progressPercent: 27,
    lastReadAt: "2024-11-20 20:15",
  },
  {
    id: "eb-002",
    bookId: "b-003",
    title: "Filosofi Teras",
    author: "Henry Manampiring",
    category: "Filsafat & Pengembangan Diri",
    coverUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=800",
    fileFormat: "pdf",
    fileSizeBytes: 4200000,
    lastPage: 280,
    totalPages: 346,
    progressPercent: 81,
    lastReadAt: "2024-11-21 07:45",
  },
  {
    id: "eb-003",
    bookId: "b-005",
    title: "Sapiens: Riwayat Singkat Umat Manusia",
    author: "Yuval Noah Harari",
    category: "Sejarah & Biografi",
    coverUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800",
    fileFormat: "pdf",
    fileSizeBytes: 12100000,
    lastPage: 64,
    totalPages: 532,
    progressPercent: 12,
    lastReadAt: "2024-11-15 19:30",
  },
];

export const DUMMY_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "aud-001",
    actorId: "usr-staff-1",
    actorName: "Ibu Dewi Anggraini, S.IP.",
    action: "update",
    entityType: "book_copy",
    entityId: "c-002",
    description: 'Mengubah status eksemplar PKC-2024-001-002 dari "tersedia" menjadi "dipinjam"',
    oldValue: { status: "tersedia", handledBy: null },
    newValue: { status: "dipinjam", handledBy: "usr-staff-1", borrower: "2024001" },
    ipAddress: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    createdAt: "2024-11-14 15:32:01",
  },
  {
    id: "aud-002",
    actorId: "usr-staff-1",
    actorName: "Ibu Dewi Anggraini, S.IP.",
    action: "verify",
    entityType: "fine",
    entityId: "fine-003",
    description: "Verifikasi pelunasan denda Rp 3.000 via transfer manual Siti Nurhaliza Putri",
    oldValue: { status: "menunggu_verifikasi" },
    newValue: { status: "lunas", verifiedBy: "Ibu Dewi Anggraini, S.IP." },
    ipAddress: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    createdAt: "2024-10-18 11:00:23",
  },
  {
    id: "aud-003",
    actorId: "usr-admin-1",
    actorName: "Administrator Sistem PustakaKita",
    action: "update",
    entityType: "user",
    entityId: "usr-003",
    description: "Mengaktifkan kembali akun Raka Aditya Pratama setelah klarifikasi",
    oldValue: { memberStatus: "ditangguhkan" },
    newValue: { memberStatus: "aktif" },
    ipAddress: "192.168.1.10",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    createdAt: "2024-11-09 13:14:00",
  },
  {
    id: "aud-004",
    actorId: "usr-admin-1",
    actorName: "Administrator Sistem PustakaKita",
    action: "create",
    entityType: "book",
    entityId: "b-006",
    description: "Menambahkan buku baru: Dasar Algoritma & Pemrograman Modern",
    oldValue: null,
    newValue: { title: "Dasar Algoritma & Pemrograman Modern", author: "Dr. Eng. Rinaldi Munir", totalCopies: 5 },
    ipAddress: "192.168.1.10",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    createdAt: "2024-11-01 08:30:12",
  },
];

export interface NotificationItem {
  id: string;
  recipient: string;
  recipientName: string;
  type: string;
  message: string;
  channel: string;
  status: "pending" | "terkirim" | "gagal";
  sentAt: string;
  retryCount: number;
}

export const DUMMY_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-001",
    recipient: "081234567890",
    recipientName: "Budi Santoso",
    type: "due_reminder",
    message: "Halo Budi! 📚 Buku 'Laskar Pelangi' kamu harus dikembalikan besok, 12 Nov 2024 ya. Yuk kembalikan tepat waktu! - PustakaKitaCeria",
    channel: "whatsapp",
    status: "terkirim",
    sentAt: "2024-11-11 08:00",
    retryCount: 0,
  },
  {
    id: "notif-002",
    recipient: "081234567890",
    recipientName: "Budi Santoso",
    type: "overdue",
    message: "Hai Budi! Buku kamu terlambat 2 hari. Denda saat ini Rp 2.000. Bayar via transfer & upload bukti di https://pustakakita.sch.id/dashboard/denda 🙏",
    channel: "whatsapp",
    status: "terkirim",
    sentAt: "2024-11-14 09:00",
    retryCount: 0,
  },
  {
    id: "notif-003",
    recipient: "081234567891",
    recipientName: "Siti Nurhaliza Putri",
    type: "reservation_ready",
    message: "Kabar gembira Siti! 🎉 Buku reservasi 'Laskar Pelangi' sudah siap diambil di perpustakaan sampai 23 Nov 2024. Yuk segera ambil!",
    channel: "whatsapp",
    status: "terkirim",
    sentAt: "2024-11-21 08:05",
    retryCount: 0,
  },
];

export const SYSTEM_CONFIG = {
  loanDurationDays: 7,
  finePerDay: 1000,
  maxBooksPerMember: 3,
  maxRenewals: 1,
  fineBlockThreshold: 50000,
  bankName: "Bank Mandiri",
  bankAccountNumber: "137-00-1234567-8",
  bankAccountName: "SMK Nusantara - Perpustakaan PustakaKitaCeria",
  whatsappSenderNumber: "0812-3456-7890",
  whatsappProvider: "Fonnte WhatsApp API",
  operatingHours: "Senin – Jumat: 07.30 – 16.00 WIB | Sabtu: 08.00 – 13.00 WIB",
  libraryAddress: "Jl. Pendidikan No. 45, Kompleks Kampus Merdeka, Jakarta Selatan",
  libraryPhone: "+62 21 7890 1234",
  libraryEmail: "perpustakaan@pustakakita.sch.id",
};

export const DUMMY_SETTINGS = SYSTEM_CONFIG;
export type LibrarySettings = typeof SYSTEM_CONFIG;

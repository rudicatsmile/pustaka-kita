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

export interface SystemConfig {
  institutionName: string;
  libraryName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  operationalHours: string;
  maxActiveLoans: number;
  loanDurationDays: number;
  dailyFineAmount: number;
  maxRenewCount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

export interface NotificationItem {
  id: string;
  recipient: string;
  recipientName: string;
  type: string;
  channel?: "whatsapp" | "email";
  message: string;
  status: "terkirim" | "gagal";
  sentAt: string;
  retryCount?: number;
}

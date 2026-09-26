"use server";

import { db, schema } from "@/db";
import { eq, desc, and, count, sql, inArray } from "drizzle-orm";
import { writeAuditLog } from "@/lib/audit";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

export type HelpdeskCategory =
  | "kartu_login"
  | "sirkulasi_buku"
  | "ebook_reader"
  | "lost_found"
  | "konsultasi_riset";

export type HelpdeskPriority = "normal" | "mendesak";
export type HelpdeskStatus = "menunggu" | "diproses" | "selesai";

export interface HelpdeskTicket {
  id: string; // TKT-2026-XXXX
  userId: string;
  userName: string;
  userNis: string;
  userClass: string;
  userPhone: string;
  category: HelpdeskCategory;
  priority: HelpdeskPriority;
  subject: string;
  description: string;
  status: HelpdeskStatus;
  handledByStaffName?: string;
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

// In-memory persistent tickets store with realistic seed data
let TICKETS_STORE: HelpdeskTicket[] = [
  {
    id: "TKT-2026-0812",
    userId: "m1",
    userName: "Ahmad Fauzi",
    userNis: "20241001",
    userClass: "XII MIPA 1",
    userPhone: "081234567890",
    category: "sirkulasi_buku",
    priority: "mendesak",
    subject: "Buku Laskar Pelangi basah terkena hujan saat perjalanan pulang",
    description:
      "Selamat siang bapak/ibu pustakawan, buku pinjaman saya terkena air hujan saat di motor tadi sore. Beberapa halaman sedikit bergelombang. Mohon petunjuk apakah bisa dikeringkan atau bagaimana prosedur penanganannya?",
    status: "diproses",
    handledByStaffName: "Dra. Hj. Nurul Hidayati",
    resolutionNotes:
      "Bawa buku ke meja sirkulasi esok pagi. Tim perpustakaan akan membantu proses preservasi menggunakan silica gel khusus tanpa dikenakan biaya penggantian jika teks masih terbaca jelas.",
    createdAt: "2026-09-26 14:10:00",
  },
  {
    id: "TKT-2026-0809",
    userId: "m-102",
    userName: "Rizky Pratama",
    userNis: "20241012",
    userClass: "XII MIPA 3",
    userPhone: "081298765432",
    category: "kartu_login",
    priority: "normal",
    subject: "Kartu fisik perpustakaan hilang di area kantin",
    description:
      "Kartu anggota fisik saya terjatuh di kantin sekolah kemarin dan belum ditemukan. Mohon bantuan blokir sementara barcode fisik tersebut agar tidak disalahgunakan.",
    status: "selesai",
    handledByStaffName: "Siti Rahayu, S.I.Pust.",
    resolutionNotes:
      "Barcode fisik lama telah dinonaktifkan di sistem. Anda tetap dapat menggunakan Kartu Anggota Digital di dasbor HP atau cetak kartu pengganti di Kiosk Lobi.",
    createdAt: "2026-09-24 10:20:00",
    resolvedAt: "2026-09-24 11:45:00",
  },
  {
    id: "TKT-2026-0805",
    userId: "m-103",
    userName: "Dewi Sartika",
    userNis: "20241033",
    userClass: "X MIPA 1",
    userPhone: "081345678901",
    category: "lost_found",
    priority: "mendesak",
    subject: "Kotak kacamata tertinggal di Meja Baca Lesehan barat",
    description:
      "Kemarin sore sekitar jam 15.00 saya membaca di area lesehan rak sastra. Kotak kacamata berwarna merah maroon tertinggal di sana. Apakah ada yang mengamankannya?",
    status: "selesai",
    handledByStaffName: "Siti Rahayu, S.I.Pust.",
    resolutionNotes:
      "Kotak kacamata sudah diamankan di laci Lost & Found meja piket sirkulasi. Silakan diambil dengan menunjukkan kartu siswa.",
    createdAt: "2026-09-23 16:30:00",
    resolvedAt: "2026-09-24 08:15:00",
  },
  {
    id: "TKT-2026-0814",
    userId: "m-105",
    userName: "Budi Santoso",
    userNis: "20241003",
    userClass: "XI MIPA 2",
    userPhone: "081299887766",
    category: "ebook_reader",
    priority: "normal",
    subject: "Halaman e-book Biologi Kelas XI blank putih di ponsel Android",
    description:
      "Saat membuka e-book Biologi di web reader, halaman 45-50 tidak muncul teksnya di browser Chrome Android. Mohon dibantu cek file PDF-nya.",
    status: "menunggu",
    createdAt: "2026-09-26 19:40:00",
  },
];

const FAQ_LIST: FaqItem[] = [
  {
    id: "faq-1",
    category: "Sirkulasi",
    question: "Berapa lama batas maksimal peminjaman buku fisik dan bagaimana cara perpanjangnya?",
    answer:
      "Masa pinjam buku fisik adalah 7 hari kalender. Anda dapat melakukan perpanjangan mandiri sebanyak 1 kali (tambahan 7 hari) melalui menu 'Riwayat Pinjam' di dasbor siswa sebelum tanggal jatuh tempo terlewati.",
  },
  {
    id: "faq-2",
    category: "Denda",
    question: "Berapa tarif denda keterlambatan dan bagaimana metode pembayarannya?",
    answer:
      "Tarif denda keterlambatan adalah Rp 1.000 per hari per buku. Pembayaran denda dapat dilakukan secara tunai di meja sirkulasi atau via transfer rekening sekolah dengan mengunggah bukti bayar di menu 'Denda & Bayar'.",
  },
  {
    id: "faq-3",
    category: "Kartu Anggota",
    question: "Apakah saya wajib membawa kartu fisik untuk meminjam buku di perpustakaan?",
    answer:
      "Tidak wajib. Anda dapat menggunakan Kartu Anggota Digital ber-QR Code resmi langsung dari layar smartphone Anda melalui menu 'Kartu Anggota' di dasbor aplikasi.",
  },
  {
    id: "faq-4",
    category: "E-Book",
    question: "Apakah koleksi e-book dapat diunduh untuk dibaca secara luring (offline)?",
    answer:
      "Karena aplikasi PustakaKita Ceria adalah Progressive Web App (PWA), halaman e-book yang pernah Anda buka akan otomatis tersimpan dalam offline cache dan dapat dibaca kembali tanpa kuota internet.",
  },
  {
    id: "faq-5",
    category: "Koleksi Baru",
    question: "Bagaimana cara mengusulkan buku yang belum ada di perpustakaan?",
    answer:
      "Buka menu 'Usulan Buku' di dasbor siswa. Masukkan judul buku impian Anda dan ajak teman-teman memberi upvote. Usulan dengan suara terbanyak akan diprioritaskan dalam belanja buku dana BOS.",
  },
];

/**
 * Mengambil daftar tiket dengan filter status dan prioritas.
 */
export async function getHelpdeskTicketsAction(params?: {
  statusFilter?: string;
  priorityFilter?: string;
  userId?: string;
}): Promise<HelpdeskTicket[]> {
  const { statusFilter = "all", priorityFilter = "all", userId } = params || {};

  let list = [...TICKETS_STORE];

  if (userId) {
    list = list.filter((t) => t.userId === userId);
  }

  if (statusFilter && statusFilter !== "all") {
    list = list.filter((t) => t.status === statusFilter);
  }

  if (priorityFilter && priorityFilter !== "all") {
    list = list.filter((t) => t.priority === priorityFilter);
  }

  // Sort: Urgent first, then newest
  list.sort((a, b) => {
    if (a.priority === "mendesak" && b.priority !== "mendesak") return -1;
    if (b.priority === "mendesak" && a.priority !== "mendesak") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return list;
}

/**
 * Mengajukan tiket pengaduan / bantuan baru oleh siswa.
 */
export async function submitHelpdeskTicketAction(params: {
  category: HelpdeskCategory;
  priority: HelpdeskPriority;
  subject: string;
  description: string;
  userId?: string;
  userName?: string;
  userNis?: string;
  userClass?: string;
  userPhone?: string;
}): Promise<{ success: boolean; ticket?: HelpdeskTicket; error?: string }> {
  const {
    category,
    priority,
    subject,
    description,
    userId = "m1",
    userName = "Ahmad Fauzi",
    userNis = "20241001",
    userClass = "XII MIPA 1",
    userPhone = "081234567890",
  } = params;

  if (!subject.trim() || !description.trim()) {
    return { success: false, error: "Judul pengaduan dan deskripsi kendala wajib diisi." };
  }

  const now = new Date();
  const dateStr = now.toISOString().replace("T", " ").substring(0, 19);
  const ticketNumber = `TKT-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newTicket: HelpdeskTicket = {
    id: ticketNumber,
    userId,
    userName,
    userNis,
    userClass,
    userPhone,
    category,
    priority,
    subject: subject.trim(),
    description: description.trim(),
    status: "menunggu",
    createdAt: dateStr,
  };

  TICKETS_STORE.unshift(newTicket);

  // Jika tiket mendesak, kirim konfirmasi notifikasi WhatsApp otomatis
  if (priority === "mendesak") {
    try {
      await sendWhatsAppMessage({
        recipient: userPhone,
        recipientName: userName,
        type: "test_message",
        message: `Halo, *${userName}*! 🚨\n\nTiket Bantuan Mendesak kamu (*#${ticketNumber}*) perihal: "${subject}" telah diterima sistem perpustakaan.\n\nStaf pustakawan piket kami telah diberi notifikasi prioritas dan akan merespons secepatnya. Jika butuh tindakan instan, hubungi hotline kami di 081298765432. Terima kasih! 🙏`,
      });
    } catch (e) {
      console.warn("Helpdesk WhatsApp dispatch error:", e);
    }
  }

  await writeAuditLog({
    actorName: userName,
    action: "create",
    entityType: "user",
    description: `Siswa mengajukan tiket bantuan #${ticketNumber} (${priority.toUpperCase()}): "${subject}"`,
    newValue: { ticketNumber, category, priority, subject },
  });

  revalidatePath("/dashboard/bantuan");
  revalidatePath("/pustakawan/bantuan");

  return { success: true, ticket: newTicket };
}

/**
 * Memperbarui status tiket dan memberikan balasan solusi oleh pustakawan.
 */
export async function updateTicketStatusAction(params: {
  ticketId: string;
  status: HelpdeskStatus;
  resolutionNotes?: string;
  staffName?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { ticketId, status, resolutionNotes, staffName = "Pustakawan Piket" } = params;

  const ticket = TICKETS_STORE.find((t) => t.id === ticketId);
  if (!ticket) {
    return { success: false, error: "Tiket pengaduan tidak ditemukan." };
  }

  ticket.status = status;
  ticket.handledByStaffName = staffName;
  if (resolutionNotes) {
    ticket.resolutionNotes = resolutionNotes;
  }

  if (status === "selesai") {
    ticket.resolvedAt = new Date().toISOString().replace("T", " ").substring(0, 19);

    // Kirim notifikasi penyelesaian via WhatsApp ke siswa
    try {
      await sendWhatsAppMessage({
        recipient: ticket.userPhone,
        recipientName: ticket.userName,
        type: "test_message",
        message: `Kabar dari Perpustakaan PustakaKita Ceria! ✅\n\nTiket Bantuan kamu (*#${ticket.id}*) telah diselesaikan oleh ${staffName}.\n\n*Solusi / Arahan:*\n"${resolutionNotes || "Kendala telah ditangani sesuai prosedur perpustakaan."}"\n\nTerima kasih atas laporanmu! Tetap semangat membaca 📖✨`,
      });
    } catch (e) {
      console.warn("Helpdesk resolution WhatsApp error:", e);
    }
  }

  await writeAuditLog({
    actorName: staffName,
    action: "update",
    entityType: "user",
    description: `Pustakawan memperbarui tiket #${ticketId} menjadi: ${status.toUpperCase()}`,
    newValue: { ticketId, status, resolutionNotes },
  });

  revalidatePath("/dashboard/bantuan");
  revalidatePath("/pustakawan/bantuan");

  return { success: true };
}

/**
 * Ringkasan statistik pengaduan untuk dasbor pustakawan.
 */
export async function getHelpdeskStatsAction() {
  const total = TICKETS_STORE.length;
  const waiting = TICKETS_STORE.filter((t) => t.status === "menunggu").length;
  const inProgress = TICKETS_STORE.filter((t) => t.status === "diproses").length;
  const resolved = TICKETS_STORE.filter((t) => t.status === "selesai").length;
  const urgent = TICKETS_STORE.filter((t) => t.priority === "mendesak" && t.status !== "selesai").length;

  return {
    total,
    waiting,
    inProgress,
    resolved,
    urgent,
  };
}

/**
 * Mengambil daftar FAQ seputar perpustakaan.
 */
export async function getFaqListAction(): Promise<FaqItem[]> {
  return FAQ_LIST;
}

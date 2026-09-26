import { db, schema } from "@/db";
import { DUMMY_NOTIFICATIONS } from "@/data/dummy";
import { NotificationItem } from "@/types";

export type WhatsAppMessageType =
  | "otp"
  | "due_reminder"
  | "overdue"
  | "fine_created"
  | "fine_verified"
  | "fine_rejected"
  | "reservation_ready"
  | "account_suspended"
  | "test_message";

export interface SendWhatsAppParams {
  recipient: string; // phone number (e.g. 081234567890 or 6281234567890)
  message: string;
  type: WhatsAppMessageType;
  userId?: string;
  recipientName?: string;
  referenceType?: string;
  referenceId?: string;
}

export interface SendWhatsAppResult {
  success: boolean;
  status: "terkirim" | "gagal";
  notificationId: string;
  message: string;
  error?: string;
  retries: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Format Indonesian phone number into international format (628xxx)
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

/**
 * Send WhatsApp message using Fonnte API with 3x exponential backoff retry
 */
export async function sendWhatsAppMessage(
  params: SendWhatsAppParams
): Promise<SendWhatsAppResult> {
  const apiUrl = process.env.WHATSAPP_API_URL || "https://api.fonnte.com/send";
  const apiKey = process.env.WHATSAPP_API_KEY || "demo_fonnte_api_key_pustakakita";
  const formattedPhone = formatPhoneNumber(params.recipient);

  let success = false;
  let attempts = 0;
  let lastError: string | null = null;
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    attempts = attempt;
    try {
      // In live environment with valid API key, send actual HTTP request to Fonnte
      if (apiKey && apiKey !== "demo_fonnte_api_key_pustakakita" && !apiKey.startsWith("isi_")) {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            target: formattedPhone,
            message: params.message,
            countryCode: "62",
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Fonnte HTTP ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        if (data.status === false) {
          throw new Error(data.reason || "Gagal mengirim via Fonnte gateway");
        }
      }

      // If simulated / demo or HTTP succeeded:
      success = true;
      lastError = null;
      break;
    } catch (err: any) {
      lastError = err.message || "Gagal menghubungkan ke gateway WhatsApp";
      console.warn(`[WhatsApp Gateway] Attempt ${attempt} failed: ${lastError}`);
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        await sleep(1000 * Math.pow(2, attempt - 1));
      }
    }
  }

  const notificationId = `notif-${Date.now()}`;
  const now = new Date();
  const status: "terkirim" | "gagal" = success ? "terkirim" : "gagal";

  // 1. Record in Neon DB if available
  if (db) {
    try {
      await db.insert(schema.notifications).values({
        userId: params.userId || null,
        channel: "whatsapp",
        type: params.type,
        recipient: formattedPhone,
        message: params.message,
        status,
        retryCount: attempts - 1,
        referenceType: params.referenceType || null,
        referenceId: params.referenceId || null,
        errorMessage: lastError,
        sentAt: success ? now : null,
      });
    } catch (dbErr) {
      console.warn("DB insert notification error:", dbErr);
    }
  }

  // 2. Also append to in-memory active list for immediate UI feedback in admin/notifikasi
  const notifItem: NotificationItem = {
    id: notificationId,
    recipient: formattedPhone,
    recipientName: params.recipientName || "Anggota Pustaka",
    type: params.type,
    message: params.message,
    channel: "whatsapp",
    status,
    sentAt: now.toISOString().replace("T", " ").substring(0, 16),
    retryCount: attempts - 1,
  };
  DUMMY_NOTIFICATIONS.unshift(notifItem as any);

  return {
    success,
    status,
    notificationId,
    message: success
      ? `Pesan WhatsApp berhasil dikirim ke ${formattedPhone}`
      : `Gagal mengirim WhatsApp setelah ${attempts} percobaan: ${lastError}`,
    error: lastError || undefined,
    retries: attempts - 1,
  };
}

/**
 * Standard message template generators
 */
export const WhatsAppTemplates = {
  otp: (name: string, code: string) =>
    `[PustakaKitaCeria] Halo ${name}!\nKode OTP verifikasi akun perpustakaan Anda adalah: *${code}*.\n\nKode ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun demi keamanan akun Anda.`,

  dueReminder: (name: string, bookTitle: string, dueDate: string) =>
    `Halo ${name}! 📚\n\nBuku yang kamu pinjam:\n*"${bookTitle}"*\nJatuh tempo pengembalian: *BESOK, ${dueDate}*.\n\nYuk kembalikan atau perpanjang tepat waktu di https://pustakakita.sch.id/dashboard/riwayat agar terhindar dari denda keterlambatan.\n\nSalam hangat,\n*PustakaKitaCeria*`,

  overdue: (name: string, bookTitle: string, daysLate: number, fineAmount: number) =>
    `Pemberitahuan Keterlambatan! ⚠️\n\nHai ${name}, buku *"${bookTitle}"* yang kamu pinjam telah melewati batas waktu (*terlambat ${daysLate} hari*).\n\nAkumulasi denda saat ini: *Rp ${fineAmount.toLocaleString("id-ID")}* (Rp 1.000/hari).\n\nMohon segera kembalikan buku fisik ke meja sirkulasi perpustakaan.`,

  fineCreated: (name: string, bookTitle: string, fineAmount: number) =>
    `Tagihan Denda Baru 🧾\n\nHalo ${name},\nTagihan denda keterlambatan pengembalian buku *"${bookTitle}"* sebesar *Rp ${fineAmount.toLocaleString("id-ID")}* telah diterbitkan.\n\nSilakan transfer ke Rekening Mandiri 137-00-1234567-8 dan unggah bukti transfer di dashboard Anda:\nhttps://pustakakita.sch.id/dashboard/denda`,

  fineVerified: (name: string, fineAmount: number) =>
    `Pelunasan Denda Berhasil! 🎉\n\nHai ${name},\nPembayaran denda sebesar *Rp ${fineAmount.toLocaleString("id-ID")}* telah diverifikasi dan dinyatakan *LUNAS* oleh pustakawan.\n\nStatus keanggotaan Anda telah aktif normal kembali. Selamat menikmati layanan perpustakaan!`,

  fineRejected: (name: string, reason: string) =>
    `Verifikasi Pembayaran Ditolak ❌\n\nHalo ${name},\nBukti transfer denda yang Anda unggah ditolak oleh petugas dengan alasan:\n"${reason}"\n\nSilakan periksa kembali dan unggah slip pembayaran yang valid di menu denda.`,

  reservationReady: (name: string, bookTitle: string, expiryDate: string) =>
    `Buku Reservasi Siap Diambil! 📦\n\nKabar gembira ${name}! Buku yang kamu pesan:\n*"${bookTitle}"*\nsudah tersedia di meja layanan sirkulasi. Buku ini disimpan untukmu hingga *${expiryDate}*.\n\nYuk segera ambil sebelum reservasi kedaluwarsa!`,

  accountSuspended: (name: string, nisNim: string, totalFine: number) =>
    `Peringatan: Akun Ditangguhkan 🔒\n\nYth. ${name} (${nisNim}),\nAkun perpustakaan Anda ditangguhkan sementara karena akumulasi denda telah mencapai *Rp ${totalFine.toLocaleString("id-ID")}* (melebihi batas toleransi Rp 50.000).\n\nLayanan peminjaman baru diblokir sampai seluruh denda diselesaikan.`,

  testMessage: (targetNumber: string) =>
    `Halo dari PustakaKitaCeria! 🚀\n\nIni adalah pesan uji coba integrasi WhatsApp Gateway (Fonnte API) ke nomor ${targetNumber}.\n\nKoneksi API: *AKTIF*\nWaktu: ${new Date().toLocaleString("id-ID")}\n\nSistem siap melayani notifikasi otomatis perpustakaan!`,
};

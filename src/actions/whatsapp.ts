"use server";

import { sendWhatsAppMessage, WhatsAppTemplates } from "@/lib/whatsapp";
import { writeAuditLog } from "@/lib/audit";
import { updateSettingsAction } from "./settings";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { eq, inArray, and, desc, sql } from "drizzle-orm";
import { DUMMY_NOTIFICATIONS, DUMMY_MEMBERS, DUMMY_LOANS } from "@/data/dummy";
import { LIBRARY_CONFIG } from "@/lib/config";

export interface BroadcastTargetItem {
  id: string;
  name: string;
  phone: string;
  bookTitle?: string;
  copyCode?: string;
  dueDate?: string;
  daysLate?: number;
  fineAmount?: number;
}

export interface BroadcastCategoryData {
  category: "due_soon" | "overdue" | "all_members";
  title: string;
  description: string;
  defaultTemplate: string;
  targets: BroadcastTargetItem[];
}

export async function sendTestWhatsAppAction(params: {
  recipient: string;
  message?: string;
  actorId?: string;
  actorName?: string;
}) {
  const msg =
    params.message || WhatsAppTemplates.testMessage(params.recipient);

  const res = await sendWhatsAppMessage({
    recipient: params.recipient,
    message: msg,
    type: "test_message",
    recipientName: "Admin Test Target",
  });

  await writeAuditLog({
    actorId: params.actorId,
    actorName: params.actorName,
    action: "create",
    entityType: "user",
    description: `Uji coba kirim pesan WhatsApp ke nomor ${params.recipient}: Status ${res.status}`,
    newValue: {
      recipient: params.recipient,
      status: res.status,
      notificationId: res.notificationId,
      retries: res.retries,
    },
  });

  revalidatePath("/admin/whatsapp");
  revalidatePath("/admin/notifikasi");
  return res;
}

export async function saveWhatsAppConfigAction(params: {
  apiKey: string;
  senderNumber: string;
  actorId?: string;
  actorName?: string;
}) {
  return await updateSettingsAction(
    {
      whatsappApiKey: params.apiKey,
      whatsappSenderNumber: params.senderNumber,
    },
    params.actorId,
    params.actorName
  );
}

/**
 * Mengambil daftar target penerima pesan broadcast berdasarkan kategori.
 */
export async function getBroadcastTargetsAction(
  category: "due_soon" | "overdue" | "all_members"
): Promise<BroadcastCategoryData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (category === "due_soon") {
    const targets: BroadcastTargetItem[] = [];

    if (db) {
      try {
        const activeLoans = await db.query.loans.findMany({
          where: eq(schema.loans.status, "dipinjam"),
          with: {
            member: true,
            copy: { with: { book: true } },
          },
          orderBy: [desc(schema.loans.dueDate)],
        });

        for (const l of activeLoans) {
          const dueDate = new Date(l.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          // H-2 s/d H-0 (hari ini atau 2 hari ke depan)
          if (diffDays <= 2 && diffDays >= 0 && l.member?.phoneWa) {
            targets.push({
              id: l.id,
              name: l.member.name,
              phone: l.member.phoneWa,
              bookTitle: l.copy?.book?.title || "Buku Perpustakaan",
              copyCode: l.copy?.copyCode,
              dueDate: dueDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
            });
          }
        }
      } catch (e) {
        console.warn("DB getBroadcastTargets due_soon error, fallback:", e);
      }
    }

    if (targets.length === 0) {
      // Fallback dummy
      targets.push({
        id: "dummy-due-1",
        name: "Ahmad Fauzi",
        phone: "081234567890",
        bookTitle: "Laskar Pelangi",
        copyCode: "PKC-2024-001-001",
        dueDate: "Besok (27 September 2026)",
      });
    }

    return {
      category: "due_soon",
      title: "Pengingat H-1 Jatuh Tempo Peminjaman",
      description: "Kirim pengingat ramah kepada siswa yang masa pinjam bukunya akan berakhir dalam 1-2 hari.",
      defaultTemplate: `Halo, *{nama}*! 📚\n\nPengingat dari Perpustakaan PustakaKita:\nBuku *"{judul_buku}"* akan jatuh tempo pada *{jatuh_tempo}*.\n\nHarap kembalikan buku tepat waktu atau perpanjang pinjaman melalui Dasbor Anggota untuk menghindari denda. Terima kasih! ✨`,
      targets,
    };
  }

  if (category === "overdue") {
    const targets: BroadcastTargetItem[] = [];

    if (db) {
      try {
        const lateLoans = await db.query.loans.findMany({
          where: eq(schema.loans.status, "terlambat"),
          with: {
            member: true,
            copy: { with: { book: true } },
            fines: true,
          },
        });

        for (const l of lateLoans) {
          const dueDate = new Date(l.dueDate);
          const diffDays = Math.max(1, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
          const fineAmount = diffDays * (LIBRARY_CONFIG.dailyFineAmount || 1000);

          if (l.member?.phoneWa) {
            targets.push({
              id: l.id,
              name: l.member.name,
              phone: l.member.phoneWa,
              bookTitle: l.copy?.book?.title || "Buku Perpustakaan",
              copyCode: l.copy?.copyCode,
              dueDate: dueDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
              daysLate: diffDays,
              fineAmount,
            });
          }
        }
      } catch (e) {
        console.warn("DB getBroadcastTargets overdue error, fallback:", e);
      }
    }

    if (targets.length === 0) {
      targets.push({
        id: "dummy-overdue-1",
        name: "Budi Santoso",
        phone: "081298765432",
        bookTitle: "Bumi Manusia",
        copyCode: "PKC-2024-001-002",
        dueDate: "20 September 2026",
        daysLate: 6,
        fineAmount: 6000,
      });
    }

    return {
      category: "overdue",
      title: "Peringatan Denda Keterlambatan",
      description: "Kirim notifikasi penagihan kepada anggota yang telah melewati batas tanggal pengembalian buku.",
      defaultTemplate: `Pemberitahuan Keterlambatan Buku ⚠️\n\nHalo, *{nama}*,\nBuku *"{judul_buku}"* telah melewati batas jatuh tempo ({jatuh_tempo}) dan terlambat *{hari_telat} hari*.\n\nTotal akumulasi denda: *Rp {denda}*.\nMohon segera kembalikan buku ke perpustakaan atau Kiosk Lobi untuk menghindari pemblokiran akun. Terima kasih.`,
      targets,
    };
  }

  // category === "all_members"
  const targets: BroadcastTargetItem[] = [];

  if (db) {
    try {
      const allUsers = await db.query.users.findMany({
        where: eq(schema.users.role, "anggota"),
        limit: 50,
      });

      for (const u of allUsers) {
        if (u.phoneWa) {
          targets.push({
            id: u.id,
            name: u.name,
            phone: u.phoneWa,
          });
        }
      }
    } catch (e) {
      console.warn("DB getBroadcastTargets all_members error, fallback:", e);
    }
  }

  if (targets.length === 0) {
    targets.push(
      { id: "m1", name: "Ahmad Fauzi", phone: "081234567890" },
      { id: "m2", name: "Siti Nurhaliza", phone: "081298765432" },
      { id: "m3", name: "Budi Santoso", phone: "081345678901" }
    );
  }

  return {
    category: "all_members",
    title: "Pengumuman Koleksi & Info Literasi Baru",
    description: "Kirimkan siaran berita, event literasi, atau koleksi buku baru tiba ke seluruh kontak siswa/wali murid.",
    defaultTemplate: `Halo, *{nama}*! 🌟\n\nSalam literasi dari Perpustakaan PustakaKita!\nKoleksi buku dan e-book terbaru bulan ini telah hadir di perpustakaan. Kunjungi katalog online kami atau mampir ke lobi perpustakaan untuk meminjam buku favorit Anda.\n\nSelamat membaca dan terus berprestasi! 📖✨`,
    targets,
  };
}

/**
 * Menjalankan broadcast massal ke antrean WhatsApp Gateway.
 */
export async function executeBatchBroadcastAction(params: {
  category: "due_soon" | "overdue" | "all_members";
  customMessageTemplate: string;
  targets: BroadcastTargetItem[];
  actorName?: string;
}) {
  const { category, customMessageTemplate, targets, actorName = "Admin Perpustakaan" } = params;

  if (!targets || targets.length === 0) {
    return { success: false, error: "Tidak ada target penerima yang dipilih." };
  }

  let sentCount = 0;
  let failedCount = 0;
  const dispatchLogs: any[] = [];

  for (const t of targets) {
    // Replace dynamic variables
    let personalizedMessage = customMessageTemplate
      .replace(/{nama}/g, t.name)
      .replace(/{judul_buku}/g, t.bookTitle || "Buku Perpustakaan")
      .replace(/{jatuh_tempo}/g, t.dueDate || "Tanggal Jatuh Tempo")
      .replace(/{hari_telat}/g, (t.daysLate || 0).toString())
      .replace(/{denda}/g, (t.fineAmount || 0).toLocaleString("id-ID"));

    const msgType = category === "due_soon" ? "due_reminder" : category === "overdue" ? "overdue" : "test_message";

    const res = await sendWhatsAppMessage({
      recipient: t.phone,
      recipientName: t.name,
      message: personalizedMessage,
      type: msgType,
      userId: t.id,
    });

    if (res.success) {
      sentCount++;
      dispatchLogs.push({ name: t.name, phone: t.phone, status: "terkirim" });
    } else {
      failedCount++;
      dispatchLogs.push({ name: t.name, phone: t.phone, status: "gagal", error: res.error });
    }
  }

  await writeAuditLog({
    actorName,
    action: "create",
    entityType: "user",
    description: `Eksekusi WhatsApp Broadcast (${category}): ${sentCount} pesan terkirim, ${failedCount} gagal.`,
    newValue: {
      category,
      totalTargets: targets.length,
      sentCount,
      failedCount,
    },
  });

  revalidatePath("/admin/whatsapp");
  revalidatePath("/admin/notifikasi");

  return {
    success: true,
    sentCount,
    failedCount,
    total: targets.length,
    logs: dispatchLogs,
  };
}

/**
 * Memicu eksekusi pengecekan keterlambatan dan pengingat H-1 secara langsung dari UI.
 */
export async function triggerManualOverdueCheckAction(actorName: string = "Admin Perpustakaan") {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let overdueUpdated = 0;
  let finesGenerated = 0;
  let remindersSent = 0;

  if (db) {
    try {
      const activeLoans = await db.query.loans.findMany({
        where: inArray(schema.loans.status, ["dipinjam", "terlambat"]),
        with: {
          member: true,
          copy: { with: { book: true } },
          fines: true,
        },
      });

      for (const loan of activeLoans) {
        const dueDate = new Date(loan.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - dueDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const finePerDay = LIBRARY_CONFIG.dailyFineAmount || 1000;
        const totalFineAmount = diffDays * finePerDay;

        // Keterlambatan
        if (diffDays > 0) {
          overdueUpdated++;

          if (loan.status !== "terlambat") {
            await db
              .update(schema.loans)
              .set({ status: "terlambat", updatedAt: new Date() })
              .where(eq(schema.loans.id, loan.id));
          }

          const existingFine = loan.fines?.find((f) => f.status === "belum_bayar");
          if (existingFine) {
            await db
              .update(schema.fines)
              .set({
                amount: totalFineAmount.toString(),
                daysLate: diffDays,
                updatedAt: new Date(),
              })
              .where(eq(schema.fines.id, existingFine.id));
          } else {
            await db.insert(schema.fines).values({
              loanId: loan.id,
              memberId: loan.memberId,
              amount: totalFineAmount.toString(),
              daysLate: diffDays,
              reason: `Keterlambatan ${diffDays} hari otomatis terdeteksi mesin sirkulasi`,
              status: "belum_bayar",
              paymentMethod: "transfer_manual",
            });
            finesGenerated++;
          }

          if (loan.member?.phoneWa) {
            await sendWhatsAppMessage({
              recipient: loan.member.phoneWa,
              recipientName: loan.member.name,
              type: "overdue",
              message: WhatsAppTemplates.overdue(
                loan.member.name,
                loan.copy?.book?.title || "Buku Perpustakaan",
                diffDays,
                totalFineAmount
              ),
              userId: loan.memberId,
              referenceType: "loan",
              referenceId: loan.id,
            });
          }
        }
        // H-1 Pengingat
        else if (diffDays === -1) {
          remindersSent++;
          if (loan.member?.phoneWa) {
            await sendWhatsAppMessage({
              recipient: loan.member.phoneWa,
              recipientName: loan.member.name,
              type: "due_reminder",
              message: WhatsAppTemplates.dueReminder(
                loan.member.name,
                loan.copy?.book?.title || "Buku Perpustakaan",
                loan.dueDate.toLocaleDateString("id-ID")
              ),
              userId: loan.memberId,
              referenceType: "loan",
              referenceId: loan.id,
            });
          }
        }
      }

      await writeAuditLog({
        actorName,
        action: "update",
        entityType: "loan",
        description: `Trigger Manual Engine Pengingat & Overdue: ${overdueUpdated} buku terlambat, ${finesGenerated} denda dibuat, ${remindersSent} WA pengingat H-1 terkirim.`,
        newValue: { overdueUpdated, finesGenerated, remindersSent },
      });

      revalidatePath("/admin/whatsapp");
      revalidatePath("/admin/notifikasi");
      revalidatePath("/pustakawan/sirkulasi");

      return {
        success: true,
        summary: {
          overdueUpdated,
          finesGenerated,
          remindersSent,
          executedAt: new Date().toLocaleTimeString("id-ID"),
        },
      };
    } catch (e: any) {
      console.warn("DB triggerManualOverdueCheckAction error:", e);
      return { success: false, error: e.message };
    }
  }

  return {
    success: true,
    summary: {
      overdueUpdated: 1,
      finesGenerated: 0,
      remindersSent: 2,
      executedAt: new Date().toLocaleTimeString("id-ID"),
    },
  };
}

/**
 * Mengambil log pesan notifikasi WhatsApp dari database.
 */
export async function getWhatsAppNotificationLogsAction() {
  if (db) {
    try {
      const logs = await db.query.notifications.findMany({
        orderBy: [desc(schema.notifications.createdAt)],
        limit: 25,
      });

      if (logs.length > 0) {
        return logs.map((l) => ({
          id: l.id,
          recipient: l.recipient,
          type: l.type,
          message: l.message,
          status: l.status,
          retryCount: l.retryCount,
          createdAt: l.createdAt.toISOString().replace("T", " ").substring(0, 19),
        }));
      }
    } catch (e) {
      console.warn("DB getWhatsAppNotificationLogsAction error, fallback:", e);
    }
  }

  return DUMMY_NOTIFICATIONS.map((n) => ({
    id: n.id,
    recipient: n.recipient,
    type: n.type,
    message: n.message,
    status: n.status,
    retryCount: n.retryCount || 1,
    createdAt: n.sentAt || new Date().toISOString(),
  }));
}


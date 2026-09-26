"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { DUMMY_FINES, DUMMY_MEMBERS } from "@/data/dummy";
import { sendWhatsAppMessage, WhatsAppTemplates } from "@/lib/whatsapp";

export async function uploadFineProofAction(params: {
  fineId: string;
  proofUrl: string;
  notes?: string;
}) {
  const fine = DUMMY_FINES.find((f) => f.id === params.fineId);
  if (!fine) return { success: false, error: "Tagihan denda tidak ditemukan." };

  const oldStatus = fine.status;
  fine.status = "menunggu_verifikasi";
  fine.proofUrl = params.proofUrl;
  fine.paidAt = new Date().toISOString().replace("T", " ").substring(0, 19);

  await writeAuditLog({
    action: "update",
    entityType: "fine",
    entityId: fine.id,
    description: `Upload bukti transfer manual denda Rp ${fine.amount.toLocaleString("id-ID")} oleh ${fine.memberName}`,
    oldValue: { status: oldStatus },
    newValue: { status: "menunggu_verifikasi", proofUrl: fine.proofUrl },
  });

  // Find member phone for notification
  const member = DUMMY_MEMBERS.find((m) => m.nisNim === fine.memberNisNim);
  if (member) {
    await sendWhatsAppMessage({
      recipient: member.phoneWa,
      recipientName: member.name,
      type: "fine_created",
      message: `Halo ${member.name}, bukti transfer denda sebesar Rp ${fine.amount.toLocaleString("id-ID")} telah kami terima. Petugas sedang memverifikasi pembayaran Anda. Mohon tunggu notifikasi selanjutnya.`,
      referenceType: "fine",
      referenceId: fine.id,
    });
  }

  revalidatePath("/dashboard/denda");
  revalidatePath("/pustakawan/denda");
  return { success: true, fine };
}

export async function verifyFineAction(params: {
  fineId: string;
  approved: boolean;
  rejectReason?: string;
  verifierName?: string;
}) {
  const fine = DUMMY_FINES.find((f) => f.id === params.fineId);
  if (!fine) return { success: false, error: "Tagihan denda tidak ditemukan." };

  const member = DUMMY_MEMBERS.find((m) => m.nisNim === fine.memberNisNim);
  const oldStatus = fine.status;

  if (params.approved) {
    fine.status = "lunas";
    fine.verifiedBy = params.verifierName || "Ibu Dewi Anggraini, S.IP.";
    fine.verifiedAt = new Date().toISOString().replace("T", " ").substring(0, 19);

    if (member && member.totalFinesUnpaid >= fine.amount) {
      member.totalFinesUnpaid -= fine.amount;
    }

    await writeAuditLog({
      action: "verify",
      entityType: "fine",
      entityId: fine.id,
      description: `Verifikasi persetujuan pelunasan denda Rp ${fine.amount.toLocaleString("id-ID")} untuk ${fine.memberName}. Akun unblocked.`,
      oldValue: { status: oldStatus },
      newValue: { status: "lunas", verifiedBy: fine.verifiedBy },
    });

    if (member) {
      await sendWhatsAppMessage({
        recipient: member.phoneWa,
        recipientName: member.name,
        type: "fine_verified",
        message: WhatsAppTemplates.fineVerified(member.name, fine.amount),
        referenceType: "fine",
        referenceId: fine.id,
      });
    }
  } else {
    fine.status = "belum_bayar";
    fine.reason = `Penolakan: ${params.rejectReason || "Nominal atau bukti transfer tidak valid"}`;

    await writeAuditLog({
      action: "update",
      entityType: "fine",
      entityId: fine.id,
      description: `Penolakan bukti transfer denda untuk ${fine.memberName}. Alasan: "${params.rejectReason}"`,
      oldValue: { status: oldStatus },
      newValue: { status: "belum_bayar", reason: fine.reason },
    });

    if (member) {
      await sendWhatsAppMessage({
        recipient: member.phoneWa,
        recipientName: member.name,
        type: "fine_rejected",
        message: WhatsAppTemplates.fineRejected(
          member.name,
          params.rejectReason || "Bukti transfer tidak valid atau tidak terbaca."
        ),
        referenceType: "fine",
        referenceId: fine.id,
      });
    }
  }

  revalidatePath("/dashboard/denda");
  revalidatePath("/pustakawan/denda");
  return { success: true, fine };
}

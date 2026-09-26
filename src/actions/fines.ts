"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { db, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import { DUMMY_FINES, DUMMY_MEMBERS } from "@/data/dummy";
import { sendWhatsAppMessage, WhatsAppTemplates } from "@/lib/whatsapp";

export async function getFineDetailAction(fineId: string) {
  if (db) {
    try {
      const fine = await db.query.fines.findFirst({
        where: eq(schema.fines.id, fineId),
        with: {
          loan: {
            with: {
              copy: {
                with: {
                  book: true,
                },
              },
            },
          },
          member: true,
        },
      });

      if (fine) {
        return {
          id: fine.id,
          amount: Number(fine.amount || 0),
          daysLate: fine.daysLate,
          reason: fine.reason || `Keterlambatan ${fine.daysLate} hari`,
          status: fine.status,
          bookTitle: fine.loan?.copy?.book?.title || "Buku Perpustakaan",
          copyCode: fine.loan?.copy?.copyCode || "-",
          memberName: fine.member?.name || "Anggota",
          memberNisNim: fine.member?.nisNim || "-",
        };
      }
    } catch (e) {
      console.warn("DB fine detail error, fallback:", e);
    }
  }

  const dummyFine = DUMMY_FINES.find((f) => f.id === fineId);
  if (dummyFine) {
    return {
      id: dummyFine.id,
      amount: dummyFine.amount,
      daysLate: dummyFine.daysLate,
      reason: dummyFine.reason,
      status: dummyFine.status,
      bookTitle: dummyFine.bookTitle,
      copyCode: dummyFine.copyCode,
      memberName: dummyFine.memberName,
      memberNisNim: dummyFine.memberNisNim,
    };
  }

  return null;
}

export async function uploadFineProofAction(params: {
  fineId: string;
  proofUrl: string;
  notes?: string;
}) {
  const now = new Date();

  if (db) {
    try {
      const fine = await db.query.fines.findFirst({
        where: eq(schema.fines.id, params.fineId),
        with: { member: true },
      });

      if (fine) {
        const oldStatus = fine.status;
        await db
          .update(schema.fines)
          .set({
            status: "menunggu_verifikasi",
            proofUrl: params.proofUrl,
            paidAt: now,
            updatedAt: now,
          })
          .where(eq(schema.fines.id, params.fineId));

        await writeAuditLog({
          actorId: fine.memberId,
          actorName: fine.member?.name || "Anggota",
          action: "update",
          entityType: "fine",
          entityId: fine.id,
          description: `Upload bukti transfer manual denda Rp ${Number(fine.amount).toLocaleString("id-ID")} oleh ${fine.member?.name}`,
          oldValue: { status: oldStatus },
          newValue: { status: "menunggu_verifikasi", proofUrl: params.proofUrl },
        });

        if (fine.member?.phoneWa) {
          await sendWhatsAppMessage({
            recipient: fine.member.phoneWa,
            recipientName: fine.member.name,
            type: "fine_created",
            message: `Halo ${fine.member.name}, bukti transfer denda sebesar Rp ${Number(fine.amount).toLocaleString("id-ID")} telah kami terima. Petugas sedang memverifikasi pembayaran Anda. Mohon tunggu notifikasi selanjutnya.`,
            referenceType: "fine",
            referenceId: fine.id,
          });
        }

        revalidatePath("/dashboard/denda");
        revalidatePath("/pustakawan/denda");
        return { success: true };
      }
    } catch (e) {
      console.warn("DB upload proof error, fallback:", e);
    }
  }

  // Fallback to memory
  const fine = DUMMY_FINES.find((f) => f.id === params.fineId);
  if (!fine) return { success: false, error: "Tagihan denda tidak ditemukan." };

  fine.status = "menunggu_verifikasi";
  fine.proofUrl = params.proofUrl;
  fine.paidAt = now.toISOString().replace("T", " ").substring(0, 19);

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
  const now = new Date();

  if (db) {
    try {
      const fine = await db.query.fines.findFirst({
        where: eq(schema.fines.id, params.fineId),
        with: { member: true },
      });

      if (fine) {
        const oldStatus = fine.status;
        const newStatus = params.approved ? "lunas" : "belum_bayar";

        await db
          .update(schema.fines)
          .set({
            status: newStatus,
            verifiedAt: now,
            reason: params.approved ? fine.reason : `Penolakan: ${params.rejectReason || "Bukti tidak valid"}`,
            updatedAt: now,
          })
          .where(eq(schema.fines.id, params.fineId));

        await writeAuditLog({
          action: params.approved ? "verify" : "update",
          entityType: "fine",
          entityId: fine.id,
          description: params.approved
            ? `Verifikasi persetujuan pelunasan denda Rp ${Number(fine.amount).toLocaleString("id-ID")} untuk ${fine.member?.name}. Akun unblocked.`
            : `Penolakan bukti transfer denda untuk ${fine.member?.name}. Alasan: "${params.rejectReason}"`,
          oldValue: { status: oldStatus },
          newValue: { status: newStatus },
        });

        if (fine.member?.phoneWa) {
          if (params.approved) {
            await sendWhatsAppMessage({
              recipient: fine.member.phoneWa,
              recipientName: fine.member.name,
              type: "fine_verified",
              message: WhatsAppTemplates.fineVerified(fine.member.name, Number(fine.amount)),
              referenceType: "fine",
              referenceId: fine.id,
            });
          } else {
            await sendWhatsAppMessage({
              recipient: fine.member.phoneWa,
              recipientName: fine.member.name,
              type: "fine_rejected",
              message: WhatsAppTemplates.fineRejected(
                fine.member.name,
                params.rejectReason || "Bukti transfer tidak valid atau tidak terbaca."
              ),
              referenceType: "fine",
              referenceId: fine.id,
            });
          }
        }

        revalidatePath("/dashboard/denda");
        revalidatePath("/pustakawan/denda");
        return { success: true };
      }
    } catch (e) {
      console.warn("DB verify fine error, fallback:", e);
    }
  }

  // Fallback to memory
  const fine = DUMMY_FINES.find((f) => f.id === params.fineId);
  if (!fine) return { success: false, error: "Tagihan denda tidak ditemukan." };

  fine.status = params.approved ? "lunas" : "belum_bayar";
  revalidatePath("/dashboard/denda");
  revalidatePath("/pustakawan/denda");
  return { success: true, fine };
}

export async function getAllFinesAction(statusFilter: string = "semua") {
  if (db) {
    try {
      const rows = await db.query.fines.findMany({
        with: {
          member: true,
          loan: {
            with: {
              copy: {
                with: {
                  book: true,
                },
              },
            },
          },
        },
        orderBy: [desc(schema.fines.createdAt)],
      });

      const formatted = rows.map((f) => ({
        id: f.id,
        loanId: f.loanId,
        memberId: f.memberId,
        memberName: f.member?.name || "Anggota",
        memberNisNim: f.member?.nisNim || "-",
        bookTitle: f.loan?.copy?.book?.title || "Buku Perpustakaan",
        copyCode: f.loan?.copy?.copyCode || "-",
        amount: Number(f.amount || 0),
        daysLate: f.daysLate || 0,
        reason: f.reason || "-",
        status: f.status,
        paymentMethod: (f.paymentMethod || "transfer_manual") as "transfer_manual",
        proofUrl: f.proofUrl || undefined,
        paidAt: f.paidAt ? f.paidAt.toISOString().replace("T", " ").substring(0, 16) : undefined,
        verifiedAt: f.verifiedAt ? f.verifiedAt.toISOString().replace("T", " ").substring(0, 16) : undefined,
        waiveReason: f.waiveReason || undefined,
        createdAt: f.createdAt ? f.createdAt.toISOString().replace("T", " ").substring(0, 16) : "-",
      }));

      if (statusFilter !== "semua") {
        return formatted.filter((f) => f.status === statusFilter);
      }
      return formatted;
    } catch (e) {
      console.warn("DB getAllFines error, fallback:", e);
    }
  }

  if (statusFilter !== "semua") {
    return DUMMY_FINES.filter((f) => f.status === statusFilter);
  }
  return DUMMY_FINES;
}

export async function waiveFineAction(fineId: string, reason: string) {
  const now = new Date();
  if (db) {
    try {
      const fine = await db.query.fines.findFirst({
        where: eq(schema.fines.id, fineId),
        with: { member: true },
      });

      if (fine) {
        await db
          .update(schema.fines)
          .set({
            status: "dibebaskan",
            waiveReason: reason,
            updatedAt: now,
          })
          .where(eq(schema.fines.id, fineId));

        await writeAuditLog({
          action: "waive",
          entityType: "fine",
          entityId: fine.id,
          description: `Pembebasan denda Rp ${Number(fine.amount).toLocaleString("id-ID")} untuk ${fine.member?.name}. Alasan: "${reason}"`,
          oldValue: { status: fine.status },
          newValue: { status: "dibebaskan", waiveReason: reason },
        });

        revalidatePath("/dashboard/denda");
        revalidatePath("/pustakawan/denda");
        return { success: true };
      }
    } catch (e) {
      console.warn("DB waive fine error, fallback:", e);
    }
  }

  const fine = DUMMY_FINES.find((f) => f.id === fineId);
  if (!fine) return { success: false, error: "Denda tidak ditemukan." };
  fine.status = "dibebaskan";
  fine.waiveReason = reason;
  revalidatePath("/dashboard/denda");
  revalidatePath("/pustakawan/denda");
  return { success: true };
}


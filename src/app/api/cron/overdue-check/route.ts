import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { db, schema } from "@/db";
import { eq, inArray, and } from "drizzle-orm";
import { sendWhatsAppMessage, WhatsAppTemplates } from "@/lib/whatsapp";
import { LIBRARY_CONFIG } from "@/lib/config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret =
    searchParams.get("secret") ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const expectedSecret = process.env.CRON_SECRET || "pustakakita_cron_secret_auth_token_99";

  if (secret !== expectedSecret) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid CRON_SECRET" },
      { status: 401 }
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let overdueCount = 0;
  let reminderCount = 0;
  let finesGenerated = 0;

  if (db) {
    try {
      const activeLoans = await db.query.loans.findMany({
        where: inArray(schema.loans.status, ["dipinjam", "terlambat"]),
        with: {
          member: true,
          copy: {
            with: { book: true },
          },
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

        // 1. Keterlambatan (diffDays > 0)
        if (diffDays > 0) {
          overdueCount++;

          if (loan.status !== "terlambat") {
            await db
              .update(schema.loans)
              .set({ status: "terlambat", updatedAt: new Date() })
              .where(eq(schema.loans.id, loan.id));
          }

          // Cek apakah denda sudah ada
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
              reason: `Keterlambatan ${diffDays} hari otomatis terdeteksi cronjob`,
              status: "belum_bayar",
              paymentMethod: "transfer_manual",
            });
            finesGenerated++;
          }

          // Kirim notifikasi WhatsApp
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

        // 2. Pengingat H-1 Jatuh Tempo (diffDays === -1)
        else if (diffDays === -1) {
          reminderCount++;
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
        action: "update",
        entityType: "loan",
        description: `Cronjob pengecekan denda & H-1 selesai: ${overdueCount} terlambat, ${finesGenerated} denda baru dibuat, ${reminderCount} WA pengingat H-1 terkirim.`,
        newValue: { overdueCount, finesGenerated, reminderCount },
      });

      return NextResponse.json({
        success: true,
        summary: {
          overdueCount,
          finesGenerated,
          reminderCount,
          executedAt: new Date().toISOString(),
        },
      });
    } catch (e: any) {
      console.warn("DB cron job error:", e);
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    success: true,
    summary: {
      overdueCount,
      finesGenerated,
      reminderCount,
      executedAt: new Date().toISOString(),
    },
  });
}

import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { DUMMY_LOANS, DUMMY_FINES, SYSTEM_CONFIG } from "@/data/dummy";
import { sendWhatsAppMessage, WhatsAppTemplates } from "@/lib/whatsapp";

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

  for (const loan of DUMMY_LOANS) {
    if (loan.status === "dipinjam" || loan.status === "terlambat") {
      const dueDate = new Date(loan.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - dueDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // 1. Keterlambatan (diffDays > 0)
      if (diffDays > 0) {
        loan.status = "terlambat";
        loan.daysLate = diffDays;
        loan.fineAmount = diffDays * SYSTEM_CONFIG.finePerDay;
        overdueCount++;

        // Find or create fine
        let existingFine = DUMMY_FINES.find(
          (f) => f.loanId === loan.id && f.status === "belum_bayar"
        );

        if (existingFine) {
          existingFine.amount = loan.fineAmount;
          existingFine.daysLate = diffDays;
        } else {
          DUMMY_FINES.unshift({
            id: `fine-cron-${Date.now()}-${finesGenerated}`,
            loanId: loan.id,
            memberId: loan.memberId,
            memberName: loan.memberName,
            memberNisNim: loan.memberNisNim,
            bookTitle: loan.bookTitle,
            copyCode: loan.copyCode,
            amount: loan.fineAmount,
            daysLate: diffDays,
            reason: `Keterlambatan ${diffDays} hari otomatis terdeteksi cronjob`,
            status: "belum_bayar",
            paymentMethod: "transfer_manual",
            createdAt: new Date().toISOString(),
          });
          finesGenerated++;
        }

        // Send WhatsApp overdue alert with retry
        await sendWhatsAppMessage({
          recipient: loan.memberPhone,
          recipientName: loan.memberName,
          type: "overdue",
          message: WhatsAppTemplates.overdue(loan.memberName, loan.bookTitle, diffDays, loan.fineAmount),
          userId: loan.memberId,
          referenceType: "loan",
          referenceId: loan.id,
        });
      }

      // 2. H-1 Jatuh Tempo (diffDays === -1)
      else if (diffDays === -1) {
        reminderCount++;
        await sendWhatsAppMessage({
          recipient: loan.memberPhone,
          recipientName: loan.memberName,
          type: "due_reminder",
          message: WhatsAppTemplates.dueReminder(loan.memberName, loan.bookTitle, loan.dueDate),
          userId: loan.memberId,
          referenceType: "loan",
          referenceId: loan.id,
        });
      }
    }
  }

  // Record Audit Log for cron job execution
  await writeAuditLog({
    action: "update",
    entityType: "loan",
    description: `Cronjob harian overdue-check selesai: ${overdueCount} buku terlambat, ${reminderCount} pengingat H-1 dikirim via WA, ${finesGenerated} denda baru diperbarui.`,
    newValue: { overdueCount, reminderCount, finesGenerated, executedAt: today.toISOString() },
  });

  return NextResponse.json({
    success: true,
    message: "Cronjob overdue-check selesai dijalankan.",
    overdueCount,
    reminderCount,
    finesGenerated,
    timestamp: new Date().toISOString(),
  });
}

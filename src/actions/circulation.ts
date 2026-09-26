"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import {
  DUMMY_LOANS,
  DUMMY_COPIES,
  DUMMY_MEMBERS,
  DUMMY_FINES,
  SYSTEM_CONFIG,
  LoanItem,
  FineItem,
} from "@/data/dummy";

export async function borrowBookAction(params: {
  memberNisNim: string;
  copyCode: string;
  isSelfCheckout?: boolean;
}) {
  const member = DUMMY_MEMBERS.find((m) => m.nisNim === params.memberNisNim.trim());
  if (!member) {
    return { success: false, error: "Anggota dengan NIS/NIM tersebut tidak ditemukan." };
  }

  // 1. Check if blocked due to fines >= 50.000
  if (member.totalFinesUnpaid >= SYSTEM_CONFIG.fineBlockThreshold) {
    return {
      success: false,
      error: `Peminjaman diblokir! Akumulasi denda Rp ${member.totalFinesUnpaid.toLocaleString("id-ID")} melampaui batas Rp ${SYSTEM_CONFIG.fineBlockThreshold.toLocaleString("id-ID")}. Harap lunasi denda terlebih dahulu.`,
    };
  }

  // 2. Check maximum 3 books quota
  if (member.activeLoansCount >= SYSTEM_CONFIG.maxBooksPerMember) {
    return {
      success: false,
      error: `Kuota pinjam penuh! Anda sudah meminjam ${member.activeLoansCount} dari maksimal ${SYSTEM_CONFIG.maxBooksPerMember} buku.`,
    };
  }

  // 3. Check copy availability
  const copy = DUMMY_COPIES.find((c) => c.copyCode.toLowerCase() === params.copyCode.trim().toLowerCase());
  if (!copy) {
    return { success: false, error: "Kode barcode eksemplar tidak ditemukan di sistem." };
  }
  if (copy.status !== "tersedia") {
    return { success: false, error: `Eksemplar sedang berstatus '${copy.status}' dan tidak dapat dipinjam.` };
  }

  // Compute dates
  const now = new Date();
  const dueDate = new Date();
  dueDate.setDate(now.getDate() + SYSTEM_CONFIG.loanDurationDays);

  const newLoan: LoanItem = {
    id: `loan-${Date.now()}`,
    memberId: member.id,
    memberName: member.name,
    memberNisNim: member.nisNim,
    memberClass: member.classOrMajor,
    memberPhone: member.phoneWa,
    bookId: copy.bookId,
    bookTitle: copy.bookTitle,
    copyCode: copy.copyCode,
    shelfLocation: copy.shelfLocation,
    borrowedAt: now.toISOString().split("T")[0],
    dueDate: dueDate.toISOString().split("T")[0],
    status: "dipinjam",
    renewedCount: 0,
    daysLate: 0,
    fineAmount: 0,
  };

  DUMMY_LOANS.unshift(newLoan);
  copy.status = "dipinjam";
  member.activeLoansCount += 1;
  member.totalLoansCount += 1;

  // Auto Audit Log
  await writeAuditLog({
    action: "create",
    entityType: "loan",
    entityId: newLoan.id,
    description: `${params.isSelfCheckout ? "[Scan Mandiri]" : "[Sirkulasi Petugas]"} ${member.name} meminjam "${copy.bookTitle}" (${copy.copyCode})`,
    newValue: newLoan as any,
  });

  revalidatePath("/dashboard");
  revalidatePath("/pustakawan/sirkulasi");
  return { success: true, loan: newLoan };
}

export async function returnBookAction(params: {
  copyCode: string;
  waive?: boolean;
  waiveReason?: string;
}) {
  const loan = DUMMY_LOANS.find(
    (l) => l.copyCode.toLowerCase() === params.copyCode.trim().toLowerCase() && l.status !== "dikembalikan"
  );
  if (!loan) {
    return { success: false, error: "Tidak ada transaksi peminjaman aktif untuk eksemplar ini." };
  }

  const copy = DUMMY_COPIES.find((c) => c.copyCode === loan.copyCode);
  const member = DUMMY_MEMBERS.find((m) => m.nisNim === loan.memberNisNim);

  const oldStatus = loan.status;
  loan.returnedAt = new Date().toISOString().split("T")[0];
  loan.status = "dikembalikan";

  if (copy) copy.status = "tersedia";
  if (member && member.activeLoansCount > 0) member.activeLoansCount -= 1;

  let createdFine: FineItem | null = null;

  // Calculate fine if late and not waived
  if (loan.daysLate > 0 && !params.waive) {
    const amount = loan.daysLate * SYSTEM_CONFIG.finePerDay;
    createdFine = {
      id: `fine-${Date.now()}`,
      loanId: loan.id,
      memberId: loan.memberId,
      memberName: loan.memberName,
      memberNisNim: loan.memberNisNim,
      bookTitle: loan.bookTitle,
      copyCode: loan.copyCode,
      amount,
      daysLate: loan.daysLate,
      reason: `Keterlambatan pengembalian ${loan.daysLate} hari (Rp 1.000 / hari)`,
      status: "belum_bayar",
      paymentMethod: "transfer_manual",
      createdAt: new Date().toISOString(),
    };
    DUMMY_FINES.unshift(createdFine);
    if (member) member.totalFinesUnpaid += amount;
  }

  // Audit Log Entry
  await writeAuditLog({
    action: params.waive ? "waive" : "update",
    entityType: "loan",
    entityId: loan.id,
    description: params.waive
      ? `Pengembalian "${loan.bookTitle}" (${loan.copyCode}) dengan pembebasan denda. Alasan: "${params.waiveReason}"`
      : `Pengembalian "${loan.bookTitle}" (${loan.copyCode}). Denda: Rp ${loan.fineAmount.toLocaleString("id-ID")}`,
    oldValue: { status: oldStatus },
    newValue: { status: "dikembalikan", fineAmount: loan.fineAmount },
  });

  revalidatePath("/dashboard");
  revalidatePath("/pustakawan/sirkulasi");
  return { success: true, loan, fine: createdFine };
}

export async function renewLoanAction(loanId: string) {
  const loan = DUMMY_LOANS.find((l) => l.id === loanId);
  if (!loan) return { success: false, error: "Peminjaman tidak ditemukan." };

  if (loan.status === "terlambat") {
    return { success: false, error: "Buku yang sudah terlambat tidak dapat diperpanjang." };
  }
  if (loan.renewedCount >= SYSTEM_CONFIG.maxRenewals) {
    return { success: false, error: "Batas perpanjangan maksimum (1x) telah tercapai." };
  }

  const oldDueDate = loan.dueDate;
  const newDueDateObj = new Date(loan.dueDate);
  newDueDateObj.setDate(newDueDateObj.getDate() + SYSTEM_CONFIG.loanDurationDays);
  loan.dueDate = newDueDateObj.toISOString().split("T")[0];
  loan.renewedCount += 1;

  await writeAuditLog({
    action: "update",
    entityType: "loan",
    entityId: loan.id,
    description: `Perpanjangan durasi pinjam "${loan.bookTitle}" (${loan.copyCode}) hingga ${loan.dueDate}`,
    oldValue: { dueDate: oldDueDate, renewedCount: 0 },
    newValue: { dueDate: loan.dueDate, renewedCount: loan.renewedCount },
  });

  revalidatePath("/dashboard");
  revalidatePath("/pustakawan/sirkulasi");
  return { success: true, loan };
}

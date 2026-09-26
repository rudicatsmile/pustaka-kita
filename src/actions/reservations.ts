"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { DUMMY_RESERVATIONS, DUMMY_BOOKS, DUMMY_MEMBERS, ReservationItem } from "@/data/dummy";
import { sendWhatsAppMessage, WhatsAppTemplates } from "@/lib/whatsapp";

export async function createReservationAction(params: {
  memberNisNim: string;
  bookId: string;
}) {
  const member = DUMMY_MEMBERS.find((m) => m.nisNim === params.memberNisNim.trim());
  const book = DUMMY_BOOKS.find((b) => b.id === params.bookId);

  if (!member || !book) {
    return { success: false, error: "Anggota atau buku tidak ditemukan." };
  }

  // Check maximum active reservations (3)
  const activeCount = DUMMY_RESERVATIONS.filter(
    (r) => r.memberNisNim === member.nisNim && r.status === "menunggu"
  ).length;

  if (activeCount >= 3) {
    return { success: false, error: "Batas maksimal 3 reservasi aktif per anggota telah tercapai." };
  }

  const newRes: ReservationItem = {
    id: `res-${Date.now()}`,
    memberId: member.id,
    memberName: member.name,
    memberNisNim: member.nisNim,
    bookId: book.id,
    bookTitle: `${book.title} - ${book.author}`,
    coverUrl: book.coverUrl,
    reservedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    status: "menunggu",
    queuePosition: activeCount + 1,
  };

  DUMMY_RESERVATIONS.unshift(newRes);

  await writeAuditLog({
    action: "create",
    entityType: "loan",
    entityId: newRes.id,
    description: `Anggota ${member.name} (${member.nisNim}) mengajukan reservasi antrean #${newRes.queuePosition} untuk "${book.title}"`,
    newValue: newRes as any,
  });

  revalidatePath(`/katalog/${book.slug}`);
  revalidatePath("/dashboard/reservasi");
  revalidatePath("/pustakawan/reservasi");
  return { success: true, reservation: newRes };
}

export async function cancelReservationAction(reservationId: string) {
  const index = DUMMY_RESERVATIONS.findIndex((r) => r.id === reservationId);
  if (index === -1) return { success: false, error: "Reservasi tidak ditemukan." };

  const removed = DUMMY_RESERVATIONS.splice(index, 1)[0];

  await writeAuditLog({
    action: "delete",
    entityType: "loan",
    entityId: reservationId,
    description: `Pembatalan antrean reservasi untuk "${removed.bookTitle}" oleh ${removed.memberName}`,
    oldValue: removed as any,
  });

  revalidatePath("/dashboard/reservasi");
  revalidatePath("/pustakawan/reservasi");
  return { success: true };
}

export async function markReservationReadyAction(reservationId: string) {
  const res = DUMMY_RESERVATIONS.find((r) => r.id === reservationId);
  if (!res) return { success: false, error: "Reservasi tidak ditemukan." };

  const now = new Date();
  const expire = new Date();
  expire.setDate(now.getDate() + 2);

  res.status = "siap";
  res.readyAt = now.toISOString().replace("T", " ").substring(0, 16);
  res.expiresAt = expire.toISOString().replace("T", " ").substring(0, 16);

  await writeAuditLog({
    action: "update",
    entityType: "loan",
    entityId: res.id,
    description: `Pustakawan menandai buku reservasi "${res.bookTitle}" SIAP DIAMBIL untuk ${res.memberName}. Notifikasi WA terkirim.`,
    newValue: { status: "siap", expiresAt: res.expiresAt },
  });

  // Find member to send WhatsApp alert
  const member = DUMMY_MEMBERS.find((m) => m.nisNim === res.memberNisNim);
  if (member) {
    await sendWhatsAppMessage({
      recipient: member.phoneWa,
      recipientName: member.name,
      type: "reservation_ready",
      message: WhatsAppTemplates.reservationReady(member.name, res.bookTitle, res.expiresAt),
      referenceType: "reservation",
      referenceId: res.id,
    });
  }

  revalidatePath("/dashboard/reservasi");
  revalidatePath("/pustakawan/reservasi");
  return { success: true, reservation: res };
}

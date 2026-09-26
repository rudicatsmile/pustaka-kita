"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { db, schema } from "@/db";
import { eq, and, desc, count } from "drizzle-orm";
import { DUMMY_RESERVATIONS, DUMMY_BOOKS, DUMMY_MEMBERS, ReservationItem } from "@/data/dummy";
import { sendWhatsAppMessage, WhatsAppTemplates } from "@/lib/whatsapp";
import { auth } from "@/auth";

export async function createReservationAction(params: {
  memberNisNim?: string;
  bookId: string;
}) {
  let session = null;
  try {
    session = await auth();
  } catch {}

  if (db) {
    try {
      let user = null;
      if (params.memberNisNim) {
        user = await db.query.users.findFirst({
          where: eq(schema.users.nisNim, params.memberNisNim.trim()),
        });
      } else if (session?.user?.id) {
        user = await db.query.users.findFirst({
          where: eq(schema.users.id, session.user.id),
        });
      }

      if (!user) {
        return { success: false, error: "Anggota tidak ditemukan." };
      }

      const book = await db.query.books.findFirst({
        where: eq(schema.books.id, params.bookId),
      });

      if (!book) {
        return { success: false, error: "Buku tidak ditemukan." };
      }

      // Hitung reservasi aktif
      const activeRes = await db.query.reservations.findMany({
        where: and(
          eq(schema.reservations.memberId, user.id),
          eq(schema.reservations.status, "menunggu")
        ),
      });

      if (activeRes.length >= 3) {
        return {
          success: false,
          error: "Batas maksimal 3 reservasi aktif per anggota telah tercapai.",
        };
      }

      const [newRes] = await db
        .insert(schema.reservations)
        .values({
          memberId: user.id,
          bookId: book.id,
          status: "menunggu",
          queuePosition: activeRes.length + 1,
        })
        .returning();

      await writeAuditLog({
        actorId: user.id,
        actorName: user.name,
        action: "create",
        entityType: "loan",
        entityId: newRes.id,
        description: `Anggota ${user.name} (${user.nisNim}) mengajukan reservasi antrean #${newRes.queuePosition} untuk "${book.title}"`,
        newValue: newRes,
      });

      revalidatePath(`/katalog/${book.slug}`);
      revalidatePath("/dashboard/reservasi");
      revalidatePath("/pustakawan/reservasi");

      return {
        success: true,
        reservation: {
          id: newRes.id,
          memberId: user.id,
          memberName: user.name,
          memberNisNim: user.nisNim,
          bookId: book.id,
          bookTitle: `${book.title} - ${book.author}`,
          coverUrl: book.coverUrl,
          reservedAt: newRes.reservedAt.toISOString(),
          status: newRes.status,
          queuePosition: newRes.queuePosition,
        },
      };
    } catch (e: any) {
      console.warn("DB create reservation error, fallback:", e);
    }
  }

  // Fallback memory
  const member = DUMMY_MEMBERS.find((m) => m.nisNim === params.memberNisNim?.trim()) || DUMMY_MEMBERS[0];
  const book = DUMMY_BOOKS.find((b) => b.id === params.bookId) || DUMMY_BOOKS[0];

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

  revalidatePath(`/katalog/${book.slug}`);
  revalidatePath("/dashboard/reservasi");
  revalidatePath("/pustakawan/reservasi");
  return { success: true, reservation: newRes };
}

export async function cancelReservationAction(reservationId: string) {
  if (db) {
    try {
      const res = await db.query.reservations.findFirst({
        where: eq(schema.reservations.id, reservationId),
        with: {
          book: true,
          member: true,
        },
      });

      if (!res) return { success: false, error: "Reservasi tidak ditemukan." };

      await db
        .update(schema.reservations)
        .set({ status: "dibatalkan" })
        .where(eq(schema.reservations.id, reservationId));

      await writeAuditLog({
        action: "delete",
        entityType: "loan",
        entityId: reservationId,
        description: `Pembatalan antrean reservasi untuk "${res.book?.title || "Buku"}" oleh ${res.member?.name || "Anggota"}`,
        oldValue: res,
      });

      revalidatePath("/dashboard/reservasi");
      revalidatePath("/pustakawan/reservasi");
      return { success: true };
    } catch (e: any) {
      console.warn("DB cancel reservation error, fallback:", e);
    }
  }

  const index = DUMMY_RESERVATIONS.findIndex((r) => r.id === reservationId);
  if (index === -1) return { success: false, error: "Reservasi tidak ditemukan." };

  const removed = DUMMY_RESERVATIONS.splice(index, 1)[0];
  revalidatePath("/dashboard/reservasi");
  revalidatePath("/pustakawan/reservasi");
  return { success: true };
}

export async function markReservationReadyAction(reservationId: string) {
  if (db) {
    try {
      const res = await db.query.reservations.findFirst({
        where: eq(schema.reservations.id, reservationId),
        with: {
          book: true,
          member: true,
        },
      });

      if (!res) return { success: false, error: "Reservasi tidak ditemukan." };

      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(now.getDate() + 2);

      await db
        .update(schema.reservations)
        .set({
          status: "siap",
          readyAt: now,
          expiresAt: expiresAt,
          notifiedAt: now,
        })
        .where(eq(schema.reservations.id, reservationId));

      await writeAuditLog({
        action: "update",
        entityType: "loan",
        entityId: res.id,
        description: `Pustakawan menandai buku reservasi "${res.book?.title || "Buku"}" SIAP DIAMBIL untuk ${res.member?.name || "Anggota"}. Notifikasi WA terkirim.`,
        newValue: { status: "siap", expiresAt: expiresAt.toISOString() },
      });

      // Kirim WhatsApp alert
      if (res.member?.phoneWa) {
        await sendWhatsAppMessage({
          recipient: res.member.phoneWa,
          recipientName: res.member.name,
          type: "reservation_ready",
          message: WhatsAppTemplates.reservationReady(
            res.member.name,
            res.book?.title || "Buku",
            expiresAt.toLocaleDateString("id-ID")
          ),
          referenceType: "reservation",
          referenceId: res.id,
        });
      }

      revalidatePath("/dashboard/reservasi");
      revalidatePath("/pustakawan/reservasi");
      return { success: true };
    } catch (e: any) {
      console.warn("DB mark reservation ready error, fallback:", e);
    }
  }

  const res = DUMMY_RESERVATIONS.find((r) => r.id === reservationId);
  if (!res) return { success: false, error: "Reservasi tidak ditemukan." };

  const now = new Date();
  const expire = new Date();
  expire.setDate(now.getDate() + 2);

  res.status = "siap";
  res.readyAt = now.toISOString().replace("T", " ").substring(0, 16);
  res.expiresAt = expire.toISOString().replace("T", " ").substring(0, 16);

  revalidatePath("/dashboard/reservasi");
  revalidatePath("/pustakawan/reservasi");
  return { success: true, reservation: res };
}

export async function getReservationsAction() {
  if (db) {
    try {
      const allRes = await db.query.reservations.findMany({
        with: {
          book: true,
          member: true,
        },
        orderBy: [desc(schema.reservations.reservedAt)],
      });

      return allRes.map((r) => ({
        id: r.id,
        memberId: r.memberId,
        memberName: r.member?.name || "Anggota",
        memberNisNim: r.member?.nisNim || "-",
        bookId: r.bookId,
        bookTitle: r.book ? `${r.book.title} - ${r.book.author}` : "Buku",
        coverUrl: r.book?.coverUrl || "",
        reservedAt: r.reservedAt.toISOString().replace("T", " ").substring(0, 16),
        status: r.status,
        queuePosition: r.queuePosition || 1,
        readyAt: r.readyAt ? r.readyAt.toISOString().replace("T", " ").substring(0, 16) : undefined,
        expiresAt: r.expiresAt ? r.expiresAt.toISOString().replace("T", " ").substring(0, 16) : undefined,
      }));
    } catch (e) {
      console.warn("DB get reservations error, fallback:", e);
    }
  }

  return DUMMY_RESERVATIONS;
}

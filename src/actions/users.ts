"use server";

import * as z from "zod";
import * as bcrypt from "bcryptjs";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { DUMMY_MEMBERS, MemberItem } from "@/data/dummy";
import { writeAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { sendWhatsAppMessage, WhatsAppTemplates } from "@/lib/whatsapp";

const createUserSchema = z.object({
  nisNim: z.string().min(3),
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phoneWa: z.string().min(10),
  role: z.enum(["anggota", "pustakawan", "admin"]),
  classOrMajor: z.string().optional(),
  memberStatus: z.enum(["aktif", "nonaktif", "ditangguhkan", "lulus", "keluar"]).default("aktif"),
});

export async function createUserAction(data: z.infer<typeof createUserSchema>, actorId?: string, actorName?: string) {
  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const defaultPassword = "password123";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  const val = parsed.data;

  let newId = `usr-${Date.now()}`;

  if (db) {
    try {
      const res = await db
        .insert(schema.users)
        .values({
          nisNim: val.nisNim,
          name: val.name,
          email: val.email || `${val.nisNim}@perpustakaan.sch.id`,
          phoneWa: val.phoneWa,
          passwordHash,
          role: val.role,
          memberStatus: val.memberStatus,
          classOrMajor: val.classOrMajor || "-",
          isVerified: true,
        })
        .returning();

      if (res[0]) newId = res[0].id;
    } catch (e) {
      console.warn("DB insert user error, updating mock array:", e);
    }
  }

  const newMember: MemberItem = {
    id: newId,
    nisNim: val.nisNim,
    name: val.name,
    classOrMajor: val.classOrMajor || "-",
    email: val.email || `${val.nisNim}@perpustakaan.sch.id`,
    phoneWa: val.phoneWa,
    role: val.role,
    memberStatus: val.memberStatus,
    activeLoansCount: 0,
    totalLoansCount: 0,
    totalFinesUnpaid: 0,
    joinDate: new Date().toISOString().split("T")[0],
    isVerified: true,
  };
  DUMMY_MEMBERS.unshift(newMember);

  await writeAuditLog({
    actorId,
    actorName,
    action: "create",
    entityType: "user",
    entityId: newId,
    description: `Admin menambahkan pengguna baru: ${val.name} (${val.nisNim}) sebagai ${val.role}`,
    newValue: val,
  });

  revalidatePath("/admin/pengguna");
  revalidatePath("/pustakawan/anggota");
  return { success: true, message: "Pengguna berhasil ditambahkan!" };
}

export async function updateUserStatusAction(params: {
  userId: string;
  status: "aktif" | "nonaktif" | "ditangguhkan" | "lulus" | "keluar";
  actorId?: string;
  actorName?: string;
}) {
  const member = DUMMY_MEMBERS.find((m) => m.id === params.userId);
  const oldStatus = member?.memberStatus || "aktif";

  if (db) {
    try {
      await db
        .update(schema.users)
        .set({ memberStatus: params.status, updatedAt: new Date() })
        .where(eq(schema.users.id, params.userId));
    } catch (e) {
      console.warn("DB update status user error:", e);
    }
  }

  if (member) {
    member.memberStatus = params.status;
  }

  await writeAuditLog({
    actorId: params.actorId,
    actorName: params.actorName,
    action: "update",
    entityType: "user",
    entityId: params.userId,
    description: `Status pengguna ${member?.name || params.userId} diubah dari "${oldStatus}" menjadi "${params.status}"`,
    oldValue: { status: oldStatus },
    newValue: { status: params.status },
  });

  if (params.status === "ditangguhkan" && member) {
    await sendWhatsAppMessage({
      recipient: member.phoneWa,
      recipientName: member.name,
      type: "account_suspended",
      message: WhatsAppTemplates.accountSuspended(member.name, member.nisNim, member.totalFinesUnpaid || 50000),
      userId: member.id,
      referenceType: "user",
      referenceId: member.id,
    });
  }

  revalidatePath("/admin/pengguna");
  revalidatePath("/pustakawan/anggota");
  return { success: true, message: `Status pengguna berhasil diperbarui menjadi ${params.status}!` };
}

export async function deleteUserAction(params: {
  userId: string;
  actorId?: string;
  actorName?: string;
}) {
  const index = DUMMY_MEMBERS.findIndex((m) => m.id === params.userId);
  const oldData = index !== -1 ? DUMMY_MEMBERS[index] : null;

  if (db) {
    try {
      await db.delete(schema.users).where(eq(schema.users.id, params.userId));
    } catch (e) {
      console.warn("DB delete user error:", e);
    }
  }

  if (index !== -1) {
    DUMMY_MEMBERS.splice(index, 1);
  }

  await writeAuditLog({
    actorId: params.actorId,
    actorName: params.actorName,
    action: "delete",
    entityType: "user",
    entityId: params.userId,
    description: `Pengguna ${oldData?.name || params.userId} dihapus oleh admin.`,
    oldValue: (oldData as unknown as Record<string, unknown>) || null,
  });

  revalidatePath("/admin/pengguna");
  return { success: true, message: "Pengguna berhasil dihapus!" };
}

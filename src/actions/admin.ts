"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { db, schema } from "@/db";
import { eq, desc, count, sql } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import {
  DUMMY_MEMBERS,
  DUMMY_AUDIT_LOGS,
  DUMMY_CATEGORIES,
  DUMMY_NOTIFICATIONS,
  MemberItem,
  AuditLogItem,
  CategoryItem,
} from "@/data/dummy";

export async function getAdminDashboardStats() {
  if (db) {
    try {
      const [totalMembers] = await db
        .select({ val: count() })
        .from(schema.users)
        .where(eq(schema.users.role, "anggota"));

      const [totalStaff] = await db
        .select({ val: count() })
        .from(schema.users)
        .where(eq(schema.users.role, "pustakawan"));

      const [totalBooks] = await db.select({ val: count() }).from(schema.books);
      const [totalLogs] = await db.select({ val: count() }).from(schema.auditLogs);

      const recentLogsRaw = await db.query.auditLogs.findMany({
        orderBy: [desc(schema.auditLogs.createdAt)],
        limit: 6,
      });

      const recentLogs = recentLogsRaw.map((l) => ({
        id: l.id,
        actorId: l.actorId || "",
        actorName: l.actorName || "Sistem",
        action: l.action,
        entityType: l.entityType as any,
        entityId: l.entityId || "",
        description: l.description || "",
        oldValue: (l.oldValue as Record<string, unknown>) || null,
        newValue: (l.newValue as Record<string, unknown>) || null,
        ipAddress: l.ipAddress || "127.0.0.1",
        userAgent: l.userAgent || "Browser",
        createdAt: l.createdAt.toISOString().replace("T", " ").substring(0, 19),
      }));

      return {
        totalMembers: Number(totalMembers?.val || 0),
        totalStaff: Number(totalStaff?.val || 0),
        totalBooks: Number(totalBooks?.val || 0),
        totalLogs: Number(totalLogs?.val || 0),
        recentLogs,
      };
    } catch (e) {
      console.warn("DB getAdminStats error, fallback:", e);
    }
  }

  return {
    totalMembers: DUMMY_MEMBERS.filter((m) => m.role === "anggota").length,
    totalStaff: DUMMY_MEMBERS.filter((m) => m.role !== "anggota").length,
    totalBooks: 6,
    totalLogs: DUMMY_AUDIT_LOGS.length,
    recentLogs: DUMMY_AUDIT_LOGS.slice(0, 6),
  };
}

export async function getAllUsersAction() {
  if (db) {
    try {
      const users = await db.query.users.findMany({
        with: {
          loans: true,
          fines: true,
        },
        orderBy: [desc(schema.users.createdAt)],
      });

      return users.map((u) => {
        const activeLoansCount =
          u.loans?.filter((l) => l.status === "dipinjam" || l.status === "terlambat").length || 0;
        const totalLoansCount = u.loans?.length || 0;
        const totalFinesUnpaid =
          u.fines
            ?.filter((f) => f.status === "belum_bayar")
            .reduce((acc, f) => acc + Number(f.amount || 0), 0) || 0;

        return {
          id: u.id,
          nisNim: u.nisNim,
          name: u.name,
          email: u.email || "",
          phoneWa: u.phoneWa,
          role: u.role,
          memberStatus: u.memberStatus,
          classOrMajor: u.classOrMajor || "-",
          joinDate: u.joinDate ? u.joinDate.toISOString().split("T")[0] : "2024-01-01",
          activeLoansCount,
          totalLoansCount,
          totalFinesUnpaid,
          isVerified: u.isVerified,
        };
      });
    } catch (e) {
      console.warn("DB getAllUsers error, fallback:", e);
    }
  }

  return DUMMY_MEMBERS;
}

export async function createAdminUserAction(params: {
  nisNim: string;
  name: string;
  email?: string;
  phoneWa: string;
  password?: string;
  role: "anggota" | "pustakawan" | "admin";
  classOrMajor?: string;
}) {
  if (!params.nisNim.trim() || !params.name.trim() || !params.phoneWa.trim()) {
    return { success: false, error: "Identitas NIS/NIM, Nama, dan No. WA wajib diisi." };
  }

  const plainPassword = params.password || "password123";
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  if (db) {
    try {
      const existing = await db.query.users.findFirst({
        where: eq(schema.users.nisNim, params.nisNim.trim()),
      });

      if (existing) {
        return { success: false, error: `NIS/NIM ${params.nisNim} sudah terdaftar di sistem.` };
      }

      const [newUser] = await db
        .insert(schema.users)
        .values({
          nisNim: params.nisNim.trim(),
          name: params.name.trim(),
          email: params.email?.trim() || null,
          phoneWa: params.phoneWa.trim(),
          passwordHash,
          role: params.role,
          memberStatus: "aktif",
          classOrMajor: params.classOrMajor?.trim() || null,
          isVerified: true,
        })
        .returning();

      await writeAuditLog({
        action: "create",
        entityType: "user",
        entityId: newUser.id,
        description: `Pembuatan akun pengguna baru [${newUser.role.toUpperCase()}]: ${newUser.name} (${newUser.nisNim})`,
        newValue: { id: newUser.id, name: newUser.name, role: newUser.role },
      });

      revalidatePath("/admin/pengguna");
      revalidatePath("/pustakawan/anggota");
      return { success: true, user: newUser };
    } catch (e: any) {
      console.warn("DB createAdminUser error, fallback:", e);
    }
  }

  const dummyUser: MemberItem = {
    id: `usr-${Date.now()}`,
    nisNim: params.nisNim,
    name: params.name,
    email: params.email || "",
    phoneWa: params.phoneWa,
    role: params.role,
    memberStatus: "aktif",
    classOrMajor: params.classOrMajor || "-",
    joinDate: new Date().toISOString().split("T")[0],
    activeLoansCount: 0,
    totalLoansCount: 0,
    totalFinesUnpaid: 0,
    isVerified: true,
  };

  DUMMY_MEMBERS.unshift(dummyUser);
  revalidatePath("/admin/pengguna");
  return { success: true, user: dummyUser };
}

export async function updateUserRoleStatusAction(params: {
  userId: string;
  role?: "anggota" | "pustakawan" | "admin";
  memberStatus?: "aktif" | "nonaktif" | "ditangguhkan" | "lulus" | "keluar";
}) {
  if (db) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, params.userId),
      });

      if (!user) return { success: false, error: "Pengguna tidak ditemukan." };

      const updateData: Record<string, any> = { updatedAt: new Date() };
      if (params.role) updateData.role = params.role;
      if (params.memberStatus) updateData.memberStatus = params.memberStatus;

      await db
        .update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, params.userId));

      await writeAuditLog({
        action: "update",
        entityType: "user",
        entityId: user.id,
        description: `Admin memperbarui role/status pengguna ${user.name} (${user.nisNim})`,
        oldValue: { role: user.role, status: user.memberStatus },
        newValue: updateData,
      });

      revalidatePath("/admin/pengguna");
      return { success: true };
    } catch (e: any) {
      console.warn("DB updateUser error, fallback:", e);
    }
  }

  const m = DUMMY_MEMBERS.find((u) => u.id === params.userId);
  if (m) {
    if (params.role) m.role = params.role;
    if (params.memberStatus) m.memberStatus = params.memberStatus;
  }
  revalidatePath("/admin/pengguna");
  return { success: true };
}

export async function getAllCategoriesAction() {
  if (db) {
    try {
      const cats = await db.query.categories.findMany({
        with: {
          books: true,
        },
        orderBy: [desc(schema.categories.createdAt)],
      });

      return cats.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        count: c.books?.length || 0,
        desc: c.description || "",
      }));
    } catch (e) {
      console.warn("DB getAllCategories error, fallback:", e);
    }
  }

  return DUMMY_CATEGORIES;
}

export async function createCategoryAction(params: { name: string; desc?: string }) {
  const name = params.name.trim();
  if (!name) return { success: false, error: "Nama kategori tidak boleh kosong." };

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  if (db) {
    try {
      const [newCat] = await db
        .insert(schema.categories)
        .values({
          name,
          slug,
          description: params.desc?.trim() || null,
        })
        .returning();

      await writeAuditLog({
        action: "create",
        entityType: "book",
        entityId: newCat.id,
        description: `Pembuatan kategori baru: "${newCat.name}"`,
        newValue: newCat,
      });

      revalidatePath("/admin/kategori");
      revalidatePath("/pustakawan/buku");
      return { success: true, category: newCat };
    } catch (e: any) {
      console.warn("DB createCategory error, fallback:", e);
    }
  }

  const dummyCat: CategoryItem = {
    id: `cat-${Date.now()}`,
    name,
    slug,
    count: 0,
    desc: params.desc || "",
  };

  DUMMY_CATEGORIES.push(dummyCat);
  revalidatePath("/admin/kategori");
  return { success: true, category: dummyCat };
}

export async function deleteCategoryAction(catId: string) {
  if (db) {
    try {
      const cat = await db.query.categories.findFirst({
        where: eq(schema.categories.id, catId),
        with: { books: true },
      });

      if (!cat) return { success: false, error: "Kategori tidak ditemukan." };
      if (cat.books && cat.books.length > 0) {
        return {
          success: false,
          error: `Kategori "${cat.name}" masih memiliki ${cat.books.length} buku terkait. Pindahkan buku sebelum menghapus.`,
        };
      }

      await db.delete(schema.categories).where(eq(schema.categories.id, catId));

      await writeAuditLog({
        action: "delete",
        entityType: "book",
        entityId: catId,
        description: `Penghapusan kategori: "${cat.name}"`,
        oldValue: cat,
      });

      revalidatePath("/admin/kategori");
      return { success: true };
    } catch (e: any) {
      console.warn("DB deleteCategory error, fallback:", e);
    }
  }

  const idx = DUMMY_CATEGORIES.findIndex((c) => c.id === catId);
  if (idx !== -1) DUMMY_CATEGORIES.splice(idx, 1);
  revalidatePath("/admin/kategori");
  return { success: true };
}

export async function getAuditLogsAction() {
  if (db) {
    try {
      const logs = await db.query.auditLogs.findMany({
        orderBy: [desc(schema.auditLogs.createdAt)],
        limit: 100,
      });

      return logs.map((l) => ({
        id: l.id,
        actorId: l.actorId || "",
        actorName: l.actorName || "Sistem",
        action: l.action,
        entityType: l.entityType as any,
        entityId: l.entityId || "",
        description: l.description || "",
        oldValue: (l.oldValue as Record<string, unknown>) || null,
        newValue: (l.newValue as Record<string, unknown>) || null,
        ipAddress: l.ipAddress || "127.0.0.1",
        userAgent: l.userAgent || "Browser",
        createdAt: l.createdAt.toISOString().replace("T", " ").substring(0, 19),
      }));
    } catch (e) {
      console.warn("DB getAuditLogs error, fallback:", e);
    }
  }

  return DUMMY_AUDIT_LOGS;
}

export async function getNotificationsLogAction() {
  if (db) {
    try {
      const rows = await db.query.notifications.findMany({
        with: {
          user: true,
        },
        orderBy: [desc(schema.notifications.createdAt)],
        limit: 50,
      });

      return rows.map((n) => ({
        id: n.id,
        recipient: n.recipient,
        recipientName: n.user?.name || "Anggota",
        channel: n.channel,
        type: n.type,
        message: n.message,
        status: n.status,
        createdAt: n.createdAt.toISOString().replace("T", " ").substring(0, 19),
        sentAt: n.sentAt ? n.sentAt.toISOString().replace("T", " ").substring(0, 19) : undefined,
      }));
    } catch (e) {
      console.warn("DB getNotificationsLog error, fallback:", e);
    }
  }

  return DUMMY_NOTIFICATIONS;
}

"use server";

import * as z from "zod";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { DUMMY_CATEGORIES, CategoryItem } from "@/data/dummy";
import { writeAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
  description: z.string().optional(),
});

export async function createCategoryAction(data: z.infer<typeof categorySchema>, actorId?: string, actorName?: string) {
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  let newId = `cat-${Date.now()}`;

  if (db) {
    try {
      const res = await db
        .insert(schema.categories)
        .values({
          name: parsed.data.name,
          slug,
          description: parsed.data.description || null,
        })
        .returning();

      if (res[0]) newId = res[0].id;
    } catch (e) {
      console.warn("DB insert category error:", e);
    }
  }

  const newCat: CategoryItem = {
    id: newId,
    name: parsed.data.name,
    slug,
    desc: parsed.data.description || "-",
    count: 0,
  };
  DUMMY_CATEGORIES.push(newCat);

  await writeAuditLog({
    actorId,
    actorName,
    action: "create",
    entityType: "book",
    entityId: newId,
    description: `Kategori buku baru ditambahkan: "${parsed.data.name}"`,
    newValue: { name: parsed.data.name, slug, description: parsed.data.description },
  });

  revalidatePath("/admin/kategori");
  revalidatePath("/katalog");
  return { success: true, message: `Kategori "${parsed.data.name}" berhasil dibuat!` };
}

export async function deleteCategoryAction(categoryId: string, actorId?: string, actorName?: string) {
  const index = DUMMY_CATEGORIES.findIndex((c) => c.id === categoryId);
  const oldData = index !== -1 ? DUMMY_CATEGORIES[index] : null;

  if (db) {
    try {
      await db.delete(schema.categories).where(eq(schema.categories.id, categoryId));
    } catch (e) {
      console.warn("DB delete category error:", e);
    }
  }

  if (index !== -1) {
    DUMMY_CATEGORIES.splice(index, 1);
  }

  await writeAuditLog({
    actorId,
    actorName,
    action: "delete",
    entityType: "book",
    entityId: categoryId,
    description: `Kategori "${oldData?.name || categoryId}" dihapus.`,
    oldValue: (oldData as unknown as Record<string, unknown>) || null,
  });

  revalidatePath("/admin/kategori");
  revalidatePath("/katalog");
  return { success: true, message: "Kategori berhasil dihapus!" };
}

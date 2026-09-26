"use server";

import * as z from "zod";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { DUMMY_SETTINGS, LibrarySettings } from "@/data/dummy";
import { writeAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

const settingsSchema = z.object({
  loanDurationDays: z.number().min(1).max(30),
  finePerDay: z.number().min(0),
  maxBooksPerMember: z.number().min(1).max(10),
  maxRenewals: z.number().min(0).max(5),
  maxFineBlockThreshold: z.number().min(0),
  bankName: z.string().min(2),
  bankAccountNumber: z.string().min(5),
  bankAccountName: z.string().min(3),
  whatsappApiKey: z.string().optional(),
  whatsappSenderNumber: z.string().optional(),
});

export async function updateSettingsAction(
  data: Partial<LibrarySettings> & { whatsappApiKey?: string; whatsappSenderNumber?: string },
  actorId?: string,
  actorName?: string
) {
  const oldSettings = { ...DUMMY_SETTINGS };

  // Update in DB if present
  if (db) {
    try {
      for (const [key, value] of Object.entries(data)) {
        await db
          .insert(schema.settings)
          .values({
            key,
            value: { val: value },
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: schema.settings.key,
            set: { value: { val: value }, updatedAt: new Date() },
          });
      }
    } catch (e) {
      console.warn("DB settings update error:", e);
    }
  }

  // Update memory state
  Object.assign(DUMMY_SETTINGS, data);

  await writeAuditLog({
    actorId,
    actorName,
    action: "update",
    entityType: "book", // or system settings
    entityId: "settings-general",
    description: "Pengaturan sistem perpustakaan diperbarui oleh Admin.",
    oldValue: oldSettings as unknown as Record<string, unknown>,
    newValue: data as unknown as Record<string, unknown>,
  });

  revalidatePath("/admin/pengaturan");
  revalidatePath("/admin/whatsapp");
  return { success: true, message: "Pengaturan berhasil disimpan!" };
}

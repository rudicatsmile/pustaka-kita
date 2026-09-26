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

export async function getSettingsAction() {
  if (db) {
    try {
      const allSettings = await db.query.settings.findMany();
      const bankAccountSetting = allSettings.find((s) => s.key === "bank_account");
      const bankVal = (bankAccountSetting?.value as any) || {};

      return {
        bankName: bankVal.bankName || "Bank Mandiri",
        bankAccountNumber: bankVal.accountNumber || "1370012345678",
        bankAccountName: bankVal.accountName || "SMK Nusantara - Perpustakaan PustakaKitaCeria",
      };
    } catch (e) {
      console.warn("DB getSettings error, fallback:", e);
    }
  }

  return {
    bankName: "Bank Mandiri",
    bankAccountNumber: "1370012345678",
    bankAccountName: "SMK Nusantara - Perpustakaan PustakaKitaCeria",
  };
}

export async function getInstitutionSettingsAction() {
  if (db) {
    try {
      const allSettings = await db.query.settings.findMany();
      const institutionSetting = allSettings.find((s) => s.key === "institution");
      if (institutionSetting?.value) {
        return institutionSetting.value as any;
      }
    } catch (e) {
      console.warn("DB getInstitutionSettings error, fallback:", e);
    }
  }

  return {
    institutionName: "SMK Nusantara Jakarta",
    libraryName: "Perpustakaan PustakaKitaCeria",
    tagline: "Membuka Jendela Dunia dengan Ceria",
    address: "Jl. Pendidikan No. 45, Kompleks Kampus Merdeka, Jakarta Selatan 12340",
    phone: "+62 21 7890 1234",
    email: "perpustakaan@smknusantara.sch.id",
    operationalHours: "Senin - Jumat: 07.30 - 16.00 WIB | Sabtu: 08.00 - 12.00 WIB",
    maxActiveLoans: 3,
    loanDurationDays: 7,
    dailyFineAmount: 1000,
    maxRenewCount: 1,
    bankName: "Bank Mandiri",
    bankAccountNumber: "137-00-1234567-8",
    bankAccountName: "SMK Nusantara - Perpustakaan PustakaKitaCeria",
  };
}



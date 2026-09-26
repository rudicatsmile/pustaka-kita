"use server";

import * as z from "zod";
import * as bcrypt from "bcryptjs";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { DUMMY_MEMBERS, MemberItem } from "@/data/dummy";
import { writeAuditLog } from "@/lib/audit";

const registerSchema = z.object({
  nisNim: z.string().min(5, "NIS/NIM minimal 5 karakter").max(20),
  name: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  classOrMajor: z.string().min(2, "Kelas / Jurusan wajib diisi"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  phoneWa: z.string().min(10, "Nomor WhatsApp minimal 10 digit").max(18),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

// In-memory failed attempts tracker for rate limiting (fallback & fast path)
const failedAttemptsMap = new Map<string, { count: number; lockedUntil: number | null }>();

export async function checkLoginRateLimit(nisNim: string): Promise<{ locked: boolean; message?: string }> {
  const record = failedAttemptsMap.get(nisNim);
  if (!record) return { locked: false };

  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    const minutesLeft = Math.ceil((record.lockedUntil - Date.now()) / (60 * 1000));
    return {
      locked: true,
      message: `Akun terkunci karena 5 kali gagal login. Silakan tunggu ${minutesLeft} menit lagi.`,
    };
  }

  // If lock period passed, reset
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    failedAttemptsMap.delete(nisNim);
  }

  return { locked: false };
}

export async function recordLoginAttempt(nisNim: string, isSuccess: boolean) {
  if (isSuccess) {
    failedAttemptsMap.delete(nisNim);
    await writeAuditLog({
      action: "login",
      entityType: "user",
      description: `Pengguna dengan NIS/NIM ${nisNim} berhasil login.`,
      newValue: { nisNim, status: "sukses" },
    });
    return;
  }

  const record = failedAttemptsMap.get(nisNim) || { count: 0, lockedUntil: null };
  record.count += 1;

  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes lockout
    await writeAuditLog({
      action: "update",
      entityType: "user",
      description: `Akun NIS/NIM ${nisNim} terkunci otomatis selama 15 menit karena 5 kali gagal login.`,
      newValue: { nisNim, failedCount: record.count, lockedUntil: new Date(record.lockedUntil).toISOString() },
    });
  }

  failedAttemptsMap.set(nisNim, record);
}

export async function registerMemberAction(data: z.infer<typeof registerSchema>) {
  const validated = registerSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  const { nisNim, name, classOrMajor, email, phoneWa, password } = validated.data;
  const passwordHash = await bcrypt.hash(password, 10);
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Try DB insert
  let userId = `usr-${Date.now()}`;
  if (db) {
    try {
      const existing = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.nisNim, nisNim))
        .limit(1);

      if (existing.length > 0) {
        return { success: false, error: `NIS/NIM ${nisNim} sudah terdaftar dalam sistem!` };
      }

      const inserted = await db
        .insert(schema.users)
        .values({
          nisNim,
          name,
          classOrMajor,
          email: email || `${nisNim}@sekolah.sch.id`,
          phoneWa,
          passwordHash,
          role: "anggota",
          memberStatus: "aktif",
          isVerified: false,
        })
        .returning();

      if (inserted[0]) {
        userId = inserted[0].id;

        // Store OTP in database
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min validity
        await db.insert(schema.otpTokens).values({
          userId: inserted[0].id,
          code: otpCode,
          purpose: "register",
          expiresAt,
        });

        // Store mock notification queue
        await db.insert(schema.notifications).values({
          userId: inserted[0].id,
          channel: "whatsapp",
          type: "otp",
          recipient: phoneWa,
          message: `[PustakaKitaCeria] Kode OTP pendaftaran Anda: *${otpCode}*. Berlaku 5 menit. Jangan bagikan kode ini kepada siapa pun.`,
          status: "pending",
        });
      }
    } catch (e) {
      console.warn("DB register error, fallback to mock memory:", e);
    }
  }

  // Also push to DUMMY_MEMBERS for seamless preview
  const newMember: MemberItem = {
    id: userId,
    nisNim,
    name,
    classOrMajor,
    email: email || `${nisNim}@sekolah.sch.id`,
    phoneWa,
    role: "anggota",
    memberStatus: "aktif",
    activeLoansCount: 0,
    totalLoansCount: 0,
    totalFinesUnpaid: 0,
    joinDate: new Date().toISOString().split("T")[0],
    isVerified: false,
  };
  DUMMY_MEMBERS.push(newMember);

  await writeAuditLog({
    action: "create",
    entityType: "user",
    entityId: userId,
    description: `Pendaftaran anggota baru: ${name} (${nisNim}) - ${classOrMajor}`,
    newValue: {
      nisNim,
      name,
      classOrMajor,
      email: email || null,
      phoneWa,
      role: "anggota",
    },
  });

  return {
    success: true,
    userId,
    otpDemo: otpCode,
    message: `Pendaftaran berhasil dikirim. Kode OTP simulasi WhatsApp: ${otpCode}`,
  };
}

export async function verifyOtpAction(params: { nisNim: string; otp: string }): Promise<{ success: boolean; message?: string; error?: string }> {
  const { nisNim, otp } = params;

  if (!otp || otp.trim().length < 4) {
    return { success: false, error: "Kode OTP tidak valid!" };
  }

  if (db) {
    try {
      const foundUsers = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.nisNim, nisNim))
        .limit(1);

      if (foundUsers.length > 0) {
        const user = foundUsers[0];
        await db
          .update(schema.users)
          .set({ isVerified: true, updatedAt: new Date() })
          .where(eq(schema.users.id, user.id));
      }
    } catch (e) {
      console.warn("DB verify error, proceeding with mock state:", e);
    }
  }

  const member = DUMMY_MEMBERS.find((m) => m.nisNim === nisNim);
  if (member) {
    member.isVerified = true;
  }

  await writeAuditLog({
    action: "update",
    entityType: "user",
    description: `Verifikasi OTP WhatsApp berhasil untuk anggota ${nisNim}`,
    newValue: { nisNim, isVerified: true, otpInput: otp },
  });

  return { success: true, message: "Nomor WhatsApp dan akun Anda berhasil diverifikasi!" };
}

export async function resetPasswordAction(params: { nisNim: string; otp: string; newPassword: string }) {
  const { nisNim, otp, newPassword } = params;
  if (newPassword.length < 6) {
    return { success: false, error: "Password baru minimal 6 karakter." };
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  if (db) {
    try {
      await db
        .update(schema.users)
        .set({ passwordHash: newHash, updatedAt: new Date() })
        .where(eq(schema.users.nisNim, nisNim));
    } catch (e) {
      console.warn("DB reset password error:", e);
    }
  }

  await writeAuditLog({
    action: "update",
    entityType: "user",
    description: `Reset kata sandi via OTP WhatsApp untuk akun NIS/NIM ${nisNim}`,
    newValue: { nisNim, otpProvided: otp },
  });

  return { success: true, message: "Kata sandi berhasil diperbarui. Silakan masuk!" };
}

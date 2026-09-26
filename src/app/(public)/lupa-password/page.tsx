"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  User,
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

import { resetPasswordAction } from "@/actions/auth";

export default function LupaPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [nisNim, setNisNim] = useState("2024001");
  const [otp, setOtp] = useState("123456");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (step === 1) {
      if (!nisNim) {
        toast.error("Harap isi NIS/NIM Anda");
        return;
      }
      toast.info("Kode OTP simulasi telah dikirim ke nomor WhatsApp Anda.", {
        description: "Kode verifikasi simulasi: 123456",
      });
      setStep(2);
    } else if (step === 2) {
      if (!otp) {
        toast.error("Harap isi kode OTP");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!newPassword || newPassword !== confirmPassword) {
        toast.error("Password baru dan konfirmasi tidak sesuai");
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await resetPasswordAction({
          nisNim,
          otp,
          newPassword,
        });

        if (!res.success) {
          toast.error("Gagal reset kata sandi", { description: res.error });
          setIsSubmitting(false);
          return;
        }

        toast.success("Kata sandi berhasil diperbarui! 🎉", {
          description: "Silakan masuk menggunakan kata sandi baru Anda.",
        });
        router.push("/masuk");
      } catch (e: any) {
        toast.error("Terjadi kesalahan:", { description: e.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <Card className="rounded-3xl border-2 border-border/80 p-8 shadow-xl">
          <CardContent className="p-0 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <BookOpen className="h-6 w-6" />
              </div>
              <h1 className="font-heading text-2xl font-extrabold text-foreground">
                Reset Kata Sandi
              </h1>
              <p className="text-xs text-muted-foreground">
                {step === 1 && "Langkah 1: Masukkan NIS/NIM terdaftar"}
                {step === 2 && "Langkah 2: Verifikasi kode OTP WhatsApp"}
                {step === 3 && "Langkah 3: Buat kata sandi baru"}
              </p>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">NIS / NIM Anggota</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={nisNim}
                      onChange={(e) => setNisNim(e.target.value)}
                      placeholder="Contoh: 2024001"
                      className="pl-10 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <KeyRound className="h-6 w-6" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Masukkan 6-digit kode OTP simulasi yang dikirimkan ke WhatsApp Anda.
                </p>
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="123456"
                  className="font-mono text-center text-xl font-bold tracking-widest max-w-[180px] mx-auto h-12"
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Kata Sandi Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      className="pl-10 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Konfirmasi Kata Sandi</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="pl-10 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <Link href="/masuk">
                <Button variant="ghost" size="sm" className="font-bold text-xs">
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Batal
                </Button>
              </Link>
              <Button onClick={handleNext} size="sm" className="font-bold">
                {step === 3 ? "Simpan Kata Sandi" : "Lanjut"}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

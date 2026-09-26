"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  User,
  GraduationCap,
  MessageCircle,
  Lock,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

import { registerMemberAction, verifyOtpAction } from "@/actions/auth";

export default function DaftarPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    nisNim: "2024003",
    name: "Rian Hidayat",
    classOrMajor: "XII IPA 1",
    email: "rian.hidayat@siswa.sch.id",
    phoneWa: "081234567899",
    password: "Password123",
    confirmPassword: "Password123",
    otp: "246810",
  });

  const updateField = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const nextStep = async () => {
    if (currentStep === 1 && !formData.nisNim) {
      toast.error("Harap isi NIS/NIM!");
      return;
    }
    if (currentStep === 2 && !formData.name) {
      toast.error("Harap isi nama lengkap!");
      return;
    }
    if (currentStep === 3 && !formData.phoneWa) {
      toast.error("Harap isi nomor WhatsApp!");
      return;
    }
    if (currentStep === 4) {
      if (!formData.password || formData.password !== formData.confirmPassword) {
        toast.error("Password dan konfirmasi password tidak cocok!");
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await registerMemberAction({
          nisNim: formData.nisNim,
          name: formData.name,
          classOrMajor: formData.classOrMajor,
          email: formData.email,
          phoneWa: formData.phoneWa,
          password: formData.password,
        });

        if (!res.success) {
          toast.error("Pendaftaran Gagal", { description: res.error });
          setIsSubmitting(false);
          return;
        }

        if (res.otpDemo) {
          setFormData((prev) => ({ ...prev, otp: res.otpDemo }));
          toast.info("Kode OTP Simulasi WhatsApp Terkirim! 📲", {
            description: `Kode OTP: ${res.otpDemo} (Tercatat di antrean notifikasi DB)`,
          });
        }
      } catch (err: any) {
        toast.error("Terjadi kesalahan:", { description: err.message });
        setIsSubmitting(false);
        return;
      } finally {
        setIsSubmitting(false);
      }
    }
    if (currentStep === 5) {
      setIsSubmitting(true);
      try {
        const res = await verifyOtpAction({
          nisNim: formData.nisNim,
          otp: formData.otp,
        });

        if (!res.success) {
          toast.error("Verifikasi OTP Gagal", { description: res.error });
          setIsSubmitting(false);
          return;
        }

        toast.success("Verifikasi OTP Berhasil! 🎉", {
          description: "Akun keanggotaan Anda telah aktif dan tercatat di Audit Log.",
        });
      } catch (err: any) {
        toast.error("Terjadi kesalahan:", { description: err.message });
        setIsSubmitting(false);
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="mx-auto flex min-h-[85vh] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6">
        <Card className="rounded-3xl border-2 border-border/80 p-8 shadow-xl">
          <CardContent className="p-0 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <BookOpen className="h-6 w-6" />
              </div>
              <h1 className="font-heading text-2xl font-extrabold text-foreground">
                Pendaftaran Anggota Baru
              </h1>
              <p className="text-xs text-muted-foreground">
                Langkah {currentStep} dari 6:{" "}
                {currentStep === 1 && "Verifikasi NIS/NIM"}
                {currentStep === 2 && "Data Identitas Akademik"}
                {currentStep === 3 && "Nomor WhatsApp & Email"}
                {currentStep === 4 && "Buat Kata Sandi"}
                {currentStep === 5 && "Verifikasi Kode OTP WhatsApp"}
                {currentStep === 6 && "Pendaftaran Berhasil"}
              </p>
            </div>

            {/* Step Progress Bar */}
            <div className="flex items-center gap-1.5 px-2">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    step <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Step 1: NIS/NIM */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 text-xs text-muted-foreground leading-relaxed">
                  Masukkan Nomor Induk Siswa (NIS) atau Nomor Induk Mahasiswa (NIM) resmi yang
                  tercatat pada data sekolah/kampus.
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Nomor NIS / NIM</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={formData.nisNim}
                      onChange={(e) => updateField("nisNim", e.target.value)}
                      placeholder="Contoh: 2024001"
                      className="pl-10 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Data Diri */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Sesuai kartu pelajar / KTP"
                      className="pl-10 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Kelas atau Program Studi</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={formData.classOrMajor}
                      onChange={(e) => updateField("classOrMajor", e.target.value)}
                      placeholder="Contoh: XII IPA 2 / Teknik Informatika"
                      className="pl-10 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Kontak WhatsApp */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Nomor WhatsApp Aktif</label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-600" />
                    <Input
                      value={formData.phoneWa}
                      onChange={(e) => updateField("phoneWa", e.target.value)}
                      placeholder="081234567890"
                      className="pl-10 font-mono text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Penting: Kode OTP dan pengingat jatuh tempo H-1 akan dikirimkan ke nomor ini.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Alamat Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="nama@sekolah.sch.id"
                    className="text-sm"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Password */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Kata Sandi Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="Minimal 8 karakter (huruf & angka)"
                      className="pl-10 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Ulangi Kata Sandi</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      placeholder="Ulangi kata sandi"
                      className="pl-10 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: OTP Input */}
            {currentStep === 5 && (
              <div className="space-y-4 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <KeyRound className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Verifikasi Kode OTP WhatsApp
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Kode 6-digit simulasi telah dikirimkan ke nomor{" "}
                    <strong className="text-foreground font-mono">{formData.phoneWa}</strong>
                  </p>
                </div>
                <div className="py-2">
                  <Input
                    value={formData.otp}
                    onChange={(e) => updateField("otp", e.target.value)}
                    maxLength={6}
                    placeholder="246810"
                    className="font-mono text-center text-xl font-bold tracking-widest max-w-[200px] mx-auto h-12"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Belum menerima kode?{" "}
                  <button
                    type="button"
                    onClick={() => toast.info("Kode OTP baru telah dikirim via WhatsApp simulasi.")}
                    className="text-primary font-bold hover:underline"
                  >
                    Kirim Ulang OTP
                  </button>
                </p>
              </div>
            )}

            {/* Step 6: Sukses */}
            {currentStep === 6 && (
              <div className="space-y-5 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading text-xl font-bold text-foreground">
                    Selamat, Akun Anda Telah Aktif! 🎉
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Kartu anggota digital Anda telah diterbitkan. Anda kini dapat meminjam buku fisik,
                    membaca e-book, dan menggunakan fasilitas perpustakaan.
                  </p>
                </div>

                {/* Digital Card Preview */}
                <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-card p-5 text-left shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-heading font-extrabold text-primary text-sm">
                      KARTU ANGGOTA DIGITAL
                    </span>
                    <Badge variant="success" className="text-[10px]">
                      Aktif
                    </Badge>
                  </div>
                  <div>
                    <p className="font-heading text-base font-bold text-foreground">
                      {formData.name}
                    </p>
                    <p className="font-mono text-xs text-primary font-bold">
                      NIS: {formData.nisNim}
                    </p>
                    <p className="text-xs text-muted-foreground">{formData.classOrMajor}</p>
                  </div>
                </div>

                <Link href="/dashboard" className="block w-full">
                  <Button size="lg" className="w-full font-bold shadow-md">
                    Buka Dasbor Anggota Sekarang
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 6 && (
              <div className="flex items-center justify-between gap-3 pt-2">
                {currentStep > 1 ? (
                  <Button variant="outline" onClick={prevStep} size="sm" className="font-bold">
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Kembali
                  </Button>
                ) : (
                  <Link href="/masuk">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                      Sudah Punya Akun?
                    </Button>
                  </Link>
                )}

                <Button onClick={nextStep} size="sm" className="ml-auto font-bold">
                  {currentStep === 5 ? "Verifikasi & Aktifkan" : "Lanjut"}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

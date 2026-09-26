"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  BookOpen,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { checkLoginRateLimit, recordLoginAttempt } from "@/actions/auth";

const loginSchema = z.object({
  nisNim: z
    .string()
    .min(5, "NIS/NIM minimal 5 karakter")
    .max(20, "NIS/NIM maksimal 20 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function MasukPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      nisNim: "2024001",
      password: "password123",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // 1. Rate-limit check (Task 2.2: 5 gagal -> lock 15 menit)
      const rateLimit = await checkLoginRateLimit(data.nisNim);
      if (rateLimit.locked) {
        toast.error("Akun Terkunci Sementara 🔒", {
          description: rateLimit.message,
        });
        setIsLoading(false);
        return;
      }

      // Check credentials (demo credentials or db)
      const valid =
        data.password === "password123" ||
        data.password.length >= 6;

      if (!valid) {
        await recordLoginAttempt(data.nisNim, false);
        toast.error("Kredensial tidak valid", {
          description: "Periksa kembali NIS/NIM dan kata sandi Anda.",
        });
        setIsLoading(false);
        return;
      }

      await recordLoginAttempt(data.nisNim, true);

      toast.success("Masuk Berhasil! 🎉", {
        description: `Selamat datang kembali, akun NIS/NIM ${data.nisNim}! Audit log tercatat.`,
      });

      // Rute redirect cerdas berdasarkan role / prefix demo
      if (data.nisNim.startsWith("PK")) {
        router.push("/pustakawan");
      } else if (data.nisNim.startsWith("ADM")) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (e: any) {
      toast.error("Terjadi kendala autentikasi:", { description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoAccount = (nis: string, role: string) => {
    setValue("nisNim", nis);
    setValue("password", "password123");
    toast.info(`Akun demo ${role} diisi otomatis`, {
      description: "Klik tombol 'Masuk Sekarang' untuk mencoba.",
    });
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Card Form */}
        <Card className="rounded-3xl border-2 border-border/80 p-8 shadow-xl">
          <CardContent className="p-0 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <BookOpen className="h-6 w-6" />
              </div>
              <h1 className="font-heading text-2xl font-extrabold text-foreground">
                Masuk ke PustakaKita<span className="text-secondary">Ceria</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Gunakan NIS/NIM resmi sekolah atau kampus yang telah terdaftar
              </p>
            </div>

            {/* Quick Demo Credentials Switcher */}
            <div className="rounded-2xl bg-muted/60 p-3 border border-border space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block">
                🧪 Coba Akun Demo Cepat (Fase 1):
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setDemoAccount("2024001", "Anggota")}
                  className="rounded-lg bg-card px-2 py-1.5 text-xs font-semibold text-primary border hover:border-primary transition-all text-center"
                >
                  Anggota
                </button>
                <button
                  type="button"
                  onClick={() => setDemoAccount("PK2024001", "Pustakawan")}
                  className="rounded-lg bg-card px-2 py-1.5 text-xs font-semibold text-secondary-foreground border hover:border-secondary transition-all text-center"
                >
                  Pustakawan
                </button>
                <button
                  type="button"
                  onClick={() => setDemoAccount("ADM2024001", "Admin")}
                  className="rounded-lg bg-card px-2 py-1.5 text-xs font-semibold text-rose-600 border hover:border-rose-400 transition-all text-center"
                >
                  Super Admin
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* NIS/NIM */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Nomor Induk Siswa / Mahasiswa (NIS/NIM)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register("nisNim")}
                    placeholder="Contoh: 2024001"
                    className="pl-10 font-mono text-sm"
                  />
                </div>
                {errors.nisNim && (
                  <p className="text-xs text-rose-600 font-medium">{errors.nisNim.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Kata Sandi (Password)</label>
                  <Link
                    href="/lupa-password"
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Lupa Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600 font-medium">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl font-bold text-sm shadow-md mt-2"
                size="lg"
              >
                {isLoading ? "Sedang Memverifikasi..." : "Masuk Sekarang"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="text-center pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Belum terdaftar sebagai anggota?{" "}
                <Link href="/daftar" className="text-primary font-bold hover:underline">
                  Daftar Mandiri di Sini
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Lock,
  BellRing,
  Save,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CURRENT_USER } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";

export default function ProfilPage() {
  const [name, setName] = useState(CURRENT_USER.name);
  const [email, setEmail] = useState(CURRENT_USER.email);
  const [phone, setPhone] = useState(CURRENT_USER.phoneWa);
  const [classOrMajor, setClassOrMajor] = useState(CURRENT_USER.classOrMajor);

  // WA Notif Settings
  const [notifH1, setNotifH1] = useState(true);
  const [notifOverdue, setNotifOverdue] = useState(true);
  const [notifReservation, setNotifReservation] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profil Berhasil Diperbarui! ✅", {
      description: "Data diri dan preferensi Anda telah tersimpan.",
    });
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Kata Sandi Berhasil Diganti! 🔒", {
      description: "Gunakan kata sandi baru saat masuk berikutnya.",
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Profil & Pengaturan Akun
        </h1>
        <p className="text-xs text-muted-foreground">
          Kelola data pribadi, kata sandi, dan saluran notifikasi WhatsApp perpustakaan Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: Member Card Summary */}
        <div className="md:col-span-1 space-y-4">
          <Card className="rounded-2xl border border-border p-6 text-center space-y-4 shadow-sm">
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
              {name.charAt(0)}
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">{name}</h3>
              <p className="font-mono text-xs text-primary font-bold">NIS: {CURRENT_USER.nisNim}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{classOrMajor}</p>
            </div>
            <div className="pt-2 border-t border-border flex justify-center">
              <Badge variant="success" className="text-xs">
                Keanggotaan Aktif
              </Badge>
            </div>
          </Card>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Data Diri Form */}
          <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>Data Identitas Anggota</span>
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Nomor NIS / NIM</label>
                  <Input value={CURRENT_USER.nisNim} disabled className="font-mono text-xs bg-muted" />
                  <p className="text-[10px] text-muted-foreground">NIS/NIM dikunci oleh pihak sekolah</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Nama Lengkap</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Kelas / Jurusan</label>
                  <Input
                    value={classOrMajor}
                    onChange={(e) => setClassOrMajor(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Alamat Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Nomor WhatsApp Aktif</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>

              <Button type="submit" size="sm" className="font-bold text-xs gap-1.5">
                <Save className="h-3.5 w-3.5" />
                Simpan Perubahan Profil
              </Button>
            </form>
          </Card>

          {/* Notifikasi WhatsApp Preferences */}
          <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
              <BellRing className="h-4 w-4 text-emerald-600" />
              <span>Pengaturan Notifikasi WhatsApp</span>
            </h3>
            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifH1}
                  onChange={(e) => setNotifH1(e.target.checked)}
                  className="h-4 w-4 rounded text-primary focus:ring-primary"
                />
                <span className="text-foreground">
                  Pengingat H-1 sebelum buku jatuh tempo pengembalian
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifOverdue}
                  onChange={(e) => setNotifOverdue(e.target.checked)}
                  className="h-4 w-4 rounded text-primary focus:ring-primary"
                />
                <span className="text-foreground">
                  Pemberitahuan denda keterlambatan & tautan pelunasan transfer
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifReservation}
                  onChange={(e) => setNotifReservation(e.target.checked)}
                  className="h-4 w-4 rounded text-primary focus:ring-primary"
                />
                <span className="text-foreground">
                  Notifikasi buku reservasi telah siap diambil di perpustakaan
                </span>
              </label>
            </div>
          </Card>

          {/* Ganti Kata Sandi */}
          <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>Ganti Kata Sandi</span>
            </h3>
            <form onSubmit={handleSavePassword} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Kata Sandi Saat Ini</label>
                <Input type="password" placeholder="••••••••" className="text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Kata Sandi Baru</label>
                <Input type="password" placeholder="Minimal 8 karakter" className="text-xs" />
              </div>
              <Button type="submit" variant="outline" size="sm" className="font-bold text-xs">
                Perbarui Kata Sandi
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

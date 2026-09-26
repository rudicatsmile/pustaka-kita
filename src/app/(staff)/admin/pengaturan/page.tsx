"use client";

import { useState } from "react";
import {
  Settings,
  CreditCard,
  Clock,
  Shield,
  Save,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SYSTEM_CONFIG } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";

export default function PengaturanSistemPage() {
  const [loanDays, setLoanDays] = useState(SYSTEM_CONFIG.loanDurationDays.toString());
  const [finePerDay, setFinePerDay] = useState(SYSTEM_CONFIG.finePerDay.toString());
  const [maxBooks, setMaxBooks] = useState(SYSTEM_CONFIG.maxBooksPerMember.toString());
  const [maxRenewals, setMaxRenewals] = useState(SYSTEM_CONFIG.maxRenewals.toString());
  const [fineThreshold, setFineThreshold] = useState(SYSTEM_CONFIG.fineBlockThreshold.toString());

  // Rekening Bank
  const [bankName, setBankName] = useState(SYSTEM_CONFIG.bankName);
  const [bankAccount, setBankAccount] = useState(SYSTEM_CONFIG.bankAccountNumber);
  const [bankHolder, setBankHolder] = useState(SYSTEM_CONFIG.bankAccountName);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Pengaturan Sistem Berhasil Diperbarui! ⚙️", {
        description: "Tarif denda, durasi peminjaman, dan info rekening baru tersimpan dan tercatat di Audit Log.",
      });
    }, 600);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Pengaturan Aturan Perpustakaan & Tarif
        </h1>
        <p className="text-xs text-muted-foreground">
          Konfigurasi aturan peminjaman, tarif denda keterlambatan, batas blokir, dan rekening tujuan transfer.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Aturan Peminjaman */}
        <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>Aturan Durasi & Kuota Peminjaman</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Durasi Pinjam Default (Hari)</label>
              <Input
                type="number"
                value={loanDays}
                onChange={(e) => setLoanDays(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Maksimal Buku per Anggota</label>
              <Input
                type="number"
                value={maxBooks}
                onChange={(e) => setMaxBooks(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Batas Maks Perpanjangan (Kali)</label>
              <Input
                type="number"
                value={maxRenewals}
                onChange={(e) => setMaxRenewals(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Aturan Denda */}
        <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-rose-600" />
            <span>Tarif Denda & Batas Toleransi</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Tarif Denda Harian per Buku (Rupiah)</label>
              <Input
                type="number"
                value={finePerDay}
                onChange={(e) => setFinePerDay(e.target.value)}
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">Default: Rp 1.000 / hari / eksemplar</p>
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Ambang Batas Blokir Pinjam (Rupiah)</label>
              <Input
                type="number"
                value={fineThreshold}
                onChange={(e) => setFineThreshold(e.target.value)}
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">Jika denda mencapai batas ini, hak pinjam dinonaktifkan otomatis</p>
            </div>
          </div>
        </Card>

        {/* Rekening Transfer Manual */}
        <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-secondary" />
            <span>Rekening Resmi Pelunasan Denda (Transfer Manual)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Nama Bank</label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} className="text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Nomor Rekening</label>
              <Input
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Atas Nama Pemilik Rekening</label>
              <Input
                value={bankHolder}
                onChange={(e) => setBankHolder(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} size="lg" className="font-bold text-xs gap-2 shadow-md">
            <Save className="h-4 w-4" />
            {isSaving ? "Menyimpan Perubahan..." : "Simpan Seluruh Pengaturan"}
          </Button>
        </div>
      </form>
    </div>
  );
}

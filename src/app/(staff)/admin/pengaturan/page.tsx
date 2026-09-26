"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Clock,
  Shield,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { getSettingsAction, updateSettingsAction } from "@/actions/settings";

export default function PengaturanSistemPage() {
  const [loanDays, setLoanDays] = useState("7");
  const [finePerDay, setFinePerDay] = useState("1000");
  const [maxBooks, setMaxBooks] = useState("3");
  const [maxRenewals, setMaxRenewals] = useState("1");
  const [fineThreshold, setFineThreshold] = useState("10000");

  // Rekening Bank
  const [bankName, setBankName] = useState("Bank Mandiri");
  const [bankAccount, setBankAccount] = useState("1370012345678");
  const [bankHolder, setBankHolder] = useState("SMK Nusantara - Perpustakaan PustakaKitaCeria");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const s = await getSettingsAction();
        if (s) {
          setBankName(s.bankName || "Bank Mandiri");
          setBankAccount(s.bankAccountNumber || "1370012345678");
          setBankHolder(s.bankAccountName || "SMK Nusantara - Perpustakaan PustakaKitaCeria");
        }
      } catch (e: any) {
        console.warn("Could not load settings:", e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateSettingsAction(
        {
          loanDurationDays: Number(loanDays),
          finePerDay: Number(finePerDay),
          maxBooksPerMember: Number(maxBooks),
          maxRenewals: Number(maxRenewals),
          fineBlockThreshold: Number(fineThreshold),
          bankName,
          bankAccountNumber: bankAccount,
          bankAccountName: bankHolder,
        },
        "usr-admin-1",
        "Administrator Perpustakaan"
      );

      if (res.success) {
        toast.success("Pengaturan Sistem Berhasil Diperbarui! ⚙️", {
          description: "Tarif denda, durasi peminjaman, dan info rekening baru tersimpan dan tercatat di Audit Log.",
        });
      } else {
        toast.error("Gagal menyimpan pengaturan.");
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Memuat konfigurasi sistem...</span>
      </div>
    );
  }

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
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Menyimpan Perubahan..." : "Simpan Seluruh Pengaturan"}
          </Button>
        </div>
      </form>
    </div>
  );
}

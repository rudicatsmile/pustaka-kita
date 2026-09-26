"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Barcode,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BookDown,
  Camera,
  CameraOff,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DUMMY_MEMBERS, DUMMY_COPIES } from "@/data/dummy";
import { BarcodeScanner } from "@/components/scanner/barcode-scanner";
import { borrowBookAction } from "@/actions/circulation";
import { toast } from "@/components/ui/sonner";

export default function PeminjamanStaffPage() {
  const router = useRouter();
  const [nisNim, setNisNim] = useState("2024001");
  const [copyCode, setCopyCode] = useState("PKC-2024-001-003");
  const [selectedMember, setSelectedMember] = useState<typeof DUMMY_MEMBERS[0] | null>(
    DUMMY_MEMBERS[0]
  );
  const [selectedCopy, setSelectedCopy] = useState<typeof DUMMY_COPIES[0] | null>(
    DUMMY_COPIES[2]
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleCheckMember = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const found = DUMMY_MEMBERS.find((m) => m.nisNim === nisNim.trim());
    if (found) {
      setSelectedMember(found);
      toast.success(`Anggota Ditemukan: ${found.name}`);
    } else {
      toast.error("Anggota dengan NIS/NIM tersebut tidak ditemukan!");
    }
  };

  const checkCopyByCode = (code: string) => {
    const found = DUMMY_COPIES.find((c) => c.copyCode.toLowerCase() === code.trim().toLowerCase());
    if (found) {
      setSelectedCopy(found);
      setCopyCode(found.copyCode);
      toast.success(`Eksemplar Ditemukan: ${found.bookTitle}`);
    } else {
      toast.error(`Kode eksemplar "${code}" tidak ditemukan!`);
    }
  };

  const handleCheckCopy = (e: React.FormEvent) => {
    e.preventDefault();
    checkCopyByCode(copyCode);
  };

  const handleBarcodeScanned = (scannedText: string) => {
    setShowCamera(false);
    checkCopyByCode(scannedText);
  };

  const handleConfirmLoan = async () => {
    if (!selectedMember || !selectedCopy) {
      toast.error("Harap pilih anggota dan eksemplar buku terlebih dahulu!");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await borrowBookAction({
        memberNisNim: selectedMember.nisNim,
        copyCode: selectedCopy.copyCode,
        isSelfCheckout: false,
      });

      if (!res.success) {
        toast.error("Transaksi Ditolak Sistem", {
          description: res.error,
        });
        setIsProcessing(false);
        return;
      }

      toast.success("Transaksi Peminjaman Berhasil Disimpan! 🎉", {
        description: `Buku "${selectedCopy.bookTitle}" (${selectedCopy.copyCode}) dipinjamkan ke ${selectedMember.name}. Tercatat di Audit Log.`,
      });
      router.push("/pustakawan/sirkulasi");
    } catch (e: any) {
      toast.error("Terjadi kesalahan sistem:", { description: e.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="mb-2">
        <Link
          href="/pustakawan/sirkulasi"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Pusat Sirkulasi</span>
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Form Peminjaman Buku (Petugas Sirkulasi)
        </h1>
        <p className="text-xs text-muted-foreground">
          Validasi data anggota dan barcode buku fisik sebelum mengonfirmasi transaksi peminjaman.
        </p>
      </div>

      {/* Bagian 1: Cari Anggota */}
      <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <span>1. Identifikasi Anggota (Scan / Input NIS/NIM)</span>
        </h3>
        <form onSubmit={handleCheckMember} className="flex gap-2">
          <Input
            value={nisNim}
            onChange={(e) => setNisNim(e.target.value)}
            placeholder="Masukkan NIS/NIM..."
            className="font-mono text-xs"
          />
          <Button type="submit" variant="outline" size="sm" className="font-bold text-xs shrink-0">
            Periksa Anggota
          </Button>
        </form>

        {selectedMember && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <strong className="text-foreground text-sm font-heading">{selectedMember.name}</strong>
              <Badge variant="success" className="text-[10px]">
                Anggota Aktif
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <p>NIS: <strong className="font-mono text-foreground">{selectedMember.nisNim}</strong></p>
              <p>Kelas: <strong className="text-foreground">{selectedMember.classOrMajor}</strong></p>
              <p>Pinjaman Aktif: <strong className="text-primary">{selectedMember.activeLoansCount} / 3 buku</strong></p>
              <p>WhatsApp: <strong className="font-mono text-foreground">{selectedMember.phoneWa}</strong></p>
            </div>
          </div>
        )}
      </Card>

      {/* Bagian 2: Scan Eksemplar */}
      <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
            <Barcode className="h-4 w-4 text-primary" />
            <span>2. Scan / Input Barcode Eksemplar Buku</span>
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCamera(!showCamera)}
            className="text-xs font-semibold gap-1.5"
          >
            {showCamera ? (
              <>
                <CameraOff className="h-3.5 w-3.5 text-rose-500" />
                Tutup Kamera
              </>
            ) : (
              <>
                <Camera className="h-3.5 w-3.5 text-primary" />
                Buka Kamera Scanner
              </>
            )}
          </Button>
        </div>

        {/* Real-time HTML5 Camera Scanner */}
        {showCamera && (
          <div className="space-y-2 pt-2">
            <BarcodeScanner
              scannerId="reader-sirkulasi-pinjam"
              onScan={handleBarcodeScanned}
            />
            <p className="text-[11px] text-center text-muted-foreground">
              Dekatkan barcode buku ke kotak pemindaian. Kamera akan membaca kode secara otomatis.
            </p>
          </div>
        )}

        <form onSubmit={handleCheckCopy} className="flex gap-2">
          <Input
            value={copyCode}
            onChange={(e) => setCopyCode(e.target.value)}
            placeholder="Contoh: PKC-2024-001-003"
            className="font-mono text-xs uppercase"
          />
          <Button type="submit" variant="outline" size="sm" className="font-bold text-xs shrink-0">
            Periksa Buku
          </Button>
        </form>

        {selectedCopy && (
          <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <strong className="text-foreground text-sm font-heading">{selectedCopy.bookTitle}</strong>
              <Badge variant="success" className="text-[10px]">
                🟢 Siap Dipinjam
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <p>Kode Eksemplar: <strong className="font-mono text-primary">{selectedCopy.copyCode}</strong></p>
              <p>Lokasi Rak: <strong className="font-mono text-foreground">{selectedCopy.shelfLocation}</strong></p>
            </div>
          </div>
        )}
      </Card>

      {/* Ringkasan Konfirmasi */}
      {selectedMember && selectedCopy && (
        <Card className="rounded-2xl border-2 border-primary bg-primary/5 p-6 shadow-md space-y-4">
          <h3 className="font-heading text-base font-bold text-foreground">
            Ringkasan Transaksi Peminjaman
          </h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Durasi Pinjam:</span>
              <strong className="text-foreground font-semibold">7 Hari Kalender</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal Peminjaman:</span>
              <strong className="font-mono text-foreground">Hari Ini</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Batas Pengembalian (Jatuh Tempo):</span>
              <strong className="font-mono text-primary text-sm font-bold">7 Hari ke Depan</strong>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleConfirmLoan}
              disabled={isProcessing}
              size="lg"
              className="w-full font-bold text-xs shadow-md gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isProcessing ? "Menyimpan Transaksi..." : "Konfirmasi & Simpan Peminjaman"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

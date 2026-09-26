"use client";

import { useState, useEffect } from "react";
import {
  QrCode,
  Barcode,
  Keyboard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BarcodeScanner } from "@/components/scanner/barcode-scanner";
import { borrowBookAction, returnBookAction, lookupBookCopyAction } from "@/actions/circulation";
import { getActiveMemberUser } from "@/actions/member";
import { toast } from "@/components/ui/sonner";

export default function ScanMandiriPage() {
  const [scanMode, setScanMode] = useState<"pinjam" | "kembali">("pinjam");
  const [inputCode, setInputCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scannedResult, setScannedResult] = useState<{
    code: string;
    title: string;
    author: string;
    shelf: string;
  } | null>(null);

  useEffect(() => {
    getActiveMemberUser().then((u) => setUser(u));
  }, []);

  const handleScan = async (code: string) => {
    try {
      const res = await lookupBookCopyAction(code);
      if (res.success && res.copy) {
        setScannedResult({
          code: res.copy.copyCode,
          title: res.copy.title,
          author: res.copy.author,
          shelf: res.copy.shelf,
        });
        toast.success("Barcode Terdeteksi! 🎯", {
          description: `Kode: ${res.copy.copyCode} — "${res.copy.title}" (${res.copy.status})`,
        });
      } else {
        toast.error("Barcode Tidak Ditemukan", {
          description: res.error || "Pastikan barcode eksemplar terdaftar di sistem.",
        });
      }
    } catch (e: any) {
      toast.error("Gagal memeriksa barcode:", { description: e.message });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      toast.error("Harap masukkan kode barcode eksemplar!");
      return;
    }
    handleScan(inputCode.trim());
  };

  const handleConfirmTransaction = async () => {
    if (!scannedResult) return;
    setIsProcessing(true);

    try {
      if (scanMode === "pinjam") {
        const res = await borrowBookAction({
          memberNisNim: user?.nisNim || "2024001",
          copyCode: scannedResult.code,
          isSelfCheckout: true,
        });

        if (res.success) {
          toast.success("Peminjaman Mandiri Berhasil! 📚", {
            description: `Buku "${scannedResult.title}" berhasil dipinjam. Batas kembali: 7 hari. Transaksi tercatat di database.`,
          });
          setScannedResult(null);
          setInputCode("");
        } else {
          toast.error(res.error || "Gagal memproses peminjaman.");
        }
      } else {
        const res = await returnBookAction({
          copyCode: scannedResult.code,
        });

        if (res.success) {
          toast.success("Pengembalian Mandiri Berhasil! ✨", {
            description: `Buku "${scannedResult.title}" berhasil dikembalikan ke perpustakaan.`,
          });
          setScannedResult(null);
          setInputCode("");
        } else {
          toast.error(res.error || "Gagal memproses pengembalian.");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan pada server");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="default" className="font-bold">
          Self-Service Kiosk
        </Badge>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Scan Barcode Mandiri
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Gunakan kamera gawai untuk meminjam atau mengembalikan buku secara langsung ke database.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1.5 max-w-md mx-auto">
        <button
          onClick={() => {
            setScanMode("pinjam");
            setScannedResult(null);
          }}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
            scanMode === "pinjam"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Pinjam Mandiri (Checkout)</span>
        </button>
        <button
          onClick={() => {
            setScanMode("kembali");
            setScannedResult(null);
          }}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
            scanMode === "kembali"
              ? "bg-secondary text-secondary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Pengembalian Mandiri</span>
        </button>
      </div>

      {/* Real html5-qrcode Camera Viewfinder */}
      <BarcodeScanner onScan={handleScan} scannerId="member-scan-reader" />

      {/* Quick Test Barcode Chips */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide block">
          ⚡ Kode Barcode Eksemplar Terdaftar di Database (Klik untuk Uji Cepat):
        </span>
        <div className="flex flex-wrap gap-2">
          {["PKC-2024-001-001", "PKC-2024-001-002", "PKC-2024-002-001", "PKC-2024-003-001"].map((code) => (
            <button
              key={code}
              onClick={() => handleScan(code)}
              className="rounded-xl border border-border bg-muted/60 px-3 py-1.5 text-xs font-mono font-bold text-foreground hover:border-primary hover:bg-primary/10 transition-all flex items-center gap-1.5"
            >
              <Barcode className="h-3.5 w-3.5 text-primary" />
              <span>{code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fallback Input Manual */}
      <Card className="rounded-2xl border border-border p-5">
        <CardContent className="p-0 space-y-3">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-heading text-xs font-bold text-foreground">
              Kamera Tidak Berfungsi? Input Kode Barcode Manual
            </h3>
          </div>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Contoh: PKC-2024-001-001"
              className="font-mono text-xs uppercase"
            />
            <Button type="submit" variant="outline" className="font-bold text-xs shrink-0">
              Cek Kode
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Transaction Result Modal / Card */}
      {scannedResult && (
        <Card className="rounded-3xl border-2 border-primary bg-primary/5 p-6 shadow-xl space-y-4 animate-in fade-in-50 zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <Badge variant="default" className="text-xs font-bold">
              Hasil Scan Terverifikasi ✅
            </Badge>
            <span className="font-mono text-xs font-bold text-primary">
              {scannedResult.code}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-heading text-xl font-bold text-foreground">
              {scannedResult.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              Penulis: {scannedResult.author} • Lokasi: {scannedResult.shelf}
            </p>
          </div>

          <div className="rounded-2xl bg-card border border-border p-4 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipe Transaksi:</span>
              <strong className="text-foreground font-bold uppercase">
                {scanMode === "pinjam" ? "Peminjaman Mandiri" : "Pengembalian Mandiri"}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Peminjam:</span>
              <strong className="text-foreground font-mono">
                {user?.name || "Anggota"} ({user?.nisNim || "NIS"})
              </strong>
            </div>
            {scanMode === "pinjam" && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tenggat Waktu Jatuh Tempo:</span>
                <strong className="text-primary font-bold">7 Hari dari Sekarang</strong>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setScannedResult(null)}
              className="font-bold text-xs"
            >
              Scan Ulang
            </Button>
            <Button
              disabled={isProcessing}
              onClick={handleConfirmTransaction}
              className="font-bold text-xs shadow-md"
            >
              {isProcessing ? "Memproses..." : `Konfirmasi ${scanMode === "pinjam" ? "Pinjam" : "Kembalikan"}`}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

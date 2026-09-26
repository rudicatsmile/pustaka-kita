"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Barcode,
  BookUp,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  RotateCcw,
  Camera,
  CameraOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DUMMY_LOANS } from "@/data/dummy";
import { BarcodeScanner } from "@/components/scanner/barcode-scanner";
import { returnBookAction } from "@/actions/circulation";
import { toast } from "@/components/ui/sonner";

export default function PengembalianStaffPage() {
  const router = useRouter();
  const [copyCode, setCopyCode] = useState("PKC-2024-001-002");
  const [activeLoan, setActiveLoan] = useState<typeof DUMMY_LOANS[0] | null>(DUMMY_LOANS[0]);
  const [waiveReason, setWaiveReason] = useState("");
  const [isWaiveMode, setIsWaiveMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const checkLoanByCode = (code: string) => {
    const found = DUMMY_LOANS.find(
      (l) => l.copyCode.toLowerCase() === code.trim().toLowerCase() && l.status !== "dikembalikan"
    );
    if (found) {
      setActiveLoan(found);
      setCopyCode(found.copyCode);
      toast.success(`Transaksi Ditemukan: ${found.bookTitle}`);
    } else {
      toast.error(`Tidak ada transaksi peminjaman aktif untuk kode eksemplar "${code}"!`);
    }
  };

  const handleSearchCopy = (e: React.FormEvent) => {
    e.preventDefault();
    checkLoanByCode(copyCode);
  };

  const handleBarcodeScanned = (scannedText: string) => {
    setShowCamera(false);
    checkLoanByCode(scannedText);
  };

  const handleConfirmReturn = async (waive: boolean) => {
    if (!activeLoan) return;

    if (waive && !waiveReason.trim()) {
      toast.error("Alasan pembebasan denda wajib diisi untuk rekam jejak Audit Log!");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await returnBookAction({
        copyCode: activeLoan.copyCode,
        waive,
        waiveReason: waive ? waiveReason : undefined,
      });

      if (!res.success) {
        toast.error("Gagal menyelesaikan pengembalian:", { description: res.error });
        setIsProcessing(false);
        return;
      }

      if (waive) {
        toast.success("Buku Dikembalikan & Denda Dibebaskan! ✨", {
          description: `Denda Rp ${activeLoan.fineAmount.toLocaleString("id-ID")} dibebaskan dengan alasan: "${waiveReason}". Tercatat di Audit Log.`,
        });
      } else {
        toast.success("Buku Berhasil Dikembalikan! 📥", {
          description: `Eksemplar ${activeLoan.copyCode} kembali ke rak. Tagihan denda Rp ${activeLoan.fineAmount.toLocaleString("id-ID")} diproses.`,
        });
      }
      router.push("/pustakawan/sirkulasi");
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
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
          Form Pengembalian Buku & Perhitungan Denda
        </h1>
        <p className="text-xs text-muted-foreground">
          Scan eksemplar buku untuk memeriksa keterlambatan dan menyelesaikan transaksi sirkulasi.
        </p>
      </div>

      {/* Input / Scan Barcode */}
      <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
            <Barcode className="h-4 w-4 text-primary" />
            <span>Scan / Masukkan Barcode Buku yang Dikembalikan</span>
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
              scannerId="reader-sirkulasi-kembali"
              onScan={handleBarcodeScanned}
            />
            <p className="text-[11px] text-center text-muted-foreground">
              Dekatkan barcode buku ke kotak pemindaian. Kamera akan membaca kode secara otomatis.
            </p>
          </div>
        )}

        <form onSubmit={handleSearchCopy} className="flex gap-2">
          <Input
            value={copyCode}
            onChange={(e) => setCopyCode(e.target.value)}
            placeholder="Contoh: PKC-2024-001-002"
            className="font-mono text-xs uppercase"
          />
          <Button type="submit" variant="outline" size="sm" className="font-bold text-xs shrink-0">
            Periksa Pinjaman
          </Button>
        </form>
      </Card>

      {/* Detail Pinjaman & Status Denda */}
      {activeLoan && (
        <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-muted-foreground">ID Pinjaman: {activeLoan.id}</span>
              <h2 className="font-heading text-base font-bold text-foreground">
                {activeLoan.bookTitle}
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Barcode Eksemplar: <strong className="text-primary">{activeLoan.copyCode}</strong>
              </p>
            </div>
            {activeLoan.daysLate > 0 ? (
              <Badge variant="destructive" className="font-mono text-xs">
                ⚠️ Terlambat {activeLoan.daysLate} Hari
              </Badge>
            ) : (
              <Badge variant="success" className="text-xs">
                🟢 Tepat Waktu
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs rounded-xl bg-muted/40 p-4 border border-border">
            <div>
              <span className="text-muted-foreground block text-[11px]">Peminjam:</span>
              <strong className="text-foreground">{activeLoan.memberName}</strong>
              <span className="block font-mono text-[10px] text-muted-foreground">{activeLoan.memberNisNim}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Tgl Pinjam:</span>
              <strong className="text-foreground">{activeLoan.borrowedAt}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Batas Waktu (Due Date):</span>
              <strong className="text-foreground">{activeLoan.dueDate}</strong>
            </div>
          </div>

          {/* Denda Keterlambatan Alert */}
          {activeLoan.daysLate > 0 ? (
            <div className="rounded-2xl border-2 border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-heading font-bold text-sm">
                <AlertTriangle className="h-5 w-5" />
                <span>Terkena Denda Keterlambatan</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  Perhitungan: {activeLoan.daysLate} hari × Rp 1.000/hari
                </span>
                <span className="font-heading text-lg font-extrabold text-rose-600 dark:text-rose-400">
                  Rp {activeLoan.fineAmount.toLocaleString("id-ID")}
                </span>
              </div>

              {/* Opsi Pembebasan Denda (Waive) dengan Audit Trail */}
              <div className="pt-2 border-t border-rose-200 dark:border-rose-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isWaiveMode}
                      onChange={(e) => setIsWaiveMode(e.target.checked)}
                      className="rounded text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Bebaskan Denda Keterlambatan (Dispensasi Khusus)</span>
                  </label>
                  {isWaiveMode && (
                    <Badge variant="warning" className="text-[10px]">
                      Memerlukan Catatan Audit Log
                    </Badge>
                  )}
                </div>

                {isWaiveMode && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      Alasan Pembebasan Denda (Wajib diisi untuk arsip pemeriksaan audit):
                    </label>
                    <Input
                      value={waiveReason}
                      onChange={(e) => setWaiveReason(e.target.value)}
                      placeholder="Contoh: Sakit dengan surat dokter / Kendala sistem perpustakaan..."
                      className="text-xs bg-card"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Buku dikembalikan sebelum atau tepat pada tanggal jatuh tempo. Tidak ada denda.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {isWaiveMode ? (
              <Button
                onClick={() => handleConfirmReturn(true)}
                disabled={isProcessing}
                variant="destructive"
                className="w-full font-bold text-xs shadow-md gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isProcessing ? "Menyimpan..." : "Konfirmasi Kembali & Bebaskan Denda (Waive)"}
              </Button>
            ) : (
              <Button
                onClick={() => handleConfirmReturn(false)}
                disabled={isProcessing}
                className="w-full font-bold text-xs shadow-md gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isProcessing ? "Menyimpan Transaksi..." : "Selesaikan Pengembalian Buku"}
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

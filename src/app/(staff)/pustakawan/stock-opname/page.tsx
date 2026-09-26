"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Boxes,
  Barcode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Printer,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  Layers,
  MapPin,
  Check,
  X,
  FileText,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BarcodeScanner } from "@/components/scanner/barcode-scanner";
import {
  getShelvesListAction,
  getShelfTargetCopiesAction,
  auditScanCopyAction,
  updateCopyShelfAction,
  finalizeStockOpnameSessionAction,
  ShelfSummary,
  ShelfCopyItem,
  BeritaAcaraReport,
} from "@/actions/stock-opname";
import { toast } from "@/components/ui/sonner";

export default function StockOpnamePage() {
  // Stage: "select_shelf" | "scanning" | "report"
  const [stage, setStage] = useState<"select_shelf" | "scanning" | "report">("select_shelf");

  // Shelves list
  const [shelves, setShelves] = useState<ShelfSummary[]>([]);
  const [loadingShelves, setLoadingShelves] = useState(true);

  // Active Shelf
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [targetCopies, setTargetCopies] = useState<ShelfCopyItem[]>([]);
  const [loadingTargetCopies, setLoadingTargetCopies] = useState(false);

  // Audit state
  const [matchedCodes, setMatchedCodes] = useState<string[]>([]);
  const [misplacedItems, setMisplacedItems] = useState<Array<ShelfCopyItem & { actualShelf: string }>>([]);
  const [manualCode, setManualCode] = useState("");
  const [showCamera, setShowCamera] = useState(true);

  // Misplaced Warning Dialog state
  const [pendingMisplaced, setPendingMisplaced] = useState<{
    copy: ShelfCopyItem;
    actualShelf: string;
  } | null>(null);

  // Report state
  const [report, setReport] = useState<BeritaAcaraReport | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Barcode Gun keydown buffer
  const barcodeBufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);

  // Load Shelves on Mount
  useEffect(() => {
    getShelvesListAction()
      .then((data) => setShelves(data))
      .catch((e) => console.error("Error loading shelves:", e))
      .finally(() => setLoadingShelves(false));
  }, []);

  // Hardware USB Barcode Gun Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stage !== "scanning") return;

      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      const now = Date.now();
      if (now - lastKeyTimeRef.current > 150) {
        barcodeBufferRef.current = "";
      }
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        const scanned = barcodeBufferRef.current.trim();
        barcodeBufferRef.current = "";
        if (scanned.length > 2) {
          handleProcessScan(scanned);
        }
      } else if (e.key.length === 1) {
        barcodeBufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stage, selectedShelf, matchedCodes, misplacedItems]);

  // Start auditing a shelf
  const handleSelectShelf = async (shelfName: string) => {
    setSelectedShelf(shelfName);
    setLoadingTargetCopies(true);
    setMatchedCodes([]);
    setMisplacedItems([]);
    setPendingMisplaced(null);

    try {
      const copies = await getShelfTargetCopiesAction(shelfName);
      setTargetCopies(copies);
      setStage("scanning");
      toast.success(`Memulai Audit ${shelfName}`, {
        description: `Terdapat ${copies.length} eksemplar buku terdaftar di rak ini.`,
      });
    } catch (e: any) {
      toast.error("Gagal memuat eksemplar rak:", { description: e.message });
    } finally {
      setLoadingTargetCopies(false);
    }
  };

  // Process a scanned barcode
  const handleProcessScan = async (code: string) => {
    if (!selectedShelf) return;
    const clean = code.trim();
    if (!clean) return;

    // Cek apakah sudah pernah discan cocok
    if (matchedCodes.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      toast.info("Sudah Terverifikasi", {
        description: `Eksemplar "${clean}" sudah terdata di rak ini.`,
      });
      return;
    }

    try {
      const res = await auditScanCopyAction(selectedShelf, clean);

      if (res.status === "MATCH" && res.copy) {
        setMatchedCodes((prev) => [...prev, res.copy!.copyCode]);
        toast.success("Buku Cocok! 🎯", {
          description: `"${res.copy.title}" (${res.copy.copyCode}) terverifikasi di ${selectedShelf}.`,
        });
      } else if (res.status === "MISPLACED" && res.copy) {
        // Trigger dialog konfirmasi salah rak
        setPendingMisplaced({
          copy: res.copy,
          actualShelf: res.actualShelf || "Rak Lain",
        });
      } else {
        toast.error("Barcode Tidak Terdaftar", {
          description: res.message,
        });
      }
    } catch (e: any) {
      toast.error("Gagal memeriksa barcode:", { description: e.message });
    } finally {
      setManualCode("");
    }
  };

  // Tindakan 1: Pindahkan Lokasi di Database ke Rak Ini
  const handleRelocateToCurrentShelf = async () => {
    if (!pendingMisplaced || !selectedShelf) return;
    const { copy } = pendingMisplaced;

    try {
      const res = await updateCopyShelfAction({
        copyId: copy.id,
        newShelfLocation: selectedShelf,
        copyCode: copy.copyCode,
      });

      if (res.success) {
        toast.success("Lokasi Rak Diperbarui! 🔄", {
          description: `Buku "${copy.title}" resmi dipindahkan ke ${selectedShelf} di database.`,
        });
        // Tambahkan ke matched codes
        setMatchedCodes((prev) => [...prev, copy.copyCode]);
        setPendingMisplaced(null);
      } else {
        toast.error("Gagal memperbarui rak:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    }
  };

  // Tindakan 2: Tandai untuk Dipindahkan Fisik ke Rak Asalnya
  const handleMarkAsMisplacedPhysical = () => {
    if (!pendingMisplaced) return;
    const { copy, actualShelf } = pendingMisplaced;

    setMisplacedItems((prev) => [
      ...prev,
      { ...copy, actualShelf },
    ]);
    toast.warning("Ditandai Salah Rak ⚠️", {
      description: `Buku "${copy.title}" dimasukkan ke daftar buku yang harus dipindah ke ${actualShelf}.`,
    });
    setPendingMisplaced(null);
  };

  // Finalize Session
  const handleFinalizeSession = async () => {
    if (!selectedShelf) return;
    setIsFinalizing(true);

    try {
      const res = await finalizeStockOpnameSessionAction({
        shelfName: selectedShelf,
        targetCopies,
        scannedMatchedCodes: matchedCodes,
        misplacedItems,
      });

      if (res.success) {
        setReport(res.report);
        setStage("report");
        toast.success("Stock Opname Selesai! 📋", {
          description: `Berita Acara ${res.report.reportNumber} berhasil diterbitkan.`,
        });
      }
    } catch (e: any) {
      toast.error("Gagal menerbitkan Berita Acara:", { description: e.message });
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Thermal / Print Layout CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #official-berita-acara, #official-berita-acara * {
            visibility: visible;
          }
          #official-berita-acara {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20mm;
          }
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
        }
      `}</style>

      {/* ========================================================= */}
      {/* TAHAP 1: PILIH RAK UNTUK DIAUDIT */}
      {/* ========================================================= */}
      {stage === "select_shelf" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/40 text-primary text-xs font-bold uppercase">
                  Inventaris Fisik
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">Mobile Scanner</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
                Stock Opname & Audit Rak Buku
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Pilih rak buku yang akan diaudit fisiknya menggunakan pemindai kamera gawai atau barcode gun.
              </p>
            </div>

            <Link href="/pustakawan/eksemplar">
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-1.5">
                <Barcode className="h-4 w-4" />
                Data Eksemplar
              </Button>
            </Link>
          </div>

          {/* Shelves Cards Grid */}
          {loadingShelves ? (
            <div className="p-16 text-center text-xs text-muted-foreground">
              Memuat data rak koleksi dari database...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shelves.map((s) => (
                <Card
                  key={s.shelfName}
                  className="rounded-3xl border border-border/80 bg-card p-5 hover:border-primary/60 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                        <Boxes className="h-6 w-6" />
                      </div>
                      <Badge variant="outline" className="text-xs font-mono font-bold">
                        {s.totalCopies} Eksemplar
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-heading font-extrabold text-base text-foreground group-hover:text-primary transition-colors">
                        {s.shelfName}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                        <span className="text-emerald-600 font-semibold">
                          🟢 {s.availableCount} di Rak
                        </span>
                        <span className="text-amber-600 font-semibold">
                          🟡 {s.borrowedCount} Dipinjam
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/60">
                    <Button
                      onClick={() => handleSelectShelf(s.shelfName)}
                      className="w-full h-10 rounded-xl text-xs font-bold gap-2 shadow-sm active:scale-95"
                    >
                      <Barcode className="h-4 w-4" />
                      Mulai Audit Rak Ini
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAHAP 2: PEMINDAIAN RAK AKTIF (SCANNING) */}
      {/* ========================================================= */}
      {stage === "scanning" && selectedShelf && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Active Shelf Top Card */}
          <div className="p-4 sm:p-6 rounded-3xl border border-primary/40 bg-gradient-to-r from-primary/15 via-card to-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStage("select_shelf")}
                  className="h-7 px-2 text-xs font-bold gap-1 -ml-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Ganti Rak
                </Button>
                <Badge variant="default" className="text-[10px] font-bold uppercase">
                  Sesi Aktif
                </Badge>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Audit: {selectedShelf}
              </h2>
              <p className="text-xs text-muted-foreground">
                Tembak barcode buku di rak secara berurutan. Sistem memeriksa kecocokan rak otomatis.
              </p>
            </div>

            {/* Live Progress Percentage */}
            <div className="flex items-center gap-4 bg-muted/60 p-3 rounded-2xl border border-border">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Progres Temuan
                </span>
                <span className="font-mono text-base font-extrabold text-primary">
                  {matchedCodes.length} / {targetCopies.length} Buku
                </span>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm shadow-sm">
                {targetCopies.length > 0
                  ? Math.round((matchedCodes.length / targetCopies.length) * 100)
                  : 0}
                %
              </div>
            </div>
          </div>

          {/* Scanner & Live Results Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Barcode Scanner */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Camera className="h-4 w-4 text-primary" />
                  Pemindai Kamera Barcode
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCamera(!showCamera)}
                  className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  {showCamera ? "Sembunyikan Kamera" : "Tampilkan Kamera"}
                </Button>
              </div>

              {showCamera ? (
                <BarcodeScanner
                  scannerId="stock-opname-scanner"
                  onScan={(code) => handleProcessScan(code)}
                />
              ) : (
                <div className="aspect-video rounded-3xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <Barcode className="h-10 w-10 text-muted-foreground/60 animate-pulse" />
                  <p className="text-xs text-muted-foreground">
                    Gunakan alat tembak barcode scanner USB/Bluetooth, atau ketik kode manual di bawah.
                  </p>
                </div>
              )}

              {/* Manual Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleProcessScan(manualCode);
                }}
                className="flex gap-2"
              >
                <Input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ketik kode barcode eksemplar..."
                  className="h-10 text-xs font-mono rounded-xl bg-background border-border"
                />
                <Button type="submit" size="sm" className="h-10 px-4 text-xs font-bold rounded-xl">
                  Periksa
                </Button>
              </form>

              {/* Quick Demo Simulator Buttons */}
              <div className="p-3 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-1.5">
                <span className="font-semibold text-foreground text-[11px] block">⚡ Uji Coba Cepat Barcode:</span>
                <div className="flex flex-wrap gap-1.5">
                  {targetCopies.slice(0, 3).map((c) => (
                    <button
                      key={c.copyCode}
                      type="button"
                      onClick={() => handleProcessScan(c.copyCode)}
                      className="px-2 py-0.5 rounded-lg bg-card border border-border hover:border-primary text-foreground font-mono text-[10px]"
                    >
                      {c.copyCode} (Cocok)
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleProcessScan("PKC-2024-002-001")}
                    className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:border-amber-500 text-amber-700 dark:text-amber-300 font-mono text-[10px]"
                  >
                    Simulasi Salah Rak
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Audit Lists */}
            <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="font-heading font-bold text-sm text-foreground">
                    Daftar Inventaris Rak ({targetCopies.length} Buku)
                  </span>
                  <Badge variant="outline" className="text-xs font-mono">
                    {matchedCodes.length} Terverifikasi
                  </Badge>
                </div>

                {/* Target copies checklist */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {targetCopies.map((item) => {
                    const isMatched = matchedCodes.some(
                      (c) => c.toLowerCase() === item.copyCode.toLowerCase()
                    );
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-2xl border text-xs transition-colors ${
                          isMatched
                            ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                            : "bg-muted/30 border-border/60 text-muted-foreground"
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                          <p className="font-heading font-bold text-foreground truncate">
                            {item.title}
                          </p>
                          <p className="font-mono text-[11px] text-primary">
                            {item.copyCode}
                          </p>
                        </div>
                        <div>
                          {isMatched ? (
                            <Badge variant="success" className="text-[10px] gap-1 py-0.5 font-bold">
                              <Check className="h-3 w-3" />
                              Cocok
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] py-0.5">
                              Belum Ter-scan
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Misplaced Books Count Warning */}
                {misplacedItems.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" />
                      {misplacedItems.length} Buku Salah Rak Tercatat
                    </span>
                    <span className="font-mono text-[11px]">Perlu Dipindahkan</span>
                  </div>
                )}
              </div>

              {/* Finalize Button */}
              <div className="pt-2 border-t border-border">
                <Button
                  onClick={handleFinalizeSession}
                  disabled={isFinalizing}
                  className="w-full h-12 rounded-2xl text-xs sm:text-sm font-bold gap-2 shadow-lg active:scale-95 bg-primary text-primary-foreground"
                >
                  <FileText className="h-4 w-4" />
                  {isFinalizing
                    ? "Menerbitkan Berita Acara..."
                    : `Selesaikan Audit Rak & Terbitkan Berita Acara`}
                </Button>
              </div>
            </div>
          </div>

          {/* MISPLACED BOOK ACTION MODAL */}
          {pendingMisplaced && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-md rounded-3xl border-2 border-amber-500 bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 text-amber-600">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 shadow-inner">
                    <AlertTriangle className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-foreground">
                      Buku Salah Rak Terdeteksi!
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Buku ini tidak terdaftar di {selectedShelf}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/50 border border-border text-xs space-y-1">
                  <p className="font-bold text-foreground text-sm leading-tight">
                    {pendingMisplaced.copy.title}
                  </p>
                  <p className="font-mono text-primary font-semibold">
                    {pendingMisplaced.copy.copyCode}
                  </p>
                  <div className="flex justify-between pt-1 border-t border-border/60 text-muted-foreground">
                    <span>Lokasi Rak Asal:</span>
                    <span className="font-bold text-amber-600 font-mono">
                      {pendingMisplaced.actualShelf}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pilih tindakan yang ingin dilakukan untuk buku ini:
                </p>

                <div className="space-y-2">
                  <Button
                    onClick={handleRelocateToCurrentShelf}
                    className="w-full h-11 rounded-xl text-xs font-bold gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Pindahkan ke {selectedShelf} di Database
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleMarkAsMisplacedPhysical}
                    className="w-full h-11 rounded-xl text-xs font-bold gap-2 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Tandai untuk Dikembalikan ke {pendingMisplaced.actualShelf}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAHAP 3: BERITA ACARA RESMI SIAP CETAK (REPORT) */}
      {/* ========================================================= */}
      {stage === "report" && report && (
        <div className="space-y-6 max-w-3xl mx-auto w-full animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between no-print">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStage("select_shelf")}
              className="rounded-xl text-xs font-bold gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Audit Rak Lain
            </Button>

            <Button
              onClick={() => window.print()}
              className="rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-sm"
            >
              <Printer className="h-4 w-4" />
              Cetak Berita Acara Resmi (A4)
            </Button>
          </div>

          {/* Official Letterhead & Report Document */}
          <div
            id="official-berita-acara"
            className="p-8 sm:p-10 rounded-3xl border border-border bg-white text-slate-900 shadow-xl space-y-6 font-sans text-xs"
          >
            {/* Header Kop Surat */}
            <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
              <h2 className="font-heading font-extrabold text-lg tracking-wider uppercase text-slate-950">
                PustakaKita Ceria — Perpustakaan Terpadu
              </h2>
              <p className="text-xs text-slate-600">
                Gedung Perpustakaan Pusat Sekolah & Kampus • Jl. Pendidikan Karakter No. 1
              </p>
              <h3 className="font-bold text-sm tracking-wide pt-2 text-primary uppercase">
                BERITA ACARA HASIL STOCK OPNAME INVENTARIS FISIK
              </h3>
              <p className="font-mono text-xs font-bold text-slate-700">
                Nomor: {report.reportNumber}
              </p>
            </div>

            {/* Narasi Pembuka */}
            <p className="text-xs leading-relaxed text-slate-800">
              Pada hari ini, <strong>{report.date}</strong>, telah dilaksanakan kegiatan inventarisasi fisik
              (Stock Opname) berkala terhadap koleksi buku pada <strong>{report.shelfName}</strong> oleh
              petugas pemeriksa <strong>{report.auditorName}</strong> dengan rincian hasil verifikasi sebagai berikut:
            </p>

            {/* Metric Summary Box */}
            <div className="grid grid-cols-4 gap-2 text-center p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Terdaftar</span>
                <span className="font-heading text-lg font-black text-slate-900">{report.totalRegistered}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 uppercase block font-semibold">Ditemukan Cocok</span>
                <span className="font-heading text-lg font-black text-emerald-700">{report.totalFound}</span>
              </div>
              <div>
                <span className="text-[10px] text-amber-700 uppercase block font-semibold">Salah Rak</span>
                <span className="font-heading text-lg font-black text-amber-700">{report.totalMisplaced}</span>
              </div>
              <div>
                <span className="text-[10px] text-rose-700 uppercase block font-semibold">Belum Ditemukan</span>
                <span className="font-heading text-lg font-black text-rose-700">{report.totalMissing}</span>
              </div>
            </div>

            {/* Daftar Buku Belum Ditemukan */}
            {report.missingItems.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-rose-800 text-xs block uppercase">
                  ⚠️ Daftar Buku Belum Ditemukan di Rak ({report.missingItems.length}):
                </span>
                <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-1.5">No</th>
                      <th className="border border-slate-300 p-1.5">Kode Barcode</th>
                      <th className="border border-slate-300 p-1.5">Judul Buku</th>
                      <th className="border border-slate-300 p-1.5">Kondisi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.missingItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="border border-slate-300 p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-slate-300 p-1.5 font-mono">{item.copyCode}</td>
                        <td className="border border-slate-300 p-1.5 font-medium">{item.title}</td>
                        <td className="border border-slate-300 p-1.5">{item.conditionNote || "Baik"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Daftar Buku Salah Rak */}
            {report.misplacedItems.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-amber-800 text-xs block uppercase">
                  🔄 Daftar Buku Salah Rak / Terselip ({report.misplacedItems.length}):
                </span>
                <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-1.5">No</th>
                      <th className="border border-slate-300 p-1.5">Kode Barcode</th>
                      <th className="border border-slate-300 p-1.5">Judul Buku</th>
                      <th className="border border-slate-300 p-1.5">Rak Seharusnya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.misplacedItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="border border-slate-300 p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-slate-300 p-1.5 font-mono">{item.copyCode}</td>
                        <td className="border border-slate-300 p-1.5 font-medium">{item.title}</td>
                        <td className="border border-slate-300 p-1.5 font-bold font-mono text-amber-800">{item.actualShelf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Signature Area */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-center text-slate-800">
              <div className="space-y-16">
                <p>Mengetahui,<br /><strong>Kepala Perpustakaan</strong></p>
                <p className="font-bold underline">Ibu Dewi Anggraini, S.IP.<br /><span className="text-[10px] font-normal text-slate-600">NIP. 19850412 201001 2 018</span></p>
              </div>

              <div className="space-y-16">
                <p>Petugas Pemeriksa,<br /><strong>Pustakawan Pelaksana</strong></p>
                <p className="font-bold underline">{report.auditorName}<br /><span className="text-[10px] font-normal text-slate-600">Divisi Sirkulasi & Aset Koleksi</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

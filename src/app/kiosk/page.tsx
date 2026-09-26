"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  QrCode,
  Barcode,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Printer,
  MessageSquare,
  Maximize2,
  Minimize2,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Camera,
  Trash2,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BarcodeScanner } from "@/components/scanner/barcode-scanner";
import {
  kioskLookupMemberAction,
  kioskBatchCheckoutAction,
  lookupActiveLoanByCopyCodeAction,
  returnBookAction,
  lookupBookCopyAction,
} from "@/actions/circulation";
import { toast } from "@/components/ui/sonner";

export default function KioskPage() {
  // Mode: "idle" | "checkout_member" | "checkout_books" | "checkout_success" | "return_scan" | "return_success"
  const [mode, setMode] = useState<
    "idle" | "checkout_member" | "checkout_books" | "checkout_success" | "return_scan" | "return_success"
  >("idle");

  // Real-time Clock
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-idle countdown (45 seconds default)
  const [idleSeconds, setIdleSeconds] = useState(45);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Member Data for checkout
  const [member, setMember] = useState<any>(null);
  const [memberInput, setMemberInput] = useState("");
  const [isVerifyingMember, setIsVerifyingMember] = useState(false);
  const [showMemberScanner, setShowMemberScanner] = useState(true);

  // Books Cart for checkout
  const [cart, setCart] = useState<any[]>([]);
  const [bookInput, setBookInput] = useState("");
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);

  // Return mode state
  const [scannedReturnLoan, setScannedReturnLoan] = useState<any>(null);
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);
  const [returnResult, setReturnResult] = useState<any>(null);

  // Barcode Gun Hardware Keydown Buffer
  const barcodeBufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  // 1. Clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }) + " WIB"
      );
      setCurrentDate(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Idle Timer Effect
  const resetIdle = () => {
    setIdleSeconds(45);
  };

  useEffect(() => {
    if (mode === "idle") {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
      return;
    }

    idleTimerRef.current = setInterval(() => {
      setIdleSeconds((prev) => {
        if (prev <= 1) {
          // Auto reset to idle
          handleCancelAndReset();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, [mode]);

  // Global user activity listener to reset idle countdown
  useEffect(() => {
    const handleActivity = () => {
      if (mode !== "idle") resetIdle();
    };
    window.addEventListener("click", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    return () => {
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
    };
  }, [mode]);

  // 3. Hardware USB Barcode Gun Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is manually typing in regular input field
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") {
        return;
      }

      const now = Date.now();
      // Barcode scanners type very fast (< 60ms between chars)
      if (now - lastKeyTimeRef.current > 150) {
        barcodeBufferRef.current = "";
      }
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        const scannedCode = barcodeBufferRef.current.trim();
        barcodeBufferRef.current = "";
        if (scannedCode.length > 2) {
          handleBarcodeGunScan(scannedCode);
        }
      } else if (e.key.length === 1) {
        barcodeBufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, cart, member]);

  const handleBarcodeGunScan = (code: string) => {
    if (mode === "checkout_member") {
      handleLookupMember(code);
    } else if (mode === "checkout_books") {
      handleAddBookToCart(code);
    } else if (mode === "return_scan") {
      handleLookupReturnBook(code);
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Reset Session
  const handleCancelAndReset = () => {
    setMode("idle");
    setMember(null);
    setMemberInput("");
    setCart([]);
    setBookInput("");
    setCheckoutResult(null);
    setScannedReturnLoan(null);
    setReturnResult(null);
    setIdleSeconds(45);
  };

  // === MEMBER LOOKUP ===
  const handleLookupMember = async (identifier: string) => {
    const clean = identifier.trim();
    if (!clean) {
      toast.error("Harap masukkan NIS/NIM atau scan kartu anggota!");
      return;
    }
    setIsVerifyingMember(true);
    resetIdle();

    try {
      const res = await kioskLookupMemberAction(clean);
      if (res.success && res.member) {
        if (res.member.isBlocked) {
          toast.error("Peminjaman Ditolak!", {
            description: res.member.blockReason || "Akumulasi denda melampaui batas.",
          });
          return;
        }
        if (res.member.remainingQuota <= 0) {
          toast.error("Kuota Penuh!", {
            description: `Anda sudah meminjam ${res.member.activeLoansCount} buku. Harap kembalikan buku terlebih dahulu.`,
          });
          return;
        }
        setMember(res.member);
        setMode("checkout_books");
        toast.success(`Selamat Datang, ${res.member.name}! 📚`, {
          description: `Sisa kuota pinjam Anda: ${res.member.remainingQuota} buku.`,
        });
      } else {
        toast.error("Anggota Tidak Ditemukan", {
          description: res.error || "Pastikan NIS/NIM atau kartu terdaftar di database.",
        });
      }
    } catch (e: any) {
      toast.error("Gagal memverifikasi:", { description: e.message });
    } finally {
      setIsVerifyingMember(false);
    }
  };

  // Numpad Touch Input for NIS/NIM
  const handleNumpadPress = (val: string) => {
    resetIdle();
    if (val === "CLEAR") {
      setMemberInput("");
    } else if (val === "BACKSPACE") {
      setMemberInput((prev) => prev.slice(0, -1));
    } else {
      if (memberInput.length < 15) {
        setMemberInput((prev) => prev + val);
      }
    }
  };

  // === BOOK SCANNING (CHECKOUT) ===
  const handleAddBookToCart = async (code: string) => {
    const clean = code.trim();
    if (!clean) return;
    resetIdle();

    // Cek apakah sudah ada di cart
    if (cart.some((item) => item.copyCode.toLowerCase() === clean.toLowerCase())) {
      toast.warning("Buku Sudah Ada di Keranjang!", {
        description: `Buku dengan kode "${clean}" sudah dimasukkan ke daftar.`,
      });
      return;
    }

    // Cek kuota
    if (cart.length >= member.remainingQuota) {
      toast.error("Batas Kuota Pinjam Tercapai!", {
        description: `Sisa kuota Anda hanya ${member.remainingQuota} buku.`,
      });
      return;
    }

    setIsAddingBook(true);
    try {
      const res = await lookupBookCopyAction(clean);
      if (res.success && res.copy) {
        if (res.copy.status !== "tersedia") {
          toast.error("Buku Tidak Tersedia!", {
            description: `Eksemplar '${res.copy.title}' sedang berstatus '${res.copy.status}'.`,
          });
          return;
        }
        setCart((prev) => [...prev, res.copy]);
        setBookInput("");
        toast.success(`Buku Ditambahkan! 🎯`, {
          description: `"${res.copy.title}" (${res.copy.copyCode}) masuk ke keranjang.`,
        });
      } else {
        toast.error("Barcode Buku Tidak Ditemukan", {
          description: res.error || "Pastikan barcode eksemplar terdaftar.",
        });
      }
    } catch (e: any) {
      toast.error("Gagal memeriksa barcode:", { description: e.message });
    } finally {
      setIsAddingBook(false);
    }
  };

  const handleRemoveFromCart = (copyCode: string) => {
    resetIdle();
    setCart((prev) => prev.filter((i) => i.copyCode !== copyCode));
  };

  // === PROCESS CHECKOUT ===
  const handleProcessCheckout = async () => {
    if (cart.length === 0 || !member) return;
    setIsCheckingOut(true);
    resetIdle();

    try {
      const res = await kioskBatchCheckoutAction({
        memberNisNim: member.nisNim,
        copyCodes: cart.map((c) => c.copyCode),
      });

      if (res.success) {
        setCheckoutResult({
          receiptNumber: res.receiptNumber,
          borrowedAt: res.borrowedAt,
          dueDate: res.dueDate,
          member: member,
          items: cart,
        });
        setMode("checkout_success");
        toast.success("Peminjaman Berhasil Diproses! 🎉", {
          description: `${cart.length} buku berhasil dipinjam. Transaksi tercatat di database.`,
        });
      } else {
        toast.error("Peminjaman Gagal Diproses", {
          description: res.error,
        });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setIsCheckingOut(false);
    }
  };

  // === RETURN SCAN & CONFIRM ===
  const handleLookupReturnBook = async (code: string) => {
    const clean = code.trim();
    if (!clean) return;
    resetIdle();

    try {
      const res = await lookupActiveLoanByCopyCodeAction(clean);
      if (res.success && res.loan) {
        setScannedReturnLoan(res.loan);
        toast.success("Buku Teridentifikasi! 📖", {
          description: `"${res.loan.bookTitle}" dipinjam oleh ${res.loan.memberName}.`,
        });
      } else {
        toast.error("Data Peminjaman Tidak Ditemukan", {
          description: res.error || "Buku ini tidak sedang dalam status pinjam aktif.",
        });
      }
    } catch (e: any) {
      toast.error("Gagal memeriksa buku:", { description: e.message });
    }
  };

  const handleConfirmReturn = async () => {
    if (!scannedReturnLoan) return;
    setIsProcessingReturn(true);
    resetIdle();

    try {
      const res = await returnBookAction({
        copyCode: scannedReturnLoan.copyCode,
      });

      if (res.success) {
        setReturnResult({
          receiptNumber: `RET-${Date.now().toString().slice(-6)}`,
          bookTitle: scannedReturnLoan.bookTitle,
          copyCode: scannedReturnLoan.copyCode,
          memberName: scannedReturnLoan.memberName,
          memberNisNim: scannedReturnLoan.memberNisNim,
          dueDate: scannedReturnLoan.dueDate,
          fineAmount: scannedReturnLoan.fineAmount || 0,
          daysLate: scannedReturnLoan.daysLate || 0,
        });
        setMode("return_success");
        toast.success("Pengembalian Buku Berhasil! ✨", {
          description: `Buku "${scannedReturnLoan.bookTitle}" telah tercatat kembali ke perpustakaan.`,
        });
      } else {
        toast.error("Gagal mengembalikan buku:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setIsProcessingReturn(false);
    }
  };

  // Print Receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  // WhatsApp Notification Toast
  const handleSendWhatsAppNotification = () => {
    toast.success("Notifikasi WhatsApp Berhasil Terkirim! 📲", {
      description: `Rincian jatuh tempo telah dikirimkan ke nomor terdaftar (${member?.phone || scannedReturnLoan?.memberPhone || "WhatsApp"}) via Gateway.`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* KIOSK TOP BAR */}
      <header className="h-20 border-b border-slate-800 bg-slate-900/90 px-6 sm:px-10 flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-xl font-extrabold tracking-tight text-white">
                  PustakaKita<span className="text-secondary">Ceria</span>
                </span>
                <Badge variant="outline" className="border-primary/40 text-primary text-[10px] uppercase font-bold tracking-wider">
                  Kiosk Lobi
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Stasiun Mandiri Sirkulasi Siswa & Guru
              </p>
            </div>
          </Link>
        </div>

        {/* Real-time Clock & Status Indicators */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col text-right">
            <span className="font-mono text-lg font-bold text-white tracking-wider flex items-center justify-end gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              {currentTime}
            </span>
            <span className="text-xs text-slate-400 font-medium">{currentDate}</span>
          </div>

          {/* Idle Countdown Warning */}
          {mode !== "idle" && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs text-amber-300 font-mono font-bold animate-pulse">
              <span>Auto-Reset: {idleSeconds}s</span>
            </div>
          )}

          {/* Top Bar Actions */}
          <div className="flex items-center gap-2">
            {mode !== "idle" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancelAndReset}
                className="text-xs font-bold rounded-xl h-10 gap-1.5 shadow-sm"
              >
                <X className="h-4 w-4" />
                <span>Batal / Mulai Ulang</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="h-10 w-10 rounded-xl border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
              title="Layar Penuh Kiosk"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* KIOSK MAIN CONTENT AREA */}
      <main className="flex-1 p-6 sm:p-10 max-w-6xl w-full mx-auto flex flex-col justify-center">
        {/* ========================================================= */}
        {/* MODE 1: WELCOME SCREEN (IDLE) */}
        {/* ========================================================= */}
        {mode === "idle" && (
          <div className="space-y-10 py-6 animate-in fade-in duration-300">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs px-3 py-1 font-bold">
                Self-Service Library Station
              </Badge>
              <h1 className="font-heading text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Layanan Sirkulasi Mandiri
              </h1>
              <p className="text-sm sm:text-base text-slate-400">
                Pilih layanan di bawah ini. Anda dapat menggunakan pemindai kamera bawaan atau alat tembak barcode kasir (USB Barcode Gun).
              </p>
            </div>

            {/* Huge 2 Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Option A: Pinjam Mandiri */}
              <button
                onClick={() => setMode("checkout_member")}
                className="group relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-primary/40 bg-gradient-to-b from-primary/10 via-slate-900 to-slate-900/90 text-center hover:border-primary transition-all duration-300 hover:scale-[1.02] shadow-2xl hover:shadow-[0_0_40px_rgba(27,163,150,0.25)] active:scale-95"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-primary/30 mb-6 group-hover:rotate-3 transition-transform">
                  <BookOpen className="h-12 w-12" />
                </div>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white mb-2">
                  Pinjam Buku Mandiri
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xs leading-relaxed">
                  Scan kartu anggota dan barcode buku yang ingin dipinjam tanpa perlu mengantre.
                </p>
                <div className="mt-8 flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md">
                  <span>Mulai Peminjaman</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>

              {/* Option B: Kembalikan Mandiri */}
              <button
                onClick={() => setMode("return_scan")}
                className="group relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-secondary/40 bg-gradient-to-b from-secondary/10 via-slate-900 to-slate-900/90 text-center hover:border-secondary transition-all duration-300 hover:scale-[1.02] shadow-2xl hover:shadow-[0_0_40px_rgba(245,158,11,0.2)] active:scale-95"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-secondary text-secondary-foreground shadow-xl shadow-secondary/30 mb-6 group-hover:-rotate-3 transition-transform">
                  <RotateCcw className="h-12 w-12" />
                </div>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white mb-2">
                  Kembalikan Buku Mandiri
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xs leading-relaxed">
                  Cukup scan barcode buku yang ingin dikembalikan. Sistem mencatatnya otomatis.
                </p>
                <div className="mt-8 flex items-center gap-2 rounded-2xl bg-secondary px-5 py-2.5 text-xs font-bold text-secondary-foreground shadow-md">
                  <span>Mulai Pengembalian</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>
            </div>

            {/* Bottom info helper */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 pt-4 border-t border-slate-900 max-w-2xl mx-auto">
              <span className="flex items-center gap-2">
                <Barcode className="h-4 w-4 text-primary" />
                Dukungan USB / Bluetooth Barcode Gun
              </span>
              <span className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-secondary" />
                Pemindai Kamera Web & Tablet
              </span>
              <span className="flex items-center gap-2">
                <Printer className="h-4 w-4 text-emerald-400" />
                Cetak Struk Thermal 58/80mm
              </span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 2: CHECKOUT - IDENTIFIKASI ANGGOTA */}
        {/* ========================================================= */}
        {mode === "checkout_member" && (
          <div className="space-y-6 max-w-3xl mx-auto w-full animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-bold">
                Langkah 1 dari 2: Identifikasi Anggota
              </Badge>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                Scan Kartu Anggota atau Ketik NIS/NIM
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Arahkan Barcode / QR Code Kartu Anggota ke kamera, tembak dengan barcode gun, atau ketik NIS/NIM di keypad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Live Camera Scanner */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-primary" />
                    Kamera Pemindai Kartu
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMemberScanner(!showMemberScanner)}
                    className="h-7 text-[11px] text-slate-400 hover:text-white"
                  >
                    {showMemberScanner ? "Sembunyikan Kamera" : "Tampilkan Kamera"}
                  </Button>
                </div>

                {showMemberScanner ? (
                  <BarcodeScanner
                    scannerId="kiosk-member-scanner"
                    onScan={(text) => handleLookupMember(text)}
                  />
                ) : (
                  <div className="aspect-square rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <Barcode className="h-12 w-12 text-slate-600 animate-pulse" />
                    <p className="text-xs text-slate-400">
                      Gunakan Barcode Gun USB atau On-Screen Keypad di sebelah kanan.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Touch On-Screen Numpad for NIS/NIM */}
              <div className="flex flex-col justify-between space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Ketik Nomor Induk Siswa / NIM:
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={memberInput}
                      onChange={(e) => setMemberInput(e.target.value)}
                      placeholder="Contoh: 2024001"
                      className="h-12 text-lg font-mono font-bold tracking-widest text-center bg-slate-950 border-slate-700 text-white rounded-xl focus:border-primary"
                    />
                  </div>
                </div>

                {/* Touch Numpad Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleNumpadPress(num)}
                      className="h-12 rounded-xl border border-slate-700 bg-slate-800/80 font-mono text-xl font-bold text-white hover:bg-primary hover:border-primary active:scale-90 transition-all shadow-sm"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleNumpadPress("CLEAR")}
                    className="h-12 rounded-xl border border-rose-900/50 bg-rose-950/40 text-xs font-bold text-rose-300 hover:bg-rose-900/60 active:scale-90 transition-all"
                  >
                    HAPUS
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumpadPress("0")}
                    className="h-12 rounded-xl border border-slate-700 bg-slate-800/80 font-mono text-xl font-bold text-white hover:bg-primary hover:border-primary active:scale-90 transition-all shadow-sm"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumpadPress("BACKSPACE")}
                    className="h-12 rounded-xl border border-slate-700 bg-slate-800/80 text-xs font-bold text-slate-300 hover:bg-slate-700 active:scale-90 transition-all"
                  >
                    ⌫ BATAL
                  </button>
                </div>

                {/* Submit button */}
                <Button
                  onClick={() => handleLookupMember(memberInput)}
                  disabled={isVerifyingMember || !memberInput.trim()}
                  className="w-full h-12 rounded-xl text-sm font-bold gap-2 shadow-lg shadow-primary/20 active:scale-95"
                >
                  {isVerifyingMember ? "Memeriksa Database..." : "Lanjutkan ke Pindai Buku"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Demo Simulator Buttons */}
            <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-1.5">
              <span className="font-semibold text-slate-300 block">⚡ Simulasi Cepat Data Anggota Uji Coba:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "2024001 (Ahmad Fauzi - Kuota Tersedia)", nis: "2024001" },
                  { label: "2024002 (Siti Nurhaliza)", nis: "2024002" },
                ].map((demo) => (
                  <button
                    key={demo.nis}
                    type="button"
                    onClick={() => {
                      setMemberInput(demo.nis);
                      handleLookupMember(demo.nis);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:border-primary text-slate-300 hover:text-white font-mono text-[11px]"
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 3: CHECKOUT - PINDAI BUKU & KERANJANG MULTI-ITEM */}
        {/* ========================================================= */}
        {mode === "checkout_books" && member && (
          <div className="space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-200">
            {/* Member Profile Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/20 via-slate-900 to-slate-900 border border-primary/30">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-sm">
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-white text-base leading-tight">
                    {member.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    NIS: {member.nisNim} • {member.classOrMajor || "Siswa"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Sisa Kuota Pinjam</span>
                  <span className="font-mono text-sm font-extrabold text-primary">
                    {member.remainingQuota - cart.length} dari {member.remainingQuota} Buku
                  </span>
                </div>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-xs font-bold">
                  Aktif
                </Badge>
              </div>
            </div>

            {/* Dual Scanner & Cart Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scanner Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Barcode className="h-4 w-4 text-primary" />
                    Pindai Barcode Buku
                  </span>
                  <span className="text-[11px] text-slate-400">Tembak barcode gun atau arahkan ke kamera</span>
                </div>

                <BarcodeScanner
                  scannerId="kiosk-book-scanner"
                  onScan={(text) => handleAddBookToCart(text)}
                />

                {/* Manual Barcode Text Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddBookToCart(bookInput);
                  }}
                  className="flex gap-2"
                >
                  <Input
                    type="text"
                    value={bookInput}
                    onChange={(e) => setBookInput(e.target.value)}
                    placeholder="Atau ketik barcode (cth: PKC-2024-001-001)"
                    className="h-10 text-xs font-mono bg-slate-900 border-slate-700 text-white rounded-xl"
                  />
                  <Button
                    type="submit"
                    disabled={isAddingBook || !bookInput.trim()}
                    size="sm"
                    className="text-xs font-bold rounded-xl h-10 px-4"
                  >
                    Tambah
                  </Button>
                </form>

                {/* Demo Barcode Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 w-full">Uji Barcode Cepat:</span>
                  {["PKC-2024-001-001", "PKC-2024-001-002", "PKC-2024-002-001", "PKC-2024-003-001"].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleAddBookToCart(code)}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-primary text-slate-300 font-mono text-[10px]"
                    >
                      +{code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cart Section */}
              <div className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="font-heading font-bold text-sm text-white flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Daftar Buku Dipinjam ({cart.length})
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Maksimal {member.remainingQuota} Buku
                    </span>
                  </div>

                  {cart.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                      <Barcode className="h-10 w-10 mx-auto opacity-50 animate-pulse text-slate-600" />
                      <p className="font-semibold text-slate-400">Belum ada buku di keranjang</p>
                      <p>Silakan scan barcode pada stiker buku perpustakaan.</p>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {cart.map((item, idx) => (
                        <div
                          key={item.copyCode}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
                        >
                          <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                            <span className="font-bold text-white block truncate">{item.title}</span>
                            <span className="font-mono text-[11px] text-primary block">{item.copyCode}</span>
                            <span className="text-[10px] text-slate-400 block">{item.author} • {item.shelf}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFromCart(item.copyCode)}
                            className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg shrink-0"
                            title="Hapus buku"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Checkout Trigger Action */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Masa Peminjaman:</span>
                    <span className="font-bold text-white">7 Hari (Gratis)</span>
                  </div>
                  <Button
                    onClick={handleProcessCheckout}
                    disabled={isCheckingOut || cart.length === 0}
                    className="w-full h-12 rounded-2xl text-sm font-bold gap-2 shadow-xl shadow-primary/25 active:scale-95 bg-primary text-primary-foreground"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    {isCheckingOut
                      ? "Memproses Database..."
                      : `Konfirmasi Peminjaman (${cart.length} Buku)`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 4: CHECKOUT - STRUK SUKSES */}
        {/* ========================================================= */}
        {mode === "checkout_success" && checkoutResult && (
          <div className="space-y-6 max-w-xl mx-auto w-full animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500 text-slate-950 mx-auto shadow-2xl shadow-emerald-500/30">
                <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                Peminjaman Berhasil!
              </h2>
              <p className="text-xs text-slate-400">
                Data sirkulasi mandiri telah resmi tersimpan di database perpustakaan.
              </p>
            </div>

            {/* Printable Receipt Paper Container */}
            <div
              id="kiosk-receipt"
              className="p-6 rounded-3xl border border-slate-800 bg-white text-slate-950 font-mono text-xs shadow-2xl space-y-4"
            >
              <div className="text-center space-y-1 pb-3 border-b-2 border-dashed border-slate-400">
                <h3 className="font-bold text-sm tracking-wider uppercase">PustakaKita Ceria</h3>
                <p className="text-[10px] text-slate-600">Perpustakaan Digital Sekolah & Kampus</p>
                <p className="text-[10px] font-bold">BUKTI PEMINJAMAN MANDIRI (KIOSK)</p>
              </div>

              <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-slate-400">
                <div className="flex justify-between">
                  <span>No. Struk:</span>
                  <span className="font-bold">{checkoutResult.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Peminjam:</span>
                  <span className="font-bold">{checkoutResult.member.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>NIS/NIM:</span>
                  <span>{checkoutResult.member.nisNim}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tgl Pinjam:</span>
                  <span>{checkoutResult.borrowedAt}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>Jatuh Tempo:</span>
                  <span>{checkoutResult.dueDate}</span>
                </div>
              </div>

              <div className="space-y-2 pb-3 border-b border-dashed border-slate-400">
                <span className="font-bold text-[10px] uppercase text-slate-600 block">Daftar Eksemplar:</span>
                {checkoutResult.items.map((item: any, i: number) => (
                  <div key={item.copyCode} className="space-y-0.5">
                    <p className="font-bold">{i + 1}. {item.title}</p>
                    <p className="text-[10px] text-slate-600 pl-3">Kode: {item.copyCode} | Rak: {item.shelf}</p>
                  </div>
                ))}
              </div>

              <div className="text-center text-[10px] text-slate-600 space-y-1">
                <p>Harap kembalikan buku tepat waktu sebelum tanggal jatuh tempo.</p>
                <p>Terima kasih telah berkunjung ke perpustakaan.</p>
              </div>
            </div>

            {/* Post-Transaction Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={handlePrintReceipt}
                className="h-12 rounded-2xl font-bold text-xs gap-2 bg-slate-800 text-white hover:bg-slate-700 active:scale-95"
              >
                <Printer className="h-4 w-4 text-primary" />
                Cetak Struk (POS)
              </Button>

              <Button
                onClick={handleSendWhatsAppNotification}
                className="h-12 rounded-2xl font-bold text-xs gap-2 bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95"
              >
                <MessageSquare className="h-4 w-4" />
                Kirim WA
              </Button>

              <Button
                onClick={handleCancelAndReset}
                className="h-12 rounded-2xl font-bold text-xs gap-2 bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
              >
                <ArrowRight className="h-4 w-4" />
                Selesai
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 5: PENGEMBALIAN MANDIRI - SCAN BUKU */}
        {/* ========================================================= */}
        {mode === "return_scan" && (
          <div className="space-y-6 max-w-2xl mx-auto w-full animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <Badge className="bg-secondary/20 text-secondary border-secondary/30 text-xs font-bold">
                Pengembalian Mandiri (Self-Return)
              </Badge>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                Pindai Barcode Buku yang Dikembalikan
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Arahkan barcode eksemplar buku ke kamera atau tembak langsung menggunakan Barcode Gun.
              </p>
            </div>

            {/* Scanner */}
            <BarcodeScanner
              scannerId="kiosk-return-scanner"
              onScan={(code) => handleLookupReturnBook(code)}
            />

            {/* Scanned Loan Preview if identified */}
            {scannedReturnLoan && (
              <div className="p-5 rounded-3xl border border-secondary/40 bg-secondary/10 space-y-4 animate-in slide-in-from-bottom duration-200">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-secondary tracking-wider block">Buku Terdeteksi</span>
                    <h3 className="font-heading font-extrabold text-lg text-white">{scannedReturnLoan.bookTitle}</h3>
                    <p className="font-mono text-xs text-primary">{scannedReturnLoan.copyCode}</p>
                  </div>
                  <Badge variant={scannedReturnLoan.daysLate > 0 ? "destructive" : "success"} className="text-xs font-bold">
                    {scannedReturnLoan.daysLate > 0 ? `Terlambat ${scannedReturnLoan.daysLate} Hari` : "Tepat Waktu"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Peminjam:</span>
                    <span className="font-bold text-white">{scannedReturnLoan.memberName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Jatuh Tempo:</span>
                    <span className="font-bold text-white">{scannedReturnLoan.dueDate}</span>
                  </div>
                </div>

                {scannedReturnLoan.fineAmount > 0 && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
                    <span>Denda Keterlambatan:</span>
                    <span className="font-bold font-mono text-sm">
                      Rp {scannedReturnLoan.fineAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}

                <Button
                  onClick={handleConfirmReturn}
                  disabled={isProcessingReturn}
                  className="w-full h-12 rounded-2xl font-bold text-sm bg-secondary text-secondary-foreground hover:opacity-90 active:scale-95 shadow-lg"
                >
                  {isProcessingReturn ? "Memproses Pengembalian..." : "Konfirmasi Pengembalian Buku Ini"}
                </Button>
              </div>
            )}

            {/* Quick Demo Return Buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-2">
              <span className="text-[11px] block w-full">Uji Coba Cepat Barcode Pinjaman:</span>
              {["PKC-2024-001-001", "PKC-2024-001-002", "PKC-2024-002-001"].map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleLookupReturnBook(code)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-secondary text-slate-300 font-mono text-xs"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 6: PENGEMBALIAN - STRUK SUKSES */}
        {/* ========================================================= */}
        {mode === "return_success" && returnResult && (
          <div className="space-y-6 max-w-md mx-auto w-full animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500 text-slate-950 mx-auto shadow-2xl shadow-emerald-500/30">
                <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                Buku Berhasil Dikembalikan!
              </h2>
              <p className="text-xs text-slate-400">
                Eksemplar telah kembali berstatus 'tersedia' di sistem perpustakaan.
              </p>
            </div>

            <div
              id="kiosk-receipt"
              className="p-5 rounded-3xl border border-slate-800 bg-white text-slate-950 font-mono text-xs space-y-3"
            >
              <div className="text-center pb-2 border-b border-dashed border-slate-400">
                <h4 className="font-bold">BUKTI PENGEMBALIAN BUKU</h4>
                <p className="text-[10px] text-slate-600">PustakaKita Ceria</p>
              </div>

              <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-slate-400">
                <div className="flex justify-between">
                  <span>Judul:</span>
                  <span className="font-bold">{returnResult.bookTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kode:</span>
                  <span>{returnResult.copyCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Peminjam:</span>
                  <span>{returnResult.memberName}</span>
                </div>
                {returnResult.fineAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Denda Telat:</span>
                    <span>Rp {returnResult.fineAmount.toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>

              <p className="text-center text-[10px] text-slate-500">
                Silakan letakkan buku di rak pengembalian lobi perpustakaan.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handlePrintReceipt}
                className="flex-1 h-12 rounded-2xl font-bold text-xs gap-1.5 bg-slate-800 text-white hover:bg-slate-700"
              >
                <Printer className="h-4 w-4" />
                Cetak Bukti
              </Button>
              <Button
                onClick={handleCancelAndReset}
                className="flex-1 h-12 rounded-2xl font-bold text-xs gap-1.5 bg-secondary text-secondary-foreground"
              >
                Selesai
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* KIOSK FOOTER */}
      <footer className="h-14 border-t border-slate-900 bg-slate-950 px-6 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Status Sistem: Terhubung ke Database Neon PostgreSQL</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/pustakawan" className="hover:text-slate-300">
            Panel Pustakawan
          </Link>
          <Link href="/" className="hover:text-slate-300">
            Web Publik
          </Link>
        </div>
      </footer>
    </div>
  );
}

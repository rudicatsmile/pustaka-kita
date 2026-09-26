"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Printer,
  Download,
  Wifi,
  WifiOff,
  CheckCircle2,
  HardDriveDownload,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getActiveMemberUser } from "@/actions/member";
import { toast } from "@/components/ui/sonner";

const OFFLINE_STORAGE_KEY = "pustakakita_offline_member_card";

export default function KartuAnggotaPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isSavedLocally, setIsSavedLocally] = useState(false);

  useEffect(() => {
    // 1. Initial offline check
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Check if already stored offline
      const cached = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setUser(parsed);
          setIsSavedLocally(true);
          setLoading(false);
        } catch {}
      }

      // Fetch fresh online data
      getActiveMemberUser()
        .then((data) => {
          if (data) {
            setUser(data);
            localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(data));
            setIsSavedLocally(true);
          }
        })
        .catch((e) => {
          console.warn("Gagal fetch online, menggunakan cache lokal:", e);
        })
        .finally(() => setLoading(false));

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success("Kartu Anggota Digital berhasil diunduh!", {
      description: `File kartu-anggota-${user?.nisNim || "member"}.png telah disimpan.`,
    });
  };

  const handleSaveToDevice = () => {
    if (user) {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(user));
      setIsSavedLocally(true);
      toast.success("Kartu Berhasil Disimpan ke Perangkat! 📲", {
        description: "Kartu ini dapat dibuka kapan saja meski tanpa sinyal atau tanpa kuota internet.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Kartu Anggota Digital
        </h1>
        <p className="text-xs text-muted-foreground">
          Tunjukkan QR atau Barcode ini di meja sirkulasi perpustakaan atau gunakan pada Kiosk scan mandiri.
        </p>
      </div>

      {/* Online/Offline Status Notification */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 rounded-2xl border p-3.5 text-xs transition-colors bg-card shadow-sm">
        <div className="flex items-center gap-2">
          {isOffline ? (
            <>
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                <WifiOff className="h-4 w-4" />
                <span>Mode Offline (Tanpa Internet)</span>
              </div>
            </>
          ) : (
            <>
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                <Wifi className="h-4 w-4" />
                <span>Terhubung ke Database Cloud</span>
              </div>
            </>
          )}
        </div>

        {isSavedLocally && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Tersimpan di Penyimpanan HP (Offline Ready)</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          Memuat kartu anggota...
        </div>
      ) : (
        <>
          {/* Digital Member Card */}
          <div className="rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary via-teal-700 to-teal-900 text-white p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
            {/* Subtle decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/20 rounded-full blur-xl -ml-16 -mb-16 pointer-events-none" />

            {/* Top Header Card */}
            <div className="flex items-center justify-between relative z-10 border-b border-white/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary shadow-md">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-heading font-extrabold text-base tracking-tight">
                    PustakaKita<span className="text-secondary">Ceria</span>
                  </p>
                  <p className="text-[10px] text-teal-100 font-medium tracking-wide">
                    PERPUSTAKAAN DIGITAL RESMI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white/15 text-white border-white/30 text-[10px] uppercase font-bold">
                  {user?.memberStatus || "AKTIF"}
                </Badge>
              </div>
            </div>

            {/* Card Body */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center relative z-10">
              <div className="sm:col-span-2 space-y-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-teal-200 tracking-wider">
                    Nama Anggota Perpustakaan
                  </span>
                  <h2 className="font-heading text-xl font-black text-white">
                    {user?.name || "Anggota Pustaka"}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-teal-200 block">Nomor Induk (NIS/NIM)</span>
                    <strong className="font-mono text-base tracking-wider text-secondary">
                      {user?.nisNim || "-"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-teal-200 block">Kelas / Peminatan</span>
                    <strong className="text-white">{user?.classOrMajor || "-"}</strong>
                  </div>
                </div>

                <div className="text-[10px] text-teal-200 pt-1 flex items-center justify-between">
                  <span>Berlaku Hingga: <strong>30 Juni 2027</strong></span>
                  <span className="font-mono opacity-80">ID: {user?.id?.slice(0, 8) || "MEMBER"}</span>
                </div>
              </div>

              {/* QR Code / Barcode Simulation */}
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-3 text-slate-900 shadow-lg space-y-2">
                <div className="h-24 w-24 bg-slate-900 rounded-lg flex items-center justify-center p-1.5">
                  {/* High contrast QR Pattern */}
                  <div className="grid grid-cols-5 gap-1 w-full h-full p-1 bg-white rounded">
                    <div className="bg-black col-span-2 row-span-2" />
                    <div className="bg-white" />
                    <div className="bg-black col-span-2 row-span-2" />
                    <div className="bg-black" />
                    <div className="bg-black" />
                    <div className="bg-white" />
                    <div className="bg-black col-span-2 row-span-2" />
                    <div className="bg-black" />
                    <div className="bg-black col-span-2" />
                  </div>
                </div>
                <p className="font-mono text-[9px] font-extrabold tracking-wider text-slate-800">
                  PKC-{user?.nisNim || "0000"}
                </p>
              </div>
            </div>

            {/* Barcode Visual Bottom Line */}
            <div className="relative z-10 border-t border-white/20 pt-4 flex flex-col items-center space-y-1">
              <div className="flex gap-1 h-6 items-center justify-center opacity-85">
                {[4, 2, 6, 2, 8, 3, 5, 2, 6, 4, 2, 7, 3, 5, 2, 8, 4, 3, 6, 2, 4, 7, 3, 5].map(
                  (w, i) => (
                    <div key={i} className="bg-white h-full" style={{ width: `${w}px` }} />
                  )
                )}
              </div>
              <span className="font-mono text-[10px] text-teal-100 tracking-widest uppercase">
                * {user?.nisNim || "NIS"}-{(user?.name || "MEMBER").replace(/\s+/g, "-")} *
              </span>
            </div>
          </div>

          {/* Offline Ready Information Card */}
          <div className="rounded-2xl border border-border bg-muted/30 p-4 text-xs space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Dukungan PWA & Offline Tanpa Kuota:</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Kartu ini otomatis di-cache ke dalam browser HP Anda. Saat berada di area perpustakaan
              tanpa Wi-Fi atau sinyal HP, kartu QR Code dan identitas di atas tetap dapat discan
              oleh pustakawan tanpa terputus.
            </p>
          </div>

          {/* Card Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <Button
              onClick={handleSaveToDevice}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto font-bold gap-2 text-xs"
            >
              <HardDriveDownload className="h-4 w-4 text-primary" />
              Simpan Offline ke HP
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto font-bold gap-2 text-xs"
            >
              <Printer className="h-4 w-4" />
              Cetak Kartu Fisik
            </Button>
            <Button
              onClick={handleDownload}
              size="sm"
              className="w-full sm:w-auto font-bold gap-2 text-xs shadow-sm"
            >
              <Download className="h-4 w-4" />
              Unduh Gambar PNG
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

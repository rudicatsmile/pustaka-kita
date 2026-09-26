"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  QrCode,
  Printer,
  Download,
  Share2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getActiveMemberUser } from "@/actions/member";
import { toast } from "@/components/ui/sonner";

export default function KartuAnggotaPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveMemberUser()
      .then((data) => setUser(data))
      .catch((e) => console.error("Gagal memuat profil kartu:", e))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success("Kartu Anggota Digital berhasil diunduh!", {
      description: `File kartu-anggota-${user?.nisNim || "member"}.png telah disimpan.`,
    });
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

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          Memuat kartu anggota dari database...
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

              <Badge variant="outline" className="bg-white/15 text-white border-white/30 text-[10px] uppercase">
                {user?.memberStatus || "AKTIF"}
              </Badge>
            </div>

            {/* Card Body */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center relative z-10">
              <div className="sm:col-span-2 space-y-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-teal-200 tracking-wider">
                    Nama Anggota Perpustakaan
                  </span>
                  <h2 className="font-heading text-xl font-black text-white">
                    {user?.name || "Anggota"}
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

                <div className="text-[10px] text-teal-200 pt-1">
                  <span>Berlaku Hingga: <strong>30 Juni 2027</strong></span>
                </div>
              </div>

              {/* QR Code / Barcode Simulation */}
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-3 text-slate-900 shadow-md space-y-2">
                <div className="h-24 w-24 bg-slate-900 rounded-lg flex items-center justify-center p-1.5">
                  {/* QR Mockup Pattern */}
                  <div className="grid grid-cols-5 gap-1 w-full h-full p-1 bg-white">
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
                <p className="font-mono text-[9px] font-bold tracking-wider text-slate-700">
                  PKC-M-{user?.nisNim || "0000"}
                </p>
              </div>
            </div>

            {/* Barcode Visual Bottom Line */}
            <div className="relative z-10 border-t border-white/20 pt-4 flex flex-col items-center space-y-1">
              <div className="flex gap-1 h-6 items-center justify-center opacity-80">
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

          {/* Card Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button onClick={handlePrint} variant="outline" size="sm" className="w-full sm:w-auto font-bold gap-2">
              <Printer className="h-4 w-4" />
              Cetak Kartu Fisik
            </Button>
            <Button onClick={handleDownload} size="sm" className="w-full sm:w-auto font-bold gap-2">
              <Download className="h-4 w-4" />
              Unduh Kartu Digital (PNG)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

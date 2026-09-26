"use client";

import Link from "next/link";
import { WifiOff, CreditCard, RefreshCw, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function OfflineFallbackPage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full rounded-3xl border border-border p-8 text-center space-y-6 shadow-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <WifiOff className="h-10 w-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-black text-foreground">
            Koneksi Internet Terputus
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Anda sedang dalam <strong>Mode Offline</strong>. Jangan khawatir, kartu anggota
            perpustakaan digital Anda telah tersimpan secara aman di perangkat ini.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-muted/40 p-4 text-xs text-left space-y-2">
          <p className="font-bold text-foreground flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-primary" />
            Fitur yang Tetap Aktif Saat Offline:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Kartu Anggota Digital (QR Code & Barcode)</li>
            <li>Identitas Nomor Induk Siswa / Mahasiswa</li>
            <li>Halaman yang baru saja Anda buka</li>
          </ul>
        </div>

        <div className="space-y-2.5 pt-2">
          <Link href="/dashboard/kartu" className="block w-full">
            <Button className="w-full font-bold text-xs gap-2 h-11 rounded-xl shadow-md">
              <CreditCard className="h-4 w-4" />
              Buka Kartu Anggota (Offline)
            </Button>
          </Link>
          <Button
            onClick={handleReload}
            variant="outline"
            className="w-full font-bold text-xs gap-2 h-11 rounded-xl"
          >
            <RefreshCw className="h-4 w-4" />
            Coba Sambungkan Ulang
          </Button>
        </div>
      </Card>
    </div>
  );
}

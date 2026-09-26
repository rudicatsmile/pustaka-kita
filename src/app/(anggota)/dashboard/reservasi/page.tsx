"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookmarkCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DUMMY_RESERVATIONS, ReservationItem } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";

export default function ReservasiSayaPage() {
  const [reservations, setReservations] = useState<ReservationItem[]>(DUMMY_RESERVATIONS);

  const handleCancel = (id: string, title: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
    toast.success("Reservasi Dibatalkan", {
      description: `Antrean reservasi untuk buku "${title}" telah dihapus.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Reservasi Buku Saya
        </h1>
        <p className="text-xs text-muted-foreground">
          Pantau antrean buku yang sedang Anda pesan saat stok fisik habis.
        </p>
      </div>

      {reservations.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border p-12 text-center space-y-3">
          <BookmarkCheck className="mx-auto h-12 w-12 text-muted-foreground/60" />
          <h3 className="font-heading text-base font-bold text-foreground">
            Tidak ada reservasi aktif
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Anda belum melakukan pemesanan antrean buku. Cari buku di katalog untuk memesan.
          </p>
          <Link href="/dashboard/katalog">
            <Button size="sm" className="font-bold text-xs mt-2">
              Jelajahi Katalog Buku
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reservations.map((item) => (
            <Card
              key={item.id}
              className={`rounded-2xl border p-6 space-y-4 shadow-sm ${
                item.status === "siap"
                  ? "border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20"
                  : "border-border"
              }`}
            >
              <div className="flex gap-4">
                <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted shadow-sm">
                  <Image
                    src={item.coverUrl}
                    alt={item.bookTitle}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant={item.status === "siap" ? "success" : "warning"}
                      className="text-[10px] font-bold"
                    >
                      {item.status === "siap" ? "🎉 Buku Siap Diambil" : "Menunggu Antrean"}
                    </Badge>
                    <span className="font-mono text-xs text-primary font-bold">
                      Antrean #{item.queuePosition}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-foreground line-clamp-1">
                    {item.bookTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground">Diajukan: {item.reservedAt}</p>
                  {item.readyAt && (
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Batas Pengambilan: {item.expiresAt} (2×24 Jam)
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between gap-3">
                <Button
                  onClick={() => handleCancel(item.id, item.bookTitle)}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  Batalkan Reservasi
                </Button>
                {item.status === "siap" && (
                  <Link href="/dashboard/scan">
                    <Button size="sm" className="text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700">
                      Ambil via Scan Barcode
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

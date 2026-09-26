"use client";

import { useState, useEffect } from "react";
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
import { getMemberReservations } from "@/actions/member";
import { cancelReservationAction } from "@/actions/reservations";
import { toast } from "@/components/ui/sonner";

export default function ReservasiSayaPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReservations = async () => {
    try {
      const data = await getMemberReservations();
      setReservations(data);
    } catch (e) {
      console.error("Gagal memuat reservasi:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleCancel = async (id: string, title: string) => {
    try {
      const res = await cancelReservationAction(id);
      if (res.success) {
        toast.success("Reservasi Dibatalkan", {
          description: `Antrean reservasi untuk buku "${title}" telah dihapus.`,
        });
        loadReservations();
      } else {
        toast.error("Gagal membatalkan:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Reservasi Buku Saya
        </h1>
        <p className="text-xs text-muted-foreground">
          Pantau antrean buku yang sedang Anda pesan saat stok fisik habis langsung dari database.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          Memuat data antrean reservasi dari database...
        </div>
      ) : reservations.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border p-12 text-center space-y-3">
          <BookmarkCheck className="mx-auto h-12 w-12 text-muted-foreground/60" />
          <h3 className="font-heading text-base font-bold text-foreground">
            Tidak ada reservasi aktif
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Anda belum melakukan pemesanan antrean buku. Cari buku di katalog untuk memesan.
          </p>
          <Link href="/katalog">
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
                  {item.coverUrl ? (
                    <Image
                      src={item.coverUrl}
                      alt={item.bookTitle}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                      Buku
                    </div>
                  )}
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
                      Batas Pengambilan: {item.readyAt} (2×24 Jam)
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

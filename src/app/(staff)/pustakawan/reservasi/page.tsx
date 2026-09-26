"use client";

import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  MessageCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { ReservationItem } from "@/types";
import {
  getReservationsAction,
  markReservationReadyAction,
} from "@/actions/reservations";

export default function KelolaReservasiPage() {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function loadReservations() {
    setIsLoading(true);
    try {
      const data = await getReservationsAction();
      setReservations(data as ReservationItem[]);
    } catch (e: any) {
      toast.error("Gagal memuat antrean reservasi: " + (e.message || "Error"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
  }, []);

  const handleMarkReady = async (id: string, title: string, memberName: string) => {
    setProcessingId(id);
    try {
      const res = await markReservationReadyAction(id);
      if (res.success) {
        setReservations((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: "siap",
                  readyAt: new Date().toISOString().split("T")[0],
                  expiresAt: "2×24 Jam ke Depan",
                }
              : r
          )
        );
        toast.success("Buku Ditandai Siap Diambil! 📢", {
          description: `Notifikasi WhatsApp otomatis dikirim ke ${memberName}: "Buku '${title}' sudah siap diambil di meja perpustakaan".`,
        });
      } else {
        toast.error("Gagal menandai reservasi siap: " + res.error);
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleFulfill = (id: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "terpenuhi" } : r))
    );
    toast.success("Reservasi Selesai (Buku Telah Diambil) ✅");
  };

  const filtered = reservations.filter((r) => {
    const s = search.toLowerCase();
    return (
      r.memberName.toLowerCase().includes(s) ||
      r.memberNisNim.toLowerCase().includes(s) ||
      r.bookTitle.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Kelola Antrean Reservasi Buku
          </h1>
          <p className="text-xs text-muted-foreground">
            Daftar pemesanan buku saat stok fisik kosong dan pengiriman notifikasi siap ambil.
          </p>
        </div>
        <Button
          onClick={loadReservations}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="h-9 gap-1.5 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Segarkan Data
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama peminjam, NIS/NIM, atau judul buku..."
          className="pl-10 text-xs"
        />
      </div>

      <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-xs text-muted-foreground">Memuat antrean reservasi...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Pemohon (NIS/NIM)</TableHead>
                <TableHead className="text-xs">Buku yang Dipesan</TableHead>
                <TableHead className="text-xs">Tgl Pengajuan</TableHead>
                <TableHead className="text-xs">Antrean</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Aksi Petugas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">
                    Tidak ada reservasi buku yang aktif saat ini.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-heading font-bold text-xs text-foreground">
                        {item.memberName}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">{item.memberNisNim}</p>
                    </TableCell>
                    <TableCell className="text-xs font-semibold">{item.bookTitle}</TableCell>
                    <TableCell className="font-mono text-xs">{item.reservedAt}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      Urutan #{item.queuePosition}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "siap"
                            ? "success"
                            : item.status === "terpenuhi"
                            ? "muted"
                            : "warning"
                        }
                        className="text-[10px]"
                      >
                        {item.status === "siap"
                          ? "Siap Diambil"
                          : item.status === "terpenuhi"
                          ? "Selesai"
                          : "Menunggu Buku"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status === "menunggu" && (
                        <Button
                          onClick={() => handleMarkReady(item.id, item.bookTitle, item.memberName)}
                          disabled={processingId === item.id}
                          size="sm"
                          className="text-xs font-bold gap-1 shadow-sm"
                        >
                          {processingId === item.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <MessageCircle className="h-3.5 w-3.5" />
                          )}
                          Tandai Siap & Kirim WA
                        </Button>
                      )}
                      {item.status === "siap" && (
                        <Button
                          onClick={() => handleFulfill(item.id)}
                          variant="outline"
                          size="sm"
                          className="text-xs font-bold gap-1 text-emerald-700 border-emerald-300 bg-emerald-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Buku Diambil
                        </Button>
                      )}
                      {item.status === "terpenuhi" && (
                        <span className="text-xs text-muted-foreground">Selesai</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Search,
  RotateCcw,
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
import { NotificationItem } from "@/types";
import { sendTestWhatsAppAction } from "@/actions/whatsapp";
import { getNotificationsLogAction } from "@/actions/admin";

export default function PusatNotifikasiPage() {
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [retryingId, setRetryingId] = useState<string | null>(null);

  async function loadNotifs() {
    setIsLoading(true);
    try {
      const data = await getNotificationsLogAction();
      setNotifs(data as NotificationItem[]);
    } catch (e: any) {
      toast.error("Gagal memuat log notifikasi: " + (e.message || "Error"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadNotifs();
  }, []);

  const handleRetry = async (id: string, recipient: string) => {
    setRetryingId(id);
    try {
      const targetNotif = notifs.find((n) => n.id === id);
      await sendTestWhatsAppAction({
        recipient,
        message: targetNotif?.message,
        actorId: "usr-admin-1",
        actorName: "Administrator Perpustakaan",
      });

      setNotifs((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, status: "terkirim", retryCount: (n.retryCount || 0) + 1 }
            : n
        )
      );
      toast.success("Pesan Berhasil Dikirim Ulang! 📲", {
        description: `Pesan WhatsApp diteruskan kembali ke ${recipient} via Fonnte Gateway. Log audit diperbarui.`,
      });
    } catch (e: any) {
      toast.error("Gagal mengirim ulang pesan:", { description: e.message });
    } finally {
      setRetryingId(null);
    }
  };

  const filtered = notifs.filter(
    (n) =>
      n.recipient.toLowerCase().includes(search.toLowerCase()) ||
      n.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      n.type.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Pusat & Log Notifikasi WhatsApp
          </h1>
          <p className="text-xs text-muted-foreground">
            Pemantauan antrean pesan WhatsApp, riwayat pengiriman, dan mekanisme retry manual.
          </p>
        </div>
        <Button
          onClick={loadNotifs}
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
          placeholder="Cari penerima atau tipe pesan..."
          className="pl-10 text-xs"
        />
      </div>

      <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-xs text-muted-foreground">Memuat riwayat notifikasi...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Waktu Kirim</TableHead>
                <TableHead className="text-xs">Penerima & WhatsApp</TableHead>
                <TableHead className="text-xs">Jenis Pesan</TableHead>
                <TableHead className="text-xs">Isi Notifikasi</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">
                    Belum ada rekaman log pengiriman WhatsApp.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {n.sentAt}
                    </TableCell>
                    <TableCell>
                      <p className="font-heading font-bold text-xs text-foreground">
                        {n.recipientName}
                      </p>
                      <p className="font-mono text-[11px] text-primary">{n.recipient}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {n.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {n.message}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={n.status === "terkirim" ? "success" : "destructive"}
                        className="text-[10px]"
                      >
                        {n.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleRetry(n.id, n.recipient)}
                        disabled={retryingId === n.id}
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs font-bold gap-1 text-primary hover:bg-primary/10"
                      >
                        {retryingId === n.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3 w-3" />
                        )}
                        Kirim Ulang
                      </Button>
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

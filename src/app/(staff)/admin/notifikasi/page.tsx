"use client";

import { useState } from "react";
import {
  BellRing,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  XCircle,
  MessageCircle,
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
import { DUMMY_NOTIFICATIONS } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";
import { sendTestWhatsAppAction } from "@/actions/whatsapp";

export default function PusatNotifikasiPage() {
  const [notifs, setNotifs] = useState(DUMMY_NOTIFICATIONS);
  const [search, setSearch] = useState("");

  const handleRetry = async (id: string, recipient: string) => {
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
            ? { ...n, status: "terkirim", retryCount: n.retryCount + 1 }
            : n
        )
      );
      toast.success("Pesan Berhasil Dikirim Ulang! 📲", {
        description: `Pesan WhatsApp diteruskan kembali ke ${recipient} via Fonnte Gateway. Log audit diperbarui.`,
      });
    } catch (e: any) {
      toast.error("Gagal mengirim ulang pesan:", { description: e.message });
    }
  };

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
            {notifs.map((n) => (
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
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs font-bold gap-1 text-primary hover:bg-primary/10"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Kirim Ulang
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

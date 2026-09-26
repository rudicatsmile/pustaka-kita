"use client";

import { useState } from "react";
import {
  MessageSquare,
  Send,
  Key,
  Phone,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SYSTEM_CONFIG } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";
import { sendTestWhatsAppAction, saveWhatsAppConfigAction } from "@/actions/whatsapp";

export default function WhatsAppConfigPage() {
  const [apiKey, setApiKey] = useState("fonnte_sec_token_9921827471928");
  const [senderNumber, setSenderNumber] = useState(SYSTEM_CONFIG.whatsappSenderNumber);
  const [testNumber, setTestNumber] = useState("081234567890");
  const [testMessage, setTestMessage] = useState(
    "Halo! 📚 Ini adalah pesan uji coba integrasi WhatsApp Gateway PustakaKitaCeria. Sistem berjalan normal!"
  );
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await saveWhatsAppConfigAction({
        apiKey,
        senderNumber,
        actorId: "usr-admin-1",
        actorName: "Administrator Perpustakaan",
      });
      toast.success("Konfigurasi WhatsApp Gateway Berhasil Disimpan! 💾", {
        description: "Token API dan nomor pengirim tersimpan serta tercatat di Audit Log.",
      });
    } catch (e: any) {
      toast.error("Gagal menyimpan konfigurasi:", { description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testNumber) {
      toast.error("Nomor penerima uji coba wajib diisi!");
      return;
    }
    setIsSending(true);
    try {
      const res = await sendTestWhatsAppAction({
        recipient: testNumber,
        message: testMessage,
        actorId: "usr-admin-1",
        actorName: "Administrator Perpustakaan",
      });

      if (res.success) {
        toast.success("Pesan Uji Coba Berhasil Terkirim! 📲", {
          description: `Pesan telah dikirim ke nomor ${testNumber} via Fonnte Gateway. Status: ${res.status}. Log tersimpan.`,
        });
      } else {
        toast.error("Gagal mengirim pesan uji coba:", {
          description: res.error || "Periksa token API Fonnte atau nomor tujuan.",
        });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Konfigurasi WhatsApp Gateway (Fonnte)
        </h1>
        <p className="text-xs text-muted-foreground">
          Pengaturan kunci API, nomor bot pengirim, dan pengujian saluran komunikasi notifikasi otomatis.
        </p>
      </div>

      {/* Status Gateway Box */}
      <Card className="rounded-2xl border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-heading text-sm font-bold text-emerald-900 dark:text-emerald-200">
              Gateway Status: TERHUBUNG (Ready)
            </h3>
          </div>
          <Badge variant="success" className="text-xs font-bold">
            Fonnte API v2
          </Badge>
        </div>
        <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
          Device Bot aktif dengan nomor <strong>{senderNumber}</strong>. Seluruh antrean pengingat
          H-1 dan verifikasi OTP diteruskan secara otomatis.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kredensial API Form */}
        <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <span>Kredensial Fonnte Gateway</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Fonnte API Token / Secret</label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Nomor Pengirim (Bot WhatsApp)</label>
              <Input
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSaving}
                size="sm"
                className="font-bold text-xs"
              >
                {isSaving ? "Menyimpan..." : "Simpan Kredensial"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Form Uji Kirim Pesan */}
        <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
            <Send className="h-4 w-4 text-secondary" />
            <span>Uji Kirim Pesan Langsung</span>
          </h3>
          <form onSubmit={handleSendTest} className="space-y-3 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Nomor WhatsApp Tujuan</label>
              <Input
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                placeholder="0812xxxx"
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Isi Pesan Uji Coba</label>
              <textarea
                rows={3}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button
              type="submit"
              disabled={isSending}
              size="sm"
              variant="secondary"
              className="font-bold text-xs gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {isSending ? "Mengirim..." : "Kirimkan Pesan Uji"}
            </Button>
          </form>
        </Card>
      </div>

      {/* Template Pesan Standar */}
      <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <h3 className="font-heading text-base font-bold text-foreground">
          Template Notifikasi Otomatis
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5">
            <Badge variant="default" className="text-[9px]">Pengingat H-1</Badge>
            <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
              &quot;Halo [Nama]! 📚 Buku [Judul] kamu harus dikembalikan besok, [Tanggal] ya. Yuk kembalikan tepat waktu!&quot;
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5">
            <Badge variant="destructive" className="text-[9px]">Keterlambatan & Denda</Badge>
            <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
              &quot;Hai [Nama]! Buku kamu terlambat [Hari] hari. Denda saat ini [Nominal]. Bayar via transfer & upload bukti.&quot;
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5">
            <Badge variant="success" className="text-[9px]">Reservasi Siap</Badge>
            <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
              &quot;Kabar gembira [Nama]! 🎉 Buku reservasi [Judul] sudah siap diambil di perpustakaan sampai [Batas].&quot;
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

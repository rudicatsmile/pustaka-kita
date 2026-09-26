"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SYSTEM_CONFIG } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";

export default function KontakPage() {
  const [name, setName] = useState("");
  const [emailOrWa, setEmailOrWa] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setName("");
      setEmailOrWa("");
      setSubject("");
      setMessage("");
      toast.success("Pesan Anda telah berhasil terkirim!", {
        description: "Tim staf pustakawan PustakaKitaCeria akan merespons melalui WhatsApp/Email secepatnya.",
      });
    }, 600);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="default" className="font-bold">
          Hubungi Kami
        </Badge>
        <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Ada Pertanyaan atau Usulan Buku?
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Staf pustakawan kami siap membantu kebutuhan referensi akademik Anda. Silakan hubungi
          melalui WhatsApp atau isi formulir di bawah.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Info Kontak & Jam Kerja */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm space-y-6">
            <h3 className="font-heading text-xl font-bold text-foreground">
              Informasi Perpustakaan
            </h3>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Alamat Fisik</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    {SYSTEM_CONFIG.libraryAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">WhatsApp Hotline Perpustakaan</p>
                  <p className="text-xs font-mono font-bold text-emerald-700 mt-0.5">
                    {SYSTEM_CONFIG.whatsappSenderNumber}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Aktif pada jam kerja operasional</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-secondary-foreground">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Surel Resmi</p>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">
                    {SYSTEM_CONFIG.libraryEmail}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Jam Pelayanan</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {SYSTEM_CONFIG.operatingHours}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mini peta / ilustrasi lokasi */}
          <div className="rounded-3xl border border-border bg-muted/40 p-6 text-center space-y-2">
            <p className="font-heading text-sm font-bold text-foreground">
              📍 Gedung Perpustakaan Pusat — Lantai 1 & 2
            </p>
            <p className="text-xs text-muted-foreground">
              Terletak tepat di samping Aula Utama dan Gedung Laboratorium Komputer.
            </p>
          </div>
        </div>

        {/* Form Kirim Pesan */}
        <div className="lg:col-span-7">
          <Card className="rounded-3xl p-8 shadow-sm">
            <CardContent className="p-0 space-y-5">
              <div className="space-y-1">
                <h3 className="font-heading text-xl font-bold text-foreground">
                  Kirim Pertanyaan atau Usulan Judul Buku
                </h3>
                <p className="text-xs text-muted-foreground">
                  Masukkan identitas Anda dan pesan yang ingin disampaikan kepada pengelola.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Nama Lengkap</label>
                    <Input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      No. WhatsApp / Email
                    </label>
                    <Input
                      required
                      value={emailOrWa}
                      onChange={(e) => setEmailOrWa(e.target.value)}
                      placeholder="0812xxxx atau email@sekolah.sch.id"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Subjek Pesan</label>
                  <Input
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Contoh: Usulan Pembelian Buku AI / Kendala Scan Barcode"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Isi Pesan / Pertanyaan</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan pesan Anda secara jelas di sini..."
                    className="flex w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full sm:w-auto font-bold gap-2">
                  <Send className="h-4 w-4" />
                  {submitting ? "Sedang Mengirim..." : "Kirimkan Pesan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

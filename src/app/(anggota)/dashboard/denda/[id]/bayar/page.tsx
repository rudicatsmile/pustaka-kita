"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Copy,
  Check,
  Upload,
  AlertCircle,
  FileCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SYSTEM_CONFIG, DUMMY_FINES } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";
import { uploadFineProofAction } from "@/actions/fines";

export default function BayarDendaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const fine = DUMMY_FINES.find((f) => f.id === resolvedParams.id) || DUMMY_FINES[0];

  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(SYSTEM_CONFIG.bankAccountNumber.replace(/-/g, ""));
    setCopied(true);
    toast.success("Nomor rekening berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error("Ukuran file melebihi 3 MB!");
        return;
      }
      setFileName(file.name);
      toast.info(`File "${file.name}" siap diunggah.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) {
      toast.error("Harap pilih file bukti transfer terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await uploadFineProofAction({
        fineId: fine.id,
        proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
        notes: `Transfer oleh ${fine.memberName} (${fileName})`,
      });

      if (!res.success) {
        toast.error("Gagal mengunggah bukti transfer:", { description: res.error });
        setIsSubmitting(false);
        return;
      }

      toast.success("Bukti Transfer Berhasil Diunggah! 🎉", {
        description: "Status tagihan kini 'Menunggu Verifikasi'. Pustakawan akan segera memvalidasi pembayaran Anda.",
      });
      router.push("/dashboard/denda");
    } catch (err: any) {
      toast.error("Terjadi kendala saat upload bukti:", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="mb-2">
        <Link
          href="/dashboard/denda"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Status Denda</span>
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Pelunasan Denda via Transfer Manual
        </h1>
        <p className="text-xs text-muted-foreground">
          Lakukan transfer ke rekening resmi perpustakaan dan unggah foto/screenshot bukti bayar.
        </p>
      </div>

      {/* Rincian Tagihan Card */}
      <Card className="rounded-2xl border border-border p-5 space-y-3 bg-muted/20">
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <span className="text-xs font-bold text-muted-foreground uppercase">
            Rincian Tagihan Denda
          </span>
          <Badge variant="destructive" className="text-xs font-bold">
            Belum Lunas
          </Badge>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Judul Buku:</span>
            <strong className="text-foreground">{fine.bookTitle}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kode Eksemplar:</span>
            <strong className="font-mono text-primary">{fine.copyCode}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Keterlambatan:</span>
            <strong className="text-rose-600">{fine.daysLate} Hari Kalender</strong>
          </div>
          <div className="flex justify-between pt-2 border-t border-border items-center">
            <span className="text-sm font-bold text-foreground">Nominal yang Harus Ditransfer:</span>
            <strong className="font-mono text-xl text-primary font-black">
              Rp {fine.amount.toLocaleString("id-ID")}
            </strong>
          </div>
        </div>
      </Card>

      {/* Rekening Resmi Box */}
      <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-sm font-bold text-foreground">
              Rekening Resmi Pembayaran Perpustakaan
            </h3>
          </div>
          <span className="font-bold text-xs text-primary">{SYSTEM_CONFIG.bankName}</span>
        </div>

        <div className="rounded-xl bg-card border border-border p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground">Nomor Rekening</p>
            <p className="font-mono text-lg font-bold text-foreground tracking-wider">
              {SYSTEM_CONFIG.bankAccountNumber}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              a.n. <strong>{SYSTEM_CONFIG.bankAccountName}</strong>
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyAccount}
            className="font-bold text-xs gap-1.5"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                Disalin
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Salin Rekening
              </>
            )}
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          *Pastikan nominal transfer Anda persis sama dengan tagihan agar proses verifikasi pustakawan
          berjalan cepat dan lancar.
        </p>
      </div>

      {/* Form Upload Bukti */}
      <Card className="rounded-2xl border border-border p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">
              Unggah File Bukti Transfer (Struk ATM / Screenshot M-Banking)
            </label>
            <div className="relative border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary transition-colors cursor-pointer bg-muted/20">
              <input
                type="file"
                accept="image/png, image/jpeg, application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2 pointer-events-none">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                {fileName ? (
                  <p className="font-semibold text-xs text-emerald-600 flex items-center justify-center gap-1">
                    <FileCheck className="h-4 w-4" />
                    {fileName}
                  </p>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-foreground">
                      Klik atau seret file bukti transfer ke sini
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Mendukung format JPG, PNG, atau PDF (Maksimal 3 MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Catatan Pengirim (Opsional)
            </label>
            <Input placeholder="Contoh: Transfer via Livin Mandiri a.n Budi Santoso" className="text-xs" />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Link href="/dashboard/denda">
              <Button type="button" variant="ghost" size="sm" className="font-bold text-xs">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="font-bold text-xs shadow-md"
            >
              {isSubmitting ? "Mengunggah Bukti..." : "Kirim Bukti Pembayaran"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

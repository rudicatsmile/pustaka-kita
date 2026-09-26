"use client";

import { use, useState, useEffect } from "react";
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
import { toast } from "@/components/ui/sonner";
import { uploadFineProofAction, getFineDetailAction } from "@/actions/fines";
import { getSettingsAction } from "@/actions/settings";

export default function BayarDendaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [fine, setFine] = useState<any>(null);
  const [bankInfo, setBankInfo] = useState<{
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;
  }>({
    bankName: "Bank Mandiri",
    bankAccountNumber: "1370012345678",
    bankAccountName: "SMK Nusantara - Perpustakaan PustakaKitaCeria",
  });
  const [loading, setLoading] = useState(true);

  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getSettingsAction().then((s) => setBankInfo(s));
    getFineDetailAction(resolvedParams.id)
      .then((data) => setFine(data))
      .catch((e) => console.error("Gagal memuat detail denda:", e))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankInfo.bankAccountNumber.replace(/-/g, ""));
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

    if (!fine) return;

    setIsSubmitting(true);
    try {
      const res = await uploadFineProofAction({
        fineId: fine.id,
        proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
        notes: `Transfer oleh ${fine.memberName || "Anggota"} (${fileName})`,
      });

      if (!res.success) {
        toast.error("Gagal mengunggah bukti transfer:", { description: (res as any).error });
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

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-12 text-center text-xs text-muted-foreground">
        Memuat detail tagihan denda dari database...
      </div>
    );
  }

  if (!fine) {
    return (
      <div className="mx-auto max-w-2xl p-12 text-center space-y-4">
        <p className="text-sm font-bold text-foreground">Tagihan denda tidak ditemukan atau sudah terhapus.</p>
        <Link href="/dashboard/denda">
          <Button size="sm">Kembali ke Daftar Denda</Button>
        </Link>
      </div>
    );
  }

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
          <Badge variant={fine.status === "lunas" ? "success" : "destructive"} className="text-xs font-bold capitalize">
            {fine.status.replace("_", " ")}
          </Badge>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Judul Buku:</span>
            <strong className="text-foreground font-semibold">{fine.bookTitle}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kode Eksemplar:</span>
            <strong className="font-mono text-primary">{fine.copyCode}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Durasi Keterlambatan:</span>
            <span className="text-rose-600 font-bold">{fine.daysLate} Hari</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border text-sm">
            <span className="font-bold text-foreground">Total Tagihan:</span>
            <strong className="font-mono text-base font-extrabold text-rose-600">
              Rp {fine.amount.toLocaleString("id-ID")}
            </strong>
          </div>
        </div>
      </Card>

      {/* Rekening Tujuan Transfer Card */}
      <Card className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-foreground">
              Rekening Bank Tujuan Transfer
            </h3>
            <p className="text-xs text-muted-foreground">
              Gunakan bank apa pun (transfer sesama bank / BI-FAST / Antar-Bank)
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Nama Bank:</span>
            <strong className="text-foreground">{bankInfo.bankName}</strong>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Nomor Rekening:</span>
            <div className="flex items-center gap-2">
              <strong className="font-mono text-base text-primary font-bold">
                {bankInfo.bankAccountNumber}
              </strong>
              <Button
                onClick={handleCopyAccount}
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Nama Pemilik Rekening:</span>
            <strong className="text-foreground">{bankInfo.bankAccountName}</strong>
          </div>
        </div>
      </Card>

      {/* Upload Bukti Form */}
      <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-base font-bold text-foreground">
            Unggah Bukti Transfer
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">Pilih File Bukti (JPG, PNG, PDF maks 3 MB)</label>
            <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="proof-file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="proof-file" className="cursor-pointer space-y-2 block">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-xs font-semibold text-foreground">
                  {fileName ? (
                    <span className="text-primary font-bold">{fileName}</span>
                  ) : (
                    "Klik untuk memilih foto struk atau screenshot bukti transfer"
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground">Format gambar atau dokumen digital</p>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !fileName}
            className="w-full font-bold shadow-md"
          >
            {isSubmitting ? "Mengunggah..." : "Kirim Bukti Pembayaran untuk Diverifikasi"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

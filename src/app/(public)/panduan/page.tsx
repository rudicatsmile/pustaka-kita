import Link from "next/link";
import {
  UserPlus,
  QrCode,
  Clock,
  Receipt,
  BookMarked,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SYSTEM_CONFIG } from "@/data/dummy";

export const metadata: Metadata = {
  title: "Panduan Penggunaan Layanan Perpustakaan | PustakaKitaCeria",
  description:
    "Tata cara peminjaman buku mandiri scan QR/barcode, durasi pinjam 7 hari, prosedur perpanjangan, baca e-book digital, dan pembayaran denda via transfer manual.",
};

export default function PanduanPage() {
  const steps = [
    {
      num: "01",
      icon: UserPlus,
      title: "Pendaftaran Akun Anggota",
      desc: "Isi formulir pendaftaran dengan NIS/NIM resmi sekolah/kampus, nama lengkap, nomor WhatsApp aktif, dan password. Masukkan kode OTP yang dikirimkan ke WhatsApp untuk mengaktifkan akun secara instan.",
      actionText: "Daftar Akun Sekarang",
      actionHref: "/daftar",
    },
    {
      num: "02",
      icon: QrCode,
      title: "Peminjaman dengan Scan Barcode Mandiri",
      desc: "Bawa buku pilihanmu dari rak, buka menu 'Scan Mandiri' di dasbor gawai, izinkan akses kamera, lalu arahkan ke stiker barcode di sampul belakang buku (contoh: PKC-2024-001-001). Konfirmasi pinjaman hanya dalam hitungan detik!",
      actionText: "Coba Fitur Scan Mandiri",
      actionHref: "/dashboard/scan",
    },
    {
      num: "03",
      icon: Clock,
      title: "Aturan Durasi Pinjam & Kuota",
      desc: `Setiap anggota aktif dapat meminjam maksimal ${SYSTEM_CONFIG.maxBooksPerMember} buku secara bersamaan selama ${SYSTEM_CONFIG.loanDurationDays} hari kalender. Anggota berhak melakukan perpanjangan (renewal) 1 kali jika buku belum melewati tanggal jatuh tempo dan tidak sedang direservasi orang lain.`,
      actionText: "Cek Riwayat Pinjaman",
      actionHref: "/dashboard/riwayat",
    },
    {
      num: "04",
      icon: Receipt,
      title: "Ketentuan Denda & Pengingat WhatsApp",
      desc: `Keterlambatan pengembalian buku dikenakan denda sebesar Rp ${SYSTEM_CONFIG.finePerDay.toLocaleString("id-ID")} per hari per eksemplar. Sistem akan otomatis mengirimkan pengingat H-1 dan notifikasi saat denda mulai berjalan ke nomor WhatsApp terdaftar.`,
      actionText: "Pelajari Status Denda",
      actionHref: "/dashboard/denda",
    },
    {
      num: "05",
      icon: CreditCard,
      title: "Pelunasan Denda via Transfer Manual",
      desc: `Jika memiliki denda, buka halaman Denda Saya, lakukan transfer persis sesuai nominal ke ${SYSTEM_CONFIG.bankName} No. Rek ${SYSTEM_CONFIG.bankAccountNumber} a.n. ${SYSTEM_CONFIG.bankAccountName}, lalu upload foto bukti transfer. Pustakawan akan memverifikasi dan akunmu langsung kembali aktif.`,
      actionText: "Form Upload Bukti",
      actionHref: "/dashboard/denda",
    },
    {
      num: "06",
      icon: BookMarked,
      title: "Membaca E-Book di Browser",
      desc: "Koleksi e-book berformat PDF dan EPUB dapat dibaca langsung tanpa install aplikasi tambahan. Fitur e-book reader dilengkapi mode malam, zoom, daftar isi, dan penyimpanan progres membaca otomatis setiap 10 detik.",
      actionText: "Buka Koleksi E-Book",
      actionHref: "/dashboard/ebook",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="default" className="font-bold">
          Pusat Bantuan & Tutorial
        </Badge>
        <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Panduan Lengkap Anggota Perpustakaan
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Semua yang perlu Anda ketahui mengenai tata cara pendaftaran, peminjaman mandiri, aturan
          tenggat waktu, pelunasan denda, dan membaca e-book.
        </p>
      </div>

      {/* Grid Panduan 6 Langkah */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-8 shadow-sm hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-2xl font-black text-muted-foreground/30">
                    {step.num}
                  </span>
                </div>

                <h3 className="font-heading text-lg font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed text-justify">
                  {step.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-border">
                <Link href={step.actionHref}>
                  <Button variant="ghost" size="sm" className="w-full justify-between text-xs font-bold text-primary group-hover:bg-primary/10">
                    <span>{step.actionText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Box Catatan Penting */}
      <div className="rounded-3xl border-2 border-amber-300 bg-amber-50/70 dark:bg-amber-950/20 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-200 text-amber-900">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading text-base font-bold text-amber-900 dark:text-amber-200">
              Batas Maksimum Tunggakan Denda
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              Jika akumulasi denda anggota mencapai atau melebihi <strong>Rp 50.000</strong>, hak
              peminjaman buku fisik akan otomatis ditangguhkan oleh sistem sampai seluruh kewajiban
              denda diverifikasi lunas oleh pustakawan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

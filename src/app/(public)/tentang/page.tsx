import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  Award,
  Users,
  Clock,
  HeartHandshake,
  Compass,
  CheckCircle,
} from "lucide-react";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tentang Kami | PustakaKitaCeria",
  description:
    "Mengenal visi, misi, dan tim pengelola perpustakaan sekolah/kampus PustakaKitaCeria dalam menumbuhkan kecintaan membaca generasi muda.",
};

export default function TentangPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* Hero Tentang Kami */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="default" className="font-bold">
          Tentang Perpustakaan
        </Badge>
        <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Menghadirkan Kebahagiaan & Keceriaan dalam Membaca
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          PustakaKitaCeria adalah pusat sumber belajar dan literasi digital modern yang memadukan
          kehangatan interaksi sekolah dengan kecanggihan otomasi teknologi web terkini.
        </p>
      </div>

      {/* Visi & Misi Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Compass className="h-6 w-6" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Visi Kami</h2>
          <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
            Menjadi pusat literasi sekolah dan kampus percontohan yang inklusif, ceria, dan unggul
            dalam pemanfaatan teknologi digital guna membentuk generasi pembelajar mandiri yang
            berakhlak mulia dan berwawasan global.
          </p>
        </div>

        <div className="rounded-3xl border border-secondary/30 bg-secondary/10 p-8 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <Award className="h-6 w-6" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Misi Kami</h2>
          <ul className="space-y-2.5 text-sm text-foreground/80">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Menyediakan koleksi buku cetak dan e-book yang relevan, mutakhir, dan bervariasi.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Memudahkan akses sirkulasi pinjam-kembali dengan sistem scan barcode mandiri nir-antrean.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Menciptakan ruang baca fisik dan virtual yang nyaman, ramah siswa, dan bersemangat kolaboratif.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Mendorong kesadaran tenggat waktu secara bersahabat melalui integrasi notifikasi WhatsApp.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Fasilitas Unggulan */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Fasilitas Perpustakaan
          </h2>
          <p className="text-sm text-muted-foreground">
            Sarana lengkap yang kami sediakan untuk menunjang kenyamanan belajar Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Ruang Baca Hening Ber-AC",
              desc: "Kapasitas 80 tempat duduk dengan pencahayaan ramah mata dan colokan listrik di setiap meja.",
            },
            {
              title: "Smart E-Library Kiosk",
              desc: "Tablet layar sentuh untuk mencari katalog OPAC dan membaca e-book di tempat secara cuma-cuma.",
            },
            {
              title: "Barcode Scanner Mandiri",
              desc: "Kamera checkout cepat di pintu keluar tanpa antre di meja sirkulasi staf perpustakaan.",
            },
            {
              title: "Ruang Diskusi & Podcast",
              desc: "Ruangan kedap suara untuk kerja kelompok, bedah buku, dan rekaman audio literasi siswa.",
            },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-2">
              <h3 className="font-heading text-base font-bold text-primary">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pustakawan & Pengelola */}
      <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex justify-center">
            <div className="h-32 w-32 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-4xl font-bold text-primary shadow-inner">
              DA
            </div>
          </div>
          <div className="md:col-span-2 space-y-3">
            <Badge variant="secondary" className="font-bold text-xs">
              Pustakawan Utama
            </Badge>
            <h3 className="font-heading text-2xl font-bold text-foreground">
              Ibu Dewi Anggraini, S.IP.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              &quot;Perpustakaan bukan lagi tempat sunyi yang membosankan dan penuh debu. Di PustakaKitaCeria, kami ingin setiap siswa dan mahasiswa tersenyum saat melangkah masuk, menemukan inspirasi baru di setiap rak, dan menikmati kemudahan teknologi tanpa rasa canggung.&quot;
            </p>
            <p className="text-xs font-semibold text-primary">
              NIP: PK2024001 • Pengalaman Pengelolaan Perpustakaan Sekolah 12+ Tahun
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

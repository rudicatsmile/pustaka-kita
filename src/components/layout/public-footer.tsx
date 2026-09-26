import Link from "next/link";
import { BookOpen, Sparkles, MapPin, Clock, Phone, Mail, MessageCircle } from "lucide-react";
import { SYSTEM_CONFIG } from "@/data/dummy";

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border/80 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Kolom 1: Branding & Visi */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-heading text-lg font-bold text-foreground">
                PustakaKita<span className="text-secondary">Ceria</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mewujudkan pengalaman literasi sekolah & kampus yang ceria, modern, dan mudah diakses di era digital.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>Sistem Sirkulasi & E-Book Terintegrasi</span>
            </div>
          </div>

          {/* Kolom 2: Jam Operasional & Layanan */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold text-foreground uppercase tracking-wider">
              Jam Operasional
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Senin – Jumat</p>
                  <p className="text-xs">07.30 – 16.00 WIB</p>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Clock className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Sabtu</p>
                  <p className="text-xs">08.00 – 13.00 WIB</p>
                </div>
              </div>
              <p className="text-xs text-rose-600 font-medium pt-1">
                *Minggu & Hari Libur Nasional Tutup
              </p>
            </div>
          </div>

          {/* Kolom 3: Navigasi Cepat */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold text-foreground uppercase tracking-wider">
              Tautan Cepat
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/katalog" className="text-muted-foreground hover:text-primary transition-colors">
                  Katalog OPAC Online
                </Link>
              </li>
              <li>
                <Link href="/panduan" className="text-muted-foreground hover:text-primary transition-colors">
                  Panduan Peminjaman
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="text-muted-foreground hover:text-primary transition-colors">
                  Profil Perpustakaan
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="text-muted-foreground hover:text-primary transition-colors">
                  Kontak & Bantuan
                </Link>
              </li>
              <li>
                <Link href="/kebijakan-privasi" className="text-muted-foreground hover:text-primary transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/syarat-ketentuan" className="text-muted-foreground hover:text-primary transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Kontak & WhatsApp */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold text-foreground uppercase tracking-wider">
              Kontak & Lokasi
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-xs">{SYSTEM_CONFIG.libraryAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs">{SYSTEM_CONFIG.libraryPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs">{SYSTEM_CONFIG.libraryEmail}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <MessageCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold text-foreground">
                  WA Bot: {SYSTEM_CONFIG.whatsappSenderNumber}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Baris Bawah */}
        <div className="mt-12 border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} <strong>PustakaKitaCeria</strong>. Hak cipta dilindungi undang-undang.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-primary hover:underline font-semibold">
              Dasbor Anggota
            </Link>
            <span>•</span>
            <Link href="/pustakawan" className="text-primary hover:underline font-semibold">
              Portal Pustakawan
            </Link>
            <span>•</span>
            <Link href="/admin" className="text-primary hover:underline font-semibold">
              Admin Sistem
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

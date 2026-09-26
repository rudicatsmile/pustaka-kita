import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  BookMarked,
  QrCode,
  Bell,
  Star,
  CheckCircle,
  Flame,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicHomeDataAction } from "@/actions/books";
import { HeroSearchForm } from "@/components/home/hero-search-form";

export default async function HomePage() {
  const { stats, books, featuredBook, categories } = await getPublicHomeDataAction();
  const displayBooks = books.slice(0, 4);
  const heroBook = featuredBook || books[0];

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16 sm:py-24">
        {/* Subtle decorative circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 blur-3xl -z-10 rounded-full" />
        <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-secondary/15 blur-2xl -z-10 rounded-full" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Content */}
            <div className="text-center lg:text-left lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5 text-secondary" />
                <span>Perpustakaan Digital Terpadu & Ceria</span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                Jelajahi Ribuan Buku & E-Book Favoritmu dengan{" "}
                <span className="text-primary underline decoration-secondary decoration-wavy decoration-from-font underline-offset-8">
                  Ceria
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Temukan koleksi sastra, sains, sejarah, dan buku pelajaran dengan cepat.
                Pinjam langsung dengan scan barcode kamera, baca e-book di browser, serta nikmati
                pengingat WhatsApp otomatis agar bebas denda.
              </p>

              {/* Fast Search Form Client Component */}
              <HeroSearchForm />

              {/* Quick Tags */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Pencarian Populer:</span>
                {["Laskar Pelangi", "Bumi Manusia", "Filosofi Teras", "Sains & AI"].map(
                  (tag) => (
                    <Link
                      key={tag}
                      href={`/katalog?q=${encodeURIComponent(tag)}`}
                      className="rounded-full bg-muted px-2.5 py-1 font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {tag}
                    </Link>
                  )
                )}
              </div>
            </div>

            {/* Right Card / Visual Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              {heroBook && (
                <div className="relative w-full max-w-md">
                  <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-5">
                    <div className="flex items-center justify-between">
                      <Badge variant="warning" className="font-bold">
                        ⭐ Rekomendasi Pekan Ini
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {heroBook.availableCopies > 0 ? "Stok Tersedia" : "Dapat Direservasi"}
                      </span>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl border shadow-md">
                        <Image
                          src={heroBook.coverUrl}
                          alt={heroBook.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <p className="text-xs font-bold text-primary uppercase tracking-wide">
                          {heroBook.category}
                        </p>
                        <h3 className="font-heading text-lg font-bold text-foreground truncate">
                          {heroBook.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Karya: <strong className="text-foreground">{heroBook.author}</strong>
                        </p>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 pt-1">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span>{heroBook.rating || 4.8}</span>
                          <span className="text-muted-foreground font-normal">
                            ({heroBook.readCount || 10}x dipinjam)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-muted/60 p-3 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lokasi Rak:</span>
                        <strong className="text-foreground font-mono">
                          {heroBook.shelfLocation}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Salinan Tersedia:</span>
                        <strong className="text-emerald-600">
                          {heroBook.availableCopies} dari {heroBook.totalCopies} eksemplar
                        </strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link href={`/katalog/${heroBook.slug}`}>
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          Detail Buku
                        </Button>
                      </Link>
                      <Link href="/dashboard/scan">
                        <Button size="sm" className="w-full text-xs font-bold">
                          Pinjam Sekarang
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Floating Micro Badge */}
                  <div className="absolute -bottom-4 -left-4 rounded-2xl border border-border bg-card p-3 shadow-lg flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-foreground">Self-Checkout Mandiri</p>
                      <p className="text-[10px] text-muted-foreground">Scan & bawa buku dalam 30 detik</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Statistik Prestasi Perpustakaan Dinamis */}
      <section className="border-y border-border/80 bg-muted/40 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
            <div className="space-y-1">
              <p className="font-heading text-3xl sm:text-4xl font-extrabold text-primary">
                {stats.totalBooks.toLocaleString("id-ID")}+
              </p>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Judul Buku Koleksi
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-heading text-3xl sm:text-4xl font-extrabold text-secondary">
                {stats.totalCopies.toLocaleString("id-ID")}+
              </p>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Eksemplar Fisik di Rak
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-heading text-3xl sm:text-4xl font-extrabold text-primary">
                {stats.totalMembers.toLocaleString("id-ID")}+
              </p>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Anggota Aktif Terdaftar
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-heading text-3xl sm:text-4xl font-extrabold text-emerald-600">
                100%
              </p>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                WhatsApp Pengingat Otomatis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Koleksi Pilihan & Buku Terpopuler */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-2">
                <Flame className="h-4 w-4 text-accent" />
                <span>Paling Banyak Dipinjam</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
                Buku Populer Pekan Ini
              </h2>
            </div>
            <Link href="/katalog">
              <Button variant="outline" size="sm" className="font-semibold gap-1.5">
                Lihat Semua Koleksi
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayBooks.map((book) => (
              <Card
                key={book.id}
                className="group flex flex-col overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                  <Image
                    src={book.coverUrl}
                    alt={book.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="shadow-sm font-bold text-[10px]">
                      {book.category}
                    </Badge>
                  </div>
                  {book.bookType === "keduanya" && (
                    <div className="absolute bottom-3 right-3">
                      <Badge variant="default" className="text-[10px] bg-primary/90">
                        E-Book + Fisik
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="flex-1 p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-heading text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {book.author} ({book.publicationYear})
                    </p>
                    <p className="text-xs text-muted-foreground/90 line-clamp-2 mt-2 leading-relaxed">
                      {book.synopsis}
                    </p>
                  </div>

                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-mono">{book.shelfLocation}</span>
                      <span
                        className={`font-semibold ${
                          book.availableCopies > 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {book.availableCopies > 0
                          ? `${book.availableCopies} Tersedia`
                          : "Habis (Bisa Reservasi)"}
                      </span>
                    </div>

                    <Link href={`/katalog/${book.slug}`} className="block w-full">
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                        Lihat Detail Buku
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Kategori Buku Pilihan */}
      <section className="bg-muted/30 py-16 sm:py-20 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Jelajahi Berdasarkan Kategori
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Koleksi terkurasi lengkap untuk menunjang kegiatan belajar siswa, riset mahasiswa,
              dan bacaan santai bermutu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/katalog?kategori=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <Badge variant="muted" className="text-xs">
                      {cat.count} Judul
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.desc}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-primary mt-4 pt-2 border-t border-border/50">
                  <span>Telusuri Koleksi</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Fitur Unggulan "PustakaKitaCeria" */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="default" className="mb-3">
              Kelebihan PustakaKitaCeria
            </Badge>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Teknologi Modern untuk Pengalaman Literasi yang Nyaman
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Dirancang untuk memangkas antrean, mencegah denda menumpuk, dan mempermudah akses
              koleksi digital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm space-y-4 text-center sm:text-left">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">
                Scan Barcode Mandiri
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pinjam atau kembalikan buku mandiri lewat kamera gawai Anda tanpa perlu mengantre di
                meja sirkulasi pustakawan.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm space-y-4 text-center sm:text-left">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/20 text-secondary-foreground">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">
                WhatsApp Pengingat H-1
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dapatkan notifikasi otomatis H-1 sebelum buku jatuh tempo langsung ke WhatsApp Anda,
                sehingga terhindar dari denda keterlambatan.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm space-y-4 text-center sm:text-left">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-accent">
                <BookMarked className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">
                E-Book Reader Terintegrasi
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Buka dan baca file PDF serta EPUB langsung di browser lengkap dengan mode malam,
                zoom, dan penyimpanan halaman otomatis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA Registrasi Anggota */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-secondary" />
            <span>Pendaftaran Mandiri Cepat & Mudah</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
            Belum Menjadi Anggota PustakaKitaCeria?
          </h2>
          <p className="text-base text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
            Daftarkan NIS/NIM Anda sekarang untuk mulai meminjam buku fisik, membaca koleksi e-book,
            dan mendapatkan kartu anggota digital resmi.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/daftar">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto font-bold shadow-md">
                Daftar Anggota Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/masuk">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white text-white hover:bg-white/10"
              >
                Sudah Punya Akun? Masuk
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

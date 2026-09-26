"use client";

import { useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  BookOpen,
  Star,
  MapPin,
  CheckCircle2,
  AlertCircle,
  BookMarked,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DUMMY_BOOKS, DUMMY_CATEGORIES, BookItem } from "@/data/dummy";

export function KatalogPageClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("kategori") || "Semua Kategori";

  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [availabilityFilter, setAvailabilityFilter] = useState<"semua" | "tersedia" | "ebook">("semua");
  const [sortBy, setSortBy] = useState<"terbaru" | "populer" | "judul">("populer");

  const filteredBooks = useMemo(() => {
    return DUMMY_BOOKS.filter((book) => {
      // Filter teks
      const matchSearch =
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase()) ||
        book.isbn.includes(search);

      // Filter kategori
      const matchCategory =
        selectedCategory === "Semua Kategori" || book.category === selectedCategory;

      // Filter ketersediaan
      let matchAvailability = true;
      if (availabilityFilter === "tersedia") {
        matchAvailability = book.availableCopies > 0;
      } else if (availabilityFilter === "ebook") {
        matchAvailability = book.bookType === "ebook" || book.bookType === "keduanya";
      }

      return matchSearch && matchCategory && matchAvailability;
    }).sort((a, b) => {
      if (sortBy === "populer") return b.readCount - a.readCount;
      if (sortBy === "terbaru") return b.publicationYear - a.publicationYear;
      if (sortBy === "judul") return a.title.localeCompare(b.title);
      return 0;
    });
  }, [search, selectedCategory, availabilityFilter, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Katalog Koleksi Pustaka (OPAC)
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Temukan buku cetak, novel sastra Indonesia, ensiklopedia sains, dan e-book digital
          yang siap kamu baca dan pinjam di perpustakaan.
        </p>
      </div>

      {/* Main Search & Filter Bar */}
      <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari judul buku, nama penulis (contoh: Pramoedya), atau nomor ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 text-sm bg-background/50 rounded-2xl"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-11 rounded-2xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="populer">Paling Banyak Dibaca</option>
              <option value="terbaru">Tahun Terbit Terbaru</option>
              <option value="judul">Abjad Judul (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" /> Filter Cepat:
          </span>
          <button
            onClick={() => setAvailabilityFilter("semua")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              availabilityFilter === "semua"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Semua Format
          </button>
          <button
            onClick={() => setAvailabilityFilter("tersedia")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              availabilityFilter === "tersedia"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            🟢 Eksemplar Tersedia
          </button>
          <button
            onClick={() => setAvailabilityFilter("ebook")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              availabilityFilter === "ebook"
                ? "bg-secondary text-secondary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            📱 E-Book Digital
          </button>
        </div>
      </div>

      {/* Grid Layout: Sidebar Categories + Book Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm space-y-3">
            <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <span>Kategori Buku</span>
            </h3>
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => setSelectedCategory("Semua Kategori")}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors text-left ${
                  selectedCategory === "Semua Kategori"
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                <span>Semua Kategori</span>
                <span className="text-[11px] font-mono opacity-80">{DUMMY_BOOKS.length}</span>
              </button>
              {DUMMY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors text-left ${
                    selectedCategory === cat.name
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  <span className="truncate pr-2">{cat.name}</span>
                  <span className="text-[11px] font-mono opacity-80">{cat.count}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Book Cards Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Menampilkan <strong>{filteredBooks.length}</strong> judul buku
            </span>
            {(search || selectedCategory !== "Semua Kategori" || availabilityFilter !== "semua") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("Semua Kategori");
                  setAvailabilityFilter("semua");
                }}
                className="text-xs text-primary font-bold hover:underline"
              >
                Reset Semua Filter
              </button>
            )}
          </div>

          {filteredBooks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-3">
              <BookOpen className="h-12 w-12 text-muted-foreground/60 mx-auto" />
              <h3 className="font-heading text-base font-bold text-foreground">
                Tidak ada buku yang sesuai
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Coba gunakan kata kunci pencarian yang lebih umum atau atur ulang filter kategori kamu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <Card
                  key={book.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-border/70 hover:border-primary/60 transition-all duration-300 hover:shadow-xl bg-card"
                >
                  <div>
                    {/* Cover Image Container */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                      <Image
                        src={book.coverUrl}
                        alt={`Sampul buku ${book.title}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="shadow-md font-bold text-[11px]">
                          {book.category}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold text-amber-400 backdrop-blur-md">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{book.rating}</span>
                      </div>
                    </div>

                    {/* Book Metadata */}
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-heading text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        Oleh <strong className="text-foreground/90">{book.author}</strong>
                      </p>

                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-1">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        <span className="truncate">{book.shelfLocation}</span>
                      </div>
                    </CardContent>
                  </div>

                  {/* Card Bottom CTA */}
                  <CardContent className="p-4 pt-0">
                    <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                      <div>
                        {book.availableCopies > 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                            <CheckCircle2 className="h-3 w-3" />
                            {book.availableCopies} Tersedia
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11px]">
                            <AlertCircle className="h-3 w-3" />
                            Habis Dipinjam
                          </span>
                        )}
                      </div>

                      <div className="flex gap-1.5">
                        <Link href={`/katalog/${book.slug}`}>
                          <Button size="sm" variant="outline" className="text-xs font-bold">
                            Detail
                          </Button>
                        </Link>
                        {book.bookType === "keduanya" || book.bookType === "ebook" ? (
                          <Link href={`/dashboard/ebook/eb-001/baca`}>
                            <Button size="sm" variant="secondary" className="w-full text-xs font-bold gap-1">
                              <BookMarked className="h-3.5 w-3.5" />
                              Baca E-Book
                            </Button>
                          </Link>
                        ) : book.availableCopies > 0 ? (
                          <Link href={`/dashboard/scan`}>
                            <Button size="sm" className="w-full text-xs font-bold">
                              Pinjam
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/katalog/${book.slug}`}>
                            <Button size="sm" variant="outline" className="w-full text-xs font-bold text-amber-700 border-amber-300 bg-amber-50">
                              Reservasi
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

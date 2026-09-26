"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Star,
  MapPin,
  CheckCircle2,
  AlertCircle,
  QrCode,
  BookmarkCheck,
  BookMarked,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getBooksAction } from "@/actions/books";
import { toast } from "@/components/ui/sonner";

export default function MemberKatalogPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Semua");

  useEffect(() => {
    getBooksAction()
      .then((res) => {
        setBooks(res.books);
        setCategories(res.categories);
      })
      .catch((e) => console.error("Gagal memuat katalog buku:", e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = books.filter((b) => {
    const matchQ =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    const matchC = selectedCat === "Semua" || b.category === selectedCat;
    return matchQ && matchC;
  });

  const handleQuickBorrow = (title: string) => {
    toast.success("Membuka Scanner Kamera...", {
      description: `Arahkan kamera ke barcode buku "${title}" untuk memvalidasi pinjaman.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Katalog Buku PustakaKita
          </h1>
          <p className="text-xs text-muted-foreground">
            Cari buku fisik untuk dipinjam mandiri atau baca langsung versi digitalnya dari database.
          </p>
        </div>
        <Link href="/dashboard/scan">
          <Button variant="secondary" size="sm" className="font-bold gap-2">
            <QrCode className="h-4 w-4" />
            Buka Scanner Kamera
          </Button>
        </Link>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul buku, penulis, atau kata kunci..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCat("Semua")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            selectedCat === "Semua"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Semua ({books.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.name)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedCat === c.name
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          Memuat koleksi buku dari database...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border p-12 text-center space-y-2">
          <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="font-semibold text-foreground text-sm">Tidak ada buku yang ditemukan</p>
          <p className="text-xs text-muted-foreground">Coba gunakan kata kunci pencarian yang lain.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((b) => (
            <Card
              key={b.id}
              className="group flex flex-col justify-between overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all"
            >
              <div className="p-5 flex gap-4">
                <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl border bg-muted shadow-sm">
                  {b.coverUrl ? (
                    <Image src={b.coverUrl} alt={b.title} fill className="object-cover" sizes="96px" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                      Buku
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Badge variant="secondary" className="text-[10px] font-bold">
                    {b.category}
                  </Badge>
                  <h3 className="font-heading text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">Karya: {b.author}</p>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{b.rating}</span>
                  </div>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pt-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {b.availableCopies} dari {b.totalCopies} tersedia
                  </p>
                </div>
              </div>

              <div className="border-t border-border bg-muted/20 px-5 py-3 flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {b.shelfLocation}
                </span>

                <div className="flex items-center gap-1.5">
                  <Link href={`/katalog/${b.slug}`}>
                    <Button variant="outline" size="sm" className="text-xs font-bold h-8">
                      Detail
                    </Button>
                  </Link>
                  <Link href="/dashboard/scan">
                    <Button
                      onClick={() => handleQuickBorrow(b.title)}
                      size="sm"
                      className="text-xs font-bold h-8 gap-1 shadow-sm"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      Pinjam
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
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
import { DUMMY_BOOKS, DUMMY_CATEGORIES } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";

export default function MemberKatalogPage() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Semua");

  const filtered = DUMMY_BOOKS.filter((b) => {
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
            Cari buku fisik untuk dipinjam mandiri atau baca langsung versi digitalnya.
          </p>
        </div>
        <Link href="/dashboard/scan">
          <Button variant="secondary" size="sm" className="font-bold gap-2">
            <QrCode className="h-4 w-4" />
            Buka Scanner Kamera
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, penulis, atau topik buku..."
            className="pl-10 text-xs"
          />
        </div>
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="h-11 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="Semua">Semua Kategori</option>
          {DUMMY_CATEGORIES.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((book) => (
          <Card
            key={book.id}
            className="group flex flex-col justify-between overflow-hidden hover:border-primary/40 hover:shadow-md transition-all"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="shadow-sm font-bold text-[10px]">
                  {book.category}
                </Badge>
              </div>
            </div>

            <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-heading text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {book.author} ({book.publicationYear})
                </p>
                <p className="text-xs text-muted-foreground/80 line-clamp-2 mt-2 leading-relaxed">
                  {book.synopsis}
                </p>
              </div>

              <div className="border-t border-border pt-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">{book.shelfLocation}</span>
                  <span
                    className={`font-semibold ${
                      book.availableCopies > 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {book.availableCopies > 0
                      ? `${book.availableCopies} Tersedia`
                      : "Stok Habis"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/katalog/${book.slug}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                      Detail
                    </Button>
                  </Link>
                  {book.availableCopies > 0 ? (
                    <Link href="/dashboard/scan">
                      <Button
                        onClick={() => handleQuickBorrow(book.title)}
                        size="sm"
                        className="w-full text-xs font-bold"
                      >
                        Pinjam
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/katalog/${book.slug}`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs font-bold"
                      >
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
    </div>
  );
}

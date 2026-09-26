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
  Sparkles,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookItem } from "@/types";
import { getBooksAction } from "@/actions/books";
import { semanticSearchBooksAction } from "@/actions/ai-librarian";
import { useEffect } from "react";

interface CategoryOption {
  id: string;
  name: string;
  slug?: string;
  count?: number;
}

interface KatalogPageClientProps {
  initialBooks?: BookItem[];
  initialCategories?: CategoryOption[];
}

export function KatalogPageClient({
  initialBooks = [],
  initialCategories = [],
}: KatalogPageClientProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("kategori") || "Semua Kategori";

  const [books, setBooks] = useState<BookItem[]>(initialBooks);
  const [categories, setCategories] = useState<CategoryOption[]>(initialCategories);

  useEffect(() => {
    if (books.length === 0) {
      getBooksAction().then((res) => {
        setBooks(res.books as any);
        setCategories(res.categories);
      });
    }
  }, [books.length]);

  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [availabilityFilter, setAvailabilityFilter] = useState<"semua" | "tersedia" | "ebook">("semua");
  const [sortBy, setSortBy] = useState<"terbaru" | "populer" | "judul">("populer");

  // AI Semantic Search State
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiMatchedIds, setAiMatchedIds] = useState<string[]>([]);

  const handleAiSearch = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;
    setIsAiSearching(true);
    try {
      const res = await semanticSearchBooksAction(q);
      if (res.success) {
        setAiSummary(res.summary);
        setAiMatchedIds(res.results.map((r: any) => r.id));
      }
    } catch (e) {
      console.error("AI search error:", e);
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleResetAiMode = () => {
    setIsAiMode(false);
    setAiSummary(null);
    setAiMatchedIds([]);
    setSearch("");
  };

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Jika mode AI aktif dan ada hasil pencocokan AI
      if (isAiMode && aiMatchedIds.length > 0) {
        return aiMatchedIds.includes(book.id);
      }

      // Filter teks standar
      const matchSearch =
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase()) ||
        (book.isbn && book.isbn.includes(search));

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
  }, [books, search, selectedCategory, availabilityFilter, sortBy, isAiMode, aiMatchedIds]);

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
        {/* Search Mode Toggle (Standar vs Mode AI) */}
        <div className="flex items-center justify-between pb-1 border-b border-border/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isAiMode) handleResetAiMode();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !isAiMode
                  ? "bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pencarian Kata Kunci
            </button>
            <button
              onClick={() => {
                setIsAiMode(true);
                if (search.trim()) handleAiSearch(search);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isAiMode
                  ? "bg-gradient-to-r from-primary to-teal-700 text-white shadow-md shadow-primary/20"
                  : "text-primary hover:bg-primary/10"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>✨ Mode Cerdas AI (Semantik)</span>
            </button>
          </div>

          {isAiMode && (
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
              AI Powered by Gemini & Hybrid Semantic Engine
            </Badge>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isAiMode) handleAiSearch(search);
            }}
            className="relative flex-1"
          >
            {isAiMode ? (
              <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-pulse" />
            ) : (
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
            <Input
              type="text"
              placeholder={
                isAiMode
                  ? "Tanya AI dalam bahasa alami: 'Buku fisika kuantum pemula', 'Novel misteri yang seru'..."
                  : "Cari judul buku, nama penulis (contoh: Pramoedya), atau nomor ISBN..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-10 pr-24 h-11 text-sm rounded-2xl transition-all ${
                isAiMode
                  ? "bg-primary/5 border-primary/50 text-foreground focus:ring-primary"
                  : "bg-background/50 border-border"
              }`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    if (isAiMode) {
                      setAiSummary(null);
                      setAiMatchedIds([]);
                    }
                  }}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isAiMode && (
                <Button
                  type="submit"
                  disabled={isAiSearching || !search.trim()}
                  size="sm"
                  className="h-8 px-3 text-xs font-bold rounded-xl gap-1 shadow-sm"
                >
                  <Sparkles className="h-3 w-3" />
                  {isAiSearching ? "Menganalisis..." : "Tanya AI"}
                </Button>
              )}
            </div>
          </form>

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

        {/* Quick Filter Badges or AI Suggestions */}
        {isAiMode ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/60 text-xs">
            <span className="text-muted-foreground mr-1 text-[11px] font-semibold">💡 Coba tanyakan topik ini:</span>
            {[
              "Rekomendasi novel fiksi terbaik",
              "Buku pemrograman web pemula",
              "Buku sains tentang antariksa dan kosmos",
              "Buku sejarah pergerakan Indonesia",
            ].map((suggested, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSearch(suggested);
                  handleAiSearch(suggested);
                }}
                className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                {suggested}
              </button>
            ))}
          </div>
        ) : (
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
        )}
      </div>

      {/* AI Smart Insight Banner (If active & returned) */}
      {isAiMode && aiSummary && (
        <div className="p-5 rounded-3xl border border-primary/40 bg-gradient-to-r from-primary/10 via-card to-card shadow-lg space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <span className="font-heading font-extrabold text-sm text-primary flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Rekomendasi Pustakawan AI
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetAiMode}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Kembali ke Semua Koleksi
            </Button>
          </div>
          <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
            {aiSummary}
          </p>
          {aiMatchedIds.length > 0 && (
            <p className="text-[11px] font-mono font-bold text-muted-foreground pt-1">
              Menampilkan {filteredBooks.length} buku teratas yang cocok dengan minat Anda di bawah ini:
            </p>
          )}
        </div>
      )}

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
                <span className="text-[11px] font-mono opacity-80">{books.length}</span>
              </button>
              {categories.map((cat) => {
                const bookCount = cat.count !== undefined 
                  ? cat.count 
                  : books.filter((b) => b.category === cat.name).length;
                return (
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
                    <span className="text-[11px] font-mono opacity-80">{bookCount}</span>
                  </button>
                );
              })}
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

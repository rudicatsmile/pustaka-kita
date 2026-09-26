"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  Search,
  Sparkles,
  Zap,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Database,
  ExternalLink,
  Loader2,
  BookmarkCheck,
  Check,
  X,
  FileText,
  Printer,
  Barcode,
  RefreshCw,
  Library,
  HelpCircle,
  Copy,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import Link from "next/link";
import {
  fetchBibliographicByIsbnAction,
  batchFetchBibliographicAction,
  saveBibliographicToCatalogAction,
  getCopyCatalogingStatsAction,
  type BibliographicRecord,
  type BibliographicSource,
} from "@/actions/copy-cataloging";

const SAMPLE_ISBNS = [
  { label: "Filosofi Teras", isbn: "978-602-06-3317-6" },
  { label: "Laskar Pelangi", isbn: "978-979-3062-79-2" },
  { label: "Sapiens", isbn: "978-602-424-694-5" },
  { label: "Bumi (Tere Liye)", isbn: "978-602-03-2478-4" },
  { label: "Atomic Habits", isbn: "978-602-06-3118-9" },
];

export default function PustakawanCopyCatalogingPage() {
  const [activeTab, setActiveTab] = useState("single");
  const [stats, setStats] = useState({
    totalSearched: 0,
    totalImported: 0,
    timeSavedHours: 0,
    sourcesCount: { perpusnas: 0, loc: 0, google: 0 },
  });

  // Single Search State
  const [searchIsbn, setSearchIsbn] = useState("978-602-06-3317-6");
  const [selectedSource, setSelectedSource] = useState<BibliographicSource>("perpusnas");
  const [isSearching, setIsSearching] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<BibliographicRecord | null>(null);
  const [sourcesList, setSourcesList] = useState<{ source: BibliographicSource; name: string; title: string }[]>([]);
  const [viewMode, setViewMode] = useState<"detail" | "card" | "marc21">("detail");
  const [isImporting, setIsImporting] = useState(false);

  // Batch Mode State
  const [batchInput, setBatchInput] = useState(
    "978-602-06-3317-6\n978-979-3062-79-2\n978-602-424-694-5\n978-602-03-2478-4"
  );
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchResults, setBatchResults] = useState<
    { isbn: string; success: boolean; data?: BibliographicRecord; error?: string; imported?: boolean }[]
  >([]);

  useEffect(() => {
    getCopyCatalogingStatsAction().then(setStats);
    handleExecuteSearch("978-602-06-3317-6");
  }, []);

  const handleExecuteSearch = async (isbnToSearch = searchIsbn) => {
    if (!isbnToSearch.trim()) {
      toast.error("Masukkan nomor ISBN terlebih dahulu.");
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetchBibliographicByIsbnAction(isbnToSearch, selectedSource);
      if (res.success && res.data) {
        setCurrentRecord(res.data);
        setSourcesList(res.sourcesFound);
        toast.success("Data Bibliografi Ditemukan! 📚✨", {
          description: `Sumber: ${res.data.sourceServerName}`,
        });
      } else {
        toast.error("Gagal menemukan data ISBN:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi error koneksi Z39.50:", { description: e.message });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveToCatalog = async () => {
    if (!currentRecord) return;

    setIsImporting(true);
    try {
      const res = await saveBibliographicToCatalogAction({
        record: currentRecord,
        actorName: "Ibu Dewi Anggraini, S.IP. (Pustakawan)",
      });

      if (res.success) {
        toast.success("Buku Berhasil Masuk Katalog Sekolah! 🎉", {
          description: `Eksemplar perdana ditempatkan di ${currentRecord.suggestedShelfCode} (${currentRecord.suggestedShelfName}). Call Number: ${currentRecord.callNumber}`,
        });
      } else {
        toast.error("Gagal menyimpan ke katalog:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setIsImporting(false);
    }
  };

  const handleProcessBatch = async () => {
    const isbns = batchInput
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (isbns.length === 0) {
      toast.error("Masukkan minimal satu nomor ISBN.");
      return;
    }

    setIsProcessingBatch(true);
    try {
      const results = await batchFetchBibliographicAction(isbns);
      setBatchResults(results.map((r) => ({ ...r, imported: false })));
      toast.success(`Batch Selesai: ${results.filter((r) => r.success).length} buku berhasil ditarik!`);
    } catch (e: any) {
      toast.error("Gagal memproses batch:", { description: e.message });
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleImportBatchItem = async (item: { isbn: string; data?: BibliographicRecord }, idx: number) => {
    if (!item.data) return;

    try {
      const res = await saveBibliographicToCatalogAction({
        record: item.data,
      });

      if (res.success) {
        toast.success(`[${item.data.isbn}] "${item.data.title}" berhasil diimpor!`);
        setBatchResults((prev) =>
          prev.map((r, i) => (i === idx ? { ...r, imported: true } : r))
        );
      }
    } catch (e: any) {
      toast.error("Gagal mengimpor buku:", { description: e.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="rounded-3xl border-primary/20 bg-linear-to-r from-primary/10 via-background to-secondary/10 p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="text-xs font-bold gap-1 bg-primary text-primary-foreground">
                <Globe className="h-3.5 w-3.5" />
                Z39.50 &amp; SRU Gateway
              </Badge>
              <Badge variant="success" className="text-xs font-semibold gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Perpusnas KIN Online
              </Badge>
              <Badge variant="outline" className="text-xs font-semibold text-blue-700 dark:text-blue-300 border-blue-400">
                Library of Congress (USA) Active
              </Badge>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Copy Cataloging Otomatis &amp; ISBN Registry
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Katalogisasi 1-detik berstandar perpustakaan nasional dan internasional. Cukup masukkan atau pindai nomor ISBN, sistem secara instan menarik metadata terverifikasi, membuat <strong>Call Number</strong>, menyarankan <strong>Lokasi Rak</strong>, serta memformat <strong>MARC21</strong> secara otomatis.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <Link href="/pustakawan/buku/baru">
              <Button size="sm" variant="outline" className="text-xs font-bold gap-1.5 rounded-2xl w-full">
                <BookOpen className="h-3.5 w-3.5" />
                Buka Form Buku Baru
              </Button>
            </Link>
            <span className="text-[11px] text-muted-foreground text-center">
              Protokol ISO 23950 &amp; Dublin Core
            </span>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Total Pencarian ISBN</span>
          <p className="font-heading text-2xl font-extrabold text-foreground">{stats.totalSearched} Buku</p>
          <p className="text-[10px] text-muted-foreground">Multi-Server Z39.50</p>
        </Card>

        <Card className="rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Berhasil Masuk Katalog</span>
          <p className="font-heading text-2xl font-extrabold text-emerald-600 font-mono">{stats.totalImported} Judul</p>
          <p className="text-[10px] text-emerald-600 font-semibold">Tersimpan di rak fisik</p>
        </Card>

        <Card className="rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Efisiensi Kerja Pustakawan</span>
          <p className="font-heading text-2xl font-extrabold text-primary font-mono">{stats.timeSavedHours} Jam</p>
          <p className="text-[10px] text-muted-foreground">~15 mnt/buku manual vs 2 dtk</p>
        </Card>

        <Card className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Akurasi Metadata
          </span>
          <p className="font-heading text-2xl font-extrabold text-amber-600 font-mono">99.4%</p>
          <p className="text-[10px] text-amber-700/80 dark:text-amber-300 font-bold">Terverifikasi Perpusnas</p>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <TabsList className="grid grid-cols-3 w-full sm:w-96 bg-muted/60 p-1">
            <TabsTrigger value="single" className="gap-1.5 text-xs font-semibold">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Pencarian Tunggal
            </TabsTrigger>
            <TabsTrigger value="batch" className="gap-1.5 text-xs font-semibold">
              <Layers className="h-3.5 w-3.5 text-primary" />
              Batch ISBN
            </TabsTrigger>
            <TabsTrigger value="standards" className="gap-1.5 text-xs font-semibold">
              <Library className="h-3.5 w-3.5 text-cyan-600" />
              Standar MARC21
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PENCARIAN TUNGGAL & INSPEKSI */}
        {/* ========================================================================= */}
        <TabsContent value="single" className="space-y-6">
          {/* ISBN Input & Sample Pills */}
          <Card className="rounded-2xl border border-border p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchIsbn}
                  onChange={(e) => setSearchIsbn(e.target.value)}
                  placeholder="Ketik atau pindai nomor ISBN (contoh: 978-602-06-3317-6)..."
                  className="pl-9 text-xs h-10 rounded-xl font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleExecuteSearch();
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value as BibliographicSource)}
                  className="bg-background border border-border text-xs rounded-xl px-3 py-2 h-10 font-semibold focus:ring-2 focus:ring-primary"
                >
                  <option value="perpusnas">Perpustakaan Nasional RI (KIN)</option>
                  <option value="loc">Library of Congress (USA)</option>
                  <option value="google_books">Google Books Global</option>
                </select>

                <Button
                  onClick={() => handleExecuteSearch()}
                  disabled={isSearching}
                  className="h-10 text-xs font-bold gap-1.5 rounded-xl px-5 shadow-xs"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  {isSearching ? "Menarik..." : "Tarik Data Z39.50"}
                </Button>
              </div>
            </div>

            {/* Quick Sample Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground text-[11px]">Uji Coba ISBN Cepat:</span>
              {SAMPLE_ISBNS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSearchIsbn(s.isbn);
                    handleExecuteSearch(s.isbn);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-[11px] font-medium border border-border transition-all active:scale-95"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Record Display Area */}
          {currentRecord && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-bold font-mono text-primary border-primary/30">
                    ISBN: {currentRecord.isbn}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Terverifikasi dari: <strong>{currentRecord.sourceServerName}</strong>
                  </span>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("detail")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      viewMode === "detail" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                    }`}
                  >
                    Detail Katalog
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("card")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      viewMode === "card" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                    }`}
                  >
                    Kartu 3x5 Inch
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("marc21")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      viewMode === "marc21" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                    }`}
                  >
                    MARC21 Tags
                  </button>
                </div>
              </div>

              {/* VIEW 1: DETAIL KATALOG */}
              {viewMode === "detail" && (
                <Card className="rounded-3xl border border-border p-6 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Cover Preview & Call Number Badge */}
                    <div className="w-full md:w-56 shrink-0 space-y-3">
                      <div className="aspect-3/4 rounded-2xl overflow-hidden border border-border shadow-md bg-muted relative">
                        <img
                          src={currentRecord.coverUrl}
                          alt={currentRecord.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Official Call Number Sticker */}
                      <div className="p-3 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-center space-y-1">
                        <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 block tracking-wider">
                          Nomor Panggil (Call Number)
                        </span>
                        <div className="font-mono text-base font-extrabold text-foreground">
                          {currentRecord.callNumber}
                        </div>
                        <span className="text-[9px] text-muted-foreground block font-mono">
                          DDC: {currentRecord.ddcNumber}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Details */}
                    <div className="flex-1 space-y-4 text-xs">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <Badge variant="secondary" className="text-[10px] font-semibold">
                            {currentRecord.ddcSubject}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-400">
                            Auto-Shelf: {currentRecord.suggestedShelfCode}
                          </Badge>
                        </div>
                        <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground leading-snug">
                          {currentRecord.title}
                        </h2>
                        {currentRecord.subtitle && (
                          <p className="text-muted-foreground text-xs font-medium mt-0.5">
                            {currentRecord.subtitle}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Penulis Utama: <strong className="text-foreground">{currentRecord.author}</strong>
                          {currentRecord.secondaryAuthors &&
                            currentRecord.secondaryAuthors.length > 0 &&
                            ` • Kontributor: ${currentRecord.secondaryAuthors.join(", ")}`}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border">
                        <div>
                          <span className="text-muted-foreground text-[10px] block">Penerbit:</span>
                          <strong className="text-foreground text-xs">{currentRecord.publisher}</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block">Kota &amp; Tahun:</span>
                          <span className="text-foreground font-semibold">
                            {currentRecord.publicationPlace}, {currentRecord.publicationYear}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block">Deskripsi Fisik:</span>
                          <span className="text-foreground font-mono">
                            {currentRecord.pages} hlm ; {currentRecord.dimensions}
                          </span>
                        </div>
                      </div>

                      {/* Synopsis */}
                      <div className="space-y-1">
                        <span className="font-bold text-foreground text-xs block">Sinopsis / Anotasi Resmi:</span>
                        <p className="text-muted-foreground leading-relaxed text-xs">
                          {currentRecord.synopsis}
                        </p>
                      </div>

                      {/* Subject Headings */}
                      <div className="space-y-1.5">
                        <span className="font-bold text-foreground text-xs block">Tajuk Subjek Perpustakaan:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentRecord.subjectHeadings.map((sub, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] bg-muted/40">
                              {sub}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Suggested Shelf & Action Button */}
                      <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-muted-foreground block">
                            Lokasi Lemari Rak Otomatis:
                          </span>
                          <span className="font-bold text-foreground text-xs">
                            {currentRecord.suggestedShelfCode} — {currentRecord.suggestedShelfName}
                          </span>
                        </div>

                        <Button
                          onClick={handleSaveToCatalog}
                          disabled={isImporting}
                          className="font-bold text-xs gap-1.5 px-6 py-2.5 rounded-xl shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkCheck className="h-4 w-4" />}
                          {isImporting ? "Menyimpan ke Database..." : "1-Klik Masukkan ke Katalog Sekolah"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* VIEW 2: KARTU KATALOG TRADISIONAL 3x5 INCH */}
              {viewMode === "card" && (
                <Card className="rounded-3xl border border-border p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-base font-bold text-foreground">
                        Preview Kartu Utama Katalog (Standard 3x5 Inch Library Card)
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Format kartu cetak laci katalog yang menjadi salah satu instrumen borang akreditasi perpustakaan sekolah.
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.print()}
                      className="text-xs gap-1 font-semibold"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Cetak Kartu
                    </Button>
                  </div>

                  {/* 3x5 Card simulation */}
                  <div className="max-w-xl mx-auto p-8 rounded-2xl bg-amber-50/50 dark:bg-stone-900 border-2 border-stone-300 dark:border-stone-700 shadow-md font-mono text-xs text-stone-900 dark:text-stone-100 space-y-4 relative">
                    <div className="absolute top-4 right-6 text-[10px] text-stone-400">
                      3x5 INCH CATALOG CARD
                    </div>

                    {/* Top Call Number */}
                    <div className="w-24 leading-tight font-bold text-stone-800 dark:text-stone-200">
                      <div>{currentRecord.ddcNumber}</div>
                      <div>{currentRecord.author.substring(0, 3).toUpperCase()}</div>
                      <div>{currentRecord.title.charAt(0).toLowerCase()}</div>
                    </div>

                    {/* Body */}
                    <div className="pl-16 space-y-2 leading-relaxed">
                      <p className="font-bold">{currentRecord.author}</p>
                      <p>
                        {currentRecord.title}
                        {currentRecord.subtitle ? ` : ${currentRecord.subtitle}` : ""} / {currentRecord.author}. —{" "}
                        {currentRecord.edition || "Cet. 1"}. — {currentRecord.publicationPlace} : {currentRecord.publisher},{" "}
                        {currentRecord.publicationYear}.
                      </p>
                      <p>
                        {currentRecord.pages} hlm. : ilus. ; {currentRecord.dimensions}.
                      </p>
                      <p>ISBN {currentRecord.isbn}</p>

                      <div className="pt-2 text-[11px] text-stone-600 dark:text-stone-400 space-y-0.5">
                        <p>1. {currentRecord.subjectHeadings.join(".  2. ")}.</p>
                        <p>I. Judul.</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* VIEW 3: FORMAT MARC21 TAGS */}
              {viewMode === "marc21" && (
                <Card className="rounded-3xl border border-border p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-heading text-base font-bold text-foreground">
                      Struktur MARC21 Machine-Readable Cataloging
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Protokol pertukaran metadata standar Library of Congress (LoC) &amp; Perpustakaan Nasional RI.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border overflow-hidden">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-muted/60 border-b border-border text-[10px] uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2.5 w-16">Tag</th>
                          <th className="px-4 py-2.5 w-64">Nama Field MARC21</th>
                          <th className="px-4 py-2.5">Subfield &amp; Konten Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {currentRecord.marc21Fields.map((field, idx) => (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="px-4 py-2 font-bold text-primary">{field.tag}</td>
                            <td className="px-4 py-2 text-muted-foreground">{field.label}</td>
                            <td className="px-4 py-2 text-foreground font-semibold">{field.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: BATCH ISBN IMPORT */}
        {/* ========================================================================= */}
        <TabsContent value="batch" className="space-y-4">
          <Card className="rounded-2xl border border-border p-5 space-y-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="font-heading text-base font-bold text-foreground">
                Katalogisasi Massal (Batch ISBN Import)
              </h3>
              <p className="text-xs text-muted-foreground">
                Salin daftar nomor ISBN dari faktur pengadaan buku BOS (satu ISBN per baris), lalu klik proses untuk menarik seluruh metadata sekaligus.
              </p>
            </div>

            <textarea
              rows={4}
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder="Contoh:&#10;978-602-06-3317-6&#10;978-979-3062-79-2&#10;978-602-424-694-5"
              className="w-full rounded-xl border border-input bg-background p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Maksimal 10 ISBN sekaligus per penarikan batch.
              </span>
              <Button
                onClick={handleProcessBatch}
                disabled={isProcessingBatch}
                className="text-xs font-bold gap-1.5 rounded-xl shadow-xs"
              >
                {isProcessingBatch ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
                {isProcessingBatch ? "Memproses Batch..." : "Proses Batch Z39.50"}
              </Button>
            </div>
          </Card>

          {/* Batch Results Table */}
          {batchResults.length > 0 && (
            <Card className="rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="font-bold text-xs text-foreground">
                  Hasil Penarikan Batch ({batchResults.length} Judul)
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  {batchResults.filter((b) => b.success).length} Berhasil Ditemukan
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-[10px] uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5">ISBN</th>
                      <th className="px-4 py-2.5">Judul Buku &amp; Pengarang</th>
                      <th className="px-4 py-2.5">Penerbit &amp; Tahun</th>
                      <th className="px-4 py-2.5">Call Number</th>
                      <th className="px-4 py-2.5">Rekomendasi Rak</th>
                      <th className="px-4 py-2.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {batchResults.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono font-bold text-primary whitespace-nowrap">
                          {item.isbn}
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          {item.success && item.data ? (
                            <div>
                              <p className="font-bold text-foreground line-clamp-1">{item.data.title}</p>
                              <p className="text-[11px] text-muted-foreground">{item.data.author}</p>
                            </div>
                          ) : (
                            <span className="text-rose-600 font-semibold">{item.error || "Gagal ditarik"}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                          {item.data ? `${item.data.publisher} (${item.data.publicationYear})` : "-"}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-foreground whitespace-nowrap">
                          {item.data ? item.data.callNumber : "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {item.data ? (
                            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-400">
                              {item.data.suggestedShelfCode}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {item.success && item.data && (
                            <Button
                              size="sm"
                              disabled={item.imported}
                              onClick={() => handleImportBatchItem(item, idx)}
                              className={`text-[11px] h-7 px-3 font-bold rounded-lg ${
                                item.imported
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                              }`}
                            >
                              {item.imported ? "Sudah Diimpor" : "Impor"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: STANDAR AKREDITASI PERPUSTAKAAN */}
        {/* ========================================================================= */}
        <TabsContent value="standards" className="space-y-4">
          <Card className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-background to-secondary/10 p-6 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Library className="h-5 w-5 text-primary" />
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Instrumen Borang Akreditasi Nasional: Standar Pengolahan Bahan Pustaka
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Berdasarkan Standar Nasional Perpustakaan (SNP) Bidang Pengolahan Bahan Perpustakaan Sekolah (Komponen 3), sistem PustakaKita Ceria kini memenuhi seluruh indikator akreditasi predikat A:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-card border border-border space-y-1.5">
                <Badge variant="default" className="text-[10px] bg-primary text-primary-foreground font-bold">
                  Indikator 3.1
                </Badge>
                <h4 className="font-bold text-foreground text-xs">Klasifikasi DDC Standar</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Seluruh koleksi diklasifikasikan menggunakan Dewey Decimal Classification edisi ke-23 secara otomatis dan presisi.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border space-y-1.5">
                <Badge variant="default" className="text-[10px] bg-emerald-600 text-white font-bold">
                  Indikator 3.2
                </Badge>
                <h4 className="font-bold text-foreground text-xs">Nomor Panggil (Call Number)</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Formula 3 baris: Kode DDC + 3 Huruf Pengarang + 1 Huruf Judul + c.Nomor Eksemplar tercetak pada stiker punggung buku.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border space-y-1.5">
                <Badge variant="default" className="text-[10px] bg-amber-500 text-white font-bold">
                  Indikator 3.3
                </Badge>
                <h4 className="font-bold text-foreground text-xs">Interoperabilitas MARC21</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Katalog dapat diekspor ke format MARC21 dan terhubung ke Katalog Induk Nasional (KIN) Perpustakaan Nasional RI via OAI-PMH.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

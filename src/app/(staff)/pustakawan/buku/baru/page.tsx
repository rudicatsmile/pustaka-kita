"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookPlus,
  Upload,
  Save,
  FileCheck,
  Sparkles,
  Zap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { createBookAction } from "@/actions/books";
import { getAllCategoriesAction } from "@/actions/admin";
import { getMasterShelvesAction, type MasterShelf } from "@/actions/shelves";
import { fetchBibliographicByIsbnAction } from "@/actions/copy-cataloging";
import { useEffect } from "react";

export default function TambahBukuBaruPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [shelves, setShelves] = useState<MasterShelf[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [isbn, setIsbn] = useState("");
  const [category, setCategory] = useState("Fiksi Indonesia");
  const [year, setYear] = useState("2024");
  const [pages, setPages] = useState("320");
  const [shelfLocation, setShelfLocation] = useState("Rak A-01 (Fiksi)");
  const [bookType, setBookType] = useState<"fisik" | "ebook" | "keduanya">("keduanya");
  const [synopsis, setSynopsis] = useState("");
  const [coverName, setCoverName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingZ3950, setIsFetchingZ3950] = useState(false);

  const handleQuickFetchZ3950 = async () => {
    if (!isbn.trim()) {
      toast.error("Masukkan nomor ISBN terlebih dahulu untuk ditarik otomatis.");
      return;
    }

    setIsFetchingZ3950(true);
    try {
      const res = await fetchBibliographicByIsbnAction(isbn);
      if (res.success && res.data) {
        const d = res.data;
        setTitle(d.title);
        setAuthor(d.author);
        setPublisher(d.publisher);
        setYear(String(d.publicationYear));
        setPages(String(d.pages));
        setSynopsis(d.synopsis);
        setShelfLocation(`${d.suggestedShelfCode} (${d.suggestedShelfName})`);
        toast.success("Data Bibliografi Z39.50 Berhasil Ditarik! ⚡📚", {
          description: `Sumber: ${d.sourceServerName}. Call Number: ${d.callNumber}`,
        });
      } else {
        toast.error("Gagal menarik data ISBN:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi error Z39.50:", { description: e.message });
    } finally {
      setIsFetchingZ3950(false);
    }
  };

  useEffect(() => {
    getAllCategoriesAction().then((cats) => {
      if (cats && cats.length > 0) {
        setCategories(cats);
        setCategory(cats[0].name);
      }
    });
    getMasterShelvesAction().then((shs) => {
      if (shs && shs.length > 0) {
        setShelves(shs);
        setShelfLocation(`${shs[0].code} (${shs[0].name})`);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) {
      toast.error("Harap isi judul buku dan nama penulis!");
      return;
    }

    setIsSaving(true);
    try {
      const res = await createBookAction({
        title,
        author,
        publisher: publisher || "Pustaka Mandiri",
        isbn: isbn || "978-602-000-000-0",
        category,
        publicationYear: parseInt(year) || 2024,
        pages: parseInt(pages) || 250,
        shelfLocation,
        bookType,
        synopsis: synopsis || "Sinopsis buku perpustakaan PustakaKitaCeria.",
        coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
        actorId: "usr-staff-1",
        actorName: "Ibu Dewi Anggraini, S.IP.",
      });

      if (!res.success) {
        toast.error("Gagal menyimpan buku:", { description: res.error });
        setIsSaving(false);
        return;
      }

      toast.success("Buku Baru Berhasil Ditambahkan! 🎉", {
        description: `Bibliografi "${title}" tersimpan dan tercatat di Audit Log. Anda dapat membuat eksemplarnya.`,
      });
      router.push("/pustakawan/buku");
    } catch (err: any) {
      toast.error("Terjadi kesalahan:", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="mb-2">
        <Link
          href="/pustakawan/buku"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Katalog Bibliografi</span>
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Tambah Bibliografi Buku Baru
        </h1>
        <p className="text-xs text-muted-foreground">
          Isi metadata lengkap buku sebelum membuat salinan nomor eksemplar barcode.
        </p>
      </div>

      <Card className="rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul & Penulis */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Judul Buku *</label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Sang Pemimpi"
                className="text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Penulis / Pengarang *</label>
                <Input
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Contoh: Andrea Hirata"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Penerbit</label>
                <Input
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="Contoh: Bentang Pustaka"
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          {/* Kategori, Tahun, ISBN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Kategori Koleksi</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((c: any) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Tahun Terbit</label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">Nomor ISBN</label>
                <button
                  type="button"
                  onClick={handleQuickFetchZ3950}
                  disabled={isFetchingZ3950}
                  className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  title="Tarik otomatis metadata dari Perpusnas RI & LoC"
                >
                  {isFetchingZ3950 ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Zap className="h-2.5 w-2.5 text-amber-500" />}
                  Tarik Z39.50
                </button>
              </div>
              <div className="flex gap-1.5">
                <Input
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="Contoh: 978-602-06-3317-6"
                  className="font-mono text-xs flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleQuickFetchZ3950();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isFetchingZ3950}
                  onClick={handleQuickFetchZ3950}
                  className="h-10 text-xs px-2.5 font-bold gap-1 rounded-xl shrink-0"
                  title="Tarik metadata otomatis dari Perpustakaan Nasional RI"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Tarik</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Lokasi Rak & Tipe Koleksi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">Lokasi Lemari Rak *</label>
                <Link
                  href="/pustakawan/rak"
                  target="_blank"
                  className="text-[10px] text-primary hover:underline font-semibold"
                >
                  Kelola Rak
                </Link>
              </div>
              <select
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono h-10 focus:ring-2 focus:ring-primary"
              >
                {shelves.map((s) => (
                  <option key={s.id} value={`${s.code} (${s.name})`}>
                    {s.code} - {s.name} [{s.currentOccupancy}/{s.capacity} buku]
                  </option>
                ))}
                <option value="Rak Sementara (Belum Dipetakan)">Rak Sementara (Belum Dipetakan)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Jumlah Halaman</label>
              <Input
                type="number"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Tipe Koleksi</label>
              <select
                value={bookType}
                onChange={(e) => setBookType(e.target.value as typeof bookType)}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="fisik">Buku Fisik Saja</option>
                <option value="ebook">E-Book Saja</option>
                <option value="keduanya">Keduanya (Fisik + E-Book)</option>
              </select>
            </div>
          </div>

          {/* Sinopsis */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Sinopsis / Deskripsi Buku</label>
            <textarea
              rows={4}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Tuliskan ringkasan isi buku secara menarik..."
              className="flex w-full rounded-xl border border-input bg-background px-4 py-2.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Upload Cover */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">File Sampul Buku (Cover)</label>
            <div className="relative border-2 border-dashed border-border rounded-2xl p-5 text-center bg-muted/20 hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverName(e.target.files?.[0]?.name || "")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-1 pointer-events-none">
                <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                {coverName ? (
                  <p className="text-xs font-bold text-emerald-600">{coverName}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Unggah foto sampul (JPG/PNG, rasio 3:4 direkomendasikan)
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Link href="/pustakawan/buku">
              <Button type="button" variant="ghost" size="sm" className="font-bold text-xs">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSaving}
              size="lg"
              className="font-bold text-xs shadow-md gap-1.5"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Menyimpan Data..." : "Simpan Bibliografi Buku"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

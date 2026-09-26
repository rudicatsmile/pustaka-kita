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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DUMMY_CATEGORIES } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";
import { createBookAction } from "@/actions/books";

export default function TambahBukuBaruPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [isbn, setIsbn] = useState("");
  const [category, setCategory] = useState(DUMMY_CATEGORIES[0].name);
  const [year, setYear] = useState("2024");
  const [pages, setPages] = useState("320");
  const [shelfLocation, setShelfLocation] = useState("Rak A-01 (Fiksi)");
  const [bookType, setBookType] = useState<"fisik" | "ebook" | "keduanya">("keduanya");
  const [synopsis, setSynopsis] = useState("");
  const [coverName, setCoverName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
                {DUMMY_CATEGORIES.map((c) => (
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
              <label className="text-xs font-bold text-foreground">Nomor ISBN</label>
              <Input
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-..."
                className="font-mono text-xs"
              />
            </div>
          </div>

          {/* Lokasi Rak & Tipe Koleksi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Lokasi Rak Standar</label>
              <Input
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="Rak A-01"
                className="font-mono text-xs"
              />
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

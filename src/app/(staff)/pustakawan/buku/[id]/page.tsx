"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Barcode,
  Plus,
  BookOpen,
  FileText,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { BookCopyItem, BookItem } from "@/types";
import { getBookDetailsAction, updateBookAction, generateBookCopyAction } from "@/actions/books";

export default function EditBukuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [book, setBook] = useState<BookItem | null>(null);
  const [copies, setCopies] = useState<BookCopyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [shelfLocation, setShelfLocation] = useState("");

  // New Copy Dialog
  const [isAddCopyOpen, setIsAddCopyOpen] = useState(false);
  const [newCopyCode, setNewCopyCode] = useState("");
  const [newShelf, setNewShelf] = useState("");
  const [newNote, setNewNote] = useState("Kondisi prima, siap dipinjam");
  const [isCreatingCopy, setIsCreatingCopy] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await getBookDetailsAction(resolvedParams.id);
        if (res.success && res.book) {
          setBook(res.book as BookItem);
          setCopies(res.copies as BookCopyItem[]);
          setTitle(res.book.title);
          setAuthor(res.book.author);
          setShelfLocation(res.book.shelfLocation || "Rak A-01");
          setNewShelf(res.book.shelfLocation || "Rak A-01");
          setNewCopyCode(`PKC-${new Date().getFullYear()}-${res.book.id.slice(0, 4)}-${String((res.copies?.length || 0) + 1).padStart(3, "0")}`);
        } else {
          toast.error("Buku tidak ditemukan");
        }
      } catch (err: any) {
        toast.error("Gagal memuat detail buku: " + (err.message || "Error"));
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.id]);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;
    setIsSaving(true);
    try {
      const res = await updateBookAction({
        id: book.id,
        title,
        author,
        shelfLocation,
      });
      if (res.success) {
        toast.success("Informasi Buku Berhasil Diperbarui! ✅", {
          description: `Perubahan data "${title}" telah disimpan ke sistem dan dicatat pada Audit Log.`,
        });
      } else {
        toast.error("Gagal memperbarui buku", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCopy = async () => {
    if (!book) return;
    setIsCreatingCopy(true);
    try {
      const res = await generateBookCopyAction({
        bookId: book.id,
        shelfLocation: newShelf || shelfLocation,
        conditionNote: newNote,
      });

      if (res.success && res.copy) {
        setCopies((prev) => [
          ...prev,
          {
            id: res.copy.id,
            bookId: book.id,
            bookTitle: book.title,
            copyCode: res.copy.copyCode,
            status: res.copy.status as any,
            shelfLocation: res.copy.shelfLocation || "Rak A-01",
            conditionNote: res.copy.conditionNote || "",
            acquisitionDate: new Date().toISOString().split("T")[0],
            acquisitionPrice: 85000,
          },
        ]);
        setIsAddCopyOpen(false);
        toast.success("Eksemplar Baru Berhasil Digenerate! 🎯", {
          description: `Kode barcode ${res.copy.copyCode} siap ditempel di fisik buku.`,
        });
      } else {
        toast.error("Gagal membuat eksemplar", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setIsCreatingCopy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Memuat data buku...</span>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Buku tidak ditemukan.</p>
        <Link href="/pustakawan/buku" className="mt-4 inline-block text-xs font-bold text-primary">
          Kembali ke Manajemen Buku
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Link
          href="/pustakawan/buku"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Manajemen Buku</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground">{title}</h1>
            <Badge variant="secondary" className="text-xs">
              {book.category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            ISBN: <span className="font-mono font-bold text-foreground">{book.isbn}</span> • Penulis:{" "}
            {author}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="eksemplar" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="info">Info Bibliografi</TabsTrigger>
          <TabsTrigger value="eksemplar">Daftar Eksemplar ({copies.length})</TabsTrigger>
          <TabsTrigger value="ebook">File E-Book</TabsTrigger>
        </TabsList>

        {/* Tab 1: Info Buku */}
        <TabsContent value="info">
          <Card className="rounded-2xl border border-border p-6 shadow-sm">
            <form onSubmit={handleSaveInfo} className="space-y-4 max-w-2xl">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Judul Buku</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-xs" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Penulis</label>
                  <Input value={author} onChange={(e) => setAuthor(e.target.value)} className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Lokasi Rak Standar</label>
                  <Input
                    value={shelfLocation}
                    onChange={(e) => setShelfLocation(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <div className="pt-2">
                <Button type="submit" size="sm" disabled={isSaving} className="font-bold text-xs gap-1.5">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* Tab 2: Daftar Eksemplar */}
        <TabsContent value="eksemplar" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">
                Eksemplar & Barcode Fisik
              </h3>
              <p className="text-xs text-muted-foreground">
                Setiap buku fisik memiliki barcode unik (format: PKC-YYYY-NNN-NNN) untuk scan sirkulasi.
              </p>
            </div>

            <Dialog open={isAddCopyOpen} onOpenChange={setIsAddCopyOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="font-bold text-xs gap-1.5 shadow-sm">
                  <Plus className="h-4 w-4" />
                  Generate Eksemplar Baru
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Eksemplar Buku Baru</DialogTitle>
                  <DialogDescription>
                    Sistem otomatis mengusulkan kode barcode eksemplar selanjutnya untuk &quot;{book.title}&quot;.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Kode Eksemplar Barcode</label>
                    <Input
                      value={newCopyCode}
                      onChange={(e) => setNewCopyCode(e.target.value)}
                      className="font-mono font-bold text-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Lokasi Rak Fisik</label>
                    <Input
                      value={newShelf}
                      onChange={(e) => setNewShelf(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Catatan Kondisi Fisik</label>
                    <Input
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAddCopyOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleAddCopy} disabled={isCreatingCopy} className="font-bold">
                    {isCreatingCopy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Eksemplar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Kode Eksemplar</TableHead>
                  <TableHead className="text-xs">Lokasi Rak</TableHead>
                  <TableHead className="text-xs">Kondisi</TableHead>
                  <TableHead className="text-xs">Tanggal Perolehan</TableHead>
                  <TableHead className="text-xs text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {copies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-6">
                      Belum ada salinan eksemplar fisik untuk buku ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  copies.map((copy) => (
                    <TableRow key={copy.id}>
                      <TableCell className="font-mono font-bold text-xs text-primary flex items-center gap-1.5">
                        <Barcode className="h-4 w-4" />
                        {copy.copyCode}
                      </TableCell>
                      <TableCell className="text-xs">{copy.shelfLocation}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{copy.conditionNote}</TableCell>
                      <TableCell className="font-mono text-xs">{copy.acquisitionDate}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={copy.status === "tersedia" ? "success" : "warning"}
                          className="text-[10px]"
                        >
                          {copy.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Tab 3: File E-Book */}
        <TabsContent value="ebook">
          <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4 max-w-2xl">
            <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>File Digital (Supabase Storage)</span>
            </h3>
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format File:</span>
                <Badge variant="secondary" className="text-[10px] font-bold">
                  PDF Digital
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ukuran Berkas:</span>
                <span className="font-mono font-bold">8.4 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Akses Keamanan:</span>
                <span className="text-emerald-600 font-bold">Supabase Signed URL (Private 1 Jam)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Link href={`/katalog/${book.slug}`}>
                <Button size="sm" variant="outline" className="text-xs font-bold gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Lihat di Katalog
                </Button>
              </Link>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => toast.info("Simulasi hapus file e-book berhasil.")}
                className="text-xs font-bold gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Ganti File E-Book
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

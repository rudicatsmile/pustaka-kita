"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Barcode,
  Plus,
  BookOpen,
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { DUMMY_BOOKS, DUMMY_COPIES, BookCopyItem } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";

export default function EditBukuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const book = DUMMY_BOOKS.find((b) => b.id === resolvedParams.id) || DUMMY_BOOKS[0];

  const [copies, setCopies] = useState<BookCopyItem[]>(
    DUMMY_COPIES.filter((c) => c.bookId === book.id)
  );

  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [shelfLocation, setShelfLocation] = useState(book.shelfLocation);

  // New Copy Dialog
  const [isAddCopyOpen, setIsAddCopyOpen] = useState(false);
  const [newCopyCode, setNewCopyCode] = useState(
    `PKC-2024-001-00${copies.length + 1}`
  );
  const [newShelf, setNewShelf] = useState(book.shelfLocation);
  const [newNote, setNewNote] = useState("Kondisi prima, baru dicap stempel perpustakaan");

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Informasi Buku Berhasil Diperbarui! ✅", {
      description: `Perubahan data "${title}" telah disimpan ke sistem dan dicatat pada Audit Log.`,
    });
  };

  const handleAddCopy = () => {
    const newCopy: BookCopyItem = {
      id: `copy-mock-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      copyCode: newCopyCode,
      status: "tersedia",
      shelfLocation: newShelf,
      conditionNote: newNote,
      acquisitionDate: new Date().toISOString().split("T")[0],
      acquisitionPrice: 85000,
    };
    setCopies((prev) => [...prev, newCopy]);
    setIsAddCopyOpen(false);
    toast.success("Eksemplar Baru Berhasil Digenerate! 🎯", {
      description: `Kode barcode ${newCopyCode} siap ditempel di fisik buku.`,
    });
  };

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
                <Button type="submit" size="sm" className="font-bold text-xs gap-1.5">
                  <Save className="h-4 w-4" />
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
                Setiap buku fisik memiliki barcode unik (format: PKC-YYYY-NNN-NNN) untuk scan mandiri.
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
                  <Button onClick={handleAddCopy} className="font-bold">
                    Simpan Eksemplar
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
                {copies.map((copy) => (
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
                ))}
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
              <Link href="/dashboard/ebook/eb-001/baca">
                <Button size="sm" variant="outline" className="text-xs font-bold gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Pratinjau Reader
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

"use client";

import { useState } from "react";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { DUMMY_CATEGORIES } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";

export default function ManajemenKategoriPage() {
  const [categories, setCategories] = useState(DUMMY_CATEGORIES);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  const handleAddCategory = () => {
    if (!newCatName.trim()) {
      toast.error("Nama kategori wajib diisi!");
      return;
    }
    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug: newCatName.toLowerCase().replace(/\s+/g, "-"),
      count: 0,
      desc: newCatDesc.trim() || "Kategori koleksi baru perpustakaan.",
    };
    setCategories((prev) => [...prev, newCat]);
    setIsAddOpen(false);
    setNewCatName("");
    setNewCatDesc("");
    toast.success("Kategori Baru Berhasil Dibuat! 📚", {
      description: `Kategori "${newCat.name}" telah ditambahkan ke sistem (Audit Log tercatat).`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success("Kategori Dihapus", {
      description: `Kategori "${name}" telah dihapus.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Manajemen Kategori Buku
          </h1>
          <p className="text-xs text-muted-foreground">
            Kelola klasifikasi bidang ilmu dan pengelompokan buku pada katalog OPAC.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="font-bold text-xs gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              Tambah Kategori Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kategori Koleksi Baru</DialogTitle>
              <DialogDescription>
                Masukkan nama kategori dan penjelasan singkat pengelompokan buku.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Nama Kategori *</label>
                <Input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Contoh: Seni & Arsitektur"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Deskripsi Kategori</label>
                <Input
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Buku-buku tentang desain, seni rupa, dan arsitektur."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddCategory} className="font-bold">
                Simpan Kategori
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Nama Kategori</TableHead>
              <TableHead className="text-xs">Slug URL</TableHead>
              <TableHead className="text-xs">Deskripsi</TableHead>
              <TableHead className="text-xs">Jumlah Judul</TableHead>
              <TableHead className="text-xs text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-heading font-bold text-xs text-foreground">
                  {c.name}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{c.slug}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-sm truncate">
                  {c.desc}
                </TableCell>
                <TableCell className="font-mono text-xs font-bold text-primary">
                  {c.count} Judul
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => handleDelete(c.id, c.name)}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Hapus
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

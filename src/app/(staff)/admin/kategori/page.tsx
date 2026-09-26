"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "@/components/ui/sonner";
import { CategoryItem } from "@/types";
import {
  getAllCategoriesAction,
  createCategoryAction,
  deleteCategoryAction,
} from "@/actions/admin";

export default function ManajemenKategoriPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadCategories() {
    setIsLoading(true);
    try {
      const data = await getAllCategoriesAction();
      setCategories(data as CategoryItem[]);
    } catch (e: any) {
      toast.error("Gagal memuat kategori: " + (e.message || "Error"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      toast.error("Nama kategori wajib diisi!");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createCategoryAction({
        name: newCatName.trim(),
        desc: newCatDesc.trim(),
      });

      if (res.success && res.category) {
        setCategories((prev) => [...prev, res.category as CategoryItem]);
        setIsAddOpen(false);
        setNewCatName("");
        setNewCatDesc("");
        toast.success("Kategori Baru Berhasil Dibuat! 📚", {
          description: `Kategori "${res.category.name}" telah ditambahkan ke sistem (Audit Log tercatat).`,
        });
      } else {
        toast.error("Gagal menambah kategori:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const res = await deleteCategoryAction(id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        toast.success("Kategori Dihapus", {
          description: `Kategori "${name}" telah dihapus.`,
        });
      } else {
        toast.error("Gagal menghapus kategori:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    }
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

        <div className="flex items-center gap-2">
          <Button
            onClick={loadCategories}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Segarkan
          </Button>

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
                <Button onClick={handleAddCategory} disabled={isSubmitting} className="font-bold">
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Simpan Kategori"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-xs text-muted-foreground">Memuat data kategori...</span>
          </div>
        ) : (
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
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">
                    Belum ada kategori buku terdaftar.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((c) => (
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
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

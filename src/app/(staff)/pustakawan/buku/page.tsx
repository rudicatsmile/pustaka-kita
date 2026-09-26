"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Barcode,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DUMMY_BOOKS, DUMMY_CATEGORIES, BookItem } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";

export default function ManajemenBukuPage() {
  const [books, setBooks] = useState<BookItem[]>(DUMMY_BOOKS);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const filteredBooks = books.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "Semua" || b.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleDelete = (id: string, title: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    toast.success("Buku Berhasil Dihapus", {
      description: `Buku "${title}" telah dihapus dari katalog bibliografi (Audit Log tercatat).`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Katalog Bibliografi Buku
          </h1>
          <p className="text-xs text-muted-foreground">
            Kelola data master judul buku, pengarang, penerbit, dan tipe koleksi perpustakaan.
          </p>
        </div>

        <Link href="/pustakawan/buku/baru">
          <Button size="sm" className="font-bold text-xs gap-1.5 shadow-sm">
            <BookPlus className="h-4 w-4" />
            Tambah Buku Baru
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
            placeholder="Cari judul buku, penulis, atau nomor ISBN..."
            className="pl-10 text-xs"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
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

      {/* Books DataTable */}
      <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Sampul & Judul Buku</TableHead>
              <TableHead className="text-xs">Kategori</TableHead>
              <TableHead className="text-xs">ISBN</TableHead>
              <TableHead className="text-xs">Tahun</TableHead>
              <TableHead className="text-xs">Eksemplar</TableHead>
              <TableHead className="text-xs">Tipe</TableHead>
              <TableHead className="text-xs text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBooks.map((book) => (
              <TableRow key={book.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg border shadow-xs bg-muted">
                      <Image src={book.coverUrl} alt={book.title} fill className="object-cover" sizes="40px" />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-xs text-foreground line-clamp-1">
                        {book.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{book.author}</p>
                      <p className="text-[10px] text-primary font-mono">{book.shelfLocation}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px]">
                    {book.category}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{book.isbn}</TableCell>
                <TableCell className="font-mono text-xs">{book.publicationYear}</TableCell>
                <TableCell className="text-xs">
                  <span className="font-bold text-emerald-600">{book.availableCopies}</span>
                  <span className="text-muted-foreground"> / {book.totalCopies} Ada</span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={book.bookType === "keduanya" ? "default" : "outline"}
                    className="text-[10px] uppercase"
                  >
                    {book.bookType}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/pustakawan/buku/${book.id}`} className="cursor-pointer gap-2">
                          <Barcode className="h-3.5 w-3.5 text-primary" />
                          <span>Kelola Eksemplar</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/pustakawan/buku/${book.id}`} className="cursor-pointer gap-2">
                          <Edit className="h-3.5 w-3.5 text-secondary" />
                          <span>Edit Buku</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(book.id, book.title)}
                        className="text-rose-600 cursor-pointer gap-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Hapus</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

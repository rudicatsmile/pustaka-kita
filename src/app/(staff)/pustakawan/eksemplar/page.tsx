"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Barcode,
  Search,
  Filter,
  Printer,
  Sparkles,
  Layers,
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
import { DUMMY_COPIES, BookCopyItem } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";

export default function ManajemenEksemplarPage() {
  const [copies, setCopies] = useState<BookCopyItem[]>(DUMMY_COPIES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");

  const filtered = copies.filter((c) => {
    const matchSearch =
      c.copyCode.toLowerCase().includes(search.toLowerCase()) ||
      c.bookTitle.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "semua" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handlePrintBarcode = (code: string) => {
    toast.info("Pratinjau Label Barcode Fisik", {
      description: `Format barcode ${code} siap dicetak ke printer label.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Daftar Eksemplar & Barcode Fisik
          </h1>
          <p className="text-xs text-muted-foreground">
            Pemantauan seluruh salinan buku, kode barcode sirkulasi, status, dan penempatan rak.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode eksemplar (PKC-...) atau judul buku..."
            className="pl-10 text-xs font-mono"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="semua">Semua Status</option>
          <option value="tersedia">Tersedia di Rak</option>
          <option value="dipinjam">Sedang Dipinjam</option>
          <option value="rusak">Rusak / Perbaikan</option>
          <option value="hilang">Hilang</option>
        </select>
      </div>

      {/* DataTable Eksemplar */}
      <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Kode Barcode Eksemplar</TableHead>
              <TableHead className="text-xs">Judul Bibliografi</TableHead>
              <TableHead className="text-xs">Lokasi Rak</TableHead>
              <TableHead className="text-xs">Harga Perolehan</TableHead>
              <TableHead className="text-xs">Status Fisik</TableHead>
              <TableHead className="text-xs text-right">Label Barcode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((copy) => (
              <TableRow key={copy.id}>
                <TableCell className="font-mono font-bold text-xs text-primary flex items-center gap-2">
                  <Barcode className="h-4 w-4" />
                  <span>{copy.copyCode}</span>
                </TableCell>
                <TableCell className="text-xs font-semibold text-foreground">
                  {copy.bookTitle}
                </TableCell>
                <TableCell className="text-xs font-mono">{copy.shelfLocation}</TableCell>
                <TableCell className="text-xs font-mono">
                  Rp {copy.acquisitionPrice.toLocaleString("id-ID")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={copy.status === "tersedia" ? "success" : "warning"}
                    className="text-[10px]"
                  >
                    {copy.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => handlePrintBarcode(copy.copyCode)}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs font-bold gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Cetak Label
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

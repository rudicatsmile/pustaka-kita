"use client";

import Link from "next/link";
import {
  ArrowLeftRight,
  BookDown,
  BookUp,
  Search,
  Barcode,
  User,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DUMMY_LOANS } from "@/data/dummy";

export default function SirkulasiHubPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Pusat Sirkulasi Peminjaman & Pengembalian
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Pilih jenis transaksi untuk memproses buku menggunakan pemindaian barcode atau input manual.
        </p>
      </div>

      {/* Two Big Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pinjam Card */}
        <div className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8 shadow-sm hover:border-primary hover:shadow-md transition-all space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <BookDown className="h-7 w-7" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              Transaksi Peminjaman Baru
            </h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Pilih anggota berdasarkan NIS/NIM, scan eksemplar buku, dan sistem akan mengesahkan
              jatuh tempo 7 hari ke depan secara otomatis.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/pustakawan/sirkulasi/pinjam">
              <Button size="lg" className="w-full font-bold gap-2">
                <span>Buka Formulir Peminjaman</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Kembali Card */}
        <div className="rounded-3xl border-2 border-secondary/30 bg-gradient-to-br from-secondary/15 via-card to-card p-8 shadow-sm hover:border-secondary hover:shadow-md transition-all space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-md">
            <BookUp className="h-7 w-7" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              Transaksi Pengembalian Buku
            </h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Scan barcode buku yang dikembalikan siswa. Sistem akan otomatis mendeteksi status
              keterlambatan dan menghitung tagihan denda jika ada.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/pustakawan/sirkulasi/kembali">
              <Button size="lg" variant="secondary" className="w-full font-bold gap-2">
                <span>Buka Formulir Pengembalian</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabel Sirkulasi Terkini */}
      <div className="space-y-4">
        <h3 className="font-heading text-lg font-bold text-foreground">
          Arsip Sirkulasi Terkini
        </h3>
        <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Nama Anggota</TableHead>
                <TableHead className="text-xs">NIS/NIM</TableHead>
                <TableHead className="text-xs">Judul Buku</TableHead>
                <TableHead className="text-xs">Kode Eksemplar</TableHead>
                <TableHead className="text-xs">Tgl Pinjam</TableHead>
                <TableHead className="text-xs">Jatuh Tempo</TableHead>
                <TableHead className="text-xs text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DUMMY_LOANS.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-heading font-bold text-xs">{l.memberName}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {l.memberNisNim}
                  </TableCell>
                  <TableCell className="text-xs">{l.bookTitle}</TableCell>
                  <TableCell className="font-mono text-xs text-primary">{l.copyCode}</TableCell>
                  <TableCell className="font-mono text-xs">{l.borrowedAt}</TableCell>
                  <TableCell className="font-mono text-xs">{l.dueDate}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        l.status === "terlambat"
                          ? "destructive"
                          : l.status === "dikembalikan"
                          ? "success"
                          : "warning"
                      }
                      className="text-[10px]"
                    >
                      {l.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import {
  ArrowLeftRight,
  BookPlus,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { DUMMY_LOANS, DUMMY_FINES, DUMMY_BOOKS } from "@/data/dummy";

export default function DasborPustakawanPage() {
  const recentLoans = DUMMY_LOANS.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="info" className="font-bold text-xs uppercase">
              Operasional Harian
            </Badge>
            <span className="text-xs text-muted-foreground">Meja Sirkulasi Perpustakaan</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
            Dasbor Layanan Pustakawan
          </h1>
          <p className="text-xs text-muted-foreground">
            Pantau sirkulasi buku, verifikasi transfer denda, dan kelola koleksi secara langsung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/pustakawan/sirkulasi/pinjam">
            <Button size="sm" className="font-bold text-xs gap-1.5 shadow-sm">
              <ArrowLeftRight className="h-4 w-4" />
              Sirkulasi Pinjam
            </Button>
          </Link>
          <Link href="/pustakawan/buku/baru">
            <Button size="sm" variant="secondary" className="font-bold text-xs gap-1.5 shadow-sm">
              <BookPlus className="h-4 w-4" />
              Tambah Buku Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Statistik Utama Hari Ini */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="rounded-2xl border border-border p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Peminjaman Hari Ini</span>
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="font-heading text-3xl font-extrabold text-foreground">8</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +2 dibanding kemarin</p>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Pengembalian Hari Ini</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="font-heading text-3xl font-extrabold text-foreground">12</p>
            <p className="text-[11px] text-muted-foreground mt-1">100% tepat waktu</p>
          </div>
        </Card>

        <Card className="rounded-2xl border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
              Keterlambatan Aktif
            </span>
            <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="font-heading text-3xl font-extrabold text-rose-700">2</p>
            <p className="text-[11px] text-rose-600 font-semibold mt-1">Total denda: Rp 7.000</p>
          </div>
        </Card>

        <Card className="rounded-2xl border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Verifikasi Denda Manual
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="font-heading text-3xl font-extrabold text-amber-800">1</p>
            <Link
              href="/pustakawan/denda"
              className="text-[11px] text-primary hover:underline font-bold mt-1 inline-block"
            >
              Periksa Bukti Transfer →
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-3">
          <h3 className="font-heading text-base font-bold text-foreground">
            Sirkulasi Cepat (Scan Barcode)
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Scan barcode buku dan NIS/NIM anggota untuk proses peminjaman atau pengembalian kurang
            dari 30 detik.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link href="/pustakawan/sirkulasi/pinjam">
              <Button size="sm" className="w-full text-xs font-bold">
                Pinjam Buku
              </Button>
            </Link>
            <Link href="/pustakawan/sirkulasi/kembali">
              <Button size="sm" variant="secondary" className="w-full text-xs font-bold">
                Kembalikan
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground">
            Verifikasi Denda Transfer
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Periksa slip bukti transfer bank yang diunggah anggota untuk denda keterlambatan (1
            menunggu persetujuan).
          </p>
          <div className="pt-2">
            <Link href="/pustakawan/denda">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                Buka Panel Verifikasi Denda
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground">
            Laporan & Grafik Sirkulasi
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Lihat analitik buku terpopuler, rekapitulasi keterlambatan, dan ekspor data sirkulasi ke
            format PDF/CSV.
          </p>
          <div className="pt-2">
            <Link href="/pustakawan/laporan">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                Lihat Laporan Bulanan
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabel Transaksi Terkini */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Aktivitas Sirkulasi Terkini
            </h3>
            <p className="text-xs text-muted-foreground">
              Daftar transaksi peminjaman dan pengembalian buku yang baru saja berlangsung.
            </p>
          </div>
          <Link href="/pustakawan/sirkulasi">
            <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">
              Lihat Seluruh Sirkulasi →
            </Button>
          </Link>
        </div>

        <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Peminjam (NIS/NIM)</TableHead>
                <TableHead className="text-xs">Judul Buku</TableHead>
                <TableHead className="text-xs">Kode Eksemplar</TableHead>
                <TableHead className="text-xs">Tgl Pinjam</TableHead>
                <TableHead className="text-xs">Jatuh Tempo</TableHead>
                <TableHead className="text-xs text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>
                    <p className="font-heading font-bold text-xs text-foreground">
                      {loan.memberName}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">{loan.memberNisNim}</p>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">
                    {loan.bookTitle}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-primary">{loan.copyCode}</TableCell>
                  <TableCell className="font-mono text-xs">{loan.borrowedAt}</TableCell>
                  <TableCell className="font-mono text-xs">{loan.dueDate}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        loan.status === "terlambat"
                          ? "destructive"
                          : loan.status === "dikembalikan"
                          ? "success"
                          : "warning"
                      }
                      className="text-[10px]"
                    >
                      {loan.status}
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

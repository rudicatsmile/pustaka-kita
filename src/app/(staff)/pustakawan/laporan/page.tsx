"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  FileSpreadsheet,
  FileText,
  BookOpen,
  Receipt,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { DUMMY_BOOKS, DUMMY_LOANS } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";

export default function LaporanPage() {
  const [period, setPeriod] = useState("november-2024");

  const handleExportPDF = () => {
    toast.success("Mengekspor Laporan ke PDF 📄", {
      description: "File Laporan-Perpustakaan-PustakaKitaCeria.pdf berhasil digenerate.",
    });
  };

  const handleExportCSV = () => {
    toast.success("Mengekspor Data ke CSV 📊", {
      description: "File rekapitulasi-sirkulasi.csv berhasil diunduh.",
    });
  };

  // Mock chart data
  const monthlyStats = [
    { day: "Senin", pinjam: 18, kembali: 14 },
    { day: "Selasa", pinjam: 24, kembali: 20 },
    { day: "Rabu", pinjam: 30, kembali: 22 },
    { day: "Kamis", pinjam: 21, kembali: 19 },
    { day: "Jumat", pinjam: 15, kembali: 25 },
    { day: "Sabtu", pinjam: 8, kembali: 12 },
  ];

  const maxVal = Math.max(...monthlyStats.map((s) => Math.max(s.pinjam, s.kembali)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Laporan & Analitik Perpustakaan
          </h1>
          <p className="text-xs text-muted-foreground">
            Rekapitulasi sirkulasi, keterlambatan, buku terpopuler, dan pendapatan denda operasional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="font-bold text-xs gap-1.5">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Ekspor CSV
          </Button>
          <Button onClick={handleExportPDF} size="sm" className="font-bold text-xs gap-1.5 shadow-sm">
            <Download className="h-4 w-4" />
            Ekspor PDF
          </Button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Total Peminjaman Bulan Ini</span>
          <p className="font-heading text-2xl font-extrabold text-foreground">116 Buku</p>
          <p className="text-[11px] text-emerald-600 font-bold">↑ +14% dari bulan lalu</p>
        </Card>

        <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Rasio Pengembalian Tepat Waktu</span>
          <p className="font-heading text-2xl font-extrabold text-emerald-600">92.4%</p>
          <p className="text-[11px] text-muted-foreground">Target institusi: &gt; 90%</p>
        </Card>

        <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Pendapatan Denda Terkumpul</span>
          <p className="font-heading text-2xl font-extrabold text-primary">Rp 48.000</p>
          <p className="text-[11px] text-muted-foreground">Dialokasikan untuk pemeliharaan buku</p>
        </Card>

        <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Anggota Paling Aktif</span>
          <p className="font-heading text-lg font-bold text-foreground">Raka Aditya P.</p>
          <p className="text-[11px] text-muted-foreground">21 kali peminjaman buku</p>
        </Card>
      </div>

      {/* Sub Laporan Tabs */}
      <Tabs defaultValue="peminjaman" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-lg">
          <TabsTrigger value="peminjaman">1. Tren Sirkulasi</TabsTrigger>
          <TabsTrigger value="koleksi">2. Buku Terpopuler</TabsTrigger>
          <TabsTrigger value="keterlambatan">3. Rekap Denda</TabsTrigger>
        </TabsList>

        {/* 1. Tren Sirkulasi Chart */}
        <TabsContent value="peminjaman" className="space-y-4">
          <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">
                  Statistik Volume Sirkulasi Mingguan
                </h3>
                <p className="text-xs text-muted-foreground">
                  Perbandingan buku dipinjam (Teal) dan buku dikembalikan (Amber) per hari.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-primary">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                  Dipinjam
                </span>
                <span className="flex items-center gap-1.5 text-secondary">
                  <span className="h-3 w-3 rounded-full bg-secondary" />
                  Dikembalikan
                </span>
              </div>
            </div>

            {/* Visual Bar Chart Component */}
            <div className="h-64 flex items-end justify-between gap-4 pt-8 px-2 border-b border-border pb-2">
              {monthlyStats.map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex justify-center items-end gap-1.5 h-48">
                    {/* Bar Pinjam */}
                    <div
                      className="w-1/2 max-w-[28px] rounded-t-lg bg-primary hover:opacity-90 transition-all relative group"
                      style={{ height: `${(item.pinjam / maxVal) * 100}%` }}
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.pinjam}
                      </span>
                    </div>
                    {/* Bar Kembali */}
                    <div
                      className="w-1/2 max-w-[28px] rounded-t-lg bg-secondary hover:opacity-90 transition-all relative group"
                      style={{ height: `${(item.kembali / maxVal) * 100}%` }}
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.kembali}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{item.day}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* 2. Buku Terpopuler */}
        <TabsContent value="koleksi">
          <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Peringkat</TableHead>
                  <TableHead className="text-xs">Judul Buku</TableHead>
                  <TableHead className="text-xs">Penulis</TableHead>
                  <TableHead className="text-xs">Kategori</TableHead>
                  <TableHead className="text-xs">Total Dipinjam</TableHead>
                  <TableHead className="text-xs text-right">Rating Pembaca</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DUMMY_BOOKS.map((b, idx) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-heading font-black text-sm text-primary">
                      #{idx + 1}
                    </TableCell>
                    <TableCell className="font-heading font-bold text-xs text-foreground">
                      {b.title}
                    </TableCell>
                    <TableCell className="text-xs">{b.author}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {b.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold">
                      {b.readCount} kali
                    </TableCell>
                    <TableCell className="text-right font-bold text-amber-500 text-xs">
                      ⭐ {b.rating} / 5.0
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* 3. Rekap Denda */}
        <TabsContent value="keterlambatan">
          <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground">
              Rekapitulasi Denda Keterlambatan Bulan Berjalan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                <span className="text-muted-foreground">Total Tagihan Terbit:</span>
                <p className="font-mono text-lg font-bold text-foreground">Rp 55.000</p>
              </div>
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 p-4 space-y-1">
                <span className="text-emerald-700">Telah Diverifikasi Lunas:</span>
                <p className="font-mono text-lg font-bold text-emerald-700">Rp 48.000</p>
              </div>
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 p-4 space-y-1">
                <span className="text-rose-700">Belum Dibayar / Tertunggak:</span>
                <p className="font-mono text-lg font-bold text-rose-700">Rp 7.000</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

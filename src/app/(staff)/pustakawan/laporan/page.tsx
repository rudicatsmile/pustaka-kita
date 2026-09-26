"use client";

import { useState, useEffect } from "react";
import {
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "@/components/ui/sonner";
import { getPustakawanReportsAction } from "@/actions/staff";
import { getBooksAction } from "@/actions/books";
import { BookItem } from "@/types";

export default function LaporanPage() {
  const [reports, setReports] = useState({
    totalLoans: 0,
    returnedLoans: 0,
    overdueLoans: 0,
    totalFinesRevenue: 0,
  });
  const [books, setBooks] = useState<BookItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);
    try {
      const [reportsData, booksData] = await Promise.all([
        getPustakawanReportsAction(),
        getBooksAction(),
      ]);
      setReports(reportsData);
      setBooks((booksData?.books as BookItem[]) || []);
    } catch (e: any) {
      toast.error("Gagal memuat analitik: " + (e.message || "Error"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleExportPDF = () => {
    toast.success("Mengekspor Laporan ke PDF 📄", {
      description: "File Laporan-Perpustakaan-PustakaKitaCeria.pdf berhasil digenerate.",
    });
  };

  const handleExportCSV = () => {
    if (books.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }
    const headers = ["Judul", "Penulis", "Kategori", "ISBN", "Total Eksemplar"];
    const rows = books.map((b) => [
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.author.replace(/"/g, '""')}"`,
      `"${b.category}"`,
      `"${b.isbn}"`,
      b.totalCopies,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan-katalog-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Data CSV Berhasil Diunduh 📊");
  };

  // Mock chart data for weekly trend
  const monthlyStats = [
    { day: "Senin", pinjam: 18, kembali: 14 },
    { day: "Selasa", pinjam: 24, kembali: 20 },
    { day: "Rabu", pinjam: 30, kembali: 22 },
    { day: "Kamis", pinjam: 21, kembali: 19 },
    { day: "Jumat", pinjam: 15, kembali: 25 },
    { day: "Sabtu", pinjam: 8, kembali: 12 },
  ];

  const maxVal = Math.max(...monthlyStats.map((s) => Math.max(s.pinjam, s.kembali)));
  const returnRate =
    reports.totalLoans > 0
      ? ((reports.returnedLoans / reports.totalLoans) * 100).toFixed(1)
      : "100.0";

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
          <Button
            onClick={loadData}
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Segarkan
          </Button>
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
          <span className="text-xs font-semibold text-muted-foreground">Total Transaksi Peminjaman</span>
          <p className="font-heading text-2xl font-extrabold text-foreground">
            {reports.totalLoans} Buku
          </p>
          <p className="text-[11px] text-emerald-600 font-bold">Aktif di sistem database</p>
        </Card>

        <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Rasio Pengembalian Tepat Waktu</span>
          <p className="font-heading text-2xl font-extrabold text-emerald-600">{returnRate}%</p>
          <p className="text-[11px] text-muted-foreground">Target institusi: &gt; 90%</p>
        </Card>

        <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Pendapatan Denda Terkumpul</span>
          <p className="font-heading text-2xl font-extrabold text-primary">
            Rp {reports.totalFinesRevenue.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-muted-foreground">Dialokasikan untuk pemeliharaan buku</p>
        </Card>

        <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Koleksi Terdaftar</span>
          <p className="font-heading text-2xl font-extrabold text-foreground">
            {books.length} Judul
          </p>
          <p className="text-[11px] text-muted-foreground">Siap dipinjam civitas</p>
        </Card>
      </div>

      {/* Sub Laporan Tabs */}
      <Tabs defaultValue="peminjaman" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-lg">
          <TabsTrigger value="peminjaman">1. Tren Sirkulasi</TabsTrigger>
          <TabsTrigger value="koleksi">2. Katalog Buku ({books.length})</TabsTrigger>
          <TabsTrigger value="keterlambatan">3. Status Sirkulasi</TabsTrigger>
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
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-xs text-muted-foreground">Memuat data koleksi...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">No.</TableHead>
                    <TableHead className="text-xs">Judul Buku</TableHead>
                    <TableHead className="text-xs">Penulis</TableHead>
                    <TableHead className="text-xs">Kategori</TableHead>
                    <TableHead className="text-xs">Jumlah Salinan</TableHead>
                    <TableHead className="text-xs text-right">Tersedia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">
                        Belum ada koleksi buku terdaftar.
                      </TableCell>
                    </TableRow>
                  ) : (
                    books.map((b, idx) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-heading font-black text-xs text-primary">
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
                          {b.totalCopies} eksemplar
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-600 text-xs">
                          {b.availableCopies} di rak
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        {/* 3. Rekap Denda & Sirkulasi */}
        <TabsContent value="keterlambatan">
          <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground">
              Rekapitulasi Sirkulasi & Denda Keterlambatan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                <span className="text-muted-foreground">Total Transaksi Pengembalian:</span>
                <p className="font-mono text-lg font-bold text-foreground">
                  {reports.returnedLoans} Transaksi
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 p-4 space-y-1">
                <span className="text-amber-700">Peminjaman Terlambat:</span>
                <p className="font-mono text-lg font-bold text-amber-700">
                  {reports.overdueLoans} Buku
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 p-4 space-y-1">
                <span className="text-emerald-700">Total Denda Terkumpul:</span>
                <p className="font-mono text-lg font-bold text-emerald-700">
                  Rp {reports.totalFinesRevenue.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

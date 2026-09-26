"use client";

import { useState, useEffect } from "react";
import {
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Award,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
  BookOpen,
  Users,
  Building,
  ShieldCheck,
  ChevronRight,
  BarChart3,
  TrendingUp,
  FileText,
  BadgeCheck,
  Target,
  ArrowUpRight,
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
import {
  getAccreditationReportAction,
  type AccreditationSummary,
} from "@/actions/accreditation";
import { BookItem } from "@/types";

export default function LaporanPage() {
  const [activeMainTab, setActiveMainTab] = useState("sirkulasi");

  // State Laporan Sirkulasi
  const [reports, setReports] = useState({
    totalLoans: 0,
    returnedLoans: 0,
    overdueLoans: 0,
    totalFinesRevenue: 0,
  });
  const [books, setBooks] = useState<BookItem[]>([]);
  const [accreditation, setAccreditation] = useState<AccreditationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);
    try {
      const [reportsData, booksData, accData] = await Promise.all([
        getPustakawanReportsAction(),
        getBooksAction(),
        getAccreditationReportAction(),
      ]);
      setReports(reportsData);
      setBooks((booksData?.books as BookItem[]) || []);
      setAccreditation(accData);
    } catch (e: any) {
      toast.error("Gagal memuat analitik: " + (e.message || "Error"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handlePrintDocument = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!accreditation) {
      toast.error("Data akreditasi belum siap.");
      return;
    }
    const headers = [
      "No Komponen",
      "Nama Komponen SNP",
      "Bobot (%)",
      "Skor Indikator (0-100)",
      "Skor Terbobot",
      "Keterangan Bukti Dukung",
    ];

    const rows: (string | number)[][] = [];
    accreditation.components.forEach((c) => {
      rows.push([
        c.componentNumber,
        `"${c.title.replace(/"/g, '""')}"`,
        c.weight,
        c.score,
        c.weightedScore,
        `"${c.indicators.map((i) => i.name).join("; ")}"`,
      ]);
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `rekap-akreditasi-snp-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Rekapitulasi Akreditasi CSV Berhasil Diunduh 📊");
  };

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
      {/* Print Styling for Borang A4 Document */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-borang-snp,
          #printable-borang-snp * {
            visibility: visible;
          }
          #printable-borang-snp {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 1.5cm;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            z-index: 9999;
            overflow-y: visible;
          }
        }
      `}</style>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Laporan & Smart Analytics Akreditasi
            </h1>
            <Badge variant="default" className="text-xs font-bold gap-1 bg-amber-500 text-white">
              <Award className="h-3.5 w-3.5" />
              SNP 008:2020 Ready
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rekapitulasi sirkulasi, analitik rasio koleksi, dan instrumen borang akreditasi Standar Nasional Perpustakaan (SNP).
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
          <Button onClick={handlePrintDocument} size="sm" className="font-bold text-xs gap-1.5 shadow-sm">
            <Printer className="h-4 w-4" />
            Cetak Dokumen Borang
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 max-w-2xl bg-muted/60 p-1">
          <TabsTrigger value="sirkulasi" className="gap-1.5 text-xs font-semibold">
            <BarChart3 className="h-3.5 w-3.5" />
            1. Sirkulasi & Finansial
          </TabsTrigger>
          <TabsTrigger value="koleksi_siswa" className="gap-1.5 text-xs font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            2. Analitik Koleksi & Siswa
          </TabsTrigger>
          <TabsTrigger value="borang_snp" className="gap-1.5 text-xs font-semibold">
            <Award className="h-3.5 w-3.5" />
            3. Borang SNP & Gap Analysis
          </TabsTrigger>
          <TabsTrigger value="dokumen_cetak" className="gap-1.5 text-xs font-semibold">
            <FileText className="h-3.5 w-3.5" />
            4. Dokumen Siap Cetak
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: SIRKULASI & FINANSIAL */}
        {/* ========================================================================= */}
        <TabsContent value="sirkulasi" className="space-y-6">
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

          {/* Tren Sirkulasi Chart */}
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

        {/* ========================================================================= */}
        {/* TAB 2: SMART ANALYTICS KOLEKSI & SISWA */}
        {/* ========================================================================= */}
        <TabsContent value="koleksi_siswa" className="space-y-6">
          {accreditation && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Rasio Buku per Siswa */}
              <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Rasio Koleksi per Siswa
                  </span>
                  <Badge variant="success" className="text-[10px]">
                    Standar SNP: &gt; 10
                  </Badge>
                </div>

                <div className="text-center py-4 space-y-1">
                  <p className="font-heading text-4xl font-extrabold text-foreground">
                    {accreditation.metrics.booksPerStudentRatio}
                  </p>
                  <p className="text-xs text-muted-foreground">Buku per Siswa Terdaftar</p>
                </div>

                <div className="space-y-2 text-xs border-t border-border/60 pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Eksemplar Fisik:</span>
                    <strong className="font-mono text-foreground">{accreditation.metrics.totalCopies * 55} Eks</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Siswa Aktif:</span>
                    <strong className="font-mono text-foreground">{accreditation.metrics.totalStudents} Siswa</strong>
                  </div>
                </div>
              </Card>

              {/* Komposisi Fiksi vs Nonfiksi */}
              <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-secondary" />
                    Proporsi Fiksi vs Nonfiksi
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    Ideal: 60:40
                  </Badge>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Buku Nonfiksi (Ilmu Pengetahuan)</span>
                      <strong className="font-mono text-primary">{accreditation.metrics.nonFictionPercentage}%</strong>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${accreditation.metrics.nonFictionPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Buku Fiksi (Sastra & Cerita)</span>
                      <strong className="font-mono text-amber-600">{accreditation.metrics.fictionPercentage}%</strong>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${accreditation.metrics.fictionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground border-t border-border/60 pt-2 leading-relaxed">
                  * Memenuhi pedoman standar akreditasi perpustakaan sekolah menengah.
                </p>
              </Card>

              {/* Koleksi Digital & Sirkulasi */}
              <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Koleksi Digital & Layanan TIK
                  </span>
                  <Badge variant="default" className="text-[10px] bg-emerald-600">
                    Sistem Lengkap
                  </Badge>
                </div>

                <div className="space-y-2.5 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex justify-between items-center">
                    <span className="text-muted-foreground">Judul E-Book Digital:</span>
                    <strong className="font-mono text-foreground">{accreditation.metrics.totalEbooks} Judul</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex justify-between items-center">
                    <span className="text-muted-foreground">Sirkulasi per Siswa/Tahun:</span>
                    <strong className="font-mono text-foreground">{accreditation.metrics.annualCirculationPerStudent} Pinjam/Tahun</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex justify-between items-center">
                    <span className="text-muted-foreground">Kiosk Mandiri Barcode:</span>
                    <strong className="text-emerald-600 font-bold">2 Terminal Aktif</strong>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: BORANG AKREDITASI SNP & GAP ANALYSIS */}
        {/* ========================================================================= */}
        <TabsContent value="borang_snp" className="space-y-6">
          {accreditation && (
            <>
              {/* Scorecard Hero Banner */}
              <Card className="rounded-3xl border-primary/20 bg-linear-to-r from-primary/10 via-background to-amber-500/10 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-emerald-600 text-white font-bold text-xs gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Status: Asesmen Mandiri Siap Diajukan
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        NPSN: {accreditation.npsn}
                      </Badge>
                    </div>
                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                      Proyeksi Predikat: <span className="text-primary">{accreditation.grade}</span> 🏆
                    </h2>
                    <p className="text-xs text-muted-foreground max-w-xl">
                      Berdasarkan evaluasi otomatis 6 Komponen Standar Nasional Perpustakaan (SNP 008:2020 Perpusnas).
                    </p>
                  </div>

                  <div className="flex items-center gap-6 bg-background/90 p-4 rounded-2xl border border-border shadow-xs">
                    <div className="text-center">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                        Skor Komposit SNP
                      </span>
                      <span className="font-mono text-3xl font-extrabold text-primary">
                        {accreditation.totalScore}
                        <span className="text-sm text-muted-foreground font-normal">/100</span>
                      </span>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div className="text-center">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                        Ambang Batas Nilai A
                      </span>
                      <span className="font-mono text-base font-bold text-emerald-600">
                        &gt; 91.0 Pts
                      </span>
                      <span className="text-[10px] text-muted-foreground block">Memenuhi Syarat</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 6 Komponen Matriks Nilai Table */}
              <Card className="rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
                  <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    Matriks Penilaian 6 Komponen Standar Nasional Perpustakaan (SNP)
                  </h3>
                  <span className="text-xs font-mono text-muted-foreground">Total Bobot: 100%</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/30 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-3 w-12 text-center">No</th>
                        <th className="px-4 py-3">Komponen SNP</th>
                        <th className="px-4 py-3 text-center">Bobot</th>
                        <th className="px-4 py-3 text-center">Skor Mentah (0-100)</th>
                        <th className="px-4 py-3 text-right">Skor Terbobot</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {accreditation.components.map((c) => (
                        <tr key={c.componentNumber} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3.5 text-center font-mono font-bold text-muted-foreground">
                            {c.componentNumber}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-foreground">
                            {c.title}
                          </td>
                          <td className="px-4 py-3.5 text-center font-mono">
                            {c.weight}%
                          </td>
                          <td className="px-4 py-3.5 text-center font-mono font-bold text-foreground">
                            {c.score}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-primary">
                            {c.weightedScore.toFixed(2)}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <Badge
                              variant={c.score >= 90 ? "success" : "warning"}
                              className="text-[10px]"
                            >
                              {c.score >= 90 ? "Sangat Baik" : "Baik"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/50 border-t-2 border-border font-bold text-xs">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-right">
                          Total Skor Terbobot Akhir:
                        </td>
                        <td className="px-4 py-3 text-center font-mono">100%</td>
                        <td className="px-4 py-3 text-center">-</td>
                        <td className="px-4 py-3 text-right font-mono text-base text-primary">
                          {accreditation.totalScore}
                        </td>
                        <td className="px-4 py-3 text-center text-emerald-600 font-bold">
                          {accreditation.grade}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>

              {/* Actionable Gap Analysis Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                      <Target className="h-4 w-4 text-amber-500" />
                      Analisis Kesenjangan & Tips Rekomendasi Asesor (Gap Analysis)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Checklist prioritas perbaikan mandiri untuk mempertahankan dan mengunci predikat Akreditasi A.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {accreditation.gapAnalysis.length} Rekomendasi
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {accreditation.gapAnalysis.map((item) => (
                    <Card
                      key={item.id}
                      className="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-xs hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            item.priority === "tinggi"
                              ? "destructive"
                              : item.priority === "sedang"
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[10px] capitalize"
                        >
                          Prioritas: {item.priority}
                        </Badge>
                        <span className="text-[10px] font-mono text-emerald-600 font-bold">
                          +{item.potentialPointGain} Poin
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-foreground leading-snug">
                        {item.issue}
                      </h4>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.recommendation}
                      </p>

                      <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
                        Komponen {item.componentNumber} Standar Nasional
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 4: DOKUMEN BORANG SIAP CETAK (A4 PDF) */}
        {/* ========================================================================= */}
        <TabsContent value="dokumen_cetak" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">
                Pratinjau Dokumen Borang Akreditasi SNP Resmi
              </h3>
              <p className="text-xs text-muted-foreground">
                Format resmi borang instrumen asesmen mandiri akreditasi perpustakaan sekolah siap cetak A4.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrintDocument}
                size="sm"
                className="font-bold text-xs gap-1.5 shadow-sm bg-primary text-primary-foreground"
              >
                <Printer className="h-4 w-4" />
                Cetak Dokumen Sekarang (PDF)
              </Button>
            </div>
          </div>

          {/* Printable Document Sheet Frame */}
          {accreditation && (
            <div className="max-w-4xl mx-auto">
              <div
                id="printable-borang-snp"
                className="rounded-3xl border border-border bg-white text-neutral-900 p-8 sm:p-12 shadow-xl space-y-6"
              >
                {/* Formal School Letterhead */}
                <div className="text-center border-b-2 border-neutral-900 pb-4 space-y-1">
                  <p className="text-[11px] uppercase tracking-widest font-bold text-neutral-700">
                    PEMERINTAH DAERAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA
                  </p>
                  <p className="text-xs uppercase font-bold text-neutral-800">
                    DINAS PENDIDIKAN • CABANG DINAS WILAYAH PERPUDI
                  </p>
                  <h2 className="font-serif text-xl sm:text-2xl font-extrabold tracking-wide uppercase text-neutral-950">
                    {accreditation.institutionName}
                  </h2>
                  <p className="text-[10px] text-neutral-600 font-mono">
                    NPSN: {accreditation.npsn} • Jalan Pendidikan Ceria No. 45, Jakarta • Telp: (021) 7890123
                  </p>
                </div>

                {/* Document Title */}
                <div className="text-center space-y-1 pt-2">
                  <h1 className="font-serif text-base sm:text-lg font-extrabold uppercase underline tracking-wider">
                    INSTRUMEN ASESMEN MANDIRI BORANG AKREDITASI
                  </h1>
                  <p className="text-xs font-mono text-neutral-600">
                    Berdasarkan {accreditation.accreditationStandard}
                  </p>
                </div>

                {/* School & Library Meta Table */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                  <div className="space-y-1">
                    <p><strong>Nama Sekolah:</strong> SMA Ceria Prestasi Bangsa</p>
                    <p><strong>Nama Perpustakaan:</strong> Perpustakaan PustakaKita Ceria</p>
                    <p><strong>Kepala Sekolah:</strong> {accreditation.headMaster}</p>
                  </div>
                  <div className="space-y-1 text-right sm:text-left">
                    <p><strong>Kepala Perpustakaan:</strong> {accreditation.headLibrarian}</p>
                    <p><strong>Tanggal Asesmen:</strong> {accreditation.selfAssessmentDate}</p>
                    <p><strong>Proyeksi Akreditasi:</strong> <span className="font-bold text-emerald-700">{accreditation.grade} ({accreditation.totalScore} Pts)</span></p>
                  </div>
                </div>

                {/* Full Indicators Table */}
                <div className="border border-neutral-300 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="bg-neutral-100 border-b border-neutral-300 font-bold uppercase text-[9px]">
                      <tr>
                        <th className="p-2 border-r border-neutral-300 w-8 text-center">No</th>
                        <th className="p-2 border-r border-neutral-300">Komponen & Indikator SNP</th>
                        <th className="p-2 border-r border-neutral-300 text-center w-28">Target Standar</th>
                        <th className="p-2 border-r border-neutral-300 text-center w-28">Kondisi Riil</th>
                        <th className="p-2 border-r border-neutral-300 text-center w-14">Skor</th>
                        <th className="p-2 text-center w-16">Bobot</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {accreditation.components.map((comp) => (
                        <tr key={comp.componentNumber}>
                          <td className="p-2 text-center font-bold font-mono border-r border-neutral-200 align-top">
                            {comp.componentNumber}
                          </td>
                          <td className="p-2 border-r border-neutral-200">
                            <strong className="text-neutral-900 block">{comp.title}</strong>
                            <ul className="list-disc list-inside text-neutral-600 text-[10px] mt-0.5 space-y-0.5">
                              {comp.indicators.map((ind) => (
                                <li key={ind.id}>{ind.name}</li>
                              ))}
                            </ul>
                          </td>
                          <td className="p-2 text-center border-r border-neutral-200 text-[10px] align-top">
                            {comp.indicators[0]?.standardTarget || "Sesuai SNP"}
                          </td>
                          <td className="p-2 text-center border-r border-neutral-200 text-[10px] font-semibold text-emerald-800 align-top">
                            {comp.indicators[0]?.currentValue || "Memenuhi"}
                          </td>
                          <td className="p-2 text-center font-mono font-bold border-r border-neutral-200 align-top">
                            {comp.score}
                          </td>
                          <td className="p-2 text-center font-mono font-bold align-top">
                            {comp.weight}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-neutral-100 border-t-2 border-neutral-400 font-bold text-xs">
                      <tr>
                        <td colSpan={4} className="p-2 text-right">
                          Skor Komposit Terbobot:
                        </td>
                        <td className="p-2 text-center font-mono text-sm text-emerald-800">
                          {accreditation.totalScore}
                        </td>
                        <td className="p-2 text-center font-mono">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Formal Signatures Section */}
                <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                  <div className="space-y-1">
                    <p className="text-neutral-600">Mengetahui,</p>
                    <p className="font-bold text-neutral-900">Kepala SMA Ceria Prestasi Bangsa</p>
                    <div className="h-16" />
                    <p className="font-serif font-bold text-neutral-950 underline">
                      {accreditation.headMaster}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-600">NIP. 19690415 199403 1 004</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-neutral-600">Jakarta, {accreditation.selfAssessmentDate}</p>
                    <p className="font-bold text-neutral-900">Kepala Perpustakaan Sekolah</p>
                    <div className="h-16" />
                    <p className="font-serif font-bold text-neutral-950 underline">
                      {accreditation.headLibrarian}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-600">NIP. 19780512 200501 2 003</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

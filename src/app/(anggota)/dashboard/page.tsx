"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  BookOpen,
  Clock,
  AlertTriangle,
  Receipt,
  BookMarked,
  QrCode,
  Search,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Calendar,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CURRENT_USER,
  DUMMY_LOANS,
  DUMMY_EBOOKS,
  DUMMY_FINES,
  LoanItem,
} from "@/data/dummy";
import { toast } from "@/components/ui/sonner";

export default function DasborAnggotaPage() {
  const [loans, setLoans] = useState<LoanItem[]>(
    DUMMY_LOANS.filter((l) => l.memberNisNim === CURRENT_USER.nisNim)
  );

  const activeLoans = loans.filter(
    (l) => l.status === "dipinjam" || l.status === "terlambat"
  );
  const overdueLoans = loans.filter((l) => l.status === "terlambat");
  const totalUnpaidFines = DUMMY_FINES.filter(
    (f) => f.memberNisNim === CURRENT_USER.nisNim && f.status === "belum_bayar"
  ).reduce((acc, curr) => acc + curr.amount, 0);

  const handleRenew = (loanId: string, title: string) => {
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id === loanId) {
          return {
            ...l,
            renewedCount: l.renewedCount + 1,
            dueDate: "2024-12-02",
          };
        }
        return l;
      })
    );
    toast.success("Perpanjangan Berhasil! 🎉", {
      description: `Buku "${title}" berhasil diperpanjang 7 hari ke depan (Jatuh tempo: 02 Des 2024).`,
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Welcome Greeting Header */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-bold">
                Selamat Datang Kembali! ✨
              </Badge>
              <span className="text-xs text-muted-foreground">Semester Ganjil 2026/2027</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Halo, {CURRENT_USER.name}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              NIS: <strong className="font-mono text-foreground">{CURRENT_USER.nisNim}</strong> •{" "}
              {CURRENT_USER.classOrMajor} • Status:{" "}
              <span className="text-emerald-600 font-bold">Anggota Aktif</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/scan">
              <Button size="lg" variant="secondary" className="rounded-2xl font-bold shadow-md gap-2">
                <QrCode className="h-5 w-5" />
                Scan Mandiri Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Stat Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Buku Dipinjam */}
        <Card className="rounded-2xl border border-border shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Buku Dipinjam</span>
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="font-heading text-3xl font-extrabold text-foreground">
              {activeLoans.length}{" "}
              <span className="text-xs text-muted-foreground font-normal">/ 3 kuota</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Sisa kuota: {3 - activeLoans.length} buku
            </p>
          </div>
        </Card>

        {/* Card 2: Jatuh Tempo */}
        <Card
          className={`rounded-2xl border p-5 space-y-3 shadow-sm ${
            overdueLoans.length > 0
              ? "border-rose-300 bg-rose-50/50 dark:bg-rose-950/20"
              : "border-border"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Jatuh Tempo Terdekat</span>
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                overdueLoans.length > 0
                  ? "bg-rose-100 text-rose-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div>
            {overdueLoans.length > 0 ? (
              <>
                <p className="font-heading text-lg font-bold text-rose-700">
                  {overdueLoans[0].daysLate} Hari Terlambat!
                </p>
                <p className="text-[11px] text-rose-600 truncate mt-1">
                  {overdueLoans[0].bookTitle} (12 Nov)
                </p>
              </>
            ) : (
              <>
                <p className="font-heading text-lg font-bold text-foreground">Aman</p>
                <p className="text-[11px] text-muted-foreground mt-1">Tidak ada pinjaman telat</p>
              </>
            )}
          </div>
        </Card>

        {/* Card 3: Status Denda */}
        <Card className="rounded-2xl border border-border shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Denda Belum Bayar</span>
            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="font-heading text-2xl font-extrabold text-foreground">
              Rp {CURRENT_USER.totalFinesUnpaid.toLocaleString("id-ID")}
            </p>
            <Link
              href="/dashboard/denda"
              className="text-[11px] text-primary hover:underline font-bold mt-1 inline-block"
            >
              Upload Bukti Transfer →
            </Link>
          </div>
        </Card>

        {/* Card 4: E-Book Reading Progress */}
        <Card className="rounded-2xl border border-border shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">E-Book Terakhir</span>
            <div className="h-9 w-9 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
              <BookMarked className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="font-heading text-sm font-bold text-foreground truncate">
              {DUMMY_EBOOKS[1].title}
            </p>
            <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${DUMMY_EBOOKS[1].progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 flex justify-between">
              <span>Hlm {DUMMY_EBOOKS[1].lastPage}</span>
              <span className="font-bold text-primary">{DUMMY_EBOOKS[1].progressPercent}%</span>
            </p>
          </div>
        </Card>
      </div>

      {/* 3. Peringatan Denda Banner Jika Ada */}
      {overdueLoans.length > 0 && (
        <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-5 dark:bg-rose-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-rose-900 dark:text-rose-200">
                Peringatan: Buku &quot;{overdueLoans[0].bookTitle}&quot; Melewati Batas Jatuh Tempo!
              </h4>
              <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
                Keterlambatan 2 hari. Denda berjalan: Rp 2.000. Segera kembalikan di meja sirkulasi atau
                via Scan Mandiri.
              </p>
            </div>
          </div>
          <Link href="/dashboard/denda">
            <Button size="sm" variant="destructive" className="shrink-0 font-bold">
              Bayar Denda Transfer
            </Button>
          </Link>
        </div>
      )}

      {/* 4. Daftar Pinjaman Aktif */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Buku yang Sedang Dipinjam
            </h3>
            <p className="text-xs text-muted-foreground">
              Pantau batas pengembalian untuk menghindari denda harian.
            </p>
          </div>
          <Link href="/dashboard/riwayat">
            <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">
              Lihat Seluruh Riwayat →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeLoans.map((loan) => (
            <Card key={loan.id} className="rounded-2xl border border-border shadow-sm p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <Badge
                    variant={loan.status === "terlambat" ? "destructive" : "warning"}
                    className="text-[10px]"
                  >
                    {loan.status === "terlambat" ? "Terlambat 2 Hari" : "Dipinjam (Aktif)"}
                  </Badge>
                  <h4 className="font-heading text-base font-bold text-foreground">{loan.bookTitle}</h4>
                  <p className="font-mono text-xs text-primary font-bold">{loan.copyCode}</p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-muted-foreground block">Jatuh Tempo</span>
                  <strong
                    className={`font-mono text-sm ${
                      loan.status === "terlambat" ? "text-rose-600" : "text-foreground"
                    }`}
                  >
                    {loan.dueDate}
                  </strong>
                </div>
              </div>

              <div className="rounded-xl bg-muted/60 p-3 text-xs flex justify-between items-center">
                <span className="text-muted-foreground font-mono">{loan.shelfLocation}</span>
                <span className="text-muted-foreground">Perpanjangan: {loan.renewedCount} / 1x</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {loan.status !== "terlambat" && loan.renewedCount === 0 ? (
                  <Button
                    onClick={() => handleRenew(loan.id, loan.bookTitle)}
                    variant="outline"
                    size="sm"
                    className="flex-1 font-bold text-xs gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Perpanjang 7 Hari
                  </Button>
                ) : (
                  <Button
                    disabled
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs opacity-60"
                  >
                    {loan.status === "terlambat"
                      ? "Tidak Bisa Perpanjang (Terlambat)"
                      : "Maksimal Perpanjangan Tercapai"}
                  </Button>
                )}

                <Link href="/dashboard/scan">
                  <Button size="sm" variant="secondary" className="text-xs font-bold gap-1">
                    <QrCode className="h-3.5 w-3.5" />
                    Kembalikan
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 5. Koleksi E-Book Cepat */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-heading text-base font-bold text-foreground">
              Lanjutkan Membaca E-Book
            </h3>
            <p className="text-xs text-muted-foreground">
              Progress membaca Anda tersimpan otomatis di setiap perangkat.
            </p>
          </div>
          <Link href="/dashboard/ebook">
            <Button variant="outline" size="sm" className="text-xs font-bold">
              Semua E-Book
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DUMMY_EBOOKS.map((eb) => (
            <div
              key={eb.id}
              className="flex items-center gap-3 rounded-2xl border border-border/80 bg-muted/30 p-3 hover:bg-muted/70 transition-all"
            >
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border shadow-sm">
                <Image src={eb.coverUrl} alt={eb.title} fill className="object-cover" sizes="48px" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-xs font-bold text-foreground">{eb.title}</p>
                <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${eb.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>{eb.progressPercent}% selesai</span>
                  <Link
                    href={`/dashboard/ebook/${eb.id}/baca`}
                    className="text-primary font-bold hover:underline"
                  >
                    Lanjut Baca →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

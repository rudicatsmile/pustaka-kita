"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Receipt,
  Search,
  Filter,
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
import { DUMMY_LOANS, LoanItem } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";

export default function RiwayatPage() {
  const [loans, setLoans] = useState<LoanItem[]>(DUMMY_LOANS);
  const [filterTab, setFilterTab] = useState<"semua" | "dipinjam" | "dikembalikan" | "terlambat">("semua");

  const filteredLoans = loans.filter((l) => {
    if (filterTab === "semua") return true;
    return l.status === filterTab;
  });

  const handleRenew = (id: string, title: string) => {
    setLoans((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, renewedCount: l.renewedCount + 1, dueDate: "2024-12-02" }
          : l
      )
    );
    toast.success("Perpanjangan Berhasil! 🎉", {
      description: `Buku "${title}" berhasil diperpanjang 7 hari ke depan (Jatuh tempo baru: 02 Des 2024).`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Riwayat Peminjaman Buku
          </h1>
          <p className="text-xs text-muted-foreground">
            Daftar seluruh transaksi sirkulasi aktif dan arsip pengembalian buku Anda.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "semua", label: "Semua Transaksi" },
          { id: "dipinjam", label: "Sedang Dipinjam" },
          { id: "terlambat", label: "⚠️ Terlambat" },
          { id: "dikembalikan", label: "✅ Selesai Dikembalikan" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as typeof filterTab)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              filterTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loans Table */}
      <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Judul Buku & Kode Eksemplar</TableHead>
              <TableHead className="text-xs">Tanggal Pinjam</TableHead>
              <TableHead className="text-xs">Jatuh Tempo</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Denda</TableHead>
              <TableHead className="text-xs text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLoans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell>
                  <p className="font-heading font-bold text-foreground text-xs">{loan.bookTitle}</p>
                  <p className="font-mono text-[11px] text-primary">{loan.copyCode}</p>
                </TableCell>
                <TableCell className="font-mono text-xs">{loan.borrowedAt}</TableCell>
                <TableCell className="font-mono text-xs">
                  <span
                    className={
                      loan.status === "terlambat"
                        ? "text-rose-600 font-bold"
                        : "text-foreground"
                    }
                  >
                    {loan.dueDate}
                  </span>
                  {loan.returnedAt && (
                    <span className="block text-[10px] text-muted-foreground">
                      Kembali: {loan.returnedAt}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {loan.status === "terlambat" && (
                    <Badge variant="destructive" className="text-[10px]">
                      Terlambat {loan.daysLate} Hari
                    </Badge>
                  )}
                  {loan.status === "dipinjam" && (
                    <Badge variant="warning" className="text-[10px]">
                      Dipinjam (Aktif)
                    </Badge>
                  )}
                  {loan.status === "dikembalikan" && (
                    <Badge variant="success" className="text-[10px]">
                      Selesai
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs font-mono">
                  {loan.fineAmount > 0 ? (
                    <span className="text-rose-600 font-bold">
                      Rp {loan.fineAmount.toLocaleString("id-ID")}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {loan.status === "dipinjam" && loan.renewedCount === 0 && (
                      <Button
                        onClick={() => handleRenew(loan.id, loan.bookTitle)}
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold h-8 px-2.5"
                      >
                        Perpanjang
                      </Button>
                    )}
                    {loan.status === "terlambat" && (
                      <Link href="/dashboard/denda">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="text-xs font-bold h-8 px-2.5"
                        >
                          Bayar Denda
                        </Button>
                      </Link>
                    )}
                    {loan.status === "dikembalikan" && (
                      <span className="text-xs text-muted-foreground">Arsip</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

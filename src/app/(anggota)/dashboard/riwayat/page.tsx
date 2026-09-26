"use client";

import { useState, useEffect } from "react";
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
import { getMemberLoansHistory, renewMemberLoanAction } from "@/actions/member";
import { toast } from "@/components/ui/sonner";

export default function RiwayatPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"semua" | "dipinjam" | "dikembalikan" | "terlambat">("semua");

  const loadLoans = async () => {
    try {
      const data = await getMemberLoansHistory("semua");
      setLoans(data);
    } catch (e) {
      console.error("Gagal memuat riwayat:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const filteredLoans = loans.filter((l) => {
    if (filterTab === "semua") return true;
    return l.status === filterTab;
  });

  const handleRenew = async (id: string, title: string) => {
    try {
      const res = await renewMemberLoanAction(id);
      if (res.success) {
        toast.success("Perpanjangan Berhasil! 🎉", {
          description: `Buku "${title}" berhasil diperpanjang 7 hari ke depan (Jatuh tempo baru: ${res.newDueDate}).`,
        });
        loadLoans();
      } else {
        toast.error("Gagal memperpanjang:", { description: res.error });
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
            Riwayat Peminjaman Buku
          </h1>
          <p className="text-xs text-muted-foreground">
            Daftar seluruh transaksi sirkulasi aktif dan arsip pengembalian buku Anda dari database.
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
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            Memuat riwayat peminjaman dari database...
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="font-semibold text-foreground text-sm">Tidak ada transaksi yang cocok</p>
            <p>Belum ada riwayat transaksi pada kategori ini.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View (< 640px) */}
            <div className="sm:hidden divide-y divide-border/60">
              {filteredLoans.map((loan) => (
                <div key={loan.id} className="p-4 space-y-3 bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <p className="font-heading font-bold text-foreground text-sm leading-snug">
                        {loan.bookTitle}
                      </p>
                      <p className="font-mono text-xs font-semibold text-primary">
                        {loan.copyCode}
                      </p>
                    </div>
                    <div>
                      {loan.status === "terlambat" && (
                        <Badge variant="destructive" className="text-[10px] px-2 py-0.5 font-bold shadow-sm">
                          Terlambat
                        </Badge>
                      )}
                      {loan.status === "dipinjam" && (
                        <Badge variant="warning" className="text-[10px] px-2 py-0.5 font-bold">
                          Dipinjam
                        </Badge>
                      )}
                      {loan.status === "dikembalikan" && (
                        <Badge variant="success" className="text-[10px] px-2 py-0.5 font-bold">
                          Selesai
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-2.5 rounded-xl border border-border/50">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                        Tgl Pinjam
                      </span>
                      <span className="font-mono text-foreground font-medium">
                        {loan.borrowedAt}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                        Jatuh Tempo
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          loan.status === "terlambat"
                            ? "text-rose-600"
                            : "text-foreground"
                        }`}
                      >
                        {loan.dueDate}
                      </span>
                      {loan.returnedAt && (
                        <span className="block text-[10px] text-muted-foreground">
                          Kembali: {loan.returnedAt}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="pt-1">
                    {loan.status === "dipinjam" && loan.renewedCount === 0 && (
                      <Button
                        onClick={() => handleRenew(loan.id, loan.bookTitle)}
                        variant="outline"
                        className="w-full text-xs font-bold h-10 rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/5 active:scale-95"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Perpanjang Pinjaman (7 Hari)
                      </Button>
                    )}
                    {loan.status === "terlambat" && (
                      <Link href="/dashboard/denda" className="block w-full">
                        <Button
                          variant="destructive"
                          className="w-full text-xs font-bold h-10 rounded-xl gap-2 active:scale-95 shadow-sm"
                        >
                          <Receipt className="h-4 w-4" />
                          Selesaikan Denda Keterlambatan
                        </Button>
                      </Link>
                    )}
                    {loan.status === "dikembalikan" && (
                      <p className="text-[11px] text-muted-foreground text-center py-1">
                        Peminjaman telah selesai dan diarsipkan.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= 640px) */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Judul Buku & Kode Eksemplar</TableHead>
                    <TableHead className="text-xs">Tanggal Pinjam</TableHead>
                    <TableHead className="text-xs">Jatuh Tempo</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
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
                            Terlambat
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
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

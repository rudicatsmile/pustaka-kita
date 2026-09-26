"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Receipt,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  ArrowRight,
  Eye,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DUMMY_FINES, CURRENT_USER, FineItem } from "@/data/dummy";

export default function StatusDendaPage() {
  const [fines, setFines] = useState<FineItem[]>(
    DUMMY_FINES.filter((f) => f.memberNisNim === CURRENT_USER.nisNim)
  );
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  const totalUnpaid = fines
    .filter((f) => f.status === "belum_bayar")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalWaiting = fines
    .filter((f) => f.status === "menunggu_verifikasi")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Status Denda & Pelunasan
          </h1>
          <p className="text-xs text-muted-foreground">
            Informasi tagihan keterlambatan dan pelunasan manual via transfer bank.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-rose-200 bg-rose-50/60 dark:bg-rose-950/20 p-5 space-y-2">
          <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
            Denda Belum Bayar
          </span>
          <p className="font-heading text-2xl font-extrabold text-rose-700">
            Rp {totalUnpaid.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-rose-600">Tarif: Rp 1.000 / hari / eksemplar</p>
        </Card>

        <Card className="rounded-2xl border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 p-5 space-y-2">
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            Menunggu Verifikasi Pustakawan
          </span>
          <p className="font-heading text-2xl font-extrabold text-amber-700">
            Rp {totalWaiting.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-amber-700">Bukti transfer sedang diperiksa</p>
        </Card>

        <Card className="rounded-2xl border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 p-5 space-y-2">
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            Denda Terbayar Lunas
          </span>
          <p className="font-heading text-2xl font-extrabold text-emerald-700">
            Rp 3.000
          </p>
          <p className="text-[11px] text-emerald-700">Transaksi selesai diverifikasi</p>
        </Card>
      </div>

      {/* Table Denda */}
      <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Buku & Kode Eksemplar</TableHead>
              <TableHead className="text-xs">Keterlambatan</TableHead>
              <TableHead className="text-xs">Nominal Denda</TableHead>
              <TableHead className="text-xs">Status Pelunasan</TableHead>
              <TableHead className="text-xs text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fines.map((fine) => (
              <TableRow key={fine.id}>
                <TableCell>
                  <p className="font-heading font-bold text-foreground text-xs">{fine.bookTitle}</p>
                  <p className="font-mono text-[11px] text-primary">{fine.copyCode}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{fine.reason}</p>
                </TableCell>
                <TableCell className="text-xs font-semibold text-rose-600">
                  {fine.daysLate} Hari Telat
                </TableCell>
                <TableCell className="font-mono font-bold text-xs text-foreground">
                  Rp {fine.amount.toLocaleString("id-ID")}
                </TableCell>
                <TableCell>
                  {fine.status === "belum_bayar" && (
                    <Badge variant="destructive" className="text-[10px]">
                      Belum Bayar
                    </Badge>
                  )}
                  {fine.status === "menunggu_verifikasi" && (
                    <Badge variant="warning" className="text-[10px]">
                      Menunggu Verifikasi
                    </Badge>
                  )}
                  {fine.status === "lunas" && (
                    <Badge variant="success" className="text-[10px]">
                      Lunas
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {fine.status === "belum_bayar" ? (
                    <Link href={`/dashboard/denda/${fine.id}/bayar`}>
                      <Button size="sm" className="text-xs font-bold gap-1 shadow-sm">
                        <CreditCard className="h-3.5 w-3.5" />
                        Bayar via Transfer
                      </Button>
                    </Link>
                  ) : fine.proofUrl ? (
                    <Button
                      onClick={() => setSelectedProof(fine.proofUrl!)}
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Lihat Bukti
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Selesai</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Preview Bukti Transfer */}
      <Dialog open={!!selectedProof} onOpenChange={() => setSelectedProof(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bukti Transfer Pembayaran</DialogTitle>
            <DialogDescription>
              Foto slip atau screenshot bukti transfer bank yang telah diunggah.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 flex justify-center">
            {selectedProof && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedProof}
                alt="Bukti Transfer"
                className="max-h-80 w-auto rounded-xl border shadow-sm object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  Eye,
  Receipt,
  Search,
  Filter,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DUMMY_FINES, FineItem } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";

import { verifyFineAction } from "@/actions/fines";

export default function VerifikasiDendaPage() {
  const [fines, setFines] = useState<FineItem[]>(DUMMY_FINES);
  const [selectedProofItem, setSelectedProofItem] = useState<FineItem | null>(null);
  const [rejectModalItem, setRejectModalItem] = useState<FineItem | null>(null);
  const [rejectReason, setRejectReason] = useState("Nominal transfer tidak sesuai dengan tagihan");

  const handleApprove = async (item: FineItem) => {
    try {
      const res = await verifyFineAction({
        fineId: item.id,
        approved: true,
        verifierName: "Ibu Dewi Anggraini, S.IP.",
      });

      if (res.success && res.fine) {
        setFines((prev) =>
          prev.map((f) => (f.id === item.id ? (res.fine as FineItem) : f))
        );
      }
      setSelectedProofItem(null);
      toast.success("Pembayaran Denda Disetujui! ✅", {
        description: `Denda Rp ${item.amount.toLocaleString("id-ID")} untuk ${item.memberName} telah lunas. Akun otomatis dibuka kembali (Audit Log tercatat).`,
      });
    } catch (e: any) {
      toast.error("Gagal memverifikasi denda:", { description: e.message });
    }
  };

  const handleReject = async () => {
    if (!rejectModalItem) return;
    try {
      const res = await verifyFineAction({
        fineId: rejectModalItem.id,
        approved: false,
        rejectReason,
      });

      if (res.success && res.fine) {
        setFines((prev) =>
          prev.map((f) => (f.id === rejectModalItem.id ? (res.fine as FineItem) : f))
        );
      }
      toast.error("Pembayaran Denda Ditolak ❌", {
        description: `Alasan penolakan telah dikirim via WhatsApp ke ${rejectModalItem.memberName}. Status kembali Belum Bayar.`,
      });
      setRejectModalItem(null);
    } catch (e: any) {
      toast.error("Gagal menolak denda:", { description: e.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Verifikasi Pelunasan Denda Manual
          </h1>
          <p className="text-xs text-muted-foreground">
            Periksa keabsahan slip transfer bank yang diunggah anggota sebelum mengubah status menjadi lunas.
          </p>
        </div>
      </div>

      {/* DataTable Denda */}
      <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Anggota (NIS/NIM)</TableHead>
              <TableHead className="text-xs">Buku & Hari Telat</TableHead>
              <TableHead className="text-xs">Nominal</TableHead>
              <TableHead className="text-xs">Bukti Transfer</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs text-right">Tindakan Pustakawan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fines.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="font-heading font-bold text-xs text-foreground">
                    {item.memberName}
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground">{item.memberNisNim}</p>
                </TableCell>
                <TableCell className="text-xs">
                  <p className="font-semibold text-foreground">{item.bookTitle}</p>
                  <p className="text-[11px] text-rose-600 font-medium">
                    {item.daysLate} hari terlambat
                  </p>
                </TableCell>
                <TableCell className="font-mono text-xs font-bold text-foreground">
                  Rp {item.amount.toLocaleString("id-ID")}
                </TableCell>
                <TableCell>
                  {item.proofUrl ? (
                    <button
                      onClick={() => setSelectedProofItem(item)}
                      className="group flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Lihat Foto Slip</span>
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Belum upload</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === "lunas"
                        ? "success"
                        : item.status === "menunggu_verifikasi"
                        ? "warning"
                        : "destructive"
                    }
                    className="text-[10px]"
                  >
                    {item.status === "lunas"
                      ? "Lunas"
                      : item.status === "menunggu_verifikasi"
                      ? "Menunggu Verifikasi"
                      : "Belum Bayar"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {item.status === "menunggu_verifikasi" ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        onClick={() => handleApprove(item)}
                        size="sm"
                        className="text-xs font-bold h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Setujui (Approve)
                      </Button>
                      <Button
                        onClick={() => setRejectModalItem(item)}
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold h-8 px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Tolak
                      </Button>
                    </div>
                  ) : item.status === "lunas" ? (
                    <div className="text-right text-[11px] text-muted-foreground">
                      <p>Diverifikasi:</p>
                      <p className="font-semibold text-emerald-700">{item.verifiedBy}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Menunggu Siswa</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Preview Bukti Transfer Lengkap dengan Action */}
      <Dialog open={!!selectedProofItem} onOpenChange={() => setSelectedProofItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Validasi Bukti Transfer Bank</DialogTitle>
            <DialogDescription>
              Pastikan nama pengirim dan nominal transfer Rp{" "}
              {selectedProofItem?.amount.toLocaleString("id-ID")} sesuai dengan mutasi rekening perpustakaan.
            </DialogDescription>
          </DialogHeader>

          {selectedProofItem && (
            <div className="space-y-4 py-2">
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama Siswa / Mahasiswa:</span>
                  <strong>{selectedProofItem.memberName} ({selectedProofItem.memberNisNim})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nominal Tagihan:</span>
                  <strong className="text-primary font-mono text-sm">
                    Rp {selectedProofItem.amount.toLocaleString("id-ID")}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Metode Pembayaran:</span>
                  <span>Transfer Manual (Bank Mandiri)</span>
                </div>
              </div>

              <div className="flex justify-center border rounded-2xl overflow-hidden bg-black/5 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedProofItem.proofUrl}
                  alt="Bukti Transfer"
                  className="max-h-72 w-auto object-contain rounded-lg shadow-sm"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setSelectedProofItem(null)}>
              Tutup
            </Button>
            {selectedProofItem?.status === "menunggu_verifikasi" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectModalItem(selectedProofItem);
                    setSelectedProofItem(null);
                  }}
                  className="text-rose-600 border-rose-200"
                >
                  Tolak Bukti
                </Button>
                <Button
                  onClick={() => handleApprove(selectedProofItem)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Setujui & Tandai Lunas
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Tolak Bukti Transfer */}
      <Dialog open={!!rejectModalItem} onOpenChange={() => setRejectModalItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Bukti Pembayaran Denda</DialogTitle>
            <DialogDescription>
              Tuliskan alasan penolakan. Catatan ini akan dicatat pada Audit Log dan dikirimkan
              kepada anggota via WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-xs font-bold text-foreground">Alasan Penolakan:</label>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Foto struk buram / Nominal kurang"
              className="text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectModalItem(null)}>
              Batal
            </Button>
            <Button onClick={handleReject} variant="destructive" className="font-bold">
              Konfirmasi Penolakan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

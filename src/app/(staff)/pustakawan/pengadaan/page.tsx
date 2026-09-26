"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  ThumbsUp,
  CheckCircle2,
  Package,
  BookPlus,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  Search,
  ChevronRight,
  ExternalLink,
  Loader2,
  X,
  Sparkles,
  Layers,
  Filter,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import {
  getWishlistProposalsAction,
  getWishlistStatsAction,
  updateProposalStatusAction,
  convertProposalToCatalogAction,
  type BookWishlistProposal,
} from "@/actions/wishlist";

export default function PustakawanPengadaanPage() {
  const [proposals, setProposals] = useState<BookWishlistProposal[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    totalVotes: 0,
    approved: 0,
    available: 0,
    totalEstimatedBudget: 0,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Convert to Catalog Modal State
  const [selectedProposalForConvert, setSelectedProposalForConvert] =
    useState<BookWishlistProposal | null>(null);
  const [shelfLocation, setShelfLocation] = useState("Rak Koleksi Baru (A-01)");
  const [copyCode, setCopyCode] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  // Status Update State
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [list, st] = await Promise.all([
        getWishlistProposalsAction({ sortBy: "votes", statusFilter }),
        getWishlistStatsAction(),
      ]);
      setProposals(list);
      setStats(st);
    } catch (e: any) {
      toast.error("Gagal memuat data pengadaan:", { description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleUpdateStatus = async (
    proposalId: string,
    status: "disetujui" | "dipesan" | "tersedia" | "ditolak",
    notes?: string
  ) => {
    setIsUpdating(true);
    try {
      const res = await updateProposalStatusAction({
        proposalId,
        status,
        adminNotes: notes || `Diperbarui menjadi ${status} oleh Pustakawan`,
        actorName: "Pustakawan Perpustakaan",
      });

      if (res.success) {
        toast.success(`Status Usulan Berhasil Diubah: ${status.toUpperCase()}! ✅`, {
          description: "Perubahan tercatat di audit log dan portal anggota.",
        });
        loadData();
      } else {
        toast.error("Gagal memperbarui status:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenConvertModal = (proposal: BookWishlistProposal) => {
    setSelectedProposalForConvert(proposal);
    setCopyCode(`PKC-2026-${Math.floor(100 + Math.random() * 900)}-001`);
  };

  const handleExecuteConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposalForConvert) return;

    setIsConverting(true);
    try {
      const res = await convertProposalToCatalogAction({
        proposalId: selectedProposalForConvert.id,
        shelfLocation,
        copyCode,
        actorName: "Pustakawan Perpustakaan",
      });

      if (res.success) {
        toast.success("Buku Berhasil Didaftarkan ke Katalog Resmi! 🎉📚", {
          description: `Eksemplar ${copyCode} telah ditempatkan di ${shelfLocation}. Notifikasi WhatsApp dikirimkan ke siswa pemilih!`,
        });
        setSelectedProposalForConvert(null);
        loadData();
      } else {
        toast.error("Gagal mengonversi buku:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi error konversi:", { description: e.message });
    } finally {
      setIsConverting(false);
    }
  };

  const filteredProposals = proposals.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q) ||
      p.proposedByName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Manajemen Usulan & Pengadaan Buku (Wishlist)
            </h1>
            <Badge variant="default" className="text-xs font-bold gap-1 bg-amber-500 text-white">
              <ShoppingCart className="h-3.5 w-3.5" />
              Crowdvoting Aktif
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kelola usulan buku dari siswa berdasarkan jumlah upvote terbanyak, verifikasi anggaran, dan konversi instan ke katalog utama.
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
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Total Usulan Masuk</span>
          <p className="font-heading text-2xl font-extrabold text-foreground">
            {stats.total} Judul
          </p>
          <p className="text-[11px] text-muted-foreground">Aspirasi koleksi dari siswa</p>
        </Card>

        <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Total Suara Dukungan (Upvotes)</span>
          <p className="font-heading text-2xl font-extrabold text-amber-600 flex items-center gap-1.5">
            <ThumbsUp className="h-5 w-5 fill-amber-500" />
            {stats.totalVotes} Suara
          </p>
          <p className="text-[11px] text-emerald-600 font-bold">Tingkat partisipasi tinggi</p>
        </Card>

        <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Disetujui & Dipesan</span>
          <p className="font-heading text-2xl font-extrabold text-primary">
            {stats.approved} Judul
          </p>
          <p className="text-[11px] text-muted-foreground">{stats.available} judul sudah tiba di rak</p>
        </Card>

        <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Estimasi Anggaran Terverifikasi</span>
          <p className="font-heading text-2xl font-extrabold text-foreground font-mono">
            Rp {stats.totalEstimatedBudget.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-muted-foreground">Alokasi belanja buku BOS</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl border border-border p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul usulan, penulis, atau nama pengusul..."
              className="pl-8 text-xs h-9 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background border border-border text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary h-9"
            >
              <option value="all">Semua Status</option>
              <option value="diusulkan">Sedang Di-Voting</option>
              <option value="disetujui">Disetujui</option>
              <option value="dipesan">Sedang Dipesan</option>
              <option value="tersedia">Sudah Ada di Rak</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 text-center w-20">Suara</th>
                <th className="px-4 py-3">Judul Buku & Penulis</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Pengusul</th>
                <th className="px-4 py-3 text-right">Estimasi Harga</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Aksi Pustakawan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredProposals.map((item) => {
                let statusBadge = (
                  <Badge variant="outline" className="text-[10px]">
                    Sedang Voting
                  </Badge>
                );
                if (item.status === "disetujui") {
                  statusBadge = (
                    <Badge variant="default" className="text-[10px] bg-primary">
                      Disetujui
                    </Badge>
                  );
                } else if (item.status === "dipesan") {
                  statusBadge = (
                    <Badge variant="secondary" className="text-[10px]">
                      Sedang Dipesan
                    </Badge>
                  );
                } else if (item.status === "tersedia") {
                  statusBadge = (
                    <Badge variant="success" className="text-[10px]">
                      Di Rak Buku
                    </Badge>
                  );
                } else if (item.status === "ditolak") {
                  statusBadge = (
                    <Badge variant="destructive" className="text-[10px]">
                      Ditolak
                    </Badge>
                  );
                }

                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    {/* Upvote Pill */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono font-bold text-xs border border-amber-500/30">
                        <ThumbsUp className="h-3 w-3 fill-amber-500" />
                        {item.upvotesCount}
                      </div>
                    </td>

                    {/* Book Title & Reason */}
                    <td className="px-4 py-3 max-w-sm">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-foreground line-clamp-1">{item.title}</h4>
                        <p className="text-muted-foreground text-[11px] line-clamp-1">
                          Penulis: {item.author} {item.isbn ? `• ISBN: ${item.isbn}` : ""}
                        </p>
                        <p className="text-[10px] text-muted-foreground italic line-clamp-1">
                          &quot;{item.reason}&quot;
                        </p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="secondary" className="text-[10px]">
                        {item.category}
                      </Badge>
                    </td>

                    {/* Proposer */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-bold text-foreground block">{item.proposedByName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {item.proposedByClass} • NIS {item.proposedByNis}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-right whitespace-nowrap font-mono font-bold text-foreground">
                      Rp {item.estimatedPrice.toLocaleString("id-ID")}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {statusBadge}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
                      {item.status === "diusulkan" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(item.id, "disetujui", "Disetujui untuk pengadaan buku baru.")
                            }
                            disabled={isUpdating}
                            className="text-[11px] h-7 px-2.5 font-bold bg-primary text-primary-foreground"
                          >
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateStatus(item.id, "ditolak", "Belum sesuai kriteria kurikulum sekolah.")
                            }
                            disabled={isUpdating}
                            className="text-[11px] h-7 px-2 text-destructive border-destructive/40 hover:bg-destructive/10"
                          >
                            Tolak
                          </Button>
                        </>
                      )}

                      {item.status === "disetujui" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            handleUpdateStatus(item.id, "dipesan", "PO Pemesanan telah dikirim ke penerbit.")
                          }
                          disabled={isUpdating}
                          className="text-[11px] h-7 px-2.5 font-bold gap-1"
                        >
                          <Package className="h-3 w-3" />
                          Tandai Dipesan
                        </Button>
                      )}

                      {item.status === "dipesan" && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenConvertModal(item)}
                          className="text-[11px] h-7 px-2.5 font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                          <BookPlus className="h-3 w-3" />
                          Buku Tiba & Masukkan Katalog
                        </Button>
                      )}

                      {item.status === "tersedia" && (
                        <Badge variant="success" className="text-[10px] gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Tersedia di Rak
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredProposals.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground italic">
                    Belum ada data usulan pengadaan buku.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 1-Click Convert to Catalog Modal */}
      {selectedProposalForConvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="max-w-md w-full rounded-3xl border border-border p-6 shadow-2xl bg-card space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <BookPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground">
                    Konversi Buku ke Katalog Utama
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Buku otomatis tercatat di katalog dan eksemplar perdana di rak.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProposalForConvert(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteConvert} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <h4 className="font-bold text-foreground text-xs">{selectedProposalForConvert.title}</h4>
                <p className="text-muted-foreground text-[11px]">
                  Penulis: {selectedProposalForConvert.author} • Pengusul: {selectedProposalForConvert.proposedByName}
                </p>
                <p className="text-[10px] text-amber-600 font-bold">
                  {selectedProposalForConvert.upvotesCount} Siswa Menunggu Buku Ini
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Kode Eksemplar / Barcode *</label>
                <Input
                  required
                  value={copyCode}
                  onChange={(e) => setCopyCode(e.target.value)}
                  className="text-xs h-9 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Lokasi Penempatan Rak *</label>
                <Input
                  required
                  value={shelfLocation}
                  onChange={(e) => setShelfLocation(e.target.value)}
                  placeholder="Contoh: Rak B-02 (Koleksi Baru)"
                  className="text-xs h-9 rounded-xl"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-950 dark:text-emerald-200">
                ✨ Notifikasi WhatsApp otomatis akan dikirim ke pengusul ({selectedProposalForConvert.proposedByName}) bahwa buku siap dipinjam!
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProposalForConvert(null)}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isConverting}
                  size="sm"
                  className="font-bold text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isConverting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  {isConverting ? "Menyimpan ke Katalog..." : "Konfirmasi Masuk Katalog"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

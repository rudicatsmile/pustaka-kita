"use client";

import { useState, useEffect } from "react";
import {
  Lightbulb,
  ThumbsUp,
  Plus,
  Flame,
  Clock,
  CheckCircle2,
  Package,
  BookOpen,
  Sparkles,
  Search,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Loader2,
  X,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import {
  getWishlistProposalsAction,
  submitBookProposalAction,
  toggleUpvoteProposalAction,
  type BookWishlistProposal,
} from "@/actions/wishlist";

export default function MemberWishlistPage() {
  const [activeTab, setActiveTab] = useState("explore");
  const [sortBy, setSortBy] = useState<"votes" | "recent">("votes");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [proposals, setProposals] = useState<BookWishlistProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "Pengembangan Diri",
    isbn: "",
    estimatedPrice: 90000,
    sourceUrl: "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUserId = "m1"; // Ahmad Fauzi
  const currentUserName = "Ahmad Fauzi";
  const currentUserNis = "20241001";
  const currentUserClass = "XII MIPA 1";

  const loadProposals = async () => {
    setIsLoading(true);
    try {
      const data = await getWishlistProposalsAction({
        sortBy,
        statusFilter,
        userId: currentUserId,
      });
      setProposals(data);
    } catch (e: any) {
      toast.error("Gagal memuat usulan buku:", { description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, [sortBy, statusFilter]);

  const handleToggleUpvote = async (proposalId: string) => {
    try {
      const res = await toggleUpvoteProposalAction(proposalId, currentUserId);
      if (res.success) {
        setProposals((prev) =>
          prev.map((p) =>
            p.id === proposalId
              ? {
                  ...p,
                  upvotesCount: res.upvotesCount,
                  hasUserUpvoted: res.hasUpvoted,
                }
              : p
          )
        );
        toast.success(
          res.hasUpvoted ? "Dukungan Ditambahkan! 👍" : "Dukungan Dibatalkan",
          {
            description: res.hasUpvoted
              ? "Suaramu telah tercatat untuk mempercepat pengadaan buku ini."
              : "Suara dukungan telah dihapus dari usulan ini.",
          }
        );
      }
    } catch (e: any) {
      toast.error("Gagal memproses upvote:", { description: e.message });
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.reason) {
      toast.error("Judul, Penulis, dan Alasan wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitBookProposalAction({
        title: formData.title,
        author: formData.author,
        category: formData.category,
        isbn: formData.isbn,
        estimatedPrice: formData.estimatedPrice,
        sourceUrl: formData.sourceUrl,
        reason: formData.reason,
        userId: currentUserId,
        userName: currentUserName,
        userNis: currentUserNis,
        userClass: currentUserClass,
      });

      if (res.success) {
        toast.success("Usulan Buku Berhasil Dikirimkan! 🎉", {
          description: "Usulan Anda kini tayang di papan crowdvoting sekolah.",
        });
        setShowSubmitModal(false);
        setFormData({
          title: "",
          author: "",
          category: "Pengembangan Diri",
          isbn: "",
          estimatedPrice: 90000,
          sourceUrl: "",
          reason: "",
        });
        loadProposals();
      } else {
        toast.error("Gagal mengirim usulan:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProposals = proposals.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const myProposals = proposals.filter((p) => p.proposedByUserId === currentUserId);
  const activeMyProposals = myProposals.filter((p) => p.status === "diusulkan").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="rounded-3xl border-primary/20 bg-linear-to-r from-primary/10 via-background to-secondary/10 p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-bold gap-1 bg-amber-500 hover:bg-amber-600 text-white">
                <Lightbulb className="h-3.5 w-3.5" />
                Aspirasi Koleksi Mandiri
              </Badge>
              <Badge variant="outline" className="text-xs">
                Kuota Aktif: {activeMyProposals}/3 Usulan
              </Badge>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Usulan Buku Baru & Crowdvoting Siswa
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Punya buku impian yang belum ada di rak perpustakaan? Usulkan di sini, ajak temanmu memberi upvote, dan dapatkan prioritas peminjaman perdana serta <strong>+10 Poin Literasi</strong> saat buku tiba!
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3">
            <Button
              onClick={() => setShowSubmitModal(true)}
              className="font-bold text-xs gap-2 px-5 py-2.5 rounded-2xl shadow-md"
            >
              <Plus className="h-4 w-4" />
              Ajukan Judul Buku Baru
            </Button>
            <p className="text-[11px] text-muted-foreground">
              * Maks. 3 usulan aktif per siswa secara bersamaan
            </p>
          </div>
        </div>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="grid grid-cols-2 w-full sm:w-80 bg-muted/60 p-1">
            <TabsTrigger value="explore" className="gap-1.5 text-xs font-semibold">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              Jelajahi & Voting ({filteredProposals.length})
            </TabsTrigger>
            <TabsTrigger value="my_proposals" className="gap-1.5 text-xs font-semibold">
              <Clock className="h-3.5 w-3.5" />
              Usulan Saya ({myProposals.length})
            </TabsTrigger>
          </TabsList>

          {/* Quick Search */}
          {activeTab === "explore" && (
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul atau penulis..."
                  className="pl-8 text-xs h-9 rounded-xl"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-background border border-border text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Semua Status</option>
                <option value="diusulkan">Sedang Di-Voting</option>
                <option value="disetujui">Disetujui Pustakawan</option>
                <option value="dipesan">Sedang Dipesan</option>
                <option value="tersedia">Sudah Ada di Rak</option>
              </select>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: JELAJAHI & CROWDVOTING */}
        {/* ========================================================================= */}
        <TabsContent value="explore" className="space-y-4">
          {/* Sorting Buttons */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/60 pb-3">
            <span className="font-semibold text-foreground">
              Menampilkan {filteredProposals.length} Usulan Koleksi
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px]">Urutkan:</span>
              <button
                type="button"
                onClick={() => setSortBy("votes")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  sortBy === "votes"
                    ? "bg-amber-500/10 text-amber-600 font-bold border border-amber-500/30"
                    : "hover:text-foreground"
                }`}
              >
                🔥 Suara Terbanyak
              </button>
              <button
                type="button"
                onClick={() => setSortBy("recent")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  sortBy === "recent"
                    ? "bg-primary/10 text-primary font-bold border border-primary/30"
                    : "hover:text-foreground"
                }`}
              >
                ⏱️ Terbaru
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProposals.map((item) => {
              let statusBadge = (
                <Badge variant="outline" className="text-[10px]">
                  🗳️ Sedang Di-Voting
                </Badge>
              );
              if (item.status === "disetujui") {
                statusBadge = (
                  <Badge variant="default" className="text-[10px] bg-primary">
                    ✅ Disetujui Pustakawan
                  </Badge>
                );
              } else if (item.status === "dipesan") {
                statusBadge = (
                  <Badge variant="secondary" className="text-[10px]">
                    📦 Sedang Dipesan
                  </Badge>
                );
              } else if (item.status === "tersedia") {
                statusBadge = (
                  <Badge variant="success" className="text-[10px]">
                    🎉 Tersedia di Rak!
                  </Badge>
                );
              }

              return (
                <Card
                  key={item.id}
                  className="rounded-2xl border border-border p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="secondary" className="text-[10px] font-semibold mb-1.5">
                          {item.category}
                        </Badge>
                        <h3 className="font-heading text-base font-bold text-foreground leading-snug line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Penulis: <strong className="text-foreground">{item.author}</strong>
                          {item.isbn && ` • ISBN: ${item.isbn}`}
                        </p>
                      </div>

                      {/* Upvote Button Pill */}
                      <button
                        type="button"
                        onClick={() => handleToggleUpvote(item.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all active:scale-95 shrink-0 ${
                          item.hasUserUpvoted
                            ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                        }`}
                        title={item.hasUserUpvoted ? "Batalkan dukungan" : "Beri upvote untuk buku ini"}
                      >
                        <ThumbsUp className={`h-4 w-4 ${item.hasUserUpvoted ? "fill-white" : ""}`} />
                        <span className="font-mono text-xs font-bold mt-1">
                          {item.upvotesCount}
                        </span>
                      </button>
                    </div>

                    {/* Reason Quote */}
                    <div className="rounded-xl bg-muted/40 p-3 border border-border/60 text-xs text-muted-foreground leading-relaxed italic space-y-1">
                      <p>&quot;{item.reason}&quot;</p>
                      <p className="text-[10px] text-right font-sans not-italic font-semibold text-foreground">
                        — {item.proposedByName} ({item.proposedByClass})
                      </p>
                    </div>

                    {/* Admin notes if any */}
                    {item.adminNotes && (
                      <div className="rounded-xl bg-primary/5 p-2.5 border border-primary/20 text-[11px] text-primary space-y-0.5">
                        <strong className="block font-bold">Catatan Pustakawan:</strong>
                        <p>{item.adminNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <div>{statusBadge}</div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Estimasi: Rp {item.estimatedPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredProposals.length === 0 && !isLoading && (
            <div className="text-center py-12 space-y-3">
              <Lightbulb className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground">
                Tidak ada usulan buku yang cocok dengan kata kunci atau filter.
              </p>
            </div>
          )}
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: USULAN SAYA & TRACKING STEPPER */}
        {/* ========================================================================= */}
        <TabsContent value="my_proposals" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-foreground">
              Daftar Usulan Buku Saya ({myProposals.length} Judul)
            </h3>
            <span className="text-xs text-muted-foreground">
              Memantau proses peninjauan, pemesanan, hingga buku tiba di rak.
            </span>
          </div>

          <div className="space-y-4">
            {myProposals.map((item) => {
              const currentStep =
                item.status === "diusulkan"
                  ? 1
                  : item.status === "disetujui"
                  ? 2
                  : item.status === "dipesan"
                  ? 3
                  : 4;

              return (
                <Card key={item.id} className="rounded-2xl border border-border p-6 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {item.category}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">Diajukan: {item.createdAt}</span>
                      </div>
                      <h4 className="font-heading text-lg font-bold text-foreground">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        Penulis: <strong>{item.author}</strong> • Estimasi: Rp {item.estimatedPrice.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 border border-amber-500/20">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {item.upvotesCount} Suara Dukungan
                      </div>
                    </div>
                  </div>

                  {/* 4-Step Stepper Timeline */}
                  <div className="pt-2">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {/* Step 1 */}
                      <div className="space-y-1.5">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs mx-auto border-2 ${
                            currentStep >= 1
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          1
                        </div>
                        <strong className="block text-[11px] text-foreground">Diusulkan</strong>
                        <span className="text-[9px] text-muted-foreground block">Tahap Voting</span>
                      </div>

                      {/* Step 2 */}
                      <div className="space-y-1.5">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs mx-auto border-2 ${
                            currentStep >= 2
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          2
                        </div>
                        <strong className="block text-[11px] text-foreground">Disetujui</strong>
                        <span className="text-[9px] text-muted-foreground block">Verifikasi Staf</span>
                      </div>

                      {/* Step 3 */}
                      <div className="space-y-1.5">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs mx-auto border-2 ${
                            currentStep >= 3
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          3
                        </div>
                        <strong className="block text-[11px] text-foreground">Dipesan</strong>
                        <span className="text-[9px] text-muted-foreground block">PO ke Penerbit</span>
                      </div>

                      {/* Step 4 */}
                      <div className="space-y-1.5">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs mx-auto border-2 ${
                            currentStep >= 4
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          4
                        </div>
                        <strong className="block text-[11px] text-foreground">Tersedia di Rak</strong>
                        <span className="text-[9px] text-emerald-600 font-bold block">Siap Dipinjam</span>
                      </div>
                    </div>
                  </div>

                  {item.adminNotes && (
                    <div className="rounded-xl bg-muted/40 p-3 border border-border text-xs text-muted-foreground space-y-1">
                      <span className="font-bold text-foreground block">Pemberitahuan Pustakawan:</span>
                      <p>{item.adminNotes}</p>
                    </div>
                  )}
                </Card>
              );
            })}

            {myProposals.length === 0 && (
              <div className="text-center py-12 space-y-3">
                <Lightbulb className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <p className="text-xs text-muted-foreground">
                  Anda belum pernah mengajukan usulan buku. Tekan tombol &quot;Ajukan Judul Buku Baru&quot; di atas untuk memulai!
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Submission Modal Dialog */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <Card className="max-w-lg w-full rounded-3xl border border-border p-6 shadow-2xl bg-card space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground">
                    Ajukan Usulan Buku Baru
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Buku yang disetujui akan diprioritaskan dalam anggaran belanja perpustakaan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Judul Buku *</label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Filosofi Teras, Sapiens, dll"
                  className="text-xs h-9 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Penulis / Pengarang *</label>
                  <Input
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Nama penulis"
                    className="text-xs h-9 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Kategori Buku *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary h-9"
                  >
                    <option value="Pengembangan Diri">Pengembangan Diri</option>
                    <option value="Sains & Astronomi">Sains & Astronomi</option>
                    <option value="Sastra & Sejarah">Sastra & Sejarah</option>
                    <option value="Teknologi & Informatika">Teknologi & Informatika</option>
                    <option value="Agama & Filsafat">Agama & Filsafat</option>
                    <option value="Komik & Grafis Edukasi">Komik & Grafis Edukasi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Perkiraan Harga (Rp)</label>
                  <Input
                    type="number"
                    value={formData.estimatedPrice}
                    onChange={(e) => setFormData({ ...formData, estimatedPrice: Number(e.target.value) })}
                    className="text-xs h-9 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">ISBN (Jika tahu)</label>
                  <Input
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="978-xxx-xxx"
                    className="text-xs h-9 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Tautan / Link Buku (Opsional)</label>
                <Input
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  placeholder="https://gramedia.com/..."
                  className="text-xs h-9 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Alasan Mengapa Buku Ini Perlu Dimiliki Sekolah *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Ceritakan mengapa buku ini bermanfaat bagi kamu dan teman-teman di sekolah..."
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSubmitModal(false)}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                  className="font-bold text-xs gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  {isSubmitting ? "Mengirim Usulan..." : "Kirim Usulan Sekarang"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

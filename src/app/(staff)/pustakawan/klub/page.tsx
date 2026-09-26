"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Award,
  Trash2,
  Pin,
  PinOff,
  Sparkles,
  BookOpen,
  Calendar,
  Users,
  Star,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Quote,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import {
  getReadingClubDataAction,
  togglePinBestReviewAction,
  deleteOrModerateReviewAction,
  updateMonthlyClubChallengeAction,
  type BookReviewItem,
  type ReadingClubChallenge,
} from "@/actions/club";

export default function PustakawanKlubPage() {
  const [challenge, setChallenge] = useState<ReadingClubChallenge | null>(null);
  const [reviews, setReviews] = useState<BookReviewItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Challenge Update Form State
  const [isEditingChallenge, setIsEditingChallenge] = useState(false);
  const [challengeForm, setChallengeForm] = useState({
    month: "September 2026",
    theme: "Eksplorasi Sastra & Sejarah Nusantara",
    featuredBookTitle: "Bumi Manusia",
    featuredBookAuthor: "Pramoedya Ananta Toer",
    description: "",
    targetParticipants: 60,
  });
  const [isSavingChallenge, setIsSavingChallenge] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getReadingClubDataAction("usr-admin-1");
      setChallenge(data.challenge);
      setReviews(data.reviews);
      setChallengeForm({
        month: data.challenge.month,
        theme: data.challenge.theme,
        featuredBookTitle: data.challenge.featuredBookTitle,
        featuredBookAuthor: data.challenge.featuredBookAuthor,
        description: data.challenge.description,
        targetParticipants: data.challenge.targetParticipants,
      });
    } catch (e: any) {
      toast.error("Gagal memuat data moderasi:", { description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePin = async (reviewId: string) => {
    try {
      const res = await togglePinBestReviewAction(reviewId, "Pustakawan");
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, isPinnedBestReview: res.isPinned } : r
          )
        );
        toast.success(
          res.isPinned
            ? "Ulasan Disematkan sebagai Resensi Terbaik! 👑"
            : "Sematan Resensi Terbaik Dilepas.",
          {
            description: res.isPinned
              ? "Ulasan ini sekarang tampil dengan lencana kehormatan di seluruh halaman."
              : "Status ulasan kembali normal.",
          }
        );
      }
    } catch (e: any) {
      toast.error("Gagal mengubah sematan:", { description: e.message });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Hapus ulasan ini secara permanen dari sistem?")) return;
    try {
      const res = await deleteOrModerateReviewAction(reviewId, "Pustakawan");
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        toast.success("Ulasan Berhasil Dimoderasi & Dihapus 🗑️");
      }
    } catch (e: any) {
      toast.error("Gagal memoderasi ulasan:", { description: e.message });
    }
  };

  const handleSaveChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingChallenge(true);
    try {
      const res = await updateMonthlyClubChallengeAction({
        ...challengeForm,
        actorName: "Pustakawan Perpustakaan",
      });
      if (res.success) {
        setChallenge(res.challenge);
        setIsEditingChallenge(false);
        toast.success("Tema Klub Membaca Bulanan Berhasil Diperbarui! 🌟", {
          description: "Perubahan tema tayang di seluruh portal anggota.",
        });
      }
    } catch (e: any) {
      toast.error("Gagal menyimpan tema:", { description: e.message });
    } finally {
      setIsSavingChallenge(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.bookTitle.toLowerCase().includes(q) ||
      r.userName.toLowerCase().includes(q) ||
      r.reviewText.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Manajemen Klub Membaca & Moderasi Resensi
            </h1>
            <Badge variant="default" className="text-xs font-bold gap-1 bg-amber-500 text-white">
              <MessageSquare className="h-3.5 w-3.5" />
              Komunitas Literasi
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Atur tema bacaan bulanan, sematkan resensi terbaik (Editor&apos;s Pick), dan jaga etika diskusi siswa.
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

      {/* Monthly Challenge Setting Box */}
      <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Program Berjalan: {challenge?.month}
            </span>
            <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              {challenge?.theme}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Buku Pilihan: <strong className="text-foreground">{challenge?.featuredBookTitle}</strong> karya {challenge?.featuredBookAuthor}
            </p>
          </div>

          <Button
            size="sm"
            variant={isEditingChallenge ? "ghost" : "outline"}
            onClick={() => setIsEditingChallenge(!isEditingChallenge)}
            className="text-xs font-semibold"
          >
            {isEditingChallenge ? "Tutup Form" : "Ubah Tema & Buku Pilihan"}
          </Button>
        </div>

        {isEditingChallenge && (
          <form onSubmit={handleSaveChallenge} className="pt-2 space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Periode Bulan *</label>
                <Input
                  required
                  value={challengeForm.month}
                  onChange={(e) => setChallengeForm({ ...challengeForm, month: e.target.value })}
                  placeholder="Contoh: Oktober 2026"
                  className="text-xs h-9 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Tema Literasi Bulan Ini *</label>
                <Input
                  required
                  value={challengeForm.theme}
                  onChange={(e) => setChallengeForm({ ...challengeForm, theme: e.target.value })}
                  placeholder="Contoh: Jelajah Sains & Kecerdasan Buatan"
                  className="text-xs h-9 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Judul Buku Pilihan *</label>
                <Input
                  required
                  value={challengeForm.featuredBookTitle}
                  onChange={(e) =>
                    setChallengeForm({ ...challengeForm, featuredBookTitle: e.target.value })
                  }
                  className="text-xs h-9 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Penulis Buku *</label>
                <Input
                  required
                  value={challengeForm.featuredBookAuthor}
                  onChange={(e) =>
                    setChallengeForm({ ...challengeForm, featuredBookAuthor: e.target.value })
                  }
                  className="text-xs h-9 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Deskripsi & Petunjuk Tantangan</label>
              <textarea
                rows={2}
                value={challengeForm.description}
                onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditingChallenge(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSavingChallenge}
                size="sm"
                className="font-bold text-xs"
              >
                {isSavingChallenge ? "Menyimpan..." : "Simpan Tema Baru"}
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Moderation Search & Filter */}
      <Card className="rounded-2xl border border-border p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ulasan berdasarkan judul buku, nama siswa, atau isi resensi..."
              className="pl-8 text-xs h-9 rounded-xl"
            />
          </div>

          <span className="text-xs text-muted-foreground">
            Menampilkan <strong>{filteredReviews.length}</strong> ulasan resensi
          </span>
        </div>
      </Card>

      {/* Moderation Table */}
      <Card className="rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Buku & Rating</th>
                <th className="px-4 py-3">Penulis Resensi</th>
                <th className="px-4 py-3">Isi Ulasan & Kutipan Emas</th>
                <th className="px-4 py-3 text-center">Likes</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Aksi Moderasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredReviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap align-top">
                    <div className="space-y-0.5">
                      <strong className="text-foreground block">{rev.bookTitle}</strong>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3 w-3 ${
                              s <= rev.rating
                                ? "text-amber-500 fill-amber-500"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                        <span className="text-[10px] text-muted-foreground font-mono ml-1">
                          {rev.rating}.0
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap align-top">
                    <strong className="text-foreground block">{rev.userName}</strong>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {rev.userClass} • NIS {rev.userNis}
                    </span>
                  </td>

                  <td className="px-4 py-3 max-w-md space-y-1.5 align-top">
                    {rev.favoriteQuote && (
                      <div className="rounded-lg border-l-2 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/30 p-2 text-[11px] font-serif italic text-foreground">
                        <Quote className="h-3 w-3 inline text-amber-500 mr-1" />
                        &quot;{rev.favoriteQuote}&quot;
                      </div>
                    )}
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                      {rev.reviewText}
                    </p>
                    {rev.hasSpoiler && (
                      <Badge variant="warning" className="text-[9px] py-0 px-1.5">
                        Mengandung Spoiler
                      </Badge>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center whitespace-nowrap font-mono font-bold align-top">
                    <span className="text-amber-600">👍 {rev.likesCount}</span>
                  </td>

                  <td className="px-4 py-3 text-center whitespace-nowrap align-top">
                    {rev.isPinnedBestReview ? (
                      <Badge variant="default" className="text-[9px] bg-amber-500 text-white font-bold gap-1">
                        <Award className="h-3 w-3" />
                        Editor&apos;s Pick
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">Normal</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-1.5 align-top">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTogglePin(rev.id)}
                      className={`text-[11px] h-7 px-2 font-bold gap-1 ${
                        rev.isPinnedBestReview
                          ? "border-amber-400 text-amber-600 hover:bg-amber-50"
                          : "border-border text-foreground hover:bg-muted"
                      }`}
                      title={
                        rev.isPinnedBestReview
                          ? "Lepas sematan Editor's Pick"
                          : "Sematkan sebagai Resensi Terbaik"
                      }
                    >
                      {rev.isPinnedBestReview ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                      {rev.isPinnedBestReview ? "Batal Semat" : "Sematkan"}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteReview(rev.id)}
                      className="text-[11px] h-7 px-2 text-destructive border-destructive/40 hover:bg-destructive/10"
                      title="Hapus / Moderasi Ulasan"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}

              {filteredReviews.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground italic">
                    Belum ada data ulasan resensi siswa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageSquare,
  BookOpen,
  Sparkles,
  ThumbsUp,
  Quote,
  Star,
  Award,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  Bookmark,
  Share2,
  Eye,
  EyeOff,
  Send,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import {
  getReadingClubDataAction,
  toggleLikeReviewAction,
  type BookReviewItem,
  type ReadingClubChallenge,
} from "@/actions/club";

export default function MemberReadingClubPage() {
  const [activeTab, setActiveTab] = useState("feed");
  const [clubData, setClubData] = useState<{
    challenge: ReadingClubChallenge;
    reviews: BookReviewItem[];
    pinnedReviews: BookReviewItem[];
    stats: { totalReviews: number; totalLikes: number; activeMembers: number };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  const currentUserId = "m1"; // Ahmad Fauzi

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getReadingClubDataAction(currentUserId);
      setClubData(data);
    } catch (e: any) {
      toast.error("Gagal memuat data Klub Membaca:", { description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleLike = async (reviewId: string) => {
    try {
      const res = await toggleLikeReviewAction(reviewId, currentUserId);
      if (res.success && clubData) {
        setClubData({
          ...clubData,
          reviews: clubData.reviews.map((r) =>
            r.id === reviewId
              ? { ...r, likesCount: res.likesCount, hasUserLiked: res.hasLiked }
              : r
          ),
        });
      }
    } catch (e: any) {
      toast.error("Gagal memproses like:", { description: e.message });
    }
  };

  if (isLoading || !clubData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-xs text-muted-foreground">Memuat Digital Reading Club...</p>
        </div>
      </div>
    );
  }

  const { challenge, reviews, stats } = clubData;
  const myReviews = reviews.filter((r) => r.userId === currentUserId);
  const myTotalLikes = myReviews.reduce((acc, r) => acc + r.likesCount, 0);

  return (
    <div className="space-y-6">
      {/* Monthly Club Featured Banner */}
      <Card className="rounded-3xl border-primary/20 bg-linear-to-r from-primary/10 via-background to-amber-500/10 p-6 shadow-sm overflow-hidden relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="text-xs font-bold gap-1 bg-amber-500 hover:bg-amber-600 text-white">
                <Sparkles className="h-3.5 w-3.5" />
                Tema Bulan Ini: {challenge.theme}
              </Badge>
              <Badge variant="outline" className="text-xs font-semibold">
                <Calendar className="h-3 w-3 mr-1" />
                {challenge.month}
              </Badge>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Buku Pilihan Klub: &quot;{challenge.featuredBookTitle}&quot;
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {challenge.description}
            </p>

            {/* Target Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  Partisipasi Membaca:
                </span>
                <span className="font-mono font-bold text-foreground">
                  {challenge.activeParticipants} / {challenge.targetParticipants} Siswa
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-linear-to-r from-primary to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((challenge.activeParticipants / challenge.targetParticipants) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link href={`/katalog/${challenge.featuredBookSlug}`}>
                <Button size="sm" className="font-bold text-xs gap-1.5 shadow-sm">
                  <BookOpen className="h-4 w-4" />
                  Lihat Buku & Pinjam di Kiosk
                </Button>
              </Link>
              <Link href={`/katalog/${challenge.featuredBookSlug}`}>
                <Button variant="outline" size="sm" className="font-semibold text-xs gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  Tulis Resensi Buku Ini
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats Box */}
          <div className="grid grid-cols-3 gap-3 bg-background/90 p-4 rounded-2xl border border-border shadow-xs text-center shrink-0">
            <div className="p-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Total Resensi
              </span>
              <span className="font-mono text-xl font-bold text-foreground">
                {stats.totalReviews}
              </span>
            </div>
            <div className="h-10 w-px bg-border my-auto" />
            <div className="p-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Diskusi Aktif
              </span>
              <span className="font-mono text-xl font-bold text-primary">
                {challenge.discussionThreadsCount}
              </span>
            </div>
            <div className="h-10 w-px bg-border my-auto" />
            <div className="p-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Total Like
              </span>
              <span className="font-mono text-xl font-bold text-amber-600 flex items-center justify-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5 fill-amber-500" />
                {stats.totalLikes}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md bg-muted/60 p-1">
          <TabsTrigger value="feed" className="gap-1.5 text-xs font-semibold">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            Feed Resensi ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="challenge" className="gap-1.5 text-xs font-semibold">
            <Award className="h-3.5 w-3.5" />
            Tantangan Bulan Ini
          </TabsTrigger>
          <TabsTrigger value="my_reviews" className="gap-1.5 text-xs font-semibold">
            <MessageSquare className="h-3.5 w-3.5" />
            Resensi Saya ({myReviews.length})
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: FEED RESENSI & KUTIPAN TERHANGAT */}
        {/* ========================================================================= */}
        <TabsContent value="feed" className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground pb-2">
            <span className="font-semibold text-foreground">
              Resensi Pembaca Terbaru & Kutipan Emas Sekolah
            </span>
            <span className="text-[11px]">Setiap resensi bernilai +5 Poin Literasi</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => {
              const isSpoilerRevealed = revealedSpoilers[rev.id];

              return (
                <Card
                  key={rev.id}
                  className={`rounded-2xl border p-5 shadow-xs transition-all space-y-3.5 flex flex-col justify-between ${
                    rev.isPinnedBestReview
                      ? "border-amber-400 bg-linear-to-b from-amber-500/5 via-card to-card shadow-sm ring-1 ring-amber-500/20"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge variant="outline" className="text-[10px] font-semibold">
                            📚 {rev.bookTitle}
                          </Badge>
                          {rev.isPinnedBestReview && (
                            <Badge variant="default" className="text-[9px] gap-1 bg-amber-500 text-white font-bold">
                              <Award className="h-3 w-3" />
                              Resensi Terbaik
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-xs">{rev.userName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">({rev.userClass})</span>
                        </div>

                        <div className="flex items-center gap-1 mt-0.5">
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
                            {rev.createdAt.substring(0, 10)}
                          </span>
                        </div>
                      </div>

                      {/* Like Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleLike(rev.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 shrink-0 ${
                          rev.hasUserLiked
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                        }`}
                        title="Bermanfaat"
                      >
                        <ThumbsUp className={`h-3.5 w-3.5 ${rev.hasUserLiked ? "fill-white" : ""}`} />
                        <span>{rev.likesCount}</span>
                      </button>
                    </div>

                    {/* Favorite Quote Block */}
                    {rev.favoriteQuote && (
                      <div className="rounded-xl border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/30 p-3 text-xs font-serif italic text-foreground leading-relaxed">
                        &quot;{rev.favoriteQuote}&quot;
                      </div>
                    )}

                    {/* Review Body */}
                    {rev.hasSpoiler && !isSpoilerRevealed ? (
                      <div className="p-3 rounded-xl bg-muted/60 border border-border text-center space-y-1">
                        <span className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                          <EyeOff className="h-3.5 w-3.5" />
                          Ulasan ini mengandung spoiler alur cerita.
                        </span>
                        <button
                          type="button"
                          onClick={() => setRevealedSpoilers({ ...revealedSpoilers, [rev.id]: true })}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Klik untuk Membaca
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {rev.reviewText}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{rev.repliesCount} Diskusi / Balasan</span>
                    <span className="text-primary font-semibold flex items-center gap-1">
                      Bahas Buku Ini <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: TANTANGAN MEMBACA BULAN INI */}
        {/* ========================================================================= */}
        <TabsContent value="challenge" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">
                  Tantangan Literasi: &quot;{challenge.theme}&quot;
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Selesaikan 3 misi literasi bulan September untuk membuka Lencana Bintang Sastra dan sertifikat semester!
                </p>
              </div>

              <div className="space-y-4">
                {/* Mission 1 */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-foreground">
                        Misi 1: Pinjam & Baca Minimal 1 Buku Bertema Sastra / Sejarah
                      </strong>
                      <Badge variant="success" className="text-[10px]">
                        Selesai
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Terverifikasi: Anda telah membaca &quot;Bumi Manusia&quot; di bulan ini.
                    </p>
                  </div>
                </div>

                {/* Mission 2 */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-foreground">
                        Misi 2: Tuliskan 1 Resensi & Kutipan Inspiratif Buku
                      </strong>
                      <Badge variant="success" className="text-[10px]">
                        Selesai (+5 Poin)
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Terverifikasi: Anda telah memposting resensi bermakna untuk &quot;Bumi Manusia&quot;.
                    </p>
                  </div>
                </div>

                {/* Mission 3 */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-foreground">
                        Misi 3: Beri Dukungan (Like) pada 3 Resensi Milik Rekan Siswa
                      </strong>
                      <Badge variant="warning" className="text-[10px]">
                        Progres 2 / 3
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Beri 1 like lagi pada ulasan rekan untuk menuntaskan misi apresiasi membaca.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Reward Card */}
            <Card className="rounded-2xl border border-amber-400 bg-amber-50/20 dark:bg-amber-950/20 p-6 shadow-sm flex flex-col justify-between space-y-4 text-center">
              <div className="space-y-3">
                <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900 border-2 border-amber-400 flex items-center justify-center text-3xl mx-auto shadow-md">
                  🏆
                </div>
                <h4 className="font-heading text-base font-bold text-foreground">
                  Lencana Bintang Sastra
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Lencana kehormatan khusus anggota Klub Membaca yang menyelesaikan seluruh tantangan literasi bulan September.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-background border border-amber-400/40 text-xs space-y-1">
                <span className="text-[10px] text-muted-foreground block">Hadiah Tambahan:</span>
                <strong className="text-amber-600 font-bold block">+25 Poin Gamifikasi</strong>
                <span className="text-[10px] text-muted-foreground block">
                  Langsung tercatat di Papan Peringkat
                </span>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: RESENSI SAYA */}
        {/* ========================================================================= */}
        <TabsContent value="my_reviews" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-foreground">
              Resensi yang Saya Tulis ({myReviews.length} Ulasan)
            </h3>
            <span className="text-xs text-muted-foreground">
              Total Apresiasi Diterima: <strong>{myTotalLikes} Likes 👍</strong>
            </span>
          </div>

          <div className="space-y-4">
            {myReviews.map((item) => (
              <Card key={item.id} className="rounded-2xl border border-border p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <Badge variant="secondary" className="text-[10px]">
                      {item.bookTitle}
                    </Badge>
                    <div className="flex items-center gap-1 pt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${
                            s <= item.rating
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                      <span className="text-[10px] text-muted-foreground font-mono ml-1">
                        {item.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-xs font-bold border border-amber-500/20">
                    <ThumbsUp className="h-3.5 w-3.5 fill-amber-500" />
                    {item.likesCount} Siswa Menyukai
                  </div>
                </div>

                {item.favoriteQuote && (
                  <div className="rounded-xl border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/30 p-3 text-xs font-serif italic text-foreground">
                    &quot;{item.favoriteQuote}&quot;
                  </div>
                )}

                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {item.reviewText}
                </p>
              </Card>
            ))}

            {myReviews.length === 0 && (
              <div className="text-center py-12 space-y-3">
                <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <p className="text-xs text-muted-foreground">
                  Anda belum pernah menulis resensi buku. Buka halaman katalog buku dan bagikan ulasanmu untuk mendapatkan +5 Poin!
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

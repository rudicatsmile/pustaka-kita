"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Star,
  Barcode,
  BookMarked,
  ArrowLeft,
  BookmarkCheck,
  Check,
  ThumbsUp,
  MessageSquare,
  Quote,
  Eye,
  EyeOff,
  Sparkles,
  Send,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookItem, BookCopyItem } from "@/types";
import { toast } from "@/components/ui/sonner";
import { createReservationAction } from "@/actions/reservations";
import { Input } from "@/components/ui/input";
import {
  getBookReviewsAction,
  submitBookReviewAction,
  toggleLikeReviewAction,
  type BookReviewItem,
} from "@/actions/club";

interface BookDetailClientProps {
  book: BookItem;
  copies: BookCopyItem[];
  sanitizedSynopsis: string;
}

export function BookDetailClient({
  book,
  copies,
  sanitizedSynopsis,
}: BookDetailClientProps) {
  const [reservationOpen, setReservationOpen] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberNis, setMemberNis] = useState("2024001");

  // Reviews state
  const [reviews, setReviews] = useState<BookReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState(5.0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewTextInput, setReviewTextInput] = useState("");
  const [quoteInput, setQuoteInput] = useState("");
  const [hasSpoilerInput, setHasSpoilerInput] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getBookReviewsAction(book.id, book.title).then((res) => {
      setReviews(res.reviews);
      setAverageRating(res.averageRating);
    });
  }, [book.id, book.title]);

  const handleToggleLike = async (reviewId: string) => {
    const res = await toggleLikeReviewAction(reviewId, "m1");
    if (res.success) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, likesCount: res.likesCount, hasUserLiked: res.hasLiked }
            : r
        )
      );
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTextInput.trim()) {
      toast.error("Tuliskan ulasan resensi kamu terlebih dahulu.");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await submitBookReviewAction({
        bookId: book.id,
        bookTitle: book.title,
        rating: ratingInput,
        reviewText: reviewTextInput,
        favoriteQuote: quoteInput,
        hasSpoiler: hasSpoilerInput,
        userId: "m1",
        userName: "Ahmad Fauzi",
        userNis: "20241001",
        userClass: "XII MIPA 1",
      });
      if (res.success && res.review) {
        setReviews([res.review, ...reviews]);
        setReviewTextInput("");
        setQuoteInput("");
        setHasSpoilerInput(false);
        setShowReviewForm(false);
        toast.success("Resensi Berhasil Diposting! ⭐ (+5 Poin Literasi)", {
          description: "Terima kasih telah berbagi pandangan membacamu!",
        });
      }
    } catch (err: any) {
      toast.error("Gagal mengirim resensi:", { description: err.message });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleReservation = async () => {
    if (!memberNis.trim()) {
      toast.error("Masukkan NIS/NIM kamu terlebih dahulu.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createReservationAction({
        memberNisNim: memberNis.trim(),
        bookId: book.id,
      });

      if (res.success) {
        setIsReserved(true);
        setReservationOpen(false);
        toast.success("Reservasi buku berhasil diajukan! 🎉", {
          description: `Buku "${book.title}" masuk dalam antreanmu. Kamu akan menerima notifikasi WhatsApp jika buku sudah siap diambil.`,
        });
      } else {
        toast.error("Gagal mengajukan reservasi", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/katalog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Katalog OPAC</span>
        </Link>
      </div>

      {/* Book Hero Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cover Column */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl border-2 border-border/80 shadow-xl bg-muted">
            <Image
              src={book.coverUrl}
              alt={`Sampul buku ${book.title} oleh ${book.author}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
              priority
            />
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="shadow-md font-bold text-xs">
                {book.category}
              </Badge>
            </div>
            {book.bookType === "keduanya" && (
              <div className="absolute bottom-4 right-4">
                <Badge variant="default" className="text-xs bg-primary/95 shadow-md">
                  Fisik + E-Book
                </Badge>
              </div>
            )}
          </div>

          {/* Quick Actions under cover */}
          <div className="w-full max-w-sm mt-5 space-y-2.5">
            {book.availableCopies > 0 ? (
              <Link href="/dashboard/scan" className="block w-full">
                <Button size="lg" className="w-full font-bold shadow-md">
                  Pinjam Sekarang via Scan
                </Button>
              </Link>
            ) : (
              <Dialog open={reservationOpen} onOpenChange={setReservationOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    variant={isReserved ? "outline" : "secondary"}
                    className="w-full font-bold"
                  >
                    {isReserved ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-emerald-600" />
                        Telah Direservasi (Antrean Aktif)
                      </>
                    ) : (
                      <>
                        <BookmarkCheck className="mr-2 h-4 w-4" />
                        Ajukan Reservasi Buku
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Konfirmasi Reservasi Buku</DialogTitle>
                    <DialogDescription>
                      Buku <strong>{book.title}</strong> saat ini sedang dipinjam seluruhnya. Kamu
                      dapat masuk antrean reservasi. Begitu eksemplar dikembalikan, kamu akan diberi
                      waktu 2×24 jam untuk mengambilnya di perpustakaan.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 my-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">
                        Nomor Induk Siswa/Mahasiswa (NIS/NIM):
                      </label>
                      <Input
                        type="text"
                        placeholder="Contoh: 2024001"
                        value={memberNis}
                        onChange={(e) => setMemberNis(e.target.value)}
                        className="text-xs font-mono"
                      />
                    </div>
                    <div className="rounded-xl bg-muted/60 p-3 text-xs space-y-1">
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">Posisi Antrean:</span>
                        <strong className="text-foreground">Masuk Antrean Aktif</strong>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">Notifikasi:</span>
                        <span className="text-emerald-600 font-semibold">WhatsApp Otomatis</span>
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setReservationOpen(false)}>
                      Batal
                    </Button>
                    <Button
                      onClick={handleReservation}
                      disabled={isSubmitting}
                      className="font-bold"
                    >
                      {isSubmitting ? "Memproses..." : "Ya, Ajukan Reservasi"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {(book.bookType === "keduanya" || book.bookType === "ebook") && (
              <Link href="/dashboard/ebook/eb-001/baca" className="block w-full">
                <Button variant="outline" size="lg" className="w-full font-bold gap-2">
                  <BookMarked className="h-4 w-4 text-primary" />
                  Baca E-Book di Browser
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {book.category}
              </span>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>{book.rating}</span>
                <span className="text-muted-foreground font-normal">
                  ({book.readCount} kali dipinjam)
                </span>
              </div>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground">
              {book.title}
            </h1>
            <p className="text-base text-muted-foreground">
              Ditulis oleh <strong className="text-foreground">{book.author}</strong> • Penerbit{" "}
              <strong className="text-foreground">{book.publisher}</strong>
            </p>
          </div>

          {/* Quick Stat Pill Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-border bg-card p-3.5 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Lokasi Rak</span>
              <p className="font-mono text-xs font-bold text-primary truncate">
                {book.shelfLocation}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-3.5 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Ketersediaan</span>
              <p className="text-xs font-bold text-emerald-600">
                {book.availableCopies} dari {book.totalCopies} Ada
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-3.5 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Tahun Terbit</span>
              <p className="text-xs font-bold text-foreground">{book.publicationYear}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-3.5 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Tebal Halaman</span>
              <p className="text-xs font-bold text-foreground">{book.pages} hlm</p>
            </div>
          </div>

          {/* Sinopsis Section (Sanitized) */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
            <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Sinopsis & Gambaran Buku</span>
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed text-justify">
              {sanitizedSynopsis}
            </p>
          </div>

          {/* Metadata Bibliografi Lengkap */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground">
              Informasi Bibliografi Lengkap
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Nomor ISBN:</span>
                <span className="font-mono font-bold text-foreground">{book.isbn}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Bahasa Dokumen:</span>
                <span className="font-bold text-foreground">{book.language}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Tipe Koleksi:</span>
                <span className="font-bold text-foreground uppercase">{book.bookType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Durasi Pinjam Standar:</span>
                <span className="font-bold text-primary">7 Hari Kalender</span>
              </div>
            </div>
          </div>

          {/* Daftar Salinan Eksemplar Fisik */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                  <Barcode className="h-5 w-5 text-primary" />
                  <span>Daftar Salinan Eksemplar Fisik</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Setiap eksemplar memiliki kode barcode unik untuk peminjaman mandiri.
                </p>
              </div>
              <Badge variant="default" className="text-xs">
                Total {copies.length > 0 ? copies.length : book.totalCopies} Salinan
              </Badge>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Kode Eksemplar</TableHead>
                  <TableHead className="text-xs">Lokasi Rak</TableHead>
                  <TableHead className="text-xs">Kondisi</TableHead>
                  <TableHead className="text-xs text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {copies.length > 0 ? (
                  copies.map((copy) => (
                    <TableRow key={copy.id}>
                      <TableCell className="font-mono font-bold text-xs text-primary">
                        {copy.copyCode}
                      </TableCell>
                      <TableCell className="text-xs">{copy.shelfLocation}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {copy.conditionNote}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={copy.status === "tersedia" ? "success" : "warning"}
                          className="text-[10px]"
                        >
                          {copy.status === "tersedia" ? "🟢 Tersedia" : "🟡 Sedang Dipinjam"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      PKC-2024-001-001
                    </TableCell>
                    <TableCell className="text-xs">{book.shelfLocation}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      Buku dalam kondisi terawat
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="success" className="text-[10px]">
                        🟢 Tersedia
                      </Badge>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Forum Resensi Pembaca & Kutipan Emas */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span>Resensi Pembaca & Kutipan Emas</span>
                  </h3>
                  <Badge variant="default" className="text-[10px] bg-amber-500 font-bold text-white">
                    ⭐ {averageRating} / 5.0
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bagikan pandangan membacamu, kutipan inspiratif, dan diskusikan buku ini bersama rekan siswa.
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="font-bold text-xs gap-1.5 shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {showReviewForm ? "Tutup Form" : "Tulis Resensi & Kutipan (+5 Poin)"}
              </Button>
            </div>

            {/* Expandable Review Form */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Beri Penilaian Bintang:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingInput(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= ratingInput
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="font-mono font-bold text-amber-600 ml-1.5">{ratingInput}.0</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Ulasan Resensi Kamu *</label>
                  <textarea
                    required
                    rows={3}
                    value={reviewTextInput}
                    onChange={(e) => setReviewTextInput(e.target.value)}
                    placeholder="Ceritakan pesan moral, alur cerita, atau karakter yang paling kamu sukai..."
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground flex items-center gap-1.5">
                    <Quote className="h-3.5 w-3.5 text-amber-500" />
                    Kutipan Emas Favorit (Quotes dari Halaman Buku):
                  </label>
                  <Input
                    value={quoteInput}
                    onChange={(e) => setQuoteInput(e.target.value)}
                    placeholder="Contoh: 'Hiduplah untuk memberi sebanyak-banyaknya...'"
                    className="text-xs h-9 rounded-xl font-serif italic"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="has-spoiler-check"
                    checked={hasSpoilerInput}
                    onChange={(e) => setHasSpoilerInput(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <label htmlFor="has-spoiler-check" className="text-muted-foreground text-[11px] cursor-pointer">
                    Ulasan ini mengandung bocoran jalan cerita (*Spoiler Alert*)
                  </label>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-border/50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReviewForm(false)}
                    className="text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmittingReview}
                    className="font-bold text-xs gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isSubmittingReview ? "Memposting..." : "Posting Resensi"}
                  </Button>
                </div>
              </form>
            )}

            {/* List of Reviews */}
            <div className="space-y-4">
              {reviews.map((rev) => {
                const isSpoilerRevealed = revealedSpoilers[rev.id];

                return (
                  <div
                    key={rev.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-3 ${
                      rev.isPinnedBestReview
                        ? "border-amber-400 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-xs">{rev.userName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">({rev.userClass})</span>
                          {rev.isPinnedBestReview && (
                            <Badge variant="default" className="text-[9px] gap-1 bg-amber-500 text-white font-bold">
                              <Award className="h-3 w-3" />
                              Pilihan Pustakawan
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${
                                s <= rev.rating
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                          <span className="text-[10px] text-muted-foreground ml-1 font-mono">
                            {rev.createdAt.substring(0, 10)}
                          </span>
                        </div>
                      </div>

                      {/* Like button */}
                      <button
                        type="button"
                        onClick={() => handleToggleLike(rev.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                          rev.hasUserLiked
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                        }`}
                        title="Bermanfaat / Suka"
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

                    {/* Review text */}
                    {rev.hasSpoiler && !isSpoilerRevealed ? (
                      <div className="p-3 rounded-xl bg-muted/60 border border-border text-center space-y-1">
                        <span className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                          <EyeOff className="h-3.5 w-3.5" />
                          Ulasan ini ditandai mengandung spoiler cerita.
                        </span>
                        <button
                          type="button"
                          onClick={() => setRevealedSpoilers({ ...revealedSpoilers, [rev.id]: true })}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Klik untuk Menampilkan Isi Ulasan
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {rev.reviewText}
                      </p>
                    )}
                  </div>
                );
              })}

              {reviews.length === 0 && (
                <div className="text-center py-8 space-y-2">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs text-muted-foreground">
                    Belum ada resensi untuk buku ini. Jadilah pembaca pertama yang membagikan pandanganmu!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

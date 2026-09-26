"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  Star,
  Barcode,
  BookMarked,
  ArrowLeft,
  BookmarkCheck,
  Check,
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
import { BookItem, BookCopyItem } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";
import { createReservationAction } from "@/actions/reservations";

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

  const handleReservation = async () => {
    setIsSubmitting(true);
    try {
      const res = await createReservationAction({
        memberNisNim: "2024001", // Demo logged in member
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
                  <div className="rounded-xl bg-muted/60 p-4 text-xs space-y-1.5 my-2">
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Posisi Antrean Kamu:</span>
                      <strong className="text-foreground">Urutan ke-1</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Notifikasi Melalui:</span>
                      <strong className="text-foreground font-mono">WhatsApp 0812-3456-7890</strong>
                    </p>
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
        </div>
      </div>
    </div>
  );
}

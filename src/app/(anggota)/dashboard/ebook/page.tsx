"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookMarked,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMemberEbooks } from "@/actions/member";

export default function KoleksiEbookPage() {
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMemberEbooks()
      .then((data) => setEbooks(data))
      .catch((e) => console.error("Gagal memuat e-book:", e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Koleksi E-Book Digital
          </h1>
          <p className="text-xs text-muted-foreground">
            Buku elektronik berformat PDF dan EPUB yang siap dibaca langsung di peramban Anda.
          </p>
        </div>
        <Badge variant="default" className="font-bold text-xs">
          {ebooks.length} Judul E-Book Tersedia
        </Badge>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          Memuat daftar e-book dari database...
        </div>
      ) : ebooks.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <BookMarked className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <p className="text-sm font-semibold text-foreground">Belum ada e-book yang tersedia</p>
          <p className="text-xs text-muted-foreground">
            Petugas perpustakaan akan segera mengunggah koleksi buku digital baru.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ebooks.map((eb) => (
            <Card
              key={eb.id}
              className="group flex flex-col justify-between overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all"
            >
              <div className="p-5 flex gap-4">
                <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl border shadow-sm bg-muted">
                  {eb.coverUrl ? (
                    <Image src={eb.coverUrl} alt={eb.title} fill className="object-cover" sizes="96px" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs font-mono text-muted-foreground">
                      {eb.fileFormat.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase">
                      {eb.fileFormat}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {(eb.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {eb.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">Karya: {eb.author}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Dibaca <strong className="text-foreground">{eb.readCount}x</strong> oleh pembaca
                  </p>
                </div>
              </div>

              <div className="border-t border-border bg-muted/20 px-5 py-3 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Format: {eb.fileFormat.toUpperCase()}
                </span>
                <Link href={`/dashboard/ebook/${eb.id}/baca`}>
                  <Button size="sm" className="text-xs font-bold gap-1 shadow-sm">
                    Buka E-Book
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

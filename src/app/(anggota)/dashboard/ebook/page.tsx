"use client";

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
import { DUMMY_EBOOKS } from "@/data/dummy";

export default function KoleksiEbookPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Koleksi E-Book Digital Saya
          </h1>
          <p className="text-xs text-muted-foreground">
            Buku elektronik berformat PDF dan EPUB yang siap dibaca langsung di peramban Anda.
          </p>
        </div>
        <Badge variant="default" className="font-bold text-xs">
          {DUMMY_EBOOKS.length} Judul E-Book Siap Dibaca
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_EBOOKS.map((eb) => (
          <Card
            key={eb.id}
            className="group flex flex-col justify-between overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <div className="p-5 flex gap-4">
              <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl border shadow-sm bg-muted">
                <Image src={eb.coverUrl} alt={eb.title} fill className="object-cover" sizes="96px" />
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
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Halaman {eb.lastPage} dari {eb.totalPages}</span>
                    <strong className="text-primary font-bold">{eb.progressPercent}%</strong>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-300"
                      style={{ width: `${eb.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-muted/20 px-5 py-3 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Terakhir dibaca: {eb.lastReadAt.split(" ")[0]}
              </span>
              <Link href={`/dashboard/ebook/${eb.id}/baca`}>
                <Button size="sm" className="text-xs font-bold gap-1 shadow-sm">
                  Lanjut Membaca
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

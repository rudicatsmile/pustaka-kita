"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DUMMY_EBOOKS } from "@/data/dummy";
import { saveEbookProgressAction } from "@/actions/ebook";
import { toast } from "@/components/ui/sonner";

export default function EbookReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const ebook = DUMMY_EBOOKS.find((e) => e.id === resolvedParams.id) || DUMMY_EBOOKS[0];

  const [page, setPage] = useState(ebook.lastPage || 1);
  const [zoom, setZoom] = useState(100);
  const [themeMode, setThemeMode] = useState<"light" | "sepia" | "dark">("light");
  const [isSaved, setIsSaved] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState<string>("Baru saja");

  // Keep ref to latest page for auto-save interval
  const pageRef = useRef(page);
  pageRef.current = page;

  // Auto-save function calling Server Action
  const performSave = async (targetPage: number) => {
    setIsSaved(false);
    try {
      const res = await saveEbookProgressAction({
        ebookId: ebook.id,
        page: targetPage,
        totalPages: ebook.totalPages,
      });
      if (res.success && res.savedAt) {
        setLastSavedTime(res.savedAt);
      }
    } catch (e) {
      console.warn("Auto-save error:", e);
    } finally {
      setIsSaved(true);
    }
  };

  // 1. Auto-save on page turn (debounced 1 sec)
  useEffect(() => {
    const timer = setTimeout(() => {
      performSave(page);
    }, 1000);
    return () => clearTimeout(timer);
  }, [page]);

  // 2. Task 2.6: Recurring 10-second interval auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      performSave(pageRef.current);
    }, 10000); // 10 seconds interval

    return () => clearInterval(interval);
  }, [ebook.id]);

  const handleNextPage = () => {
    if (page < ebook.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNextPage();
      if (e.key === "ArrowLeft") handlePrevPage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [page, ebook.totalPages]);

  const themeClasses = {
    light: "bg-white text-slate-900 border-border",
    sepia: "bg-[#fbf0d9] text-[#5f4b32] border-[#e4d4ba]",
    dark: "bg-slate-950 text-slate-100 border-slate-800",
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top Reader Toolbar */}
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/ebook">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" title="Kembali ke Koleksi">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="font-heading text-sm font-bold text-foreground truncate max-w-[180px] sm:max-w-md">
              {ebook.title}
            </h1>
            <p className="text-[11px] text-muted-foreground truncate">{ebook.author}</p>
          </div>
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrevPage}
            disabled={page <= 1}
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="font-mono text-xs font-semibold px-2">
            Hlm <strong className="text-primary">{page}</strong> dari {ebook.totalPages}
          </span>

          <Button
            onClick={handleNextPage}
            disabled={page >= ebook.totalPages}
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Right Tools: Zoom, Theme, Auto-save Status */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden lg:flex items-center gap-1 border border-border rounded-xl px-1.5 py-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoom((z) => Math.max(70, z - 10))}
              title="Perkecil"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[11px] font-mono text-muted-foreground w-10 text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              title="Perbesar"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Status Auto-save */}
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{isSaved ? `Auto-save ${lastSavedTime}` : "Menyimpan..."}</span>
          </span>

          {/* Theme switcher */}
          <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
            <button
              onClick={() => setThemeMode("light")}
              className={`rounded-lg p-1.5 transition-colors ${
                themeMode === "light" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
              title="Mode Terang"
            >
              <Sun className="h-4 w-4" />
            </button>
            <button
              onClick={() => setThemeMode("sepia")}
              className={`rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
                themeMode === "sepia" ? "bg-[#fbf0d9] text-[#5f4b32] shadow-sm" : "text-muted-foreground"
              }`}
              title="Mode Sepia (Hangat)"
            >
              Sepia
            </button>
            <button
              onClick={() => setThemeMode("dark")}
              className={`rounded-lg p-1.5 transition-colors ${
                themeMode === "dark" ? "bg-slate-900 text-white shadow-sm" : "text-muted-foreground"
              }`}
              title="Mode Malam"
            >
              <Moon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Reading Canvas */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-muted/40">
        <div
          className={`w-full max-w-3xl rounded-3xl border p-8 sm:p-14 shadow-xl transition-all duration-200 min-h-[85vh] flex flex-col justify-between ${
            themeClasses[themeMode]
          }`}
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
        >
          {/* Header of page */}
          <div className="flex justify-between items-center pb-4 border-b border-current/15 text-xs opacity-70">
            <span>{ebook.title}</span>
            <span>Bab II — Dikotomi Kendali & Ketenangan Batin</span>
          </div>

          {/* Book Content (Indonesian sample text) */}
          <article className="py-8 space-y-6 text-base sm:text-lg leading-relaxed text-justify font-serif">
            <p className="font-heading font-extrabold text-2xl tracking-tight not-italic">
              Bagian 1: Membedakan Hal di Luar dan di Dalam Kendali
            </p>

            <p>
              &quot;Ada hal-hal di bawah kendali kita, dan ada hal-hal yang tidak di bawah kendali kita.&quot;
              Kutipan dari Epiktetos, filsuf Stoa Yunani kuno, adalah fondasi paling krusial dalam
              menavigasi kehidupan kita di sekolah, kampus, maupun dunia profesional.
            </p>

            <p>
              Sering kali kecemasan, ketakutan gagal ujian, atau rasa putus asa muncul bukan karena
              peristiwa itu sendiri, melainkan karena persepsi dan penilaian yang kita lekatkan
              kepadanya. Apa yang orang lain katakan tentangmu, hasil pengumuman beasiswa esok hari,
              atau macetnya jalanan di pagi hari, sesungguhnya berada di luar kendali mutlak kita.
            </p>

            <blockquote className="border-l-4 border-current pl-4 italic opacity-90 my-4 text-base">
              &quot;Fokuskan energimu hanya pada tindakan, usaha, dan respon terbaik yang sanggup kamu
              berikan hari ini. Sisanya? Biarkan semesta yang mengaturnya.&quot;
            </blockquote>

            <p>
              Ketika kamu memegang buku ini di perpustakaan PustakaKitaCeria, ingatlah bahwa waktu yang
              kamu luangkan untuk membaca dan memperkaya akal budimu adalah salah satu bentuk kendali
              terbaik yang kamu miliki atas masa depanmu sendiri.
            </p>
          </article>

          {/* Page Footer */}
          <div className="flex justify-between items-center pt-6 border-t border-current/15 text-xs opacity-70">
            <span>PustakaKitaCeria Digital Reader</span>
            <span className="font-mono font-bold">- {page} -</span>
          </div>
        </div>
      </main>

      {/* Bottom Floating Page Turn Bar */}
      <footer className="h-12 border-t border-border bg-card px-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="hidden sm:inline">Tips: Gunakan tombol keyboard ◄ dan ► untuk membalik halaman</span>
        <div className="flex items-center gap-4 mx-auto sm:mx-0">
          <button
            onClick={handlePrevPage}
            disabled={page <= 1}
            className="hover:text-primary font-semibold disabled:opacity-40"
          >
            ◄ Halaman Sebelumnya
          </button>
          <span>•</span>
          <button
            onClick={handleNextPage}
            disabled={page >= ebook.totalPages}
            className="hover:text-primary font-semibold disabled:opacity-40"
          >
            Halaman Berikutnya ►
          </button>
        </div>
      </footer>
    </div>
  );
}

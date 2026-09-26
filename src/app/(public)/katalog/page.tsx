import { Metadata } from "next";
import { Suspense } from "react";
import { KatalogPageClient } from "@/components/katalog/katalog-page-client";

export const metadata: Metadata = {
  title: "Katalog Buku OPAC Online | PustakaKitaCeria",
  description:
    "Cari dan temukan ribuan judul buku fisik dan digital koleksi perpustakaan. Filter berdasarkan kategori, ketersediaan eksemplar, dan tahun terbit.",
  keywords: ["katalog buku", "OPAC", "cari buku perpustakaan", "PustakaKitaCeria", "pinjam buku"],
  openGraph: {
    title: "Katalog Koleksi Pustaka (OPAC) | PustakaKitaCeria",
    description:
      "Jelajahi koleksi lengkap sastra Indonesia, sains, sejarah, dan referensi akademik secara real-time.",
    type: "website",
  },
};

export default function KatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-muted-foreground">
          Memuat katalog buku perpustakaan...
        </div>
      }
    >
      <KatalogPageClient />
    </Suspense>
  );
}

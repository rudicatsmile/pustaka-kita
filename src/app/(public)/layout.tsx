import { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://pustakakitaceria.sch.id"),
  title: {
    default: "PustakaKitaCeria | Perpustakaan Sekolah & Kampus Digital",
    template: "%s | PustakaKitaCeria",
  },
  description:
    "Platform sistem otomasi perpustakaan sekolah dan kampus modern berbasis OPAC online, peminjaman mandiri QR/Barcode, pembaca e-book digital, dan integrasi WhatsApp Gateway.",
  keywords: [
    "perpustakaan sekolah",
    "perpustakaan kampus",
    "OPAC",
    "katalog buku digital",
    "e-book reader",
    "PustakaKitaCeria",
    "sirkulasi buku",
  ],
  authors: [{ name: "Tim Pengembang PustakaKitaCeria" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://pustakakitaceria.sch.id",
    siteName: "PustakaKitaCeria",
    title: "PustakaKitaCeria | Perpustakaan Sekolah & Kampus Digital",
    description:
      "Jelajahi ribuan koleksi buku sastra Indonesia, sains, sejarah, dan referensi akademik. Pinjam mandiri dengan scan barcode dan nikmati kemudahan notifikasi WhatsApp.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PustakaKitaCeria | Perpustakaan Sekolah & Kampus Digital",
    description: "Sistem otomasi perpustakaan sekolah/kampus terintegrasi & modern.",
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const librarySchema = {
    "@context": "https://schema.org",
    "@type": "Library",
    "name": "Perpustakaan PustakaKitaCeria",
    "url": "https://pustakakitaceria.sch.id",
    "description": "Sistem otomasi perpustakaan sekolah dan kampus digital terintegrasi",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Pendidikan No. 45, Kompleks Kampus Merdeka",
      "addressLocality": "Jakarta Selatan",
      "addressRegion": "DKI Jakarta",
      "postalCode": "12340",
      "addressCountry": "ID",
    },
    "telephone": "+62 21 7890 1234",
    "openingHours": "Mo-Fr 07:30-16:00, Sa 08:00-13:00",
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(librarySchema) }}
      />
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

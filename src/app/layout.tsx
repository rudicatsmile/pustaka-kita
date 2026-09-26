import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { PwaInstaller } from "@/components/pwa/pwa-installer";
import { AiLibrarianChat } from "@/components/ai/ai-librarian-chat";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "PustakaKitaCeria — Perpustakaan Digital Sekolah & Kampus",
    template: "%s | PustakaKitaCeria",
  },
  description:
    "Sistem perpustakaan digital terpadu untuk sekolah & kampus. Akses katalog online (OPAC), scan barcode sirkulasi, baca e-book, dan kelola peminjaman dengan ceria dan mudah.",
  keywords: [
    "perpustakaan digital",
    "OPAC",
    "katalog buku",
    "e-book reader",
    "sirkulasi perpustakaan",
    "PustakaKitaCeria",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PustakaKita",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col selection:bg-primary/20 selection:text-primary">
        {children}
        <PwaInstaller />
        <AiLibrarianChat />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  LayoutDashboard,
  BookCopy,
  Barcode,
  ArrowLeftRight,
  BookmarkCheck,
  CheckCircle2,
  Users,
  BarChart3,
  Shield,
  Settings,
  MessageSquare,
  History,
  BellRing,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  Layers,
  Sparkles,
  Boxes,
  ShoppingCart,
  LifeBuoy,
  Brain,
  MapPin,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pustakawanMenu = [
    { href: "/pustakawan", label: "Dasbor Pustakawan", icon: LayoutDashboard },
    { href: "/pustakawan/buku", label: "Katalog & Bibliografi", icon: BookCopy },
    { href: "/pustakawan/copy-cataloging", label: "Copy Cataloging Z39.50", icon: Globe, badge: "Z39.50" },
    { href: "/pustakawan/eksemplar", label: "Eksemplar & Barcode", icon: Barcode },
    { href: "/pustakawan/sirkulasi", label: "Sirkulasi Pinjam/Kembali", icon: ArrowLeftRight, highlight: true },
    { href: "/pustakawan/stock-opname", label: "Stock Opname & Audit Rak", icon: Boxes },
    { href: "/pustakawan/rak", label: "Master Rak & Denah", icon: MapPin, badge: "Denah" },
    { href: "/pustakawan/reservasi", label: "Kelola Reservasi", icon: BookmarkCheck },
    { href: "/pustakawan/denda", label: "Verifikasi Denda Manual", icon: CheckCircle2, badge: "1 Menunggu" },
    { href: "/pustakawan/anggota", label: "Data Anggota", icon: Users },
    { href: "/pustakawan/pengadaan", label: "Usulan & Pengadaan", icon: ShoppingCart, badge: "Wishlist" },
    { href: "/pustakawan/klub", label: "Klub & Resensi", icon: MessageSquare, badge: "Diskusi" },
    { href: "/pustakawan/laporan", label: "Laporan & Akreditasi", icon: BarChart3, badge: "Borang SNP" },
    { href: "/pustakawan/reading-dna", label: "Peta Minat Baca AI", icon: Brain, badge: "AI DNA" },
    { href: "/pustakawan/bantuan", label: "Pusat Bantuan & Tiket", icon: LifeBuoy, badge: "Helpdesk" },
  ];

  const adminMenu = [
    { href: "/admin", label: "Dasbor Admin", icon: Shield },
    { href: "/admin/pengguna", label: "Kelola Pengguna & Role", icon: Users },
    { href: "/admin/kategori", label: "Kelola Kategori Buku", icon: Layers },
    { href: "/pustakawan/rak", label: "Master Data Rak & Denah", icon: MapPin },
    { href: "/admin/pengaturan", label: "Pengaturan Sistem & Tarif", icon: Settings },
    { href: "/admin/whatsapp", label: "WhatsApp Gateway", icon: MessageSquare },
    { href: "/admin/notifikasi", label: "Pusat & Log Notifikasi", icon: BellRing },
    { href: "/admin/audit-log", label: "Audit Log Sistem", icon: History },
  ];

  const isCurrentPustakawan = pathname.startsWith("/pustakawan");
  const isCurrentAdmin = pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 z-30 border-r border-border/80 bg-card p-5 shadow-sm">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-lg font-bold text-foreground">
                PustakaKita<span className="text-secondary">Ceria</span>
              </span>
            </div>
            <p className="text-[11px] font-medium text-muted-foreground">
              Panel Pengelola Perpustakaan
            </p>
          </div>
        </Link>

        {/* Staff Switch Tab Bar */}
        <div className="mt-5 grid grid-cols-2 gap-1.5 rounded-xl bg-muted p-1">
          <Link
            href="/pustakawan"
            className={`flex items-center justify-center rounded-lg py-1.5 text-xs font-bold transition-all ${
              isCurrentPustakawan
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pustakawan
          </Link>
          <Link
            href="/admin"
            className={`flex items-center justify-center rounded-lg py-1.5 text-xs font-bold transition-all ${
              isCurrentAdmin
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Super Admin
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="mt-5 flex-1 space-y-6 overflow-y-auto pr-1">
          {/* Pustakawan Section */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Operasional Perpustakaan
            </div>
            {pustakawanMenu.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/pustakawan"
                  ? pathname === "/pustakawan"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badge && !isActive && (
                    <Badge variant="warning" className="ml-auto text-[9px] py-0 px-1.5">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Admin Section */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Konfigurasi & Pengawasan
            </div>
            {adminMenu.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Staff Profile Box */}
        <div className="mt-auto border-t border-border pt-4">
          <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground font-bold text-xs shadow-sm">
              DA
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-foreground">
                Ibu Dewi Anggraini, S.IP.
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                Kepala Pustakawan
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <Link href="/" className="flex-1">
              <Button variant="ghost" size="sm" className="w-full text-[11px] justify-start px-2 text-muted-foreground">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Web Publik
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button variant="ghost" size="sm" className="w-full text-[11px] justify-start px-2 text-muted-foreground">
                Mode Anggota
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/80 bg-background/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-xl border border-border p-2 text-foreground"
              aria-label="Buka Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Badge variant={isCurrentAdmin ? "destructive" : "info"} className="font-bold text-xs uppercase">
                {isCurrentAdmin ? "Mode Super Admin" : "Mode Pustakawan"}
              </Badge>
              <span className="hidden sm:inline text-xs text-muted-foreground">
                Sistem Terpadu Perpustakaan Sekolah
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/kiosk" target="_blank" title="Buka Terminal Kiosk Mandiri Lobi">
              <Button size="sm" variant="outline" className="rounded-xl border-primary/40 text-primary text-xs font-bold gap-1.5 hover:bg-primary/10">
                <Sparkles className="h-4 w-4" />
                <span className="hidden lg:inline">Buka Kiosk Lobi</span>
              </Button>
            </Link>
            <Link href="/pustakawan/sirkulasi">
              <Button size="sm" variant="default" className="rounded-xl shadow-sm text-xs font-bold gap-1.5">
                <ArrowLeftRight className="h-4 w-4" />
                <span className="hidden sm:inline">Sirkulasi Pinjam/Kembali</span>
              </Button>
            </Link>
            <Link href="/pustakawan/denda">
              <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100">
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden md:inline">Verifikasi Denda</span> (1)
              </Button>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 pb-16 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-card p-5 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="font-heading font-bold text-foreground">
                  Panel Staf
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-4 flex-1 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase">Pustakawan</p>
                {pustakawanMenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
              <div className="space-y-1">
                <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase">Admin</p>
                {adminMenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  LayoutDashboard,
  Search,
  Clock,
  BookmarkCheck,
  QrCode,
  BookMarked,
  ReceiptText,
  CreditCard,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CURRENT_USER } from "@/data/dummy";

export default function AnggotaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { href: "/dashboard", label: "Dasbor Saya", icon: LayoutDashboard },
    { href: "/dashboard/katalog", label: "Katalog Buku", icon: Search },
    { href: "/dashboard/riwayat", label: "Riwayat Pinjam", icon: Clock },
    { href: "/dashboard/reservasi", label: "Reservasi Buku", icon: BookmarkCheck },
    { href: "/dashboard/scan", label: "Scan Mandiri", icon: QrCode, highlight: true },
    { href: "/dashboard/ebook", label: "Koleksi E-Book", icon: BookMarked },
    { href: "/dashboard/denda", label: "Denda & Bayar", icon: ReceiptText },
    { href: "/dashboard/kartu", label: "Kartu Anggota", icon: CreditCard },
    { href: "/dashboard/profil", label: "Profil & Akun", icon: User },
  ];

  const bottomNavItems = [
    { href: "/dashboard", label: "Dasbor", icon: LayoutDashboard },
    { href: "/dashboard/riwayat", label: "Riwayat", icon: Clock },
    { href: "/dashboard/scan", label: "Scan", icon: QrCode, isPrimary: true },
    { href: "/dashboard/ebook", label: "E-Book", icon: BookMarked },
    { href: "/dashboard/denda", label: "Denda", icon: ReceiptText },
  ];

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
              Portal Anggota Mandiri
            </p>
          </div>
        </Link>

        {/* Member Profile Badge */}
        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
              {CURRENT_USER.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">
                {CURRENT_USER.name}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                NIS: {CURRENT_USER.nisNim} • {CURRENT_USER.classOrMajor}
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t border-primary/10 pt-2 text-xs">
            <span className="text-muted-foreground">Status Anggota</span>
            <Badge variant="success" className="text-[10px] px-2 py-0.5">
              Aktif
            </Badge>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 flex-1 space-y-1.5 overflow-y-auto pr-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : item.highlight
                    ? "text-secondary font-bold hover:bg-secondary/10"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : item.highlight ? "text-secondary" : ""}`} />
                <span>{item.label}</span>
                {item.highlight && !isActive && (
                  <Badge variant="warning" className="ml-auto text-[10px] py-0 px-1.5">
                    Scan
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto border-t border-border pt-4 space-y-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground">
              <ExternalLink className="mr-2 h-4 w-4" />
              Kembali ke Beranda Publik
            </Button>
          </Link>
          <Link href="/masuk">
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
              <LogOut className="mr-2 h-4 w-4" />
              Keluar Akun
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Wrapper */}
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
            <div className="hidden sm:block">
              <h1 className="font-heading text-lg font-bold text-foreground">
                Perpustakaan PustakaKitaCeria
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/scan">
              <Button size="sm" variant="secondary" className="rounded-xl shadow-sm text-xs font-bold gap-1.5">
                <QrCode className="h-4 w-4" />
                <span className="hidden sm:inline">Scan Mandiri</span>
              </Button>
            </Link>

            <Link href="/dashboard/denda">
              <Button variant="outline" size="sm" className="relative rounded-xl text-xs gap-1.5 border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100">
                <ReceiptText className="h-4 w-4" />
                <span className="font-bold">Denda: Rp 2.000</span>
              </Button>
            </Link>

            <div className="relative">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" title="Notifikasi">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-secondary" />
              </Button>
            </div>

            <Link href="/dashboard/profil" className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm">
                BS
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-12 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-card/95 backdrop-blur-md px-3 py-2">
          <div className="flex items-center justify-around">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              if (item.isPrimary) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center -mt-6"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-lg transition-transform active:scale-95">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-secondary mt-1">
                      {item.label}
                    </span>
                  </Link>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
                    isActive
                      ? "text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Sidebar */}
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
                  PustakaKita<span className="text-secondary">Ceria</span>
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto pt-4 border-t border-border">
              <Link href="/" onClick={() => setSidebarOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

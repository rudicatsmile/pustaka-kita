"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  Search,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/katalog", label: "Katalog OPAC" },
    { href: "/panduan", label: "Panduan Anggota" },
    { href: "/tentang", label: "Tentang Kami" },
    { href: "/kontak", label: "Kontak & Lokasi" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo & Brand */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105 group-hover:shadow-md">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-xl font-extrabold tracking-tight text-foreground">
                PustakaKita<span className="text-secondary">Ceria</span>
              </span>
              <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            </div>
            <p className="text-[11px] font-medium text-muted-foreground">
              Perpustakaan Digital Sekolah & Kampus
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth & Switcher Actions */}
        <div className="hidden lg:flex items-center gap-2.5">
          <Link href="/katalog">
            <Button variant="ghost" size="icon" title="Cari di Katalog">
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>
          <Link href="/masuk">
            <Button variant="outline" size="sm" className="rounded-xl font-bold">
              <User className="mr-1.5 h-4 w-4" />
              Masuk
            </Button>
          </Link>
          <Link href="/daftar">
            <Button size="sm" className="rounded-xl font-bold">
              Daftar Anggota
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>

          {/* Quick Access to other portals for review */}
          <div className="pl-2 border-l border-border flex items-center gap-1.5">
            <Link href="/dashboard" title="Area Dasbor Anggota">
              <Badge variant="warning" className="cursor-pointer hover:opacity-80 text-[10px]">
                Area Anggota
              </Badge>
            </Link>
            <Link href="/pustakawan" title="Area Pustakawan & Admin">
              <Badge variant="info" className="cursor-pointer hover:opacity-80 text-[10px]">
                Area Staff
              </Badge>
            </Link>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/masuk">
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs">
              Masuk
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground"
            aria-label="Buka Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Link href="/daftar" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center">Daftar Anggota Baru</Button>
              </Link>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    Dasbor Anggota
                  </Button>
                </Link>
                <Link href="/pustakawan" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Staff Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

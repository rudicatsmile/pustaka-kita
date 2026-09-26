"use client";

import Link from "next/link";
import {
  Shield,
  Users,
  Settings,
  MessageSquare,
  History,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Server,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DUMMY_AUDIT_LOGS, DUMMY_MEMBERS, DUMMY_BOOKS } from "@/data/dummy";

export default function DasborAdminPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="font-bold text-xs uppercase">
              Super Administrator
            </Badge>
            <span className="text-xs text-muted-foreground">Kontrol & Audit Sistem PustakaKita</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
            Dasbor Pusat Administrasi Sistem
          </h1>
          <p className="text-xs text-muted-foreground">
            Kelola hak akses pengguna, konfigurasi tarif denda, WhatsApp Gateway, dan penelusuran audit log.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/pengaturan">
            <Button size="sm" variant="outline" className="font-bold text-xs gap-1.5">
              <Settings className="h-4 w-4" />
              Pengaturan Sistem
            </Button>
          </Link>
          <Link href="/admin/audit-log">
            <Button size="sm" className="font-bold text-xs gap-1.5 shadow-sm">
              <History className="h-4 w-4" />
              Audit Trail Lengkap
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Cards Metrik Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Pengguna Terdaftar</span>
            <Users className="h-5 w-5 text-primary" />
          </div>
          <p className="font-heading text-2xl font-extrabold text-foreground">
            {DUMMY_MEMBERS.length} Akun
          </p>
          <p className="text-[11px] text-muted-foreground">3 Anggota, 1 Pustakawan, 1 Admin</p>
        </Card>

        <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Koleksi Bibliografi</span>
            <BookOpen className="h-5 w-5 text-secondary" />
          </div>
          <p className="font-heading text-2xl font-extrabold text-foreground">
            {DUMMY_BOOKS.length} Judul Buku
          </p>
          <p className="text-[11px] text-muted-foreground">Total 27 Salinan Eksemplar Fisik</p>
        </Card>

        <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">WhatsApp Gateway (Fonnte)</span>
            <MessageSquare className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="font-heading text-xl font-bold text-emerald-600 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            Terhubung & Aktif
          </p>
          <p className="text-[11px] text-muted-foreground">Tingkat pengiriman sukses: 100%</p>
        </Card>

        <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Entri Rekam Audit Log</span>
            <History className="h-5 w-5 text-accent" />
          </div>
          <p className="font-heading text-2xl font-extrabold text-foreground">
            {DUMMY_AUDIT_LOGS.length} Log CUD
          </p>
          <p className="text-[11px] text-muted-foreground">Retensi aman 2 tahun (Append-Only)</p>
        </Card>
      </div>

      {/* Shortcut Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground">
            Manajemen Pengguna & Hak Akses
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Atur peran pengguna (Anggota, Pustakawan, Admin), reset kata sandi darurat, dan
            penguncian akun.
          </p>
          <div className="pt-2">
            <Link href="/admin/pengguna">
              <Button size="sm" variant="outline" className="w-full text-xs font-bold">
                Buka Pengguna Sistem
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground">
            Konfigurasi Tarif & Rekening
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Kustomisasi tarif denda per hari (default: Rp 1.000), batas pinjaman buku, dan nomor
            rekening bank tujuan.
          </p>
          <div className="pt-2">
            <Link href="/admin/pengaturan">
              <Button size="sm" variant="outline" className="w-full text-xs font-bold">
                Buka Pengaturan Sistem
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground">
            Audit Trail & Log Sensitif
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pantau setiap aksi Create, Update, Delete dengan rekaman JSON nilai lama vs nilai baru
            secara transparan.
          </p>
          <div className="pt-2">
            <Link href="/admin/audit-log">
              <Button size="sm" className="w-full text-xs font-bold">
                Buka Log Audit Sistem
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feed Audit Log Terbaru */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Aktivitas Audit Log Terbaru
            </h3>
            <p className="text-xs text-muted-foreground">
              Rekaman perubahan data sensitif yang baru saja terjadi di dalam sistem.
            </p>
          </div>
          <Link href="/admin/audit-log">
            <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">
              Lihat Seluruh Log →
            </Button>
          </Link>
        </div>

        <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Waktu</TableHead>
                <TableHead className="text-xs">Aktor</TableHead>
                <TableHead className="text-xs">Aksi</TableHead>
                <TableHead className="text-xs">Entitas</TableHead>
                <TableHead className="text-xs">Deskripsi Perubahan</TableHead>
                <TableHead className="text-xs">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DUMMY_AUDIT_LOGS.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{log.createdAt}</TableCell>
                  <TableCell className="font-heading font-bold text-xs">{log.actorName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.action === "create"
                          ? "success"
                          : log.action === "update"
                          ? "warning"
                          : log.action === "verify"
                          ? "default"
                          : "destructive"
                      }
                      className="text-[10px] font-mono uppercase"
                    >
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-primary">{log.entityType}</TableCell>
                  <TableCell className="text-xs text-foreground/80">{log.description}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.ipAddress}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

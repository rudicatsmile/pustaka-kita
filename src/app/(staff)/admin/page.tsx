"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Settings,
  MessageSquare,
  History,
  BookOpen,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { AuditLogItem } from "@/types";
import { getAdminDashboardStats } from "@/actions/admin";

export default function DasborAdminPage() {
  const [stats, setStats] = useState<{
    totalMembers: number;
    totalStaff: number;
    totalBooks: number;
    totalLogs: number;
    recentLogs: AuditLogItem[];
  }>({
    totalMembers: 0,
    totalStaff: 0,
    totalBooks: 0,
    totalLogs: 0,
    recentLogs: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  async function loadStats() {
    setIsLoading(true);
    try {
      const data = await getAdminDashboardStats();
      setStats({
        ...data,
        recentLogs: data.recentLogs as AuditLogItem[],
      });
    } catch (e: any) {
      toast.error("Gagal memuat statistik admin: " + (e.message || "Error"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

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
          <Button
            onClick={loadStats}
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Segarkan
          </Button>
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
            {stats.totalMembers + stats.totalStaff} Akun
          </p>
          <p className="text-[11px] text-muted-foreground">
            {stats.totalMembers} Anggota, {stats.totalStaff} Staff / Admin
          </p>
        </Card>

        <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Koleksi Bibliografi</span>
            <BookOpen className="h-5 w-5 text-secondary" />
          </div>
          <p className="font-heading text-2xl font-extrabold text-foreground">
            {stats.totalBooks} Judul Buku
          </p>
          <p className="text-[11px] text-muted-foreground">Tersedia di katalog institusi</p>
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
          <p className="text-[11px] text-muted-foreground">Otomasi pengingat denda aktif</p>
        </Card>

        <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Entri Rekam Audit Log</span>
            <History className="h-5 w-5 text-accent" />
          </div>
          <p className="font-heading text-2xl font-extrabold text-foreground">
            {stats.totalLogs} Log CUD
          </p>
          <p className="text-[11px] text-muted-foreground">Retensi aman database (Append-Only)</p>
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
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-xs text-muted-foreground">Memuat audit log...</span>
            </div>
          ) : (
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
                {stats.recentLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-6">
                      Belum ada rekaman audit log.
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.recentLogs.map((log) => (
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
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}

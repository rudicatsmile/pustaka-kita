"use client";

import { useState } from "react";
import {
  History,
  Search,
  Filter,
  Eye,
  FileCode,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DUMMY_AUDIT_LOGS, AuditLogItem } from "@/data/dummy";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>(DUMMY_AUDIT_LOGS);
  const [selectedEntity, setSelectedEntity] = useState("semua");
  const [selectedAction, setSelectedAction] = useState("semua");
  const [search, setSearch] = useState("");
  const [viewLogDiff, setViewLogDiff] = useState<AuditLogItem | null>(null);

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.actorName.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.ipAddress.includes(search);
    const matchEntity = selectedEntity === "semua" || l.entityType === selectedEntity;
    const matchAction = selectedAction === "semua" || l.action === selectedAction;
    return matchSearch && matchEntity && matchAction;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Audit Log & Rekam Jejak Sistem
          </h1>
          <p className="text-xs text-muted-foreground">
            Rekaman append-only tidak dapat dihapus untuk setiap aksi perubahan data (buku, eksemplar, denda, dan pengguna).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aktor, deskripsi, atau IP..."
            className="pl-10 text-xs"
          />
        </div>

        <select
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
          className="h-11 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="semua">Semua Entitas</option>
          <option value="book">Buku (Bibliografi)</option>
          <option value="book_copy">Eksemplar Buku</option>
          <option value="loan">Sirkulasi Pinjaman</option>
          <option value="fine">Denda Keterlambatan</option>
          <option value="user">Pengguna Sistem</option>
        </select>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="h-11 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="semua">Semua Aksi</option>
          <option value="create">CREATE</option>
          <option value="update">UPDATE</option>
          <option value="delete">DELETE</option>
          <option value="verify">VERIFY</option>
          <option value="waive">WAIVE</option>
          <option value="login">LOGIN</option>
          <option value="logout">LOGOUT</option>
        </select>
      </div>

      {/* Audit DataTable */}
      <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Waktu & Tanggal</TableHead>
              <TableHead className="text-xs">Aktor Pelaku</TableHead>
              <TableHead className="text-xs">Aksi</TableHead>
              <TableHead className="text-xs">Entitas</TableHead>
              <TableHead className="text-xs">Deskripsi Perubahan</TableHead>
              <TableHead className="text-xs">IP Address</TableHead>
              <TableHead className="text-xs text-right">Perubahan JSON</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {log.createdAt}
                </TableCell>
                <TableCell className="font-heading font-bold text-xs text-foreground">
                  {log.actorName}
                </TableCell>
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
                    className="text-[10px] font-mono uppercase font-bold"
                  >
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-primary font-bold">
                  {log.entityType}
                </TableCell>
                <TableCell className="text-xs text-foreground/90 max-w-xs leading-relaxed">
                  {log.description}
                </TableCell>
                <TableCell className="font-mono text-[11px] text-muted-foreground">
                  {log.ipAddress}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => setViewLogDiff(log)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-bold gap-1 text-primary hover:bg-primary/10"
                  >
                    <FileCode className="h-3.5 w-3.5" />
                    Lihat Diff JSON
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Diff Viewer JSON */}
      <Dialog open={!!viewLogDiff} onOpenChange={() => setViewLogDiff(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-primary" />
              <span>Detail Nilai Lama vs Nilai Baru (JSON Diff)</span>
            </DialogTitle>
            <DialogDescription>
              {viewLogDiff?.description} • Pelaku: {viewLogDiff?.actorName}
            </DialogDescription>
          </DialogHeader>

          {viewLogDiff && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 text-[11px] rounded-xl bg-muted/40 p-3">
                <p>Aksi: <strong className="uppercase font-mono">{viewLogDiff.action}</strong></p>
                <p>Entitas: <strong className="font-mono">{viewLogDiff.entityType}</strong></p>
                <p>IP: <strong className="font-mono">{viewLogDiff.ipAddress}</strong></p>
                <p>Waktu: <strong className="font-mono">{viewLogDiff.createdAt}</strong></p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Old Value */}
                <div className="space-y-1.5">
                  <span className="font-bold text-rose-700 dark:text-rose-400 block">
                    Nilai Sebelumnya (old_value JSONB):
                  </span>
                  <pre className="rounded-xl border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 p-3 font-mono text-[11px] text-rose-900 dark:text-rose-200 overflow-x-auto max-h-56">
                    {viewLogDiff.oldValue
                      ? JSON.stringify(viewLogDiff.oldValue, null, 2)
                      : "(null - Rekord Baru Dibuat)"}
                  </pre>
                </div>

                {/* New Value */}
                <div className="space-y-1.5">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                    Nilai Sesudahnya (new_value JSONB):
                  </span>
                  <pre className="rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 font-mono text-[11px] text-emerald-900 dark:text-emerald-200 overflow-x-auto max-h-56">
                    {viewLogDiff.newValue
                      ? JSON.stringify(viewLogDiff.newValue, null, 2)
                      : "(null - Rekord Dihapus)"}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewLogDiff(null)} className="font-bold text-xs">
              Tutup Pratinjau
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

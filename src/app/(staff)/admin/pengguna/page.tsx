"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  KeyRound,
  Shield,
  CheckCircle2,
  XCircle,
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
import { DUMMY_MEMBERS, MemberItem } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";

export default function ManajemenPenggunaPage() {
  const [users, setUsers] = useState<MemberItem[]>(DUMMY_MEMBERS);
  const [search, setSearch] = useState("");
  const [resetModalUser, setResetModalUser] = useState<MemberItem | null>(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.nisNim.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleResetPassword = () => {
    if (!resetModalUser) return;
    toast.success("Kata Sandi Berhasil Direset! 🔑", {
      description: `Password sementara 'Pustaka2024!' telah dikirim ke WhatsApp ${resetModalUser.phoneWa}. Tercatat di Audit Log.`,
    });
    setResetModalUser(null);
  };

  const handleToggleRole = (id: string, currentRole: string) => {
    const newRole = currentRole === "anggota" ? "pustakawan" : "anggota";
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole as any } : u))
    );
    toast.success("Peran Pengguna Diperbarui! 🛡️", {
      description: `Peran berhasil diubah menjadi '${newRole}'. Aksi dicatat pada Audit Log.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Manajemen Pengguna & Hak Akses
          </h1>
          <p className="text-xs text-muted-foreground">
            Kelola akun seluruh civitas perpustakaan, ganti peran (Role), dan reset kata sandi darurat.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, NIS/NIM, atau peran..."
          className="pl-10 text-xs"
        />
      </div>

      <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Nama Pengguna</TableHead>
              <TableHead className="text-xs">NIS / NIP / ID</TableHead>
              <TableHead className="text-xs">Surel / WhatsApp</TableHead>
              <TableHead className="text-xs">Peran Sistem (Role)</TableHead>
              <TableHead className="text-xs">Status Akun</TableHead>
              <TableHead className="text-xs text-right">Aksi Kelola</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-heading font-bold text-xs text-foreground">
                  {u.name}
                </TableCell>
                <TableCell className="font-mono text-xs text-primary font-bold">
                  {u.nisNim}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  <p>{u.email}</p>
                  <p className="font-mono text-[11px]">{u.phoneWa}</p>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      u.role === "admin"
                        ? "destructive"
                        : u.role === "pustakawan"
                        ? "warning"
                        : "secondary"
                    }
                    className="text-[10px] uppercase font-bold"
                  >
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={u.memberStatus === "aktif" ? "success" : "muted"}
                    className="text-[10px]"
                  >
                    {u.memberStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {u.role !== "admin" && (
                      <Button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold h-8 px-2"
                      >
                        Ubah Role
                      </Button>
                    )}
                    <Button
                      onClick={() => setResetModalUser(u)}
                      variant="ghost"
                      size="sm"
                      className="text-xs font-bold h-8 px-2 text-primary"
                    >
                      <KeyRound className="h-3.5 w-3.5 mr-1" />
                      Reset Pass
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Konfirmasi Reset Password */}
      <Dialog open={!!resetModalUser} onOpenChange={() => setResetModalUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Kata Sandi Pengguna</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mereset kata sandi untuk akun <strong>{resetModalUser?.name}</strong> ({resetModalUser?.nisNim})?
              Password baru sementara akan dikirimkan otomatis melalui pesan WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResetModalUser(null)}>
              Batal
            </Button>
            <Button onClick={handleResetPassword} className="font-bold">
              Konfirmasi Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

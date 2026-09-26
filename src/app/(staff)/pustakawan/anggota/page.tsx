"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  CreditCard,
  GraduationCap,
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
import { DUMMY_MEMBERS, MemberItem } from "@/data/dummy";
import { toast } from "@/components/ui/sonner";

export default function ManajemenAnggotaPage() {
  const [members, setMembers] = useState<MemberItem[]>(DUMMY_MEMBERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");

  const filtered = members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.nisNim.toLowerCase().includes(search.toLowerCase()) ||
      m.classOrMajor.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "semua" || m.memberStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleStatus = (id: string, name: string, currentStatus: string) => {
    const newStatus = currentStatus === "aktif" ? "ditangguhkan" : "aktif";
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, memberStatus: newStatus as any } : m))
    );
    toast.success(`Status Anggota Diperbarui! ✅`, {
      description: `Akun ${name} kini berstatus "${newStatus}". Aksi dicatat pada Audit Log.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Data Keanggotaan Perpustakaan
          </h1>
          <p className="text-xs text-muted-foreground">
            Daftar siswa dan mahasiswa terdaftar, pemantauan pinjaman aktif, serta status hak akses.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama anggota, nomor NIS/NIM, atau kelas..."
            className="pl-10 text-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="semua">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="ditangguhkan">Ditangguhkan</option>
          <option value="lulus">Lulus / Alumni</option>
        </select>
      </div>

      <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Nama & NIS/NIM</TableHead>
              <TableHead className="text-xs">Kelas / Jurusan</TableHead>
              <TableHead className="text-xs">WhatsApp</TableHead>
              <TableHead className="text-xs">Pinjaman Aktif</TableHead>
              <TableHead className="text-xs">Tunggakan Denda</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <p className="font-heading font-bold text-xs text-foreground">{member.name}</p>
                  <p className="font-mono text-[11px] text-primary">{member.nisNim}</p>
                </TableCell>
                <TableCell className="text-xs">{member.classOrMajor}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {member.phoneWa}
                </TableCell>
                <TableCell className="text-xs font-bold">
                  {member.activeLoansCount} / 3 buku
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {member.totalFinesUnpaid > 0 ? (
                    <span className="text-rose-600 font-bold">
                      Rp {member.totalFinesUnpaid.toLocaleString("id-ID")}
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-semibold">Nihil</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      member.memberStatus === "aktif"
                        ? "success"
                        : member.memberStatus === "ditangguhkan"
                        ? "destructive"
                        : "muted"
                    }
                    className="text-[10px]"
                  >
                    {member.memberStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      onClick={() => toggleStatus(member.id, member.name, member.memberStatus)}
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold h-8 px-2"
                    >
                      {member.memberStatus === "aktif" ? "Tangguhkan" : "Aktifkan"}
                    </Button>
                    <Link href="/dashboard/kartu">
                      <Button variant="ghost" size="sm" className="text-xs h-8 px-2" title="Lihat Kartu">
                        <CreditCard className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

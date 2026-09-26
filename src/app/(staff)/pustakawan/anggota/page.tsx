"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  CreditCard,
  Loader2,
  RefreshCw,
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
import { toast } from "@/components/ui/sonner";
import { MemberItem } from "@/types";
import { getMembersAction, updateMemberStatusAction } from "@/actions/staff";

export default function ManajemenAnggotaPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadMembers() {
    setIsLoading(true);
    try {
      const data = await getMembersAction();
      setMembers(data as MemberItem[]);
    } catch (e: any) {
      toast.error("Gagal memuat data anggota: " + (e.message || "Error"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  const filtered = members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.nisNim.toLowerCase().includes(search.toLowerCase()) ||
      m.classOrMajor.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "semua" || m.memberStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleStatus = async (id: string, name: string, currentStatus: string) => {
    const newStatus = currentStatus === "aktif" ? "ditangguhkan" : "aktif";
    setUpdatingId(id);
    try {
      const res = await updateMemberStatusAction(id, newStatus as any);
      if (res.success) {
        setMembers((prev) =>
          prev.map((m) => (m.id === id ? { ...m, memberStatus: newStatus as any } : m))
        );
        toast.success(`Status Anggota Diperbarui! ✅`, {
          description: `Akun ${name} kini berstatus "${newStatus}". Aksi dicatat pada Audit Log.`,
        });
      } else {
        toast.error("Gagal mengubah status:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setUpdatingId(null);
    }
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
        <Button
          onClick={loadMembers}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="h-9 gap-1.5 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Segarkan Data
        </Button>
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
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-xs text-muted-foreground">Memuat data keanggotaan...</span>
          </div>
        ) : (
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
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-8">
                    Tidak ditemukan anggota yang sesuai kriteria pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((member) => (
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
                          disabled={updatingId === member.id}
                          variant="outline"
                          size="sm"
                          className="text-xs font-bold h-8 px-2"
                        >
                          {updatingId === member.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : member.memberStatus === "aktif" ? (
                            "Tangguhkan"
                          ) : (
                            "Aktifkan"
                          )}
                        </Button>
                        <Link href="/dashboard/kartu">
                          <Button variant="ghost" size="sm" className="text-xs h-8 px-2" title="Lihat Kartu">
                            <CreditCard className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

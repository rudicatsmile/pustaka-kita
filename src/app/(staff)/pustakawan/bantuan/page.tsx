"use client";

import { useState, useEffect } from "react";
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Loader2,
  X,
  CreditCard,
  BookX,
  Tablet,
  Sparkles,
  Compass,
  PhoneCall,
  User,
  ShieldCheck,
  Send,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import {
  getHelpdeskTicketsAction,
  getHelpdeskStatsAction,
  updateTicketStatusAction,
  type HelpdeskTicket,
  type HelpdeskStatus,
} from "@/actions/helpdesk";

export default function PustakawanBantuanPage() {
  const [tickets, setTickets] = useState<HelpdeskTicket[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    waiting: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Handling/Resolving Ticket
  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicket | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<HelpdeskStatus>("diproses");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [staffName, setStaffName] = useState("Ibu Dewi Anggraini, S.IP.");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [list, st] = await Promise.all([
        getHelpdeskTicketsAction({ statusFilter, priorityFilter }),
        getHelpdeskStatsAction(),
      ]);
      setTickets(list);
      setStats(st);
    } catch (e: any) {
      toast.error("Gagal memuat tiket bantuan:", { description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter]);

  const handleOpenModal = (ticket: HelpdeskTicket) => {
    setSelectedTicket(ticket);
    setResolutionStatus(ticket.status === "menunggu" ? "diproses" : ticket.status);
    setResolutionNotes(ticket.resolutionNotes || "");
  };

  const handleSaveResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    if (!resolutionNotes.trim()) {
      toast.error("Catatan solusi / tanggapan wajib diisi!");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await updateTicketStatusAction({
        ticketId: selectedTicket.id,
        status: resolutionStatus,
        resolutionNotes: resolutionNotes.trim(),
        staffName,
      });

      if (res.success) {
        toast.success(`Tiket #${selectedTicket.id} Berhasil Diperbarui! ✅`, {
          description:
            resolutionStatus === "selesai"
              ? "Notifikasi WhatsApp penyelesaian otomatis telah dikirim ke nomor siswa."
              : "Status tiket telah diubah menjadi sedang ditangani.",
        });
        setSelectedTicket(null);
        loadData();
      } else {
        toast.error("Gagal memperbarui tiket:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.userName.toLowerCase().includes(q) ||
      t.userNis.includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Pusat Bantuan & Tiket Pengaduan (Helpdesk)
            </h1>
            <Badge variant="default" className="text-xs font-bold gap-1 bg-primary text-primary-foreground">
              <LifeBuoy className="h-3.5 w-3.5" />
              Live Support Siswa
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kelola pengaduan kendala kartu anggota, sirkulasi buku rusak/hilang, e-book reader, lost &amp; found, dan bimbingan referensi dengan notifikasi otomatis via WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadData}
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Segarkan Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Card className="rounded-2xl border border-border p-4 space-y-1.5 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Total Tiket Masuk</span>
          <p className="font-heading text-2xl font-extrabold text-foreground">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground">Seluruh periode</p>
        </Card>

        <Card className="rounded-2xl border border-border p-4 space-y-1.5 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Menunggu Respon</span>
          <p className="font-heading text-2xl font-extrabold text-amber-600">{stats.waiting}</p>
          <p className="text-[10px] text-amber-700/80 dark:text-amber-300 font-semibold">Perlu tindak lanjut</p>
        </Card>

        <Card className="rounded-2xl border border-border p-4 space-y-1.5 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Sedang Ditangani</span>
          <p className="font-heading text-2xl font-extrabold text-blue-600">{stats.inProgress}</p>
          <p className="text-[10px] text-muted-foreground">Dalam investigasi</p>
        </Card>

        <Card className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-1.5 shadow-sm">
          <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Kasus Mendesak
          </span>
          <p className="font-heading text-2xl font-extrabold text-rose-600">{stats.urgent}</p>
          <p className="text-[10px] text-rose-600/80 font-bold">SLA 2-4 Jam</p>
        </Card>

        <Card className="rounded-2xl border border-border p-4 space-y-1.5 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Terselesaikan</span>
          <p className="font-heading text-2xl font-extrabold text-emerald-600">{stats.resolved}</p>
          <p className="text-[10px] text-emerald-600/80 font-semibold">Solusi dikirim</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl border border-border p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID tiket, nama siswa, NIS, atau kata kunci..."
              className="pl-8 text-xs h-9 rounded-xl"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-background border border-border text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary h-9"
              >
                <option value="all">Semua Status</option>
                <option value="menunggu">Menunggu</option>
                <option value="diproses">Sedang Diproses</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Prioritas:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-background border border-border text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary h-9"
              >
                <option value="all">Semua Prioritas</option>
                <option value="mendesak">🚨 Mendesak</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Tickets Table */}
      <Card className="rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">ID Tiket & Waktu</th>
                <th className="px-4 py-3">Siswa & Kontak</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Subjek & Rincian Masalah</th>
                <th className="px-4 py-3 text-center">Prioritas</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTickets.map((t) => {
                let statusBadge = (
                  <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/40 bg-amber-500/10 font-bold">
                    Menunggu
                  </Badge>
                );
                if (t.status === "diproses") {
                  statusBadge = (
                    <Badge variant="secondary" className="text-[10px] bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold">
                      Diproses
                    </Badge>
                  );
                } else if (t.status === "selesai") {
                  statusBadge = (
                    <Badge variant="success" className="text-[10px] font-bold">
                      Selesai
                    </Badge>
                  );
                }

                let catLabel = "Umum";
                if (t.category === "kartu_login") catLabel = "Kartu / Akun";
                if (t.category === "sirkulasi_buku") catLabel = "Sirkulasi / Denda";
                if (t.category === "ebook_reader") catLabel = "E-Book Reader";
                if (t.category === "lost_found") catLabel = "Lost & Found";
                if (t.category === "konsultasi_riset") catLabel = "Riset / Tugas";

                return (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    {/* Ticket ID & Time */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-primary block">#{t.id}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{t.createdAt}</span>
                      </div>
                    </td>

                    {/* Student Info */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground block">{t.userName}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {t.userClass} • NIS {t.userNis}
                        </span>
                        <a
                          href={`https://wa.me/62${t.userPhone.replace(/^0/, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-emerald-600 hover:underline flex items-center gap-1 font-mono"
                        >
                          <PhoneCall className="h-2.5 w-2.5" />
                          {t.userPhone}
                        </a>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="secondary" className="text-[10px]">
                        {catLabel}
                      </Badge>
                    </td>

                    {/* Subject & Description */}
                    <td className="px-4 py-3 max-w-xs">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-foreground line-clamp-1">{t.subject}</h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {t.priority === "mendesak" ? (
                        <Badge variant="destructive" className="text-[10px] font-bold">
                          🚨 Mendesak
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          Normal
                        </Badge>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {statusBadge}
                    </td>

                    {/* Action Button */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        onClick={() => handleOpenModal(t)}
                        className={`text-[11px] h-7 px-3 font-bold rounded-lg ${
                          t.status === "selesai"
                            ? "bg-muted text-muted-foreground hover:bg-muted/80"
                            : "bg-primary text-primary-foreground shadow-xs"
                        }`}
                      >
                        {t.status === "selesai" ? "Lihat Solusi" : "Tanggapi Tiket"}
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {filteredTickets.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground italic">
                    Tidak ada tiket bantuan yang sesuai dengan filter atau kata kunci.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resolution Response Dialog Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <Card className="max-w-xl w-full rounded-3xl border border-border p-6 shadow-2xl bg-card space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <LifeBuoy className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground">
                    Penanganan Tiket #{selectedTicket.id}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Berikan solusi atau instruksi teknis kepada siswa bersangkutan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Ticket Inquiry Details Box */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">
                  {selectedTicket.userName} ({selectedTicket.userClass})
                </span>
                <span className="font-mono text-muted-foreground text-[10px]">
                  Diajukan: {selectedTicket.createdAt}
                </span>
              </div>
              <h4 className="font-bold text-foreground text-sm">{selectedTicket.subject}</h4>
              <p className="text-muted-foreground leading-relaxed italic bg-background/60 p-2.5 rounded-xl border border-border/60">
                &quot;{selectedTicket.description}&quot;
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-muted-foreground">
                  No. WhatsApp: <strong>{selectedTicket.userPhone}</strong>
                </span>
                <a
                  href={`https://wa.me/62${selectedTicket.userPhone.replace(
                    /^0/,
                    ""
                  )}?text=Halo%20${encodeURIComponent(
                    selectedTicket.userName
                  )},%20kami%20dari%20Perpustakaan%20sekolah%20menindaklanjuti%20tiket%20bantuan%20#${
                    selectedTicket.id
                  }...`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 hover:underline flex items-center gap-1 font-bold"
                >
                  <MessageSquare className="h-3 w-3" />
                  Chat Siswa Langsung via WA
                </a>
              </div>
            </div>

            <form onSubmit={handleSaveResolution} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Status Tiket *</label>
                  <select
                    value={resolutionStatus}
                    onChange={(e) => setResolutionStatus(e.target.value as HelpdeskStatus)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary h-9 font-semibold"
                  >
                    <option value="diproses">Sedang Diproses / Investigasi</option>
                    <option value="selesai">Selesai (Kasus Ditutup)</option>
                    <option value="menunggu">Menunggu Tindak Lanjut</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Pustakawan Penanggung Jawab *</label>
                  <Input
                    required
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="text-xs h-9 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">
                  Catatan Solusi / Tanggapan Resmi Pustakawan *
                </label>
                <textarea
                  required
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Contoh: Silakan bawa buku ke meja piket sirkulasi untuk kami keringkan tanpa biaya denda. / Barang telah kami simpan di laci piket..."
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                />
              </div>

              {resolutionStatus === "selesai" && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 text-[11px] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>
                    Sistem akan secara otomatis mengirimkan pesan konfirmasi WhatsApp penyelesaian beserta catatan solusi di atas ke nomor siswa ({selectedTicket.userPhone}).
                  </span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTicket(null)}
                  className="text-xs"
                >
                  Tutup
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  size="sm"
                  className="font-bold text-xs gap-1.5 bg-primary text-primary-foreground"
                >
                  {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  {isUpdating ? "Menyimpan Solusi..." : "Simpan & Kirim Solusi"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

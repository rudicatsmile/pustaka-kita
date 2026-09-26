"use client";

import { useState, useEffect } from "react";
import {
  LifeBuoy,
  MessageSquare,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  PhoneCall,
  Search,
  ExternalLink,
  Loader2,
  CreditCard,
  BookX,
  Tablet,
  Compass,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import {
  getHelpdeskTicketsAction,
  submitHelpdeskTicketAction,
  getFaqListAction,
  type HelpdeskTicket,
  type HelpdeskCategory,
  type HelpdeskPriority,
  type FaqItem,
} from "@/actions/helpdesk";

const CATEGORIES: {
  id: HelpdeskCategory;
  name: string;
  desc: string;
  icon: any;
}[] = [
  {
    id: "kartu_login",
    name: "Kartu & Akun Login",
    desc: "Kartu fisik hilang, lupa sandi, kendala barcode",
    icon: CreditCard,
  },
  {
    id: "sirkulasi_buku",
    name: "Sirkulasi, Buku & Denda",
    desc: "Buku basah/rusak, salah denda, klaim kembali",
    icon: BookX,
  },
  {
    id: "ebook_reader",
    name: "E-Book & Reader Digital",
    desc: "Halaman blank, offline cache, file PDF corrupt",
    icon: Tablet,
  },
  {
    id: "lost_found",
    name: "Barang Hilang (Lost & Found)",
    desc: "Kacamata, alat tulis, tumbler tertinggal di perpus",
    icon: Sparkles,
  },
  {
    id: "konsultasi_riset",
    name: "Riset & Referensi Tugas",
    desc: "Bimbingan sumber karya ilmiah, jurnal & ensiklopedia",
    icon: Compass,
  },
];

export default function MemberHelpdeskPage() {
  const [activeTab, setActiveTab] = useState("submit");
  const [myTickets, setMyTickets] = useState<HelpdeskTicket[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [category, setCategory] = useState<HelpdeskCategory>("sirkulasi_buku");
  const [priority, setPriority] = useState<HelpdeskPriority>("normal");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FAQ Search
  const [faqSearch, setFaqSearch] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  // Selected ticket for expanded detail
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  const currentUserId = "m1";
  const currentUserName = "Ahmad Fauzi";
  const currentUserNis = "20241001";
  const currentUserClass = "XII MIPA 1";
  const currentUserPhone = "081234567890";

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ticketsData, faqData] = await Promise.all([
        getHelpdeskTicketsAction({ userId: currentUserId }),
        getFaqListAction(),
      ]);
      setMyTickets(ticketsData);
      setFaqs(faqData);
      if (ticketsData.length > 0 && !expandedTicketId) {
        setExpandedTicketId(ticketsData[0].id);
      }
    } catch (e: any) {
      toast.error("Gagal memuat tiket bantuan:", { description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Judul dan deskripsi kendala wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitHelpdeskTicketAction({
        category,
        priority,
        subject,
        description,
        userId: currentUserId,
        userName: currentUserName,
        userNis: currentUserNis,
        userClass: currentUserClass,
        userPhone: currentUserPhone,
      });

      if (res.success && res.ticket) {
        toast.success(`Tiket #${res.ticket.id} Berhasil Dikirim! 🎫`, {
          description:
            priority === "mendesak"
              ? "Notifikasi darurat telah dikirim ke pustakawan piket & nomor WA Anda."
              : "Pustakawan akan segera meninjau tiket bantuan Anda.",
        });
        setSubject("");
        setDescription("");
        setPriority("normal");
        setCategory("sirkulasi_buku");
        setActiveTab("tickets");
        setExpandedTicketId(res.ticket.id);
        loadData();
      } else {
        toast.error("Gagal mengirim tiket:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="rounded-3xl border-primary/20 bg-linear-to-r from-primary/10 via-background to-secondary/10 p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-bold gap-1 bg-primary text-primary-foreground">
                <LifeBuoy className="h-3.5 w-3.5" />
                Helpdesk & Live Support
              </Badge>
              <Badge variant="success" className="text-xs font-semibold gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Pustakawan Piket Aktif
              </Badge>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Pusat Bantuan & Pengaduan Perpustakaan
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Mengalami masalah kartu anggota, denda sirkulasi, e-book reader, atau barang tertinggal di ruang baca? Tim pustakawan siap memberikan solusi cepat dan terpadu.
            </p>
          </div>

          {/* Emergency Hotline Button */}
          <div className="flex flex-col gap-2 shrink-0">
            <a
              href="https://wa.me/6281298765432?text=Halo%20Pustakawan%20PustakaKita%20Ceria,%20saya%20membutuhkan%20bantuan%20mendesak%20terkait%20layanan%20perpustakaan."
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="outline"
                className="w-full font-bold text-xs gap-2 px-4 py-2.5 rounded-2xl border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 shadow-xs"
              >
                <PhoneCall className="h-4 w-4 text-emerald-600" />
                Hotline WA Piket: 0812-9876-5432
              </Button>
            </a>
            <span className="text-[11px] text-muted-foreground text-center">
              Jam Layanan: Senin–Jumat 07.30–16.00 WIB
            </span>
          </div>
        </div>
      </Card>

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <TabsList className="grid grid-cols-3 w-full sm:w-96 bg-muted/60 p-1">
            <TabsTrigger value="submit" className="gap-1.5 text-xs font-semibold">
              <Send className="h-3.5 w-3.5 text-primary" />
              Buat Tiket
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-1.5 text-xs font-semibold">
              <Clock className="h-3.5 w-3.5" />
              Tiket Saya ({myTickets.length})
            </TabsTrigger>
            <TabsTrigger value="faq" className="gap-1.5 text-xs font-semibold">
              <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
              FAQ & Panduan
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: FORM BUAT TIKET BARU */}
        {/* ========================================================================= */}
        <TabsContent value="submit" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-5">
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Formulir Pengajuan Tiket Bantuan
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Isi detail kendala secara jelas agar pustakawan dapat memberikan penanganan yang akurat.
                  </p>
                </div>

                <form onSubmit={handleSubmitTicket} className="space-y-5 text-xs">
                  {/* Category Selection Grid */}
                  <div className="space-y-2">
                    <label className="font-bold text-foreground block">
                      1. Pilih Kategori Kendala *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.id;
                        return (
                          <div
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                              isSelected
                                ? "bg-primary/10 border-primary text-primary shadow-xs font-bold"
                                : "bg-card border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <div
                              className={`p-2 rounded-lg shrink-0 ${
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-foreground">
                                {cat.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground leading-snug">
                                {cat.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Priority Toggle */}
                  <div className="space-y-2">
                    <label className="font-bold text-foreground block">
                      2. Tingkat Urgensi / Prioritas *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setPriority("normal")}
                        className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1 ${
                          priority === "normal"
                            ? "bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300 font-bold"
                            : "bg-card border-border text-muted-foreground hover:border-border/80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">Standard (Normal)</span>
                          <Badge variant="outline" className="text-[10px]">
                            SLA 24 Jam
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Untuk pertanyaan umum, kendala akun, saran riset tugas.
                        </p>
                      </div>

                      <div
                        onClick={() => setPriority("mendesak")}
                        className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1 ${
                          priority === "mendesak"
                            ? "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 font-bold"
                            : "bg-card border-border text-muted-foreground hover:border-border/80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                            Mendesak (Prioritas)
                          </span>
                          <Badge variant="destructive" className="text-[10px]">
                            SLA 2-4 Jam
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Buku hilang/basah, barang tertinggal, klaim denda mendesak.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subject Input */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground">
                      3. Judul Pengaduan / Topik Bantuan *
                    </label>
                    <Input
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Contoh: Kartu fisik hilang di area kantin / Halaman e-book blank"
                      className="text-xs h-10 rounded-xl"
                    />
                  </div>

                  {/* Description Textarea */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground">
                      4. Deskripsi Detail Kendala *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Jelaskan secara rinci kronologi kendala yang kamu alami, judul buku bersangkutan (jika ada), atau barang yang tertinggal..."
                      className="w-full rounded-xl border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                    />
                  </div>

                  {priority === "mendesak" && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>
                        Tiket berprioritas <strong>MENDESAK</strong> akan otomatis mengirimkan pesan konfirmasi WhatsApp ke nomor <strong>{currentUserPhone}</strong> dan notifikasi instan ke pustakawan piket.
                      </span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="font-bold text-xs gap-1.5 px-6 py-2.5 rounded-xl shadow-md"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {isSubmitting ? "Mengirimkan Tiket..." : "Kirim Tiket Pengaduan"}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Sidebar Guide */}
            <div className="space-y-4">
              <Card className="rounded-2xl border border-border p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-foreground">
                    Pedoman Pengaduan Cepat
                  </h4>
                </div>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-foreground">•</span>
                    <span>
                      <strong>Buku Basah/Rusak:</strong> Jangan menjemur di bawah matahari langsung. Bawa segera ke meja piket untuk preservasi dengan silica gel.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-foreground">•</span>
                    <span>
                      <strong>Barang Tertinggal:</strong> Sebutkan ciri fisik, perkiraan jam membaca, dan lokasi meja baca.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-foreground">•</span>
                    <span>
                      <strong>Kartu Fisik Hilang:</strong> Anda tetap bisa meminjam dengan Kartu Digital ber-QR Code di HP.
                    </span>
                  </li>
                </ul>
              </Card>

              {/* Identity Preview Card */}
              <Card className="rounded-2xl border border-border p-5 space-y-2 shadow-xs bg-muted/30">
                <h4 className="font-heading text-xs font-bold text-foreground">
                  Identitas Pengaju Tiket
                </h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    Nama Siswa: <strong className="text-foreground">{currentUserName}</strong>
                  </p>
                  <p>
                    NIS: <span className="font-mono">{currentUserNis}</span> • Kelas: {currentUserClass}
                  </p>
                  <p>
                    WhatsApp Aktif: <span className="font-mono text-foreground font-semibold">{currentUserPhone}</span>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: RIWAYAT TIKET SAYA */}
        {/* ========================================================================= */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-foreground">
              Daftar Tiket Pengaduan Saya ({myTickets.length})
            </h3>
            <span className="text-xs text-muted-foreground">
              Status tiket diperbarui secara real-time oleh pustakawan
            </span>
          </div>

          <div className="space-y-3">
            {myTickets.map((t) => {
              const isExpanded = expandedTicketId === t.id;
              let statusBadge = (
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/40 bg-amber-500/10 font-bold">
                  ⏳ Menunggu Respon
                </Badge>
              );
              if (t.status === "diproses") {
                statusBadge = (
                  <Badge variant="secondary" className="text-[10px] bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold">
                    🔄 Sedang Ditangani
                  </Badge>
                );
              } else if (t.status === "selesai") {
                statusBadge = (
                  <Badge variant="success" className="text-[10px] font-bold">
                    ✅ Selesai / Terjawab
                  </Badge>
                );
              }

              return (
                <Card
                  key={t.id}
                  className={`rounded-2xl border transition-all ${
                    isExpanded ? "border-primary/40 shadow-sm" : "border-border hover:border-border/80"
                  }`}
                >
                  <div
                    onClick={() => setExpandedTicketId(isExpanded ? null : t.id)}
                    className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          #{t.id}
                        </span>
                        {statusBadge}
                        {t.priority === "mendesak" && (
                          <Badge variant="destructive" className="text-[9px] uppercase font-bold">
                            🚨 Mendesak
                          </Badge>
                        )}
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {t.createdAt}
                        </span>
                      </div>
                      <h4 className="font-heading text-sm sm:text-base font-bold text-foreground line-clamp-1">
                        {t.subject}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Content Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-border/60 space-y-4 text-xs">
                      {/* Original Student Issue */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                          Rincian Laporan Siswa:
                        </span>
                        <div className="p-3 rounded-xl bg-muted/40 border border-border text-foreground leading-relaxed">
                          {t.description}
                        </div>
                      </div>

                      {/* Librarian Response if any */}
                      {t.resolutionNotes ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              Tanggapan & Solusi Pustakawan:
                            </span>
                            {t.handledByStaffName && (
                              <span className="text-[11px] text-muted-foreground">
                                Ditangani oleh: <strong>{t.handledByStaffName}</strong>
                              </span>
                            )}
                          </div>
                          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 leading-relaxed font-medium">
                            {t.resolutionNotes}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
                          Pustakawan piket sedang meneliti laporan Anda. Solusi atau arahan akan diperbarui di sini dan dikonfirmasi via pesan WhatsApp.
                        </div>
                      )}

                      {t.resolvedAt && (
                        <div className="text-[11px] text-muted-foreground text-right font-mono">
                          Diselesaikan pada: {t.resolvedAt}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}

            {myTickets.length === 0 && !isLoading && (
              <div className="text-center py-12 space-y-3">
                <LifeBuoy className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <p className="text-xs text-muted-foreground">
                  Belum ada tiket pengaduan yang diajukan. Gunakan tab &quot;Buat Tiket&quot; jika mengalami kendala layanan perpustakaan.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: FAQ & PUSAT BANTUAN MANDIRI */}
        {/* ========================================================================= */}
        <TabsContent value="faq" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading text-sm font-bold text-foreground">
                Pertanyaan Populer (FAQ Perpustakaan)
              </h3>
              <p className="text-xs text-muted-foreground">
                Temukan jawaban cepat seputar peminjaman buku, denda, kartu anggota, dan fitur digital.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Cari kata kunci (cth: denda, e-book)..."
                className="pl-8 text-xs h-9 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <Card
                  key={faq.id}
                  className={`rounded-2xl border transition-all ${
                    isOpen ? "border-primary/40 shadow-xs" : "border-border hover:border-border/80"
                  }`}
                >
                  <div
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="space-y-1">
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        {faq.category}
                      </Badge>
                      <h4 className="font-heading text-sm font-bold text-foreground">
                        {faq.question}
                      </h4>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full shrink-0">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-border/60 text-xs text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </Card>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <HelpCircle className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs text-muted-foreground">
                  Pertanyaan tidak ditemukan. Silakan ajukan melalui formulir Buat Tiket.
                </p>
              </div>
            )}
          </div>

          {/* Quick Ticket Trigger */}
          <Card className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-0.5 text-center sm:text-left">
              <h5 className="font-bold text-xs text-foreground">
                Belum menemukan jawaban atas kendala Anda?
              </h5>
              <p className="text-[11px] text-muted-foreground">
                Pustakawan kami siap membantu menyelesaikan masalah Anda secara personal.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setActiveTab("submit")}
              className="text-xs font-bold gap-1.5 rounded-xl shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              Ajukan Tiket Sekarang
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

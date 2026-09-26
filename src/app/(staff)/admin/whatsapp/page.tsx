"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Send,
  Key,
  BadgeCheck,
  Bell,
  AlertTriangle,
  Megaphone,
  RefreshCw,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Smartphone,
  Sparkles,
  Users,
  BookOpen,
  Layers,
  CheckCheck,
  Loader2,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import {
  sendTestWhatsAppAction,
  saveWhatsAppConfigAction,
  getBroadcastTargetsAction,
  executeBatchBroadcastAction,
  triggerManualOverdueCheckAction,
  getWhatsAppNotificationLogsAction,
  type BroadcastTargetItem,
  type BroadcastCategoryData,
} from "@/actions/whatsapp";

export default function WhatsAppAdminPage() {
  const [activeTab, setActiveTab] = useState("broadcast");

  // --- Broadcast Hub State ---
  const [category, setCategory] = useState<"due_soon" | "overdue" | "all_members">("due_soon");
  const [categoryData, setCategoryData] = useState<BroadcastCategoryData | null>(null);
  const [customTemplate, setCustomTemplate] = useState<string>("");
  const [isLoadingTargets, setIsLoadingTargets] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<any | null>(null);

  // --- Engine State ---
  const [isTriggeringEngine, setIsTriggeringEngine] = useState(false);
  const [engineResult, setEngineResult] = useState<any | null>(null);

  // --- Logs State ---
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // --- Config State ---
  const [apiKey, setApiKey] = useState("fonnte_sec_token_9921827471928");
  const [senderNumber, setSenderNumber] = useState("081298765432");
  const [testNumber, setTestNumber] = useState("081234567890");
  const [testMessage, setTestMessage] = useState(
    "Halo! 📚 Ini adalah pesan uji coba integrasi WhatsApp Gateway PustakaKitaCeria. Sistem berjalan normal!"
  );
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch targets when category changes
  useEffect(() => {
    let isMounted = true;
    async function loadCategory() {
      setIsLoadingTargets(true);
      try {
        const res = await getBroadcastTargetsAction(category);
        if (isMounted) {
          setCategoryData(res);
          setCustomTemplate(res.defaultTemplate);
          setBroadcastResult(null);
        }
      } catch (err: any) {
        toast.error("Gagal memuat daftar target broadcast:", { description: err.message });
      } finally {
        if (isMounted) setIsLoadingTargets(false);
      }
    }
    loadCategory();
    return () => {
      isMounted = false;
    };
  }, [category]);

  // Fetch logs when logs tab is opened
  const loadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const data = await getWhatsAppNotificationLogsAction();
      setLogs(data);
    } catch (err: any) {
      toast.error("Gagal mengambil log WhatsApp:", { description: err.message });
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === "logs") {
      loadLogs();
    }
  }, [activeTab]);

  // Variable injection helper
  const handleInsertVariable = (variable: string) => {
    setCustomTemplate((prev) => prev + " " + variable);
  };

  // Preview interpolation based on first sample target
  const sampleTarget: BroadcastTargetItem = categoryData?.targets?.[0] || {
    id: "sample-1",
    name: "Ahmad Fauzi",
    phone: "081234567890",
    bookTitle: "Laskar Pelangi",
    copyCode: "PKC-2024-001-001",
    dueDate: "27 September 2026",
    daysLate: 3,
    fineAmount: 3000,
  };

  const previewMessage = customTemplate
    ? customTemplate
        .replace(/{nama}/g, sampleTarget.name)
        .replace(/{judul_buku}/g, sampleTarget.bookTitle || "Buku Pilihan")
        .replace(/{jatuh_tempo}/g, sampleTarget.dueDate || "Besok")
        .replace(/{hari_telat}/g, (sampleTarget.daysLate || 0).toString())
        .replace(/{denda}/g, (sampleTarget.fineAmount || 0).toLocaleString("id-ID"))
    : "";

  // Broadcast Submission
  const handleExecuteBroadcast = async () => {
    if (!categoryData || categoryData.targets.length === 0) {
      toast.error("Tidak ada penerima dalam antrean untuk kategori ini.");
      return;
    }

    if (!confirm(`Kirim siaran pesan WhatsApp ke ${categoryData.targets.length} penerima sekarang?`)) {
      return;
    }

    setIsBroadcasting(true);
    try {
      const res = await executeBatchBroadcastAction({
        category,
        customMessageTemplate: customTemplate,
        targets: categoryData.targets,
        actorName: "Admin Perpustakaan",
      });

      if (res.success) {
        setBroadcastResult(res);
        toast.success(`Siaran WhatsApp Selesai Dikirim! 🚀`, {
          description: `${res.sentCount} pesan berhasil dikirimkan, ${res.failedCount} gagal.`,
        });
      } else {
        toast.error("Gagal memproses broadcast:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi error saat broadcast:", { description: e.message });
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Manual Engine Trigger
  const handleTriggerEngine = async () => {
    setIsTriggeringEngine(true);
    try {
      const res = await triggerManualOverdueCheckAction("Admin Perpustakaan");
      if (res.success && res.summary) {
        setEngineResult(res.summary);
        toast.success("Mesin Pengingat & Overdue Berhasil Dijalankan! ⚡", {
          description: `${res.summary.remindersSent} pengingat H-1 terkirim, ${res.summary.overdueUpdated} status buku diperbarui, ${res.summary.finesGenerated} denda baru dibuat.`,
        });
      } else {
        toast.error("Gagal menjalankan mesin:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi kegagalan mesin:", { description: e.message });
    } finally {
      setIsTriggeringEngine(false);
    }
  };

  // Save Gateway Credentials
  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await saveWhatsAppConfigAction({
        apiKey,
        senderNumber,
        actorId: "usr-admin-1",
        actorName: "Administrator Perpustakaan",
      });
      toast.success("Konfigurasi WhatsApp Gateway Berhasil Disimpan! 💾", {
        description: "Token API dan nomor pengirim tersimpan serta tercatat di Audit Log.",
      });
    } catch (e: any) {
      toast.error("Gagal menyimpan konfigurasi:", { description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Send Direct Test Message
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testNumber) {
      toast.error("Nomor penerima uji coba wajib diisi!");
      return;
    }
    setIsSending(true);
    try {
      const res = await sendTestWhatsAppAction({
        recipient: testNumber,
        message: testMessage,
        actorId: "usr-admin-1",
        actorName: "Administrator Perpustakaan",
      });

      if (res.success) {
        toast.success("Pesan Uji Coba Berhasil Terkirim! 📲", {
          description: `Pesan telah dikirim ke nomor ${testNumber} via Fonnte Gateway. Status: ${res.status}. Log tersimpan.`,
        });
      } else {
        toast.error("Gagal mengirim pesan uji coba:", {
          description: res.error || "Periksa token API Fonnte atau nomor tujuan.",
        });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              WhatsApp Automation & Broadcast Hub
            </h1>
            <Badge variant="success" className="gap-1 text-[11px] font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Gateway Aktif
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pusat otomasi pengingat H-1, tagihan denda keterlambatan, siaran pengumuman, dan integrasi Fonnte Gateway.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerEngine}
            disabled={isTriggeringEngine}
            className="text-xs font-semibold gap-1.5 border-primary/30 hover:bg-primary/5 text-primary"
          >
            {isTriggeringEngine ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-primary" />
            )}
            {isTriggeringEngine ? "Memproses Mesin..." : "Jalankan Engine H-1"}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-muted/60 p-1">
          <TabsTrigger value="broadcast" className="gap-1.5 text-xs font-semibold">
            <Megaphone className="h-3.5 w-3.5" />
            Broadcast Massal
          </TabsTrigger>
          <TabsTrigger value="engine" className="gap-1.5 text-xs font-semibold">
            <Clock className="h-3.5 w-3.5" />
            Engine Pengingat
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5 text-xs font-semibold">
            <Layers className="h-3.5 w-3.5" />
            Log Riwayat WA
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-1.5 text-xs font-semibold">
            <Key className="h-3.5 w-3.5" />
            Gateway & Kunci API
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: BROADCAST MASSAL HUB */}
        {/* ========================================================================= */}
        <TabsContent value="broadcast" className="space-y-6 mt-4">
          {/* Target Category Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setCategory("due_soon")}
              className={`text-left p-4 rounded-2xl border transition-all ${
                category === "due_soon"
                  ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 shadow-sm ring-2 ring-amber-500/20"
                  : "border-border bg-card hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Bell className="h-4 w-4" />
                </span>
                <Badge variant={category === "due_soon" ? "warning" : "outline"} className="text-[10px]">
                  {category === "due_soon" && categoryData ? `${categoryData.targets.length} Target` : "Peminjam"}
                </Badge>
              </div>
              <h3 className="text-xs font-bold text-foreground">Pengingat H-1 Jatuh Tempo</h3>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                Peringatan ramah sebelum buku jatuh tempo esok hari agar terhindar denda.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setCategory("overdue")}
              className={`text-left p-4 rounded-2xl border transition-all ${
                category === "overdue"
                  ? "border-destructive bg-destructive/5 shadow-sm ring-2 ring-destructive/20"
                  : "border-border bg-card hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <Badge variant={category === "overdue" ? "destructive" : "outline"} className="text-[10px]">
                  {category === "overdue" && categoryData ? `${categoryData.targets.length} Target` : "Terlambat"}
                </Badge>
              </div>
              <h3 className="text-xs font-bold text-foreground">Peringatan Denda Tertunggak</h3>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                Notifikasi keterlambatan pengembalian buku beserta nominal akumulasi denda.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setCategory("all_members")}
              className={`text-left p-4 rounded-2xl border transition-all ${
                category === "all_members"
                  ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                  : "border-border bg-card hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Megaphone className="h-4 w-4" />
                </span>
                <Badge variant={category === "all_members" ? "default" : "outline"} className="text-[10px]">
                  {category === "all_members" && categoryData ? `${categoryData.targets.length} Kontak` : "Semua Siswa"}
                </Badge>
              </div>
              <h3 className="text-xs font-bold text-foreground">Pengumuman & Info Literasi</h3>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                Siarkan kabar buku baru, festival membaca, atau informasi libur ke kontak anggota.
              </p>
            </button>
          </div>

          {/* Interactive Workspace: Editor & Phone Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Message Editor & Target Control (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="rounded-2xl border border-border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="font-heading text-sm font-bold text-foreground">
                      Penyusun Pesan Siaran (Template Editor)
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11px] h-7 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      if (categoryData) setCustomTemplate(categoryData.defaultTemplate);
                    }}
                  >
                    Reset Template Default
                  </Button>
                </div>

                {/* Variable Inserters */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Sisipkan Variabel Personal (Klik untuk menambahkan):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleInsertVariable("{nama}")}
                      className="px-2 py-1 rounded-md bg-muted text-[11px] font-mono hover:bg-primary/10 hover:text-primary transition-colors border border-border/60"
                    >
                      &#123;nama&#125;
                    </button>
                    {(category === "due_soon" || category === "overdue") && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleInsertVariable("{judul_buku}")}
                          className="px-2 py-1 rounded-md bg-muted text-[11px] font-mono hover:bg-primary/10 hover:text-primary transition-colors border border-border/60"
                        >
                          &#123;judul_buku&#125;
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertVariable("{jatuh_tempo}")}
                          className="px-2 py-1 rounded-md bg-muted text-[11px] font-mono hover:bg-primary/10 hover:text-primary transition-colors border border-border/60"
                        >
                          &#123;jatuh_tempo&#125;
                        </button>
                      </>
                    )}
                    {category === "overdue" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleInsertVariable("{hari_telat}")}
                          className="px-2 py-1 rounded-md bg-muted text-[11px] font-mono hover:bg-primary/10 hover:text-primary transition-colors border border-border/60"
                        >
                          &#123;hari_telat&#125;
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertVariable("{denda}")}
                          className="px-2 py-1 rounded-md bg-muted text-[11px] font-mono hover:bg-primary/10 hover:text-primary transition-colors border border-border/60"
                        >
                          &#123;denda&#125;
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Textarea */}
                <div className="space-y-1.5">
                  <textarea
                    rows={8}
                    value={customTemplate}
                    onChange={(e) => setCustomTemplate(e.target.value)}
                    placeholder="Ketik isi pesan WhatsApp di sini..."
                    className="w-full rounded-xl border border-input bg-background p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary font-sans resize-y"
                  />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Mendukung format WhatsApp: *tebal*, _miring_, ~coret~</span>
                    <span>{customTemplate.length} karakter</span>
                  </div>
                </div>

                {/* Target Audience Summary List */}
                <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      Daftar Target Penerima ({categoryData?.targets.length || 0} orang)
                    </span>
                    {isLoadingTargets && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                    {categoryData?.targets.map((t, idx) => (
                      <div
                        key={t.id || idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/60 text-[11px]"
                      >
                        <div className="truncate max-w-[200px]">
                          <span className="font-semibold text-foreground">{t.name}</span>
                          <span className="text-muted-foreground ml-1.5 font-mono text-[10px]">{t.phone}</span>
                        </div>
                        {t.bookTitle && (
                          <div className="text-right truncate max-w-[180px] text-muted-foreground">
                            <span>{t.bookTitle}</span>
                            {t.fineAmount ? (
                              <span className="text-destructive font-bold ml-1">
                                (Rp {t.fineAmount.toLocaleString("id-ID")})
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ))}
                    {(!categoryData || categoryData.targets.length === 0) && (
                      <p className="text-[11px] text-muted-foreground italic py-2 text-center">
                        Tidak ada antrean anggota untuk kategori ini saat ini.
                      </p>
                    )}
                  </div>
                </div>

                {/* Dispatch Button */}
                <div className="pt-2 flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={handleExecuteBroadcast}
                    disabled={isBroadcasting || !categoryData || categoryData.targets.length === 0}
                    className="flex-1 font-bold text-xs gap-2 py-5 rounded-xl shadow-md"
                  >
                    {isBroadcasting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isBroadcasting
                      ? "Mengirimkan Pesan ke Gateway..."
                      : `Kirim Siaran ke ${categoryData?.targets.length || 0} Penerima`}
                  </Button>
                </div>
              </Card>

              {/* Execution Feedback Banner */}
              {broadcastResult && (
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Hasil Siaran Massal Terakhir:
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                    <div className="p-2 rounded-xl bg-background border border-emerald-500/20">
                      <span className="text-[10px] text-muted-foreground block">Total Target</span>
                      <strong className="text-sm font-bold">{broadcastResult.total}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-background border border-emerald-500/20">
                      <span className="text-[10px] text-emerald-600 block">Terkirim</span>
                      <strong className="text-sm font-bold text-emerald-600">{broadcastResult.sentCount}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-background border border-emerald-500/20">
                      <span className="text-[10px] text-destructive block">Gagal</span>
                      <strong className="text-sm font-bold text-destructive">{broadcastResult.failedCount}</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground pt-1">
                    * Seluruh status pengiriman dicatat dalam Audit Log & tabel Riwayat Notifikasi.
                  </p>
                </div>
              )}
            </div>

            {/* Right: Realistic WhatsApp Mobile Preview (5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-primary" />
                  Pratinjau Layar WhatsApp Penerima
                </span>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Simulasi: {sampleTarget.name}
                </Badge>
              </div>

              {/* Smartphone Shell */}
              <div className="rounded-3xl border-4 border-muted-foreground/30 bg-[#efeae2] dark:bg-[#0c1317] overflow-hidden shadow-xl max-w-sm mx-auto">
                {/* WhatsApp Chat Header */}
                <div className="bg-[#008069] dark:bg-[#1f2c34] text-white p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-emerald-700 dark:bg-emerald-900 text-white flex items-center justify-center font-bold text-xs">
                      PK
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-tight flex items-center gap-1">
                        PustakaKita Official
                        <BadgeCheck className="h-3 w-3 text-sky-300" />
                      </h4>
                      <p className="text-[9px] text-emerald-100 opacity-90">Akun Bisnis Terverifikasi</p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Chat Body */}
                <div className="p-4 space-y-3 min-h-[360px] flex flex-col justify-end">
                  {/* Date badge */}
                  <div className="text-center">
                    <span className="px-2.5 py-0.5 rounded-md bg-white/70 dark:bg-muted/70 text-[9px] font-semibold text-muted-foreground shadow-xs">
                      HARI INI
                    </span>
                  </div>

                  {/* Chat Message Bubble */}
                  <div className="self-start max-w-[90%] rounded-2xl rounded-tl-xs bg-white dark:bg-[#202c33] text-foreground p-3 shadow-sm space-y-1 relative">
                    <div className="text-[11.5px] leading-relaxed whitespace-pre-wrap font-sans text-neutral-800 dark:text-neutral-100">
                      {previewMessage || "Isi pesan akan tampil di sini..."}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[9px] text-neutral-500 dark:text-neutral-400 pt-1">
                      <span>14:32</span>
                      <CheckCheck className="h-3 w-3 text-sky-500" />
                    </div>
                  </div>
                </div>

                {/* WhatsApp Mock Footer */}
                <div className="bg-white dark:bg-[#1f2c34] p-2 flex items-center gap-2 border-t border-border/30 text-muted-foreground">
                  <div className="flex-1 bg-muted/40 rounded-full px-3 py-1.5 text-[10px]">
                    Ketik pesan...
                  </div>
                  <div className="p-1.5 rounded-full bg-[#008069] text-white">
                    <Send className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: ENGINE PENGINGAT H-1 & OVERDUE */}
        {/* ========================================================================= */}
        <TabsContent value="engine" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Engine Overview Card */}
            <Card className="md:col-span-2 rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-foreground">
                      Mekanisme Otomasi Pengingat H-1 & Overdue
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Sistem berjalan terjadwal tiap tengah malam (00:00 WIB) atau dapat dipicu sewaktu-waktu.
                    </p>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px]">
                  Scheduler Aktif
                </Badge>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 font-bold text-xs mt-0.5">
                    01
                  </span>
                  <div>
                    <strong className="text-foreground">Deteksi Jatuh Tempo Besok (H-1):</strong>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">
                      Sistem memindai seluruh data peminjaman aktif yang berstatus <code>dipinjam</code> dengan tanggal jatuh tempo tepat esok hari, lalu mengirimkan notifikasi WA pengingat secara otomatis ke nomor siswa/wali murid.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="p-1.5 rounded-lg bg-destructive/10 text-destructive font-bold text-xs mt-0.5">
                    02
                  </span>
                  <div>
                    <strong className="text-foreground">Pembaruan Status & Akumulasi Denda:</strong>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">
                      Buku yang melewati tanggal jatuh tempo otomatis dialihkan statusnya menjadi <code>terlambat</code>, tagihan denda dihitung berdasarkan tarif harian (Rp 1.000/hari), dan pesan peringatan keterlambatan dikirimkan.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="p-1.5 rounded-lg bg-primary/10 text-primary font-bold text-xs mt-0.5">
                    03
                  </span>
                  <div>
                    <strong className="text-foreground">Pencatatan Audit Trail & Log Notifikasi:</strong>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">
                      Setiap aksi yang dieksekusi mesin tercatat transparan ke dalam Audit Log sistem untuk keperluan kepatuhan data dan monitoring pustakawan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-muted-foreground">
                  Ingin mengecek atau menyinkronkan data sekarang tanpa menunggu tengah malam?
                </p>
                <Button
                  onClick={handleTriggerEngine}
                  disabled={isTriggeringEngine}
                  className="font-bold text-xs gap-2 px-5 py-2.5 rounded-xl w-full sm:w-auto"
                >
                  {isTriggeringEngine ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 fill-white" />
                  )}
                  {isTriggeringEngine ? "Mengeksekusi Mesin..." : "Jalankan Engine Sekarang"}
                </Button>
              </div>
            </Card>

            {/* Live Stats / Last Trigger Result */}
            <Card className="rounded-2xl border border-border p-6 space-y-4">
              <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Statistik Eksekusi Terakhir
              </h3>

              {engineResult ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
                    <span className="text-muted-foreground text-[10px] block">Waktu Selesai:</span>
                    <strong className="text-foreground font-mono">{engineResult.executedAt} WIB</strong>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300">
                      <span>Pengingat H-1 Terkirim</span>
                      <strong className="font-mono text-sm">{engineResult.remindersSent}</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-destructive/10 text-destructive">
                      <span>Buku Terlambat Diperbarui</span>
                      <strong className="font-mono text-sm">{engineResult.overdueUpdated}</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-primary/10 text-primary">
                      <span>Denda Otomatis Terbuat</span>
                      <strong className="font-mono text-sm">{engineResult.finesGenerated}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-2">
                  <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs text-muted-foreground">
                    Belum ada eksekusi manual pada sesi ini. Tekan tombol &quot;Jalankan Engine Sekarang&quot; untuk memindai antrean.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: LOG RIWAYAT NOTIFIKASI WHATSAPP */}
        {/* ========================================================================= */}
        <TabsContent value="logs" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">
                Riwayat Pengiriman Pesan WhatsApp
              </h3>
              <p className="text-xs text-muted-foreground">
                Daftar 25 transaksi notifikasi WhatsApp terakhir yang dikirim via gateway.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadLogs}
              disabled={isLoadingLogs}
              className="text-xs font-semibold gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingLogs ? "animate-spin" : ""}`} />
              Segarkan Log
            </Button>
          </div>

          <Card className="rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Waktu</th>
                    <th className="px-4 py-3">Tipe</th>
                    <th className="px-4 py-3">Penerima</th>
                    <th className="px-4 py-3">Isi Pesan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Percobaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {logs.map((log) => {
                    let badgeVariant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" = "default";
                    if (log.status === "terkirim") badgeVariant = "success";
                    else if (log.status === "antre") badgeVariant = "warning";
                    else if (log.status === "gagal") badgeVariant = "destructive";

                    return (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                          {log.createdAt}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-foreground">
                          {log.type === "due_reminder"
                            ? "Pengingat H-1"
                            : log.type === "overdue"
                            ? "Keterlambatan"
                            : log.type === "reservation_ready"
                            ? "Buku Siap"
                            : log.type === "otp"
                            ? "Verifikasi OTP"
                            : "Uji Coba"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-muted-foreground">
                          {log.recipient}
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-muted-foreground" title={log.message}>
                          {log.message}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant={badgeVariant} className="text-[10px] capitalize">
                            {log.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-muted-foreground">
                          {log.retryCount || 1}x
                        </td>
                      </tr>
                    );
                  })}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground italic">
                        {isLoadingLogs ? "Memuat data riwayat notifikasi..." : "Belum ada catatan riwayat pesan WhatsApp."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 4: GATEWAY & KUNCI API CONFIGURATION */}
        {/* ========================================================================= */}
        <TabsContent value="config" className="space-y-6 mt-4">
          {/* Status Gateway Box */}
          <Card className="rounded-2xl border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-heading text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Gateway Status: TERHUBUNG (Ready)
                </h3>
              </div>
              <Badge variant="success" className="text-xs font-bold">
                Fonnte API v2
              </Badge>
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              Device Bot aktif dengan nomor <strong>{senderNumber}</strong>. Seluruh antrean pengingat
              H-1, denda keterlambatan, dan siaran massal diteruskan secara otomatis dengan toleransi retry bertahap.
            </p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kredensial API Form */}
            <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
              <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                <span>Kredensial Fonnte Gateway</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Fonnte API Token / Secret</label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Nomor Pengirim (Bot WhatsApp)</label>
                  <Input
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handleSaveConfig}
                    disabled={isSaving}
                    size="sm"
                    className="font-bold text-xs"
                  >
                    {isSaving ? "Menyimpan..." : "Simpan Kredensial"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Form Uji Kirim Pesan Langsung */}
            <Card className="rounded-2xl border border-border p-6 shadow-sm space-y-4">
              <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                <Send className="h-4 w-4 text-secondary" />
                <span>Uji Kirim Pesan Langsung</span>
              </h3>
              <form onSubmit={handleSendTest} className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Nomor WhatsApp Tujuan</label>
                  <Input
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                    placeholder="0812xxxx"
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Isi Pesan Uji Coba</label>
                  <textarea
                    rows={3}
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSending}
                  size="sm"
                  variant="secondary"
                  className="font-bold text-xs gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSending ? "Mengirim..." : "Kirimkan Pesan Uji"}
                </Button>
              </form>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

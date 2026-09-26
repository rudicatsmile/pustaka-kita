"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  Sparkles,
  Users,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  BookOpen,
  Send,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  ChevronRight,
  ShoppingCart,
  GraduationCap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import {
  getClassAggregateAnalyticsAction,
  getInterventionStudentsAction,
  sendReadingNudgeWhatsAppAction,
  type ClassAggregateAnalytics,
  type InterventionStudent,
} from "@/actions/reading-dna";

export default function PustakawanReadingDnaPage() {
  const [classList, setClassList] = useState<ClassAggregateAnalytics[]>([]);
  const [interventionList, setInterventionList] = useState<InterventionStudent[]>([]);
  const [activeTab, setActiveTab] = useState("classes");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [classes, students] = await Promise.all([
        getClassAggregateAnalyticsAction(),
        getInterventionStudentsAction(),
      ]);
      setClassList(classes);
      setInterventionList(students);
    } catch (e: any) {
      toast.error("Gagal memuat analitik minat baca:", { description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendNudge = async (student: InterventionStudent) => {
    setSendingId(student.id);
    try {
      const res = await sendReadingNudgeWhatsAppAction({
        studentId: student.id,
        studentName: student.name,
        studentPhone: student.phone,
        recommendedTopic: student.recommendedInterest,
        senderStaffName: "Ibu Dewi Anggraini, S.IP. (Kepala Pustakawan)",
      });

      if (res.success) {
        toast.success(`Sapaan WhatsApp Terkirim ke ${student.name}! 📲`, {
          description: `Rekomendasi topik "${student.recommendedInterest}" berhasil diteruskan.`,
        });
      } else {
        toast.error("Gagal mengirim WhatsApp:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setSendingId(null);
    }
  };

  const totalStudents = classList.reduce((acc, c) => acc + c.totalStudents, 0);
  const activeStudents = classList.reduce((acc, c) => acc + c.activeReadersCount, 0);
  const avgParticipation =
    classList.length > 0
      ? Math.round(
          classList.reduce((acc, c) => acc + c.participationRate, 0) /
            classList.length
        )
      : 0;
  const totalIntervention = classList.reduce(
    (acc, c) => acc + c.interventionNeededCount,
    0
  );

  const filteredClasses = classList.filter((c) =>
    c.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Peta Minat Baca & AI Reading DNA Sekolah
            </h1>
            <Badge variant="default" className="text-xs font-bold gap-1 bg-primary text-primary-foreground">
              <Brain className="h-3.5 w-3.5" />
              Machine Learning Literacy Map
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Analisis agregat tren membaca antarkelas, deteksi siswa berisiko inaktif (early intervention), dan wawasan pengadaan koleksi berbasis kesenjangan minat baca.
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
            Segarkan
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Total Siswa Terpetakan</span>
          <p className="font-heading text-2xl font-extrabold text-foreground">{totalStudents} Siswa</p>
          <p className="text-[10px] text-muted-foreground">{activeStudents} pembaca aktif semester ini</p>
        </Card>

        <Card className="rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Rata-Rata Partisipasi</span>
          <p className="font-heading text-2xl font-extrabold text-emerald-600 font-mono">{avgParticipation}%</p>
          <p className="text-[10px] text-emerald-600 font-semibold">Di atas target SPM sekolah (75%)</p>
        </Card>

        <Card className="rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Arketipe Terpopuler</span>
          <p className="font-heading text-lg font-extrabold text-amber-600 line-clamp-1">
            Arsitek Imajinasi
          </p>
          <p className="text-[10px] text-muted-foreground">Disusul Sang Filosof Muda</p>
        </Card>

        <Card className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Butuh Intervensi
          </span>
          <p className="font-heading text-2xl font-extrabold text-rose-600 font-mono">{totalIntervention} Siswa</p>
          <p className="text-[10px] text-rose-600/80 font-bold">Inaktif &gt; 30 hari kalender</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <TabsList className="grid grid-cols-3 w-full sm:w-96 bg-muted/60 p-1">
            <TabsTrigger value="classes" className="gap-1.5 text-xs font-semibold">
              <GraduationCap className="h-3.5 w-3.5" />
              Peta Antarkelas
            </TabsTrigger>
            <TabsTrigger value="intervention" className="gap-1.5 text-xs font-semibold">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              Intervensi ({interventionList.length})
            </TabsTrigger>
            <TabsTrigger value="procurement" className="gap-1.5 text-xs font-semibold">
              <ShoppingCart className="h-3.5 w-3.5 text-amber-500" />
              Saran Koleksi
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PETA KELAS */}
        {/* ========================================================================= */}
        <TabsContent value="classes" className="space-y-4">
          <Card className="rounded-2xl border border-border p-4 shadow-xs">
            <div className="relative max-w-sm">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kelas (cth: XII MIPA, X IPS)..."
                className="pl-8 text-xs h-9 rounded-xl"
              />
            </div>
          </Card>

          <Card className="rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Nama Kelas</th>
                    <th className="px-4 py-3 text-center">Total Siswa</th>
                    <th className="px-4 py-3">Partisipasi Membaca</th>
                    <th className="px-4 py-3">Arketipe Dominan</th>
                    <th className="px-4 py-3">Genre Terfavorit</th>
                    <th className="px-4 py-3 text-center">Rata-Rata Buku</th>
                    <th className="px-4 py-3 text-center">Perlu Dorongan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredClasses.map((c) => (
                    <tr key={c.classId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">
                        {c.className}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap font-mono">
                        {c.totalStudents} Siswa
                      </td>
                      <td className="px-4 py-3 min-w-[160px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-foreground">
                              {c.activeReadersCount}/{c.totalStudents} Siswa
                            </span>
                            <span className="font-bold text-emerald-600 font-mono">
                              {c.participationRate}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${c.participationRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="secondary" className="text-[10px] font-semibold">
                          {c.dominantArchetype}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {c.topFavoriteGenre}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap font-mono font-bold text-foreground">
                        {c.avgBooksPerStudent} Buku
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {c.interventionNeededCount > 0 ? (
                          <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-300 bg-rose-50/50">
                            {c.interventionNeededCount} Siswa
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[10px]">
                            Optimal
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: DETEKSI SISWA INAKTIF (EARLY INTERVENTION) */}
        {/* ========================================================================= */}
        <TabsContent value="intervention" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-sm font-bold text-foreground">
                Daftar Siswa Berisiko Inaktif (&gt; 30 Hari Tanpa Aktivitas Membaca)
              </h3>
              <p className="text-xs text-muted-foreground">
                Kirimkan sapaan literasi WhatsApp personal dengan rekomendasi buku yang sesuai dengan minat mereka.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {interventionList.map((st) => (
              <Card
                key={st.id}
                className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{st.name}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {st.classOrMajor} • NIS {st.nisNim}
                      </Badge>
                      <Badge variant="destructive" className="text-[10px]">
                        Inaktif {st.daysInactive} Hari
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Buku terakhir dipinjam: <strong>{st.lastBorrowedBook || "Belum ada"}</strong> • Total pinjam tahun ini: <strong>{st.totalLoansThisYear} buku</strong>
                    </p>
                  </div>

                  <Button
                    size="sm"
                    disabled={sendingId === st.id}
                    onClick={() => handleSendNudge(st)}
                    className="text-xs font-bold gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shrink-0"
                  >
                    {sendingId === st.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Kirim Sapaan Rekomendasi WA
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-rose-500/10">
                  <div className="p-2.5 rounded-xl bg-background border border-border space-y-0.5">
                    <span className="font-bold text-foreground text-[11px] block">
                      Minat Potensial Terdeteksi:
                    </span>
                    <p className="text-muted-foreground text-[11px]">
                      {st.recommendedInterest}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-background border border-border space-y-0.5">
                    <span className="font-bold text-foreground text-[11px] block">
                      Rekomendasi Tindakan Pustakawan:
                    </span>
                    <p className="text-muted-foreground text-[11px]">
                      {st.suggestedAction}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: SARAN BELANJA KOLEKSI (BOS GAP ANALYSIS) */}
        {/* ========================================================================= */}
        <TabsContent value="procurement" className="space-y-4">
          <Card className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-background to-secondary/10 p-5 space-y-3">
            <div className="space-y-1">
              <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Wawasan Kesenjangan Koleksi (AI Collection Gap Insight)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Algoritma AI menganalisis kecenderungan arketipe siswa dibandingkan ketersediaan eksemplar di rak buku. Berikut adalah rekomendasi prioritas belanja koleksi dana BOS tahun ini:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-card border border-border space-y-1.5">
                <Badge variant="default" className="text-[10px] bg-amber-500 text-white font-bold">
                  Defisit Koleksi 42%
                </Badge>
                <h4 className="font-bold text-foreground text-xs">
                  Sains Populer &amp; Eksperimen STEM
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Banyak diminati siswa arketipe <em>Penjelajah Sains</em> di kelas MIPA, namun jumlah eksemplar fisik di rak hanya 18 judul.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-card border border-border space-y-1.5">
                <Badge variant="default" className="text-[10px] bg-purple-600 text-white font-bold">
                  Defisit Koleksi 35%
                </Badge>
                <h4 className="font-bold text-foreground text-xs">
                  Novel Grafis &amp; Fiksi Sejarah
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Paling digemari siswa kelas X untuk membangun kebiasaan membaca awal. Antrean reservasi mencapai 12 siswa.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-card border border-border space-y-1.5">
                <Badge variant="default" className="text-[10px] bg-blue-600 text-white font-bold">
                  Defisit Koleksi 28%
                </Badge>
                <h4 className="font-bold text-foreground text-xs">
                  Koding &amp; Robotika Pemula
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Dibutuhkan untuk mendukung ekstrakurikuler informatika dan arketipe <em>Inovator Teknologi Cilik</em>.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

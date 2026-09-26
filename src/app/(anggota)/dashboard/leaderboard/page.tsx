"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Sparkles,
  Flame,
  BookOpen,
  CheckCircle2,
  Lock,
  Printer,
  Share2,
  QrCode,
  ArrowRight,
  Star,
  Users,
  Calendar,
  Layers,
  FileCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import {
  getMemberGamificationDataAction,
  getLeaderboardAction,
  generateCertificateDataAction,
  type MemberGamificationProfile,
  type LeaderboardEntry,
  type CertificateData,
} from "@/actions/gamification";

export default function MemberLeaderboardPage() {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [timeframe, setTimeframe] = useState<"month" | "all_time">("month");
  const [classFilter, setClassFilter] = useState("semua");

  const [profile, setProfile] = useState<MemberGamificationProfile | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<{
    currentUserRank: LeaderboardEntry;
    entries: LeaderboardEntry[];
    topPodium: LeaderboardEntry[];
  } | null>(null);
  const [certData, setCertData] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [prof, lead, cert] = await Promise.all([
          getMemberGamificationDataAction(),
          getLeaderboardAction(timeframe, classFilter),
          generateCertificateDataAction(),
        ]);
        setProfile(prof);
        setLeaderboardData(lead);
        setCertData(cert);
      } catch (err: any) {
        toast.error("Gagal memuat data gamifikasi:", { description: err.message });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [timeframe, classFilter]);

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleShareCertificate = () => {
    if (certData) {
      navigator.clipboard.writeText(
        `https://pustakakitaceria.sch.id/verifikasi/${certData.verificationCode}`
      );
      toast.success("Tautan Verifikasi Sertifikat Disalin! 📋", {
        description: "Tautan verifikasi keaslian sertifikat siap dibagikan.",
      });
    }
  };

  if (isLoading || !profile || !leaderboardData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-xs text-muted-foreground">Memuat Peringkat & Prestasi Literasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Print Styles for Certificate */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate,
          #printable-certificate * {
            visibility: visible;
          }
          #printable-certificate {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 2cm;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: 8px double #d4af37 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            z-index: 9999;
          }
        }
      `}</style>

      {/* Gamification Header Banner */}
      <Card className="rounded-3xl border-primary/20 bg-linear-to-r from-primary/10 via-background to-secondary/10 p-6 shadow-sm overflow-hidden relative">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Trophy className="h-64 w-64 text-primary" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-bold gap-1 bg-amber-500 hover:bg-amber-600 text-white">
                <Crown className="h-3.5 w-3.5" />
                Peringkat #{profile.rankPosition} dari {profile.totalMembers} Siswa
              </Badge>
              <Badge variant="outline" className="text-xs font-semibold">
                {profile.classOrMajor}
              </Badge>
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Halo, {profile.name}! {profile.levelTier.icon}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xl">
              Tingkat Pembaca: <strong className="text-foreground">{profile.levelTier.title}</strong>. Terus membaca, pinjam buku tepat waktu, dan kumpulkan poin untuk membuka sertifikat semester!
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 bg-background/80 backdrop-blur-xs p-4 rounded-2xl border border-border shadow-xs">
            <div className="text-center px-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Total Poin
              </span>
              <span className="font-mono text-xl font-bold text-primary flex items-center justify-center gap-1">
                <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                {profile.totalPoints}
              </span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center px-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Buku Selesai
              </span>
              <span className="font-mono text-xl font-bold text-foreground">
                {profile.stats.onTimeReturns + profile.stats.ebooksRead}
              </span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center px-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Lencana
              </span>
              <span className="font-mono text-xl font-bold text-amber-600">
                {profile.badges.filter((b) => b.isUnlocked).length}/5
              </span>
            </div>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="mt-6 pt-4 border-t border-border/60 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Progres Menuju Tier Berikutnya:
            </span>
            <span className="text-muted-foreground font-mono">
              {profile.levelTier.remainingToNext > 0
                ? `${profile.levelTier.remainingToNext} poin lagi menuju Level Berikutnya`
                : "Level Maksimal Tercapai!"}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden p-0.5 border border-border/50">
            <div
              className="bg-linear-to-r from-amber-500 to-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${profile.levelTier.progressPercent}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md bg-muted/60 p-1">
          <TabsTrigger value="leaderboard" className="gap-1.5 text-xs font-semibold">
            <Trophy className="h-3.5 w-3.5" />
            Papan Peringkat
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-1.5 text-xs font-semibold">
            <Award className="h-3.5 w-3.5" />
            Lencana Prestasi
          </TabsTrigger>
          <TabsTrigger value="certificate" className="gap-1.5 text-xs font-semibold">
            <FileCheck className="h-3.5 w-3.5" />
            Sertifikat E-Literasi
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: LEADERBOARD & PODIUM */}
        {/* ========================================================================= */}
        <TabsContent value="leaderboard" className="space-y-6 mt-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTimeframe("month")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  timeframe === "month"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Bulan Ini (September)
              </button>
              <button
                type="button"
                onClick={() => setTimeframe("all_time")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  timeframe === "all_time"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Sepanjang Masa
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Filter Tingkat:</span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="bg-background border border-border text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="semua">Semua Tingkat (Seluruh Sekolah)</option>
                <option value="X">Kelas X</option>
                <option value="XI">Kelas XI</option>
                <option value="XII">Kelas XII</option>
              </select>
            </div>
          </div>

          {/* Visual Podium Top 3 */}
          {leaderboardData.topPodium.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 pt-6 pb-2 max-w-2xl mx-auto items-end">
              {/* 2nd Place */}
              <div className="text-center space-y-2">
                <div className="relative inline-block">
                  <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-slate-400 flex items-center justify-center font-bold text-foreground text-sm shadow-md mx-auto">
                    {leaderboardData.topPodium[1].name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                  </div>
                  <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-slate-300 dark:bg-slate-600 border border-slate-400 flex items-center justify-center text-xs font-bold">
                    🥈
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-xs truncate text-foreground">{leaderboardData.topPodium[1].name}</h4>
                  <p className="text-[10px] text-muted-foreground">{leaderboardData.topPodium[1].classOrMajor}</p>
                  <p className="text-xs font-mono font-bold text-primary mt-0.5">{leaderboardData.topPodium[1].totalPoints} Pts</p>
                </div>
                <div className="h-20 bg-linear-to-t from-slate-300/80 to-slate-200/40 dark:from-slate-800 dark:to-slate-700/50 rounded-t-2xl flex items-center justify-center font-bold text-base text-slate-600 dark:text-slate-300">
                  #2
                </div>
              </div>

              {/* 1st Place (Center / Taller) */}
              <div className="text-center space-y-2">
                <div className="relative inline-block">
                  <Crown className="h-6 w-6 text-amber-500 fill-amber-400 mx-auto animate-bounce" />
                  <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-400 flex items-center justify-center font-bold text-amber-900 dark:text-amber-200 text-base shadow-lg mx-auto">
                    {leaderboardData.topPodium[0].name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                  </div>
                  <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-amber-400 border border-amber-500 flex items-center justify-center text-sm font-bold shadow-sm">
                    🥇
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-xs truncate text-foreground">{leaderboardData.topPodium[0].name}</h4>
                  <p className="text-[10px] text-muted-foreground">{leaderboardData.topPodium[0].classOrMajor}</p>
                  <p className="text-xs font-mono font-bold text-amber-600 mt-0.5">{leaderboardData.topPodium[0].totalPoints} Pts</p>
                </div>
                <div className="h-28 bg-linear-to-t from-amber-400/80 to-amber-200/40 dark:from-amber-900/60 dark:to-amber-800/40 rounded-t-2xl flex items-center justify-center font-bold text-xl text-amber-800 dark:text-amber-200">
                  #1
                </div>
              </div>

              {/* 3rd Place */}
              <div className="text-center space-y-2">
                <div className="relative inline-block">
                  <div className="h-14 w-14 rounded-full bg-amber-100/60 dark:bg-amber-950/30 border-2 border-amber-700/50 flex items-center justify-center font-bold text-foreground text-sm shadow-md mx-auto">
                    {leaderboardData.topPodium[2].name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                  </div>
                  <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-700/30 border border-amber-700/50 flex items-center justify-center text-xs font-bold">
                    🥉
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-xs truncate text-foreground">{leaderboardData.topPodium[2].name}</h4>
                  <p className="text-[10px] text-muted-foreground">{leaderboardData.topPodium[2].classOrMajor}</p>
                  <p className="text-xs font-mono font-bold text-primary mt-0.5">{leaderboardData.topPodium[2].totalPoints} Pts</p>
                </div>
                <div className="h-16 bg-linear-to-t from-amber-800/40 to-amber-700/20 dark:from-amber-950 dark:to-amber-900/40 rounded-t-2xl flex items-center justify-center font-bold text-base text-amber-900 dark:text-amber-300">
                  #3
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <Card className="rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-center w-14">Rank</th>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-4 py-3">Kelas</th>
                    <th className="px-4 py-3">Tingkat Literasi</th>
                    <th className="px-4 py-3 text-center">Buku Dibaca</th>
                    <th className="px-4 py-3 text-right">Poin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {leaderboardData.entries.map((item) => {
                    const isSelf = item.isCurrentUser;
                    return (
                      <tr
                        key={item.userId}
                        className={`transition-colors ${
                          isSelf
                            ? "bg-primary/5 font-semibold hover:bg-primary/10 border-l-4 border-l-primary"
                            : "hover:bg-muted/30"
                        }`}
                      >
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {item.rank === 1 ? (
                            <span className="text-base">🥇</span>
                          ) : item.rank === 2 ? (
                            <span className="text-base">🥈</span>
                          ) : item.rank === 3 ? (
                            <span className="text-base">🥉</span>
                          ) : (
                            <span className="font-mono text-muted-foreground font-bold">#{item.rank}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">
                              {item.name}
                            </span>
                            {isSelf && (
                              <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4">
                                Anda
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                          {item.classOrMajor}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge
                            variant={
                              item.levelTier === 4
                                ? "default"
                                : item.levelTier === 3
                                ? "secondary"
                                : "outline"
                            }
                            className="text-[10px]"
                          >
                            {item.levelTitle}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap font-mono text-muted-foreground">
                          {item.booksRead} buku
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <span className="font-mono font-bold text-primary flex items-center justify-end gap-1">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            {item.totalPoints}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: ACHIEVEMENTS & BADGES */}
        {/* ========================================================================= */}
        <TabsContent value="badges" className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">
                Koleksi Lencana Prestasi (Badges)
              </h3>
              <p className="text-xs text-muted-foreground">
                Buka lencana kehormatan dengan menyelesaikan berbagai tantangan membaca dan sirkulasi.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">
              Terbuka: {profile.badges.filter((b) => b.isUnlocked).length} dari {profile.badges.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {profile.badges.map((badge) => (
              <Card
                key={badge.id}
                className={`p-5 rounded-2xl border transition-all ${
                  badge.isUnlocked
                    ? "border-amber-400/60 bg-linear-to-b from-amber-500/5 to-card shadow-sm ring-1 ring-amber-500/20"
                    : "border-border/60 bg-muted/20 opacity-75"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${
                      badge.isUnlocked
                        ? "bg-amber-100 dark:bg-amber-950/80 border border-amber-300"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <Badge
                    variant={badge.isUnlocked ? "success" : "outline"}
                    className="text-[10px] gap-1"
                  >
                    {badge.isUnlocked ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Terbuka
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 text-muted-foreground" />
                        Terkunci
                      </>
                    )}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1">
                  <h4 className="font-heading text-sm font-bold text-foreground">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-border/50 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Progres Tantangan</span>
                    <span className="font-mono font-semibold">
                      {badge.currentCount}/{badge.targetCount}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        badge.isUnlocked ? "bg-amber-500" : "bg-primary/50"
                      }`}
                      style={{ width: `${badge.progressPercent}%` }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: E-CERTIFICATE GENERATOR */}
        {/* ========================================================================= */}
        <TabsContent value="certificate" className="space-y-6 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">
                Sertifikat E-Literasi Resmi
              </h3>
              <p className="text-xs text-muted-foreground">
                Sertifikat resmi penghargaan keaktifan literasi perpustakaan sekolah dengan barcode verifikasi.
              </p>
            </div>
            {profile.isEligibleForCertificate ? (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleShareCertificate}
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold gap-1.5"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Salin Tautan
                </Button>
                <Button
                  onClick={handlePrintCertificate}
                  size="sm"
                  className="text-xs font-bold gap-1.5 bg-primary text-primary-foreground"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Cetak / Simpan PDF
                </Button>
              </div>
            ) : null}
          </div>

          {/* Certificate Eligibility Banner */}
          {!profile.isEligibleForCertificate ? (
            <Card className="rounded-2xl border-amber-300 bg-amber-50/60 dark:bg-amber-950/20 p-6 text-center space-y-3">
              <Lock className="h-8 w-8 text-amber-600 mx-auto" />
              <h4 className="font-heading text-sm font-bold text-amber-900 dark:text-amber-200">
                Sertifikat Belum Terbuka
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto">
                Kumpulkan minimal <strong>50 Poin Literasi</strong> (saat ini {profile.totalPoints} poin) untuk menerbitkan Sertifikat Penghargaan E-Literasi Anda!
              </p>
            </Card>
          ) : certData ? (
            /* Luxury Printable Certificate Frame */
            <div className="max-w-4xl mx-auto">
              <div
                id="printable-certificate"
                className="relative rounded-3xl border-8 border-double border-amber-400/80 bg-[#fffdfa] dark:bg-[#1a1b1e] text-neutral-900 dark:text-neutral-100 p-8 sm:p-12 shadow-xl space-y-6 overflow-hidden"
              >
                {/* Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <BookOpen className="h-96 w-96 text-amber-600" />
                </div>

                {/* Header with Institution */}
                <div className="text-center space-y-1 relative z-10 border-b border-amber-200/80 dark:border-amber-900/50 pb-4">
                  <p className="text-[10px] tracking-widest uppercase font-bold text-amber-700 dark:text-amber-400">
                    KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET DAN TEKNOLOGI
                  </p>
                  <h2 className="font-serif text-lg sm:text-xl font-bold tracking-wider text-foreground">
                    {certData.institutionName.toUpperCase()}
                  </h2>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Nomor Akreditasi Perpustakaan: A/SNP/2024/099 • Status: Resmi Terverifikasi
                  </p>
                </div>

                {/* Certificate Title */}
                <div className="text-center space-y-2 relative z-10 pt-2">
                  <span className="text-[11px] font-mono tracking-widest text-amber-600 dark:text-amber-400 uppercase font-bold">
                    No: {certData.certificateNumber}
                  </span>
                  <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-foreground tracking-wide">
                    SERTIFIKAT APRESIASI LITERASI
                  </h1>
                  <p className="text-xs text-muted-foreground italic">
                    Diberikan dengan penuh penghargaan dan apresiasi kepada:
                  </p>
                </div>

                {/* Recipient Name in Calligraphy Style */}
                <div className="text-center py-2 relative z-10">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary underline decoration-amber-400 decoration-2 underline-offset-8">
                    {certData.recipientName}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 font-mono">
                    NIS / ID: {certData.nisNim} • {certData.classOrMajor}
                  </p>
                </div>

                {/* Achievement Description */}
                <div className="text-center max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed text-muted-foreground relative z-10">
                  Atas dedikasi, kedisiplinan, dan partisipasi luar biasa dalam program literasi gemar membaca buku sekolah dengan pencapaian gelar:
                  <div className="mt-2 inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-700 dark:text-amber-300 font-bold text-sm">
                    ✨ {certData.levelTitle} ({certData.totalPoints} Poin Literasi) ✨
                  </div>
                </div>

                {/* Signatures & Seal Footer */}
                <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-6 items-end relative z-10 border-t border-amber-200/80 dark:border-amber-900/50">
                  {/* Left: QR Verification */}
                  <div className="space-y-1">
                    <div className="h-16 w-16 bg-white p-1 rounded-lg border border-border/80 shadow-xs flex items-center justify-center">
                      <QrCode className="h-14 w-14 text-neutral-800" />
                    </div>
                    <p className="text-[9px] font-mono text-muted-foreground">
                      Kode: {certData.verificationCode}
                    </p>
                  </div>

                  {/* Center: Official Seal */}
                  <div className="hidden sm:flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full border-2 border-dashed border-amber-500 text-amber-600 flex items-center justify-center font-serif text-[10px] font-bold rotate-12 shadow-xs">
                      CAP RESMI
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1">Stempel Digital Perpustakaan</p>
                  </div>

                  {/* Right: Signature */}
                  <div className="text-right space-y-1">
                    <p className="text-[11px] text-muted-foreground">Jakarta, {certData.issuedDate}</p>
                    <p className="text-[11px] text-muted-foreground">Kepala Perpustakaan,</p>
                    <div className="h-8" />
                    <p className="font-serif text-xs font-bold text-foreground underline">
                      {certData.headLibrarian}
                    </p>
                    <p className="text-[9px] font-mono text-muted-foreground">NIP. 19780512 200501 2 003</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

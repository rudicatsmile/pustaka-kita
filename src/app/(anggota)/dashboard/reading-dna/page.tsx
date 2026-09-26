"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  Brain,
  Compass,
  Trophy,
  Flame,
  Clock,
  Target,
  ChevronRight,
  TrendingUp,
  BookmarkCheck,
  BookMarked,
  Share2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Award,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import Link from "next/link";
import {
  getStudentReadingDnaAction,
  getAiBookRecommendationsAction,
  updateReadingGoalAction,
  type ReadingAnalyticsProfile,
  type AiBookRecommendation,
} from "@/actions/reading-dna";

export default function MemberReadingDnaPage() {
  const [profile, setProfile] = useState<ReadingAnalyticsProfile | null>(null);
  const [recommendations, setRecommendations] = useState<AiBookRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Goal Editor State
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [customGoal, setCustomGoal] = useState(20);
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dnaData, recsData] = await Promise.all([
        getStudentReadingDnaAction("m1"),
        getAiBookRecommendationsAction("m1"),
      ]);
      setProfile(dnaData);
      setRecommendations(recsData);
      setCustomGoal(dnaData.stats.targetBooks2026);
    } catch (e: any) {
      toast.error("Gagal memuat profil AI Reading DNA:", { description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveGoal = async () => {
    if (customGoal < 1 || customGoal > 100) {
      toast.error("Target membaca harus antara 1 sampai 100 buku.");
      return;
    }

    setIsUpdatingGoal(true);
    try {
      const res = await updateReadingGoalAction(customGoal, "m1");
      if (res.success) {
        toast.success(`Target Membaca 2026 Diperbarui: ${res.targetBooks} Buku! 🎯`, {
          description: "Semangat menuntaskan misi literasi tahunanmu!",
        });
        if (profile) {
          setProfile({
            ...profile,
            stats: {
              ...profile.stats,
              targetBooks2026: res.targetBooks,
            },
          });
        }
        setIsEditingGoal(false);
      }
    } catch (e: any) {
      toast.error("Gagal memperbarui target:", { description: e.message });
    } finally {
      setIsUpdatingGoal(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground animate-pulse">
          Menganalisis DNA literasi dan jejak bacaanmu...
        </p>
      </div>
    );
  }

  // Radar Chart Calculations for 5 Dimensions
  // Center at (150, 150), radius = 100
  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  const angles = [
    -Math.PI / 2, // Top: Kedalaman Narasi
    -Math.PI / 2 + (2 * Math.PI) / 5, // Top-Right: Pengetahuan Faktual
    -Math.PI / 2 + (4 * Math.PI) / 5, // Bottom-Right: Imajinasi & Kreativitas
    -Math.PI / 2 + (6 * Math.PI) / 5, // Bottom-Left: Konsistensi
    -Math.PI / 2 + (8 * Math.PI) / 5, // Top-Left: Eksplorasi Genre
  ];

  const dimValues = [
    profile.dimensions.narrativeDepth,
    profile.dimensions.factualKnowledge,
    profile.dimensions.creativity,
    profile.dimensions.readingConsistency,
    profile.dimensions.genreDiversity,
  ];

  const dimLabels = [
    { label: "Kedalaman Narasi", val: profile.dimensions.narrativeDepth },
    { label: "Faktual & Sains", val: profile.dimensions.factualKnowledge },
    { label: "Imajinasi Fiksi", val: profile.dimensions.creativity },
    { label: "Konsistensi Streak", val: profile.dimensions.readingConsistency },
    { label: "Keberagaman Genre", val: profile.dimensions.genreDiversity },
  ];

  const pointsString = dimValues
    .map((val, i) => {
      const r = (val / 100) * radius;
      const x = centerX + r * Math.cos(angles[i]);
      const y = centerY + r * Math.sin(angles[i]);
      return `${x},${y}`;
    })
    .join(" ");

  const targetProgress = Math.min(
    100,
    Math.round((profile.stats.totalBooksFinished / profile.stats.targetBooks2026) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Top Archetype Persona Banner */}
      <Card
        className={`rounded-3xl border border-primary/20 bg-linear-to-br ${profile.archetype.gradientClass} text-white p-6 sm:p-8 shadow-xl relative overflow-hidden`}
      >
        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 top-6 opacity-15">
          <Brain className="w-48 h-48 text-white" />
        </div>

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="bg-white/15 text-white border-white/30 text-xs font-bold gap-1 px-3 py-1 backdrop-blur-md"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              AI Reading DNA Persona
            </Badge>
            <Badge
              variant="outline"
              className="bg-black/20 text-white/90 border-white/20 text-xs font-mono"
            >
              {profile.archetype.level}
            </Badge>
          </div>

          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {profile.archetype.name}
            </h1>
            <p className="text-amber-200 text-xs sm:text-sm font-semibold mt-1">
              &quot;{profile.archetype.tagline}&quot;
            </p>
          </div>

          <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
            {profile.archetype.description}
          </p>

          <div className="pt-2 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/80 italic">
            <p>&quot;{profile.archetype.quote}&quot;</p>
            <span className="not-italic font-bold font-mono text-[11px] bg-white/20 px-2.5 py-1 rounded-xl shrink-0">
              ID: {profile.userName} • {profile.classOrMajor}
            </span>
          </div>
        </div>
      </Card>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Card className="rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Total Buku Tamat</span>
          <p className="font-heading text-2xl font-extrabold text-foreground flex items-center gap-1.5">
            <BookOpen className="h-5 w-5 text-primary" />
            {profile.stats.totalBooksFinished} Buku
          </p>
          <p className="text-[10px] text-muted-foreground">Tahun ajaran 2025/2026</p>
        </Card>

        <Card className="rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Total Halaman Dibaca</span>
          <p className="font-heading text-2xl font-extrabold text-foreground font-mono">
            {profile.stats.totalPagesRead.toLocaleString("id-ID")}
          </p>
          <p className="text-[10px] text-muted-foreground">Fisik &amp; E-Book</p>
        </Card>

        <Card className="rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Estimasi Waktu Membaca</span>
          <p className="font-heading text-2xl font-extrabold text-foreground flex items-center gap-1.5">
            <Clock className="h-5 w-5 text-cyan-600" />
            {profile.stats.estimatedHoursRead} Jam
          </p>
          <p className="text-[10px] text-muted-foreground">Rata-rata 40 mnt/hari</p>
        </Card>

        <Card className="rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Kecepatan Baca</span>
          <p className="font-heading text-2xl font-extrabold text-foreground font-mono">
            {profile.stats.avgDaysPerBook} <span className="text-xs font-normal">Hari/Buku</span>
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold">Tergolong pembaca tangkas</p>
        </Card>

        <Card className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 fill-amber-500" />
            Streak Membaca
          </span>
          <p className="font-heading text-2xl font-extrabold text-amber-600 font-mono">
            {profile.stats.currentStreakDays} Hari
          </p>
          <p className="text-[10px] text-amber-700/80 dark:text-amber-300 font-bold">Jangan putus hari ini!</p>
        </Card>
      </div>

      {/* Main Grid: Radar Chart + Reading Challenge Target */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 5-Dimension Radar Chart (7 cols) */}
        <Card className="lg:col-span-7 rounded-3xl border border-border p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Radar Spektrum Literasi (5 Dimensi)
                </h3>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                  AI Matrix
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Keseimbangan minat baca diukur dari jenis buku, kedalaman topik, dan konsistensi membaca.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* SVG Spider / Radar Chart */}
            <div className="relative flex items-center justify-center p-2">
              <svg width="280" height="280" viewBox="0 0 300 300" className="overflow-visible">
                {/* Background Concentric Polygon Rings (20%, 40%, 60%, 80%, 100%) */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, sIdx) => {
                  const ringPoints = angles
                    .map((angle) => {
                      const r = radius * scale;
                      const x = centerX + r * Math.cos(angle);
                      const y = centerY + r * Math.sin(angle);
                      return `${x},${y}`;
                    })
                    .join(" ");
                  return (
                    <polygon
                      key={sIdx}
                      points={ringPoints}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-muted/60 dark:text-muted/40"
                    />
                  );
                })}

                {/* Axis Radial Lines */}
                {angles.map((angle, aIdx) => {
                  const x = centerX + radius * Math.cos(angle);
                  const y = centerY + radius * Math.sin(angle);
                  return (
                    <line
                      key={aIdx}
                      x1={centerX}
                      y1={centerY}
                      x2={x}
                      y2={y}
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-muted/70"
                    />
                  );
                })}

                {/* Student's Filled Dimension Polygon */}
                <polygon
                  points={pointsString}
                  fill="url(#radarGradient)"
                  stroke="#d97706"
                  strokeWidth="2.5"
                  className="transition-all duration-700 ease-out"
                />

                {/* Vertices Dots */}
                {dimValues.map((val, vIdx) => {
                  const r = (val / 100) * radius;
                  const x = centerX + r * Math.cos(angles[vIdx]);
                  const y = centerY + r * Math.sin(angles[vIdx]);
                  return (
                    <circle
                      key={vIdx}
                      cx={x}
                      cy={y}
                      r="4.5"
                      fill="#ffffff"
                      stroke="#d97706"
                      strokeWidth="2.5"
                    />
                  );
                })}

                {/* Linear Gradient for Filled Area */}
                <defs>
                  <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d97706" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Dimension Breakdown Metrics List */}
            <div className="space-y-3">
              {dimLabels.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{item.label}</span>
                    <span className="font-mono font-bold text-amber-600">{item.val}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Strengths & Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-xs">
              <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-600" />
                Kekuatan Utama Pembaca:
              </span>
              <ul className="space-y-1 text-[11px] text-muted-foreground list-disc list-inside">
                {profile.keyStrengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-1 text-xs">
              <span className="font-bold text-primary flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5" />
                Saran Pengembangan Literasi:
              </span>
              <ul className="space-y-1 text-[11px] text-muted-foreground list-disc list-inside">
                {profile.readingGrowthTips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Right Column: Reading Challenge 2026 & Genre Distribution (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target Membaca 2026 Card */}
          <Card className="rounded-3xl border border-border p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground">
                    Target Membaca 2026
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Reading Challenge Pribadi</p>
                </div>
              </div>

              {!isEditingGoal ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingGoal(true)}
                  className="text-xs h-7 px-2.5 rounded-lg"
                >
                  Ubah Target
                </Button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={customGoal}
                    onChange={(e) => setCustomGoal(Number(e.target.value))}
                    className="w-16 h-7 text-xs font-mono rounded-lg"
                  />
                  <Button
                    size="sm"
                    disabled={isUpdatingGoal}
                    onClick={handleSaveGoal}
                    className="text-xs h-7 px-2 bg-primary text-primary-foreground font-bold rounded-lg"
                  >
                    Simpan
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <span className="font-heading text-3xl font-extrabold text-foreground">
                    {profile.stats.totalBooksFinished}
                  </span>
                  <span className="text-muted-foreground text-sm font-semibold">
                    {" "}
                    / {profile.stats.targetBooks2026} Buku
                  </span>
                </div>
                <Badge variant="default" className="text-xs font-bold bg-primary text-primary-foreground">
                  {targetProgress}% Tercapai
                </Badge>
              </div>

              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-primary to-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${targetProgress}%` }}
                />
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Tersisa <strong>{Math.max(0, profile.stats.targetBooks2026 - profile.stats.totalBooksFinished)} buku lagi</strong> untuk menuntaskan resolusi membaca tahun 2026. Dengan rata-rata membacamu (4.8 hari/buku), target ini diproyeksikan selesai pada <strong>November 2026</strong>! 🎉
              </p>
            </div>
          </Card>

          {/* Distribusi Genre Favorit */}
          <Card className="rounded-3xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground">
              Distribusi Kategori Bacaan
            </h3>

            <div className="space-y-3">
              {profile.genreDistribution.map((g, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">{g.genre}</span>
                    <span className="font-mono font-bold text-foreground">
                      {g.count} Buku ({g.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${g.percentage}%`, backgroundColor: g.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* AI Book Recommendations Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-xl font-bold text-foreground">
                Kurasi Rekomendasi Buku Cerdas (AI Match 90%+)
              </h2>
              <Badge variant="default" className="text-xs font-bold gap-1 bg-amber-500 text-white">
                <Sparkles className="h-3 w-3" />
                Dipersonalisasi
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Buku yang disesuaikan secara khusus dengan arketipe &quot;{profile.archetype.name}&quot; dan rekam jejak literasimu.
            </p>
          </div>

          <Link href="/katalog">
            <Button variant="ghost" size="sm" className="text-xs gap-1 font-semibold text-primary">
              Jelajahi Katalog Lengkap
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((book) => (
            <Card
              key={book.id}
              className="rounded-2xl border border-border p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-[10px] font-semibold">
                      {book.category}
                    </Badge>
                    <h4 className="font-heading text-base font-bold text-foreground leading-snug line-clamp-2">
                      {book.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Penulis: <strong className="text-foreground">{book.author}</strong>
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0">
                    <span className="font-mono text-xs font-extrabold">{book.matchScore}%</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider">Cocok</span>
                  </div>
                </div>

                {/* AI Reasoning Box */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/80 text-xs text-muted-foreground leading-relaxed space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1 text-[11px]">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    Mengapa Buku Ini Cocok Untukmu:
                  </span>
                  <p>{book.matchReason}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    {book.shelfLocation}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600">
                    {book.availableCopies} Eksemplar Tersedia
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {book.isEbook && (
                    <Link href="/dashboard/ebook">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[11px] h-7 px-2.5 font-bold gap-1 rounded-lg"
                      >
                        <BookMarked className="h-3 w-3" />
                        E-Book
                      </Button>
                    </Link>
                  )}
                  <Link href="/katalog">
                    <Button
                      size="sm"
                      className="text-[11px] h-7 px-2.5 font-bold gap-1 rounded-lg bg-primary text-primary-foreground"
                    >
                      <BookmarkCheck className="h-3 w-3" />
                      Pinjam
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

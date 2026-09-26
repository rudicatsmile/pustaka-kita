"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Printer,
  Barcode,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Edit2,
  Trash2,
  BookOpen,
  Info,
  Maximize2,
  Compass,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import {
  getMasterShelvesAction,
  createMasterShelfAction,
  updateMasterShelfAction,
  deleteMasterShelfAction,
  getShelfCapacityStatsAction,
  getShelfBooksListAction,
  type MasterShelf,
  type ShelfStatus,
} from "@/actions/shelves";

export default function PustakawanMasterRakPage() {
  const [shelves, setShelves] = useState<MasterShelf[]>([]);
  const [stats, setStats] = useState({
    totalShelves: 0,
    totalCapacity: 0,
    totalStored: 0,
    avgOccupancyPct: 0,
    nearFullCount: 0,
  });
  const [activeTab, setActiveTab] = useState("table");
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState(0); // 0 = all
  const [statusFilter, setStatusFilter] = useState("all");

  // Floor Map Active Level (1 or 2)
  const [activeFloorLevel, setActiveFloorLevel] = useState<number>(1);
  const [selectedShelfForMap, setSelectedShelfForMap] = useState<MasterShelf | null>(null);

  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    code: "",
    name: "",
    zone: "Lantai 1 - Sayap Barat",
    floorLevel: 1,
    ddcCategory: "800 - Kesusastraan & Novel",
    capacity: 100,
    status: "aktif" as ShelfStatus,
    description: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Shelf Books Inspection Modal State
  const [inspectingShelf, setInspectingShelf] = useState<MasterShelf | null>(null);
  const [inspectingBooks, setInspectingBooks] = useState<
    { copyCode: string; title: string; author: string; status: string }[]
  >([]);
  const [loadingBooks, setLoadingBooks] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [list, st] = await Promise.all([
        getMasterShelvesAction({
          zoneFilter,
          statusFilter,
          floorFilter,
        }),
        getShelfCapacityStatsAction(),
      ]);
      setShelves(list);
      setStats(st);
      if (list.length > 0 && !selectedShelfForMap) {
        setSelectedShelfForMap(list[0]);
      }
    } catch (e: any) {
      toast.error("Gagal memuat master rak:", { description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [zoneFilter, floorFilter, statusFilter]);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      code: `RAK-${String.fromCharCode(65 + Math.floor(Math.random() * 5))}0${Math.floor(
        1 + Math.random() * 9
      )}`,
      name: "",
      zone: "Lantai 1 - Sayap Barat",
      floorLevel: 1,
      ddcCategory: "800 - Kesusastraan & Novel",
      capacity: 100,
      status: "aktif",
      description: "",
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (shelf: MasterShelf) => {
    setIsEditing(true);
    setFormData({
      id: shelf.id,
      code: shelf.code,
      name: shelf.name,
      zone: shelf.zone,
      floorLevel: shelf.floorLevel,
      ddcCategory: shelf.ddcCategory,
      capacity: shelf.capacity,
      status: shelf.status,
      description: shelf.description,
    });
    setShowModal(true);
  };

  const handleSaveShelf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error("Kode Rak dan Nama Rak wajib diisi!");
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing) {
        const res = await updateMasterShelfAction(formData);
        if (res.success) {
          toast.success(`Data Rak ${res.shelf?.code} Berhasil Diperbarui! ✅`);
          setShowModal(false);
          loadData();
        } else {
          toast.error("Gagal memperbarui rak:", { description: res.error });
        }
      } else {
        const res = await createMasterShelfAction(formData);
        if (res.success) {
          toast.success(`Rak Baru [${res.shelf?.code}] Berhasil Didaftarkan! 🎉`);
          setShowModal(false);
          loadData();
        } else {
          toast.error("Gagal mendaftarkan rak:", { description: res.error });
        }
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan:", { description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteShelf = async (id: string, code: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus rak "${code}"?`)) return;

    try {
      const res = await deleteMasterShelfAction(id);
      if (res.success) {
        toast.success(`Rak ${code} Berhasil Dihapus!`);
        loadData();
      } else {
        toast.error("Gagal menghapus rak:", { description: res.error });
      }
    } catch (e: any) {
      toast.error("Terjadi error:", { description: e.message });
    }
  };

  const handleInspectBooks = async (shelf: MasterShelf) => {
    setInspectingShelf(shelf);
    setLoadingBooks(true);
    try {
      const books = await getShelfBooksListAction(shelf.code);
      setInspectingBooks(books);
    } catch (e: any) {
      toast.error("Gagal memuat buku:", { description: e.message });
    } finally {
      setLoadingBooks(false);
    }
  };

  const filteredShelves = shelves.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.zone.toLowerCase().includes(q) ||
      s.ddcCategory.toLowerCase().includes(q)
    );
  });

  const floorShelves = shelves.filter((s) => s.floorLevel === activeFloorLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Master Data Rak &amp; Denah Lokasi Perpustakaan
            </h1>
            <Badge variant="default" className="text-xs font-bold gap-1 bg-primary text-primary-foreground">
              <MapPin className="h-3.5 w-3.5" />
              Inventaris Ruang
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pengelolaan terpadu lemari rak buku, klasifikasi DDC, pemetaan denah 2D interaktif, serta pencetakan label barcode fisik rak.
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

          <Button
            onClick={handleOpenCreateModal}
            size="sm"
            className="h-8 gap-1.5 text-xs font-bold rounded-xl shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah Rak Baru
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Card className="rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Total Lemari Rak</span>
          <p className="font-heading text-2xl font-extrabold text-foreground">{stats.totalShelves} Unit</p>
          <p className="text-[10px] text-muted-foreground">Lantai 1 &amp; Lantai 2</p>
        </Card>

        <Card className="rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Total Daya Tampung</span>
          <p className="font-heading text-2xl font-extrabold text-primary font-mono">{stats.totalCapacity} Buku</p>
          <p className="text-[10px] text-muted-foreground">Kapasitas maksimal</p>
        </Card>

        <Card className="rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Koleksi Tersimpan</span>
          <p className="font-heading text-2xl font-extrabold text-foreground font-mono">{stats.totalStored} Buku</p>
          <p className="text-[10px] text-emerald-600 font-semibold">Tercatat di sistem</p>
        </Card>

        <Card className="rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground">Rata-Rata Keterisian</span>
          <p className="font-heading text-2xl font-extrabold text-emerald-600 font-mono">{stats.avgOccupancyPct}%</p>
          <p className="text-[10px] text-muted-foreground">Kepadatan optimal</p>
        </Card>

        <Card className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Hampir Penuh (&gt;90%)
          </span>
          <p className="font-heading text-2xl font-extrabold text-amber-600 font-mono">{stats.nearFullCount} Rak</p>
          <p className="text-[10px] text-amber-700/80 dark:text-amber-300 font-bold">Perlu ekspansi rak</p>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <TabsList className="grid grid-cols-3 w-full sm:w-96 bg-muted/60 p-1">
            <TabsTrigger value="table" className="gap-1.5 text-xs font-semibold">
              <Layers className="h-3.5 w-3.5" />
              Daftar Rak
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-1.5 text-xs font-semibold">
              <Compass className="h-3.5 w-3.5 text-cyan-600" />
              Denah Ruangan 2D
            </TabsTrigger>
            <TabsTrigger value="labels" className="gap-1.5 text-xs font-semibold">
              <Printer className="h-3.5 w-3.5 text-amber-500" />
              Cetak Barcode
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: DAFTAR MASTER RAK */}
        {/* ========================================================================= */}
        <TabsContent value="table" className="space-y-4">
          <Card className="rounded-2xl border border-border p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kode rak, nama, atau zona..."
                  className="pl-8 text-xs h-9 rounded-xl"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={floorFilter}
                  onChange={(e) => setFloorFilter(Number(e.target.value))}
                  className="bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs h-9 focus:ring-2 focus:ring-primary"
                >
                  <option value={0}>Semua Lantai</option>
                  <option value={1}>Lantai 1</option>
                  <option value={2}>Lantai 2</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs h-9 focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="penuh">Penuh</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Kode Rak</th>
                    <th className="px-4 py-3">Nama Lemari &amp; Klasifikasi DDC</th>
                    <th className="px-4 py-3">Zona / Lokasi</th>
                    <th className="px-4 py-3 min-w-[140px]">Keterisian / Kapasitas</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredShelves.map((shelf) => {
                    const occupancyPct = Math.round(
                      (shelf.currentOccupancy / shelf.capacity) * 100
                    );
                    let colorClass = "bg-emerald-500";
                    if (occupancyPct >= 90) colorClass = "bg-rose-500";
                    else if (occupancyPct >= 70) colorClass = "bg-amber-500";

                    return (
                      <tr key={shelf.id} className="hover:bg-muted/30 transition-colors">
                        {/* Kode Rak */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant="outline" className="font-mono text-xs font-bold text-primary border-primary/30">
                            {shelf.code}
                          </Badge>
                        </td>

                        {/* Nama & DDC */}
                        <td className="px-4 py-3 max-w-xs">
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-foreground line-clamp-1">{shelf.name}</h4>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              DDC: {shelf.ddcCategory}
                            </p>
                          </div>
                        </td>

                        {/* Zona */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-semibold text-foreground block">{shelf.zone}</span>
                          <span className="text-[10px] text-muted-foreground">Lantai {shelf.floorLevel}</span>
                        </td>

                        {/* Kapasitas Progress */}
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-mono text-muted-foreground">
                                {shelf.currentOccupancy}/{shelf.capacity} buku
                              </span>
                              <span className="font-mono font-bold text-foreground">{occupancyPct}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                                style={{ width: `${occupancyPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {shelf.status === "aktif" && (
                            <Badge variant="success" className="text-[10px]">
                              Aktif
                            </Badge>
                          )}
                          {shelf.status === "penuh" && (
                            <Badge variant="destructive" className="text-[10px]">
                              Penuh
                            </Badge>
                          )}
                          {shelf.status === "maintenance" && (
                            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-400 bg-amber-50">
                              Preservasi
                            </Badge>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleInspectBooks(shelf)}
                            className="text-[11px] h-7 px-2"
                            title="Lihat daftar buku di rak ini"
                          >
                            <BookOpen className="h-3 w-3 mr-1" />
                            Isi Buku
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditModal(shelf)}
                            className="text-[11px] h-7 px-2"
                            title="Edit data rak"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteShelf(shelf.id, shelf.code)}
                            className="text-[11px] h-7 px-2 text-destructive hover:bg-destructive/10"
                            title="Hapus rak"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredShelves.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground italic">
                        Tidak ada lemari rak yang cocok dengan filter atau kata kunci.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: DENAH RUANGAN 2D INTERAKTIF */}
        {/* ========================================================================= */}
        <TabsContent value="map" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-sm font-bold text-foreground">
                Peta Denah 2D Perpustakaan PustakaKita Ceria
              </h3>
              <p className="text-xs text-muted-foreground">
                Klik pada blok lemari rak untuk menginspeksi rincian keterisian dan isi buku secara langsung.
              </p>
            </div>

            {/* Floor Switcher */}
            <div className="flex items-center gap-1.5 rounded-xl bg-muted p-1">
              <button
                type="button"
                onClick={() => setActiveFloorLevel(1)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeFloorLevel === 1
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Lantai 1 (Lobi &amp; Sirkulasi)
              </button>
              <button
                type="button"
                onClick={() => setActiveFloorLevel(2)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeFloorLevel === 2
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Lantai 2 (Ruang Referensi &amp; Riset)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* SVG Floor Map (8 cols) */}
            <Card className="lg:col-span-8 rounded-3xl border border-border p-4 shadow-sm relative overflow-hidden bg-muted/20">
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox="0 0 580 320"
                  className="w-full min-w-[500px] h-auto rounded-2xl select-none"
                >
                  {/* Floor Outline Boundary */}
                  <rect
                    x="10"
                    y="10"
                    width="560"
                    height="300"
                    rx="16"
                    fill="currentColor"
                    className="text-card stroke-border"
                    strokeWidth="2"
                  />

                  {/* Main Entrance Door */}
                  <rect
                    x="250"
                    y="295"
                    width="80"
                    height="15"
                    rx="4"
                    fill="#3b82f6"
                    opacity="0.8"
                  />
                  <text
                    x="290"
                    y="306"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    PINTU UTAMA
                  </text>

                  {/* Fixed Landmarks on Floor 1 */}
                  {activeFloorLevel === 1 && (
                    <>
                      {/* Sirkulasi Desk */}
                      <rect
                        x="230"
                        y="230"
                        width="120"
                        height="40"
                        rx="8"
                        fill="#0284c7"
                        opacity="0.15"
                        stroke="#0284c7"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />
                      <text
                        x="290"
                        y="254"
                        textAnchor="middle"
                        fill="#0284c7"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        MEJA SIRKULASI &amp; PIKET
                      </text>

                      {/* Lesehan Area */}
                      <rect
                        x="30"
                        y="220"
                        width="140"
                        height="60"
                        rx="8"
                        fill="#f59e0b"
                        opacity="0.1"
                        stroke="#f59e0b"
                        strokeWidth="1"
                      />
                      <text
                        x="100"
                        y="255"
                        textAnchor="middle"
                        fill="#d97706"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        AREA BACA LESEHAN
                      </text>

                      {/* OPAC Kiosk Station */}
                      <rect
                        x="410"
                        y="220"
                        width="140"
                        height="60"
                        rx="8"
                        fill="#8b5cf6"
                        opacity="0.1"
                        stroke="#8b5cf6"
                        strokeWidth="1"
                      />
                      <text
                        x="480"
                        y="255"
                        textAnchor="middle"
                        fill="#7c3aed"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        TERMINAL KIOSK OPAC
                      </text>
                    </>
                  )}

                  {/* Fixed Landmarks on Floor 2 */}
                  {activeFloorLevel === 2 && (
                    <>
                      <rect
                        x="180"
                        y="200"
                        width="220"
                        height="70"
                        rx="8"
                        fill="#10b981"
                        opacity="0.1"
                        stroke="#10b981"
                        strokeWidth="1.5"
                      />
                      <text
                        x="290"
                        y="240"
                        textAnchor="middle"
                        fill="#059669"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        MEJA RISET KELOMPOK &amp; KTI
                      </text>
                    </>
                  )}

                  {/* Dynamic Shelves on this floor */}
                  {floorShelves.map((s) => {
                    const isSelected = selectedShelfForMap?.id === s.id;
                    const occupancyPct = Math.round((s.currentOccupancy / s.capacity) * 100);

                    let fillColor = "#10b981"; // Green
                    if (s.status === "maintenance") fillColor = "#f59e0b"; // Amber
                    else if (occupancyPct >= 90) fillColor = "#ef4444"; // Red
                    else if (occupancyPct >= 70) fillColor = "#f59e0b"; // Yellow

                    return (
                      <g
                        key={s.id}
                        onClick={() => setSelectedShelfForMap(s)}
                        className="cursor-pointer transition-all hover:opacity-90"
                      >
                        <rect
                          x={s.mapPosition.x}
                          y={s.mapPosition.y}
                          width={s.mapPosition.width}
                          height={s.mapPosition.height}
                          rx="6"
                          fill={fillColor}
                          opacity={isSelected ? "0.95" : "0.75"}
                          stroke={isSelected ? "#000000" : "currentColor"}
                          strokeWidth={isSelected ? "2.5" : "1"}
                          className="dark:stroke-white/30"
                        />
                        <text
                          x={s.mapPosition.x + s.mapPosition.width / 2}
                          y={s.mapPosition.y + s.mapPosition.height / 2 - 3}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          {s.code}
                        </text>
                        <text
                          x={s.mapPosition.x + s.mapPosition.width / 2}
                          y={s.mapPosition.y + s.mapPosition.height / 2 + 9}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="8"
                          fontWeight="medium"
                        >
                          {occupancyPct}% ({s.currentOccupancy} bk)
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Map Legend */}
              <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">Legenda Keterisian:</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    &lt; 70% Luang
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    70 - 89% Sedang
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-rose-500" />
                    &ge; 90% Penuh
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-amber-500/80 border border-amber-600" />
                    Preservasi
                  </span>
                </div>
              </div>
            </Card>

            {/* Inspector Panel for Selected Shelf (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {selectedShelfForMap ? (
                <Card className="rounded-3xl border border-primary/30 p-5 shadow-sm space-y-4 bg-card">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        Inspeksi Lemari Rak
                      </span>
                      <h4 className="font-heading text-lg font-bold text-foreground">
                        {selectedShelfForMap.code}
                      </h4>
                    </div>
                    <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30">
                      Lt. {selectedShelfForMap.floorLevel}
                    </Badge>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-muted-foreground text-[11px] block">Nama Rak:</span>
                      <strong className="text-foreground text-sm">{selectedShelfForMap.name}</strong>
                    </div>

                    <div>
                      <span className="text-muted-foreground text-[11px] block">Zona Lokasi:</span>
                      <span className="text-foreground font-semibold">{selectedShelfForMap.zone}</span>
                    </div>

                    <div>
                      <span className="text-muted-foreground text-[11px] block">Klasifikasi DDC:</span>
                      <span className="text-foreground font-mono">{selectedShelfForMap.ddcCategory}</span>
                    </div>

                    <div>
                      <span className="text-muted-foreground text-[11px] block">Deskripsi:</span>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        {selectedShelfForMap.description}
                      </p>
                    </div>

                    {/* Occupancy Indicator */}
                    <div className="pt-2 border-t border-border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Keterisian Koleksi:</span>
                        <span className="font-mono font-bold text-foreground">
                          {selectedShelfForMap.currentOccupancy} / {selectedShelfForMap.capacity} Buku (
                          {Math.round(
                            (selectedShelfForMap.currentOccupancy / selectedShelfForMap.capacity) * 100
                          )}
                          %)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.round(
                              (selectedShelfForMap.currentOccupancy / selectedShelfForMap.capacity) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleInspectBooks(selectedShelfForMap)}
                      className="w-full text-xs font-bold gap-1.5 rounded-xl shadow-xs"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Lihat Daftar Buku di Rak Ini
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditModal(selectedShelfForMap)}
                      className="w-full text-xs rounded-xl"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      Ubah Data / Kapasitas Rak
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="rounded-3xl border border-dashed border-border p-8 text-center space-y-2 text-muted-foreground">
                  <Compass className="h-8 w-8 mx-auto text-muted-foreground/40" />
                  <p className="text-xs">Klik salah satu blok rak pada denah untuk melihat rincian.</p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: CETAK LABEL BARCODE RAK FISIK */}
        {/* ========================================================================= */}
        <TabsContent value="labels" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-sm font-bold text-foreground">
                Lembar Cetak Label Barcode &amp; QR Rak Perpustakaan
              </h3>
              <p className="text-xs text-muted-foreground">
                Tempelkan label ini di sisi depan fisik lemari rak agar pustakawan dapat memindainya saat Stock Opname.
              </p>
            </div>

            <Button
              onClick={() => window.print()}
              size="sm"
              className="text-xs font-bold gap-1.5 rounded-xl shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              Cetak Semua Label (Print)
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shelves.map((s) => (
              <Card
                key={s.id}
                className="rounded-2xl border-2 border-border p-5 space-y-3 bg-card shadow-xs relative print:border-black print:shadow-none"
              >
                {/* Header branding */}
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    Perpustakaan PustakaKita Ceria
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground">
                    Lt. {s.floorLevel}
                  </span>
                </div>

                {/* Big Code */}
                <div className="text-center py-1">
                  <h4 className="font-mono text-3xl font-extrabold tracking-wider text-foreground">
                    {s.code}
                  </h4>
                  <p className="text-xs font-bold text-foreground mt-0.5 line-clamp-1">{s.name}</p>
                </div>

                {/* Simulated Barcode */}
                <div className="p-2.5 rounded-xl bg-muted/60 border border-border flex flex-col items-center justify-center space-y-1">
                  <div className="flex items-center gap-1 font-mono text-[9px] tracking-widest text-foreground">
                    ||| | |||| | ||| || |||| || ||| | ||
                  </div>
                  <span className="font-mono text-[10px] font-bold text-muted-foreground">
                    *{s.barcode}*
                  </span>
                </div>

                {/* Metadata details */}
                <div className="text-[11px] text-muted-foreground space-y-0.5 border-t border-border/80 pt-2">
                  <p>
                    Klasifikasi: <strong className="text-foreground">{s.ddcCategory}</strong>
                  </p>
                  <p>
                    Zona: <span className="text-foreground">{s.zone}</span>
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Dialog: Tambah / Edit Rak */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <Card className="max-w-md w-full rounded-3xl border border-border p-6 shadow-2xl bg-card space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground">
                    {isEditing ? `Ubah Data Rak [${formData.code}]` : "Tambah Master Rak Baru"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Master lokasi lemari rak buku perpustakaan sekolah.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveShelf} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Kode Rak *</label>
                  <Input
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Contoh: RAK-A01"
                    className="text-xs h-9 rounded-xl font-mono uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Lantai Gedung *</label>
                  <select
                    value={formData.floorLevel}
                    onChange={(e) => setFormData({ ...formData, floorLevel: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs h-9 focus:ring-2 focus:ring-primary"
                  >
                    <option value={1}>Lantai 1 (Lobi Utama)</option>
                    <option value={2}>Lantai 2 (Ruang Referensi)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Nama Lemari Rak *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Rak Sastra Populer & Fiksi"
                  className="text-xs h-9 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Zona / Ruang *</label>
                  <Input
                    required
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    placeholder="Contoh: Sayap Barat"
                    className="text-xs h-9 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Kapasitas Maksimal (Buku) *</label>
                  <Input
                    type="number"
                    min={10}
                    max={500}
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="text-xs h-9 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Klasifikasi DDC *</label>
                <Input
                  required
                  value={formData.ddcCategory}
                  onChange={(e) => setFormData({ ...formData, ddcCategory: e.target.value })}
                  placeholder="Contoh: 800 - Kesusastraan & Sastra"
                  className="text-xs h-9 rounded-xl font-mono"
                />
              </div>

              {isEditing && (
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Status Rak *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ShelfStatus })}
                    className="w-full bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs h-9 focus:ring-2 focus:ring-primary"
                  >
                    <option value="aktif">Aktif (Tersedia untuk buku baru)</option>
                    <option value="penuh">Penuh (Sudah mencapai batas fisik)</option>
                    <option value="maintenance">Maintenance (Sedang penataan / preservasi)</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-foreground">Keterangan / Catatan Lokasi</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi posisi rak atau jenis koleksi khusus..."
                  className="w-full rounded-xl border border-input bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  size="sm"
                  className="font-bold text-xs gap-1.5 bg-primary text-primary-foreground"
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  {isSaving ? "Menyimpan..." : "Simpan Data Rak"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal Dialog: Inspeksi Eksemplar di Rak */}
      {inspectingShelf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <Card className="max-w-lg w-full rounded-3xl border border-border p-6 shadow-2xl bg-card space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground">
                    Daftar Koleksi di [{inspectingShelf.code}]
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {inspectingShelf.name} • {inspectingShelf.zone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingShelf(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs max-h-72 overflow-y-auto pr-1">
              {loadingBooks ? (
                <div className="py-8 text-center space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground text-xs">Memuat eksemplar di rak...</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[9px]">
                    <tr>
                      <th className="px-3 py-2">Barcode</th>
                      <th className="px-3 py-2">Judul Buku</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {inspectingBooks.map((b, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono font-bold text-primary text-[11px]">
                          {b.copyCode}
                        </td>
                        <td className="px-3 py-2">
                          <p className="font-semibold text-foreground line-clamp-1">{b.title}</p>
                          <p className="text-[10px] text-muted-foreground">{b.author}</p>
                        </td>
                        <td className="px-3 py-2">
                          <Badge
                            variant={b.status === "tersedia" ? "success" : "secondary"}
                            className="text-[9px]"
                          >
                            {b.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-2 flex justify-end border-t border-border">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInspectingShelf(null)}
                className="text-xs"
              >
                Tutup
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

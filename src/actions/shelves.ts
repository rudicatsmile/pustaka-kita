"use server";

import { db, schema } from "@/db";
import { eq, desc, and, count, sql } from "drizzle-orm";
import { writeAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export type ShelfStatus = "aktif" | "penuh" | "maintenance";

export interface MasterShelf {
  id: string;
  code: string; // RAK-A01
  name: string; // Rak Sastra Populer & Fiksi
  zone: string; // Lantai 1 - Sayap Barat
  floorLevel: number; // 1 | 2
  ddcCategory: string; // 800 - Kesusastraan & Novel
  capacity: number; // Kapasitas maksimal buku
  currentOccupancy: number; // Jumlah eksemplar aktif
  status: ShelfStatus;
  description: string;
  mapPosition: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  };
  barcode: string; // RAK:RAK-A01
  createdAt: string;
  updatedAt: string;
}

// Persistent In-memory Store with realistic library layout seed data
let SHELVES_STORE: MasterShelf[] = [
  {
    id: "sh-1",
    code: "RAK-A01",
    name: "Rak Sastra Populer & Fiksi Klasik",
    zone: "Lantai 1 - Sayap Barat",
    floorLevel: 1,
    ddcCategory: "800 - Kesusastraan & Novel",
    capacity: 100,
    currentOccupancy: 84,
    status: "aktif",
    description: "Koleksi novel sastra Indonesia klasik, angkatan Balai Pustaka hingga kontemporer.",
    mapPosition: { x: 80, y: 100, width: 90, height: 40, label: "A-01 Sastra" },
    barcode: "RAK:RAK-A01",
    createdAt: "2026-01-10 08:00:00",
    updatedAt: "2026-09-20 10:15:00",
  },
  {
    id: "sh-2",
    code: "RAK-A02",
    name: "Rak Fiksi Remaja & Novel Terjemahan",
    zone: "Lantai 1 - Sayap Barat",
    floorLevel: 1,
    ddcCategory: "800 - Kesusastraan Dunia",
    capacity: 100,
    currentOccupancy: 95,
    status: "penuh",
    description: "Koleksi novel remaja, petualangan fantasi, dan terjemahan sastra dunia terpopuler.",
    mapPosition: { x: 80, y: 160, width: 90, height: 40, label: "A-02 Fiksi Dunia" },
    barcode: "RAK:RAK-A02",
    createdAt: "2026-01-10 08:00:00",
    updatedAt: "2026-09-22 14:30:00",
  },
  {
    id: "sh-3",
    code: "RAK-B01",
    name: "Rak Filsafat, Etika & Pengembangan Diri",
    zone: "Lantai 1 - Sayap Barat",
    floorLevel: 1,
    ddcCategory: "100 - Filsafat & Psikologi",
    capacity: 80,
    currentOccupancy: 52,
    status: "aktif",
    description: "Koleksi buku stoikisme, kepemimpinan siswa, psikologi populer, dan motivasi belajar.",
    mapPosition: { x: 200, y: 100, width: 90, height: 40, label: "B-01 Filsafat" },
    barcode: "RAK:RAK-B01",
    createdAt: "2026-01-10 08:00:00",
    updatedAt: "2026-09-18 11:00:00",
  },
  {
    id: "sh-4",
    code: "RAK-B02",
    name: "Rak Sains Murni, Astronomi & Fisika",
    zone: "Lantai 1 - Sayap Timur",
    floorLevel: 1,
    ddcCategory: "500 - Sains Murni & Matematika",
    capacity: 90,
    currentOccupancy: 64,
    status: "aktif",
    description: "Buku ensiklopedia antariksa, olimpiade fisika, kimia, dan keanekaragaman hayati.",
    mapPosition: { x: 200, y: 160, width: 90, height: 40, label: "B-02 Sains" },
    barcode: "RAK:RAK-B02",
    createdAt: "2026-01-10 08:00:00",
    updatedAt: "2026-09-25 09:20:00",
  },
  {
    id: "sh-5",
    code: "RAK-C01",
    name: "Rak Teknologi, Koding & Robotika",
    zone: "Lantai 1 - Sayap Timur",
    floorLevel: 1,
    ddcCategory: "600 - Teknologi & Ilmu Terapan",
    capacity: 80,
    currentOccupancy: 48,
    status: "aktif",
    description: "Buku pemrograman web, algoritma Python, dasar kecerdasan buatan, dan elektronika.",
    mapPosition: { x: 320, y: 100, width: 90, height: 40, label: "C-01 Teknologi" },
    barcode: "RAK:RAK-C01",
    createdAt: "2026-01-10 08:00:00",
    updatedAt: "2026-09-24 16:40:00",
  },
  {
    id: "sh-6",
    code: "RAK-C02",
    name: "Rak Sejarah Nasional & Peradaban Dunia",
    zone: "Lantai 1 - Sayap Timur",
    floorLevel: 1,
    ddcCategory: "900 - Sejarah & Geografi",
    capacity: 90,
    currentOccupancy: 58,
    status: "aktif",
    description: "Biografi pahlawan nusantara, atlas tematik, sejarah perang dunia, dan peradaban kuno.",
    mapPosition: { x: 320, y: 160, width: 90, height: 40, label: "C-02 Sejarah" },
    barcode: "RAK:RAK-C02",
    createdAt: "2026-01-10 08:00:00",
    updatedAt: "2026-09-21 13:10:00",
  },
  {
    id: "sh-7",
    code: "RAK-D01",
    name: "Rak Koleksi Baru & Terpopuler",
    zone: "Lantai 1 - Area Depan Sirkulasi",
    floorLevel: 1,
    ddcCategory: "000 - Karya Umum & Koleksi Baru",
    capacity: 60,
    currentOccupancy: 45,
    status: "aktif",
    description: "Pajangan buku baru hasil pengadaan dana BOS dan karya terfavorit pilihan siswa.",
    mapPosition: { x: 440, y: 100, width: 90, height: 40, label: "D-01 Koleksi Baru" },
    barcode: "RAK:RAK-D01",
    createdAt: "2026-01-10 08:00:00",
    updatedAt: "2026-09-26 15:00:00",
  },
  {
    id: "sh-8",
    code: "RAK-REF01",
    name: "Rak Ensiklopedia & Kamus Rujukan",
    zone: "Lantai 2 - Ruang Referensi Khusus",
    floorLevel: 2,
    ddcCategory: "000 - Karya Umum / Referensi",
    capacity: 70,
    currentOccupancy: 55,
    status: "aktif",
    description: "Koleksi khusus baca di tempat: Ensiklopedia Britannica, KBBI edisi V, dan atlas besar.",
    mapPosition: { x: 120, y: 120, width: 100, height: 45, label: "REF-01 Ensiklopedia" },
    barcode: "RAK:RAK-REF01",
    createdAt: "2026-01-10 08:00:00",
    updatedAt: "2026-09-15 10:00:00",
  },
  {
    id: "sh-9",
    code: "RAK-REF02",
    name: "Rak Karya Tulis Ilmiah & Jurnal Sekolah",
    zone: "Lantai 2 - Ruang Referensi Khusus",
    floorLevel: 2,
    ddcCategory: "300 - Ilmu Sosial & Karya Riset",
    capacity: 70,
    currentOccupancy: 38,
    status: "aktif",
    description: "Arsip laporan penelitian tindakan kelas (PTK) guru dan karya ilmiah remaja (KIR) siswa.",
    mapPosition: { x: 260, y: 120, width: 100, height: 45, label: "REF-02 Riset & KTI" },
    barcode: "RAK:RAK-REF02",
    createdAt: "2026-01-10 08:00:00",
    updatedAt: "2026-09-19 14:15:00",
  },
  {
    id: "sh-10",
    code: "RAK-MNT01",
    name: "Rak Preservasi & Perbaikan Buku",
    zone: "Lantai 1 - Ruang Tata Usaha Perpustakaan",
    floorLevel: 1,
    ddcCategory: "Perawatan & Restorasi Fisik",
    capacity: 50,
    currentOccupancy: 12,
    status: "maintenance",
    description: "Khusus buku yang sedang dalam proses pengeringan silica gel, pengeleman, atau perbaikan sampul.",
    mapPosition: { x: 440, y: 160, width: 90, height: 40, label: "MNT-01 Preservasi" },
    barcode: "RAK:RAK-MNT01",
    createdAt: "2026-02-01 08:00:00",
    updatedAt: "2026-09-26 12:00:00",
  },
];

/**
 * Mengambil daftar seluruh master data rak.
 */
export async function getMasterShelvesAction(params?: {
  zoneFilter?: string;
  statusFilter?: string;
  floorFilter?: number;
}): Promise<MasterShelf[]> {
  const { zoneFilter, statusFilter, floorFilter } = params || {};

  let list = [...SHELVES_STORE];

  if (zoneFilter && zoneFilter !== "all") {
    list = list.filter((s) => s.zone === zoneFilter);
  }

  if (statusFilter && statusFilter !== "all") {
    list = list.filter((s) => s.status === statusFilter);
  }

  if (floorFilter && floorFilter !== 0) {
    list = list.filter((s) => s.floorLevel === floorFilter);
  }

  return list;
}

/**
 * Mengambil detail rak berdasarkan kode rak unik.
 */
export async function getShelfByCodeAction(code: string): Promise<MasterShelf | null> {
  const shelf = SHELVES_STORE.find(
    (s) => s.code.toLowerCase() === code.trim().toLowerCase()
  );
  return shelf || null;
}

/**
 * Menambahkan data master rak baru.
 */
export async function createMasterShelfAction(data: {
  code: string;
  name: string;
  zone: string;
  floorLevel: number;
  ddcCategory: string;
  capacity: number;
  description?: string;
}): Promise<{ success: boolean; shelf?: MasterShelf; error?: string }> {
  const codeNormalized = data.code.trim().toUpperCase();

  // Validasi kode unik
  const existing = SHELVES_STORE.find((s) => s.code === codeNormalized);
  if (existing) {
    return { success: false, error: `Kode rak "${codeNormalized}" sudah digunakan.` };
  }

  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  const newShelf: MasterShelf = {
    id: `sh-${Date.now()}`,
    code: codeNormalized,
    name: data.name.trim(),
    zone: data.zone.trim(),
    floorLevel: data.floorLevel || 1,
    ddcCategory: data.ddcCategory.trim(),
    capacity: data.capacity || 100,
    currentOccupancy: 0,
    status: "aktif",
    description: data.description?.trim() || "Lemari rak buku resmi perpustakaan sekolah.",
    mapPosition: {
      x: 100 + (SHELVES_STORE.length % 4) * 110,
      y: 220,
      width: 90,
      height: 40,
      label: codeNormalized,
    },
    barcode: `RAK:${codeNormalized}`,
    createdAt: now,
    updatedAt: now,
  };

  SHELVES_STORE.push(newShelf);

  await writeAuditLog({
    actorName: "Pustakawan",
    action: "create",
    entityType: "book",
    description: `Menambahkan master rak baru [${codeNormalized}] - ${data.name}`,
    newValue: {
      id: newShelf.id,
      code: newShelf.code,
      name: newShelf.name,
      capacity: newShelf.capacity,
      zone: newShelf.zone,
    },
  });

  revalidatePath("/pustakawan/rak");
  revalidatePath("/pustakawan/buku/baru");
  return { success: true, shelf: newShelf };
}

/**
 * Memperbarui data master rak.
 */
export async function updateMasterShelfAction(data: {
  id: string;
  code: string;
  name: string;
  zone: string;
  floorLevel: number;
  ddcCategory: string;
  capacity: number;
  status: ShelfStatus;
  description?: string;
}): Promise<{ success: boolean; shelf?: MasterShelf; error?: string }> {
  const index = SHELVES_STORE.findIndex((s) => s.id === data.id);
  if (index === -1) {
    return { success: false, error: "Data rak tidak ditemukan." };
  }

  const codeNormalized = data.code.trim().toUpperCase();
  const existingCode = SHELVES_STORE.find(
    (s) => s.code === codeNormalized && s.id !== data.id
  );
  if (existingCode) {
    return { success: false, error: `Kode rak "${codeNormalized}" sudah digunakan oleh rak lain.` };
  }

  const current = SHELVES_STORE[index];
  const now = new Date().toISOString().replace("T", " ").substring(0, 19);

  SHELVES_STORE[index] = {
    ...current,
    code: codeNormalized,
    name: data.name.trim(),
    zone: data.zone.trim(),
    floorLevel: data.floorLevel,
    ddcCategory: data.ddcCategory.trim(),
    capacity: data.capacity,
    status: data.status,
    description: data.description?.trim() || current.description,
    barcode: `RAK:${codeNormalized}`,
    updatedAt: now,
  };

  await writeAuditLog({
    actorName: "Pustakawan",
    action: "update",
    entityType: "book",
    description: `Memperbarui master rak [${codeNormalized}] - ${data.name}`,
    newValue: {
      id: data.id,
      code: codeNormalized,
      name: data.name,
      capacity: data.capacity,
      status: data.status,
    },
  });

  revalidatePath("/pustakawan/rak");
  revalidatePath("/pustakawan/buku/baru");
  return { success: true, shelf: SHELVES_STORE[index] };
}

/**
 * Menghapus data master rak (hanya jika kosong).
 */
export async function deleteMasterShelfAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const shelf = SHELVES_STORE.find((s) => s.id === id);
  if (!shelf) {
    return { success: false, error: "Rak tidak ditemukan." };
  }

  if (shelf.currentOccupancy > 0) {
    return {
      success: false,
      error: `Tidak dapat menghapus rak "${shelf.code}". Masih ada ${shelf.currentOccupancy} eksemplar buku tersimpan di rak ini. Pindahkan buku terlebih dahulu.`,
    };
  }

  SHELVES_STORE = SHELVES_STORE.filter((s) => s.id !== id);

  await writeAuditLog({
    actorName: "Pustakawan",
    action: "delete",
    entityType: "book",
    description: `Menghapus master rak [${shelf.code}] - ${shelf.name}`,
    newValue: { id, code: shelf.code },
  });

  revalidatePath("/pustakawan/rak");
  return { success: true };
}

/**
 * Statistik kapasitas dan keterisian seluruh rak perpustakaan.
 */
export async function getShelfCapacityStatsAction() {
  const totalShelves = SHELVES_STORE.length;
  const totalCapacity = SHELVES_STORE.reduce((acc, s) => acc + s.capacity, 0);
  const totalStored = SHELVES_STORE.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const avgOccupancyPct =
    totalCapacity > 0 ? Math.round((totalStored / totalCapacity) * 100) : 0;
  const nearFullCount = SHELVES_STORE.filter(
    (s) => (s.currentOccupancy / s.capacity) >= 0.9
  ).length;

  return {
    totalShelves,
    totalCapacity,
    totalStored,
    avgOccupancyPct,
    nearFullCount,
  };
}

/**
 * Mengambil daftar eksemplar buku yang tersimpan di dalam rak tertentu.
 */
export async function getShelfBooksListAction(shelfCode: string): Promise<
  { copyCode: string; title: string; author: string; status: string }[]
> {
  // Simulasi daftar eksemplar di rak
  return [
    {
      copyCode: `${shelfCode}-001`,
      title: "Laskar Pelangi",
      author: "Andrea Hirata",
      status: "tersedia",
    },
    {
      copyCode: `${shelfCode}-002`,
      title: "Filosofi Teras: Panduan Stoikisme",
      author: "Henry Manampiring",
      status: "tersedia",
    },
    {
      copyCode: `${shelfCode}-003`,
      title: "Sapiens: Riwayat Singkat Umat Manusia",
      author: "Yuval Noah Harari",
      status: "dipinjam",
    },
    {
      copyCode: `${shelfCode}-004`,
      title: "Bumi: Serial Petualangan Fantasi",
      author: "Tere Liye",
      status: "tersedia",
    },
    {
      copyCode: `${shelfCode}-005`,
      title: "Kosmos: Menjelajahi Batas Semesta",
      author: "Carl Sagan",
      status: "tersedia",
    },
  ];
}

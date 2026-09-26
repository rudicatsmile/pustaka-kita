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
    currentOccupancy: 10,
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
    currentOccupancy: 9,
    status: "aktif",
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
    currentOccupancy: 7,
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
    currentOccupancy: 6,
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
    currentOccupancy: 6,
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
    currentOccupancy: 6,
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
    currentOccupancy: 5,
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
    currentOccupancy: 4,
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
    currentOccupancy: 3,
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
    currentOccupancy: 2,
    status: "maintenance",
    description: "Khusus buku yang sedang dalam proses pengeringan silica gel, pengeleman, atau perbaikan sampul.",
    mapPosition: { x: 440, y: 160, width: 90, height: 40, label: "MNT-01 Preservasi" },
    barcode: "RAK:RAK-MNT01",
    createdAt: "2026-02-01 08:00:00",
    updatedAt: "2026-09-26 12:00:00",
  },
];

// Registri eksemplar buku riil per rak terstruktur berdasarkan DDC & kategori rak
export const SHELF_BOOKS_REGISTRY: Record<
  string,
  { copyCode: string; title: string; author: string; status: "tersedia" | "dipinjam" | "perawatan" }[]
> = {
  "RAK-A01": [
    { copyCode: "RAK-A01-001", title: "Laskar Pelangi", author: "Andrea Hirata", status: "tersedia" },
    { copyCode: "RAK-A01-002", title: "Bumi Manusia (Tetralogi Buru #1)", author: "Pramoedya Ananta Toer", status: "dipinjam" },
    { copyCode: "RAK-A01-003", title: "Anak Semua Bangsa (Tetralogi Buru #2)", author: "Pramoedya Ananta Toer", status: "tersedia" },
    { copyCode: "RAK-A01-004", title: "Tenggelamnya Kapal Van Der Wijck", author: "Buya Hamka", status: "tersedia" },
    { copyCode: "RAK-A01-005", title: "Ronggeng Dukuh Paruk", author: "Ahmad Tohari", status: "tersedia" },
    { copyCode: "RAK-A01-006", title: "Siti Nurbaya: Kasih Tak Sampai", author: "Marah Rusli", status: "dipinjam" },
    { copyCode: "RAK-A01-007", title: "Cantik Itu Luka", author: "Eka Kurniawan", status: "tersedia" },
    { copyCode: "RAK-A01-008", title: "Robohnya Surau Kami", author: "A.A. Navis", status: "tersedia" },
    { copyCode: "RAK-A01-009", title: "Layar Terkembang", author: "Sutan Takdir Alisjahbana", status: "tersedia" },
    { copyCode: "RAK-A01-010", title: "Atheis", author: "Achdiat K. Mihardja", status: "tersedia" },
  ],
  "RAK-A02": [
    { copyCode: "RAK-A02-001", title: "Bumi (Serial Dunia Paralel #1)", author: "Tere Liye", status: "tersedia" },
    { copyCode: "RAK-A02-002", title: "Bulan (Serial Dunia Paralel #2)", author: "Tere Liye", status: "dipinjam" },
    { copyCode: "RAK-A02-003", title: "Matahari (Serial Dunia Paralel #3)", author: "Tere Liye", status: "tersedia" },
    { copyCode: "RAK-A02-004", title: "Harry Potter dan Batu Bertuah", author: "J.K. Rowling", status: "dipinjam" },
    { copyCode: "RAK-A02-005", title: "The Alchemist: Sang Alkemis", author: "Paulo Coelho", status: "tersedia" },
    { copyCode: "RAK-A02-006", title: "Negeri 5 Menara", author: "Ahmad Fuadi", status: "tersedia" },
    { copyCode: "RAK-A02-007", title: "Dilan: Dia adalah Dilanku Tahun 1990", author: "Pidi Baiq", status: "tersedia" },
    { copyCode: "RAK-A02-008", title: "Perahu Kertas", author: "Dee Lestari", status: "tersedia" },
    { copyCode: "RAK-A02-009", title: "Pulang", author: "Leila S. Chudori", status: "tersedia" },
  ],
  "RAK-B01": [
    { copyCode: "RAK-B01-001", title: "Filosofi Teras: Panduan Stoikisme", author: "Henry Manampiring", status: "tersedia" },
    { copyCode: "RAK-B01-002", title: "Atomic Habits: Perubahan Kecil Berdampak Besar", author: "James Clear", status: "dipinjam" },
    { copyCode: "RAK-B01-003", title: "Berani Tidak Disukai", author: "Ichiro Kishimi & Fumitake Koga", status: "tersedia" },
    { copyCode: "RAK-B01-004", title: "The Psychology of Money", author: "Morgan Housel", status: "tersedia" },
    { copyCode: "RAK-B01-005", title: "Man's Search for Meaning", author: "Viktor E. Frankl", status: "tersedia" },
    { copyCode: "RAK-B01-006", title: "Sebuah Seni untuk Bersikap Bodo Amat", author: "Mark Manson", status: "tersedia" },
    { copyCode: "RAK-B01-007", title: "Grit: Kekuatan Passion dan Kegigihan", author: "Angela Duckworth", status: "dipinjam" },
  ],
  "RAK-B02": [
    { copyCode: "RAK-B02-001", title: "Kosmos: Menjelajahi Batas Semesta", author: "Carl Sagan", status: "tersedia" },
    { copyCode: "RAK-B02-002", title: "Sapiens: Riwayat Singkat Umat Manusia", author: "Yuval Noah Harari", status: "dipinjam" },
    { copyCode: "RAK-B02-003", title: "Sejarah Singkat Waktu (A Brief History of Time)", author: "Stephen Hawking", status: "tersedia" },
    { copyCode: "RAK-B02-004", title: "Fisika Kuantum untuk Pemula", author: "Brian Cox", status: "tersedia" },
    { copyCode: "RAK-B02-005", title: "The Origin of Species (Asal Usul Spesies)", author: "Charles Darwin", status: "tersedia" },
    { copyCode: "RAK-B02-006", title: "Astrophysics for People in a Hurry", author: "Neil deGrasse Tyson", status: "tersedia" },
  ],
  "RAK-C01": [
    { copyCode: "RAK-C01-001", title: "Clean Code: A Handbook of Agile Craftsmanship", author: "Robert C. Martin", status: "tersedia" },
    { copyCode: "RAK-C01-002", title: "Kecerdasan Buatan & Modern AI", author: "Stuart Russell & Peter Norvig", status: "tersedia" },
    { copyCode: "RAK-C01-003", title: "Pemrograman Python untuk Sains Data", author: "Wes McKinney", status: "dipinjam" },
    { copyCode: "RAK-C01-004", title: "Dasar Pemrograman Web Modern (React & TypeScript)", author: "Robin Wieruch", status: "tersedia" },
    { copyCode: "RAK-C01-005", title: "Arsitektur Komputer & Jaringan TCP/IP", author: "Andrew S. Tanenbaum", status: "tersedia" },
    { copyCode: "RAK-C01-006", title: "Pengenalan Algoritma & Struktur Data", author: "Thomas H. Cormen", status: "tersedia" },
  ],
  "RAK-C02": [
    { copyCode: "RAK-C02-001", title: "Nusantara: Sejarah Indonesia Klasik", author: "Bernard H.M. Vlekke", status: "tersedia" },
    { copyCode: "RAK-C02-002", title: "Guns, Germs, and Steel: Bedil, Kuman & Baja", author: "Jared Diamond", status: "tersedia" },
    { copyCode: "RAK-C02-003", title: "Sejarah Dunia yang Disembunyikan", author: "Jonathan Black", status: "dipinjam" },
    { copyCode: "RAK-C02-004", title: "Sukarno: Penyambung Lidah Rakyat Indonesia", author: "Cindy Adams", status: "tersedia" },
    { copyCode: "RAK-C02-005", title: "Mohammad Hatta: Untuk Negeriku (Memoar)", author: "Mohammad Hatta", status: "tersedia" },
    { copyCode: "RAK-C02-006", title: "Atlas Sejarah Indonesia & Jalur Sutra Maritim", author: "Tim Sejarawan Kemdikbud", status: "tersedia" },
  ],
  "RAK-D01": [
    { copyCode: "RAK-D01-001", title: "Laut Bercerita", author: "Leila S. Chudori", status: "dipinjam" },
    { copyCode: "RAK-D01-002", title: "Gadis Kretek", author: "Ratih Kumala", status: "tersedia" },
    { copyCode: "RAK-D01-003", title: "Superintelligence: Paths, Dangers, Strategies", author: "Nick Bostrom", status: "tersedia" },
    { copyCode: "RAK-D01-004", title: "Bicara Itu Ada Seninya", author: "Oh Su Hyang", status: "tersedia" },
    { copyCode: "RAK-D01-005", title: "Dunia Sophie: Sebuah Novel Filsafat", author: "Jostein Gaarder", status: "tersedia" },
  ],
  "RAK-REF01": [
    { copyCode: "RAK-REF01-001", title: "Kamus Besar Bahasa Indonesia (KBBI) Edisi V Cetak", author: "Badan Pengembangan & Pembinaan Bahasa", status: "tersedia" },
    { copyCode: "RAK-REF01-002", title: "Oxford Advanced Learner's Dictionary 10th Ed.", author: "Oxford University Press", status: "tersedia" },
    { copyCode: "RAK-REF01-003", title: "Ensiklopedia Sains & Teknologi Lengkap Jilid 1", author: "Tim Editor Dorling Kindersley", status: "tersedia" },
    { copyCode: "RAK-REF01-004", title: "Atlas Dunia Tematik & Geografis Lengkap", author: "Bakosurtanal / BIG", status: "tersedia" },
  ],
  "RAK-REF02": [
    { copyCode: "RAK-REF02-001", title: "Panduan Metodologi Riset Ilmiah Siswa SMA/SMK", author: "Tim Akademik Kurikulum Merdeka", status: "tersedia" },
    { copyCode: "RAK-REF02-002", title: "Kumpulan Karya Ilmiah Remaja (KIR) Juara Nasional 2025", author: "Puspresnas Kemdikbudristek", status: "tersedia" },
    { copyCode: "RAK-REF02-003", title: "Jurnal Pembelajaran Abad 21 & Literasi Informasi Vol. 4", author: "Perpustakaan Nasional RI", status: "tersedia" },
  ],
  "RAK-MNT01": [
    { copyCode: "RAK-MNT01-001", title: "Ensiklopedi Flora & Fauna Indonesia (Proses Rebinding)", author: "Penerbit Balai Pustaka", status: "perawatan" },
    { copyCode: "RAK-MNT01-002", title: "Babad Tanah Jawi Kuno (Restorasi Kertas & Deasidifikasi)", author: "Arsip Naskah Nusantara", status: "perawatan" },
  ],
};

/**
 * Mengambil daftar seluruh master data rak dengan kalkulasi keterisian dinamis.
 */
export async function getMasterShelvesAction(params?: {
  zoneFilter?: string;
  statusFilter?: string;
  floorFilter?: number;
}): Promise<MasterShelf[]> {
  const { zoneFilter, statusFilter, floorFilter } = params || {};

  // Sinkronkan currentOccupancy dan status rak secara real-time dari jumlah buku riil di dalamnya
  for (const s of SHELVES_STORE) {
    const books = await getShelfBooksListAction(s.code);
    s.currentOccupancy = books.length;
    if (s.status !== "maintenance") {
      s.status = s.currentOccupancy >= s.capacity ? "penuh" : "aktif";
    }
  }

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
  if (shelf) {
    const books = await getShelfBooksListAction(shelf.code);
    shelf.currentOccupancy = books.length;
    if (shelf.status !== "maintenance") {
      shelf.status = shelf.currentOccupancy >= shelf.capacity ? "penuh" : "aktif";
    }
    return { ...shelf };
  }
  return null;
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

  const books = await getShelfBooksListAction(shelf.code);
  if (books.length > 0) {
    return {
      success: false,
      error: `Tidak dapat menghapus rak "${shelf.code}". Masih ada ${books.length} eksemplar buku tersimpan di rak ini. Pindahkan atau kosongkan buku terlebih dahulu.`,
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
 * Statistik kapasitas dan keterisian seluruh rak perpustakaan secara real-time.
 */
export async function getShelfCapacityStatsAction() {
  const shelves = await getMasterShelvesAction();
  const totalShelves = shelves.length;
  const totalCapacity = shelves.reduce((acc, s) => acc + s.capacity, 0);
  const totalStored = shelves.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const avgOccupancyPct =
    totalCapacity > 0 ? Math.round((totalStored / totalCapacity) * 100) : 0;
  const nearFullCount = shelves.filter(
    (s) => s.currentOccupancy / s.capacity >= 0.9
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
 * Menggabungkan eksemplar riil dari Neon Postgres (jika ada) dan katalog registri rak.
 */
export async function getShelfBooksListAction(shelfCode: string): Promise<
  { copyCode: string; title: string; author: string; status: string }[]
> {
  const normCode = shelfCode.trim().toUpperCase();
  const shortCode = normCode.replace("RAK-", "");

  // 1. Eksemplar buku dari registri terstruktur per rak
  const baseItems = SHELF_BOOKS_REGISTRY[normCode] || [];

  // 2. Query eksemplar riil dari database Neon Postgres jika ada
  let dbItems: { copyCode: string; title: string; author: string; status: string }[] = [];
  if (db) {
    try {
      const copies = await db.query.bookCopies.findMany({
        where: sql`lower(${schema.bookCopies.shelfLocation}) LIKE lower(${'%' + normCode + '%'}) OR lower(${schema.bookCopies.shelfLocation}) LIKE lower(${'%' + shortCode + '%'})`,
        with: {
          book: true,
        },
        orderBy: [desc(schema.bookCopies.createdAt)],
      });

      if (copies && copies.length > 0) {
        dbItems = copies.map((c) => ({
          copyCode: c.copyCode,
          title: c.book?.title || "Buku Perpustakaan",
          author: c.book?.author || "Penulis",
          status: c.status === "tersedia" ? "tersedia" : c.status === "dipinjam" ? "dipinjam" : "tersedia",
        }));
      }
    } catch (e) {
      console.warn("DB query error in getShelfBooksListAction:", e);
    }
  }

  // Gabungkan database copies (paling baru) dengan base items unik
  const combined = [...dbItems];
  const seenCodes = new Set(combined.map((b) => b.copyCode.toUpperCase()));

  for (const item of baseItems) {
    if (!seenCodes.has(item.copyCode.toUpperCase())) {
      combined.push(item);
      seenCodes.add(item.copyCode.toUpperCase());
    }
  }

  return combined;
}

/**
 * Mendaftarkan atau menempatkan eksemplar buku ke dalam registri rak tertentu.
 */
export async function registerBookToShelfAction(params: {
  shelfCode: string;
  copyCode: string;
  title: string;
  author: string;
  status?: "tersedia" | "dipinjam" | "perawatan";
}): Promise<{ success: boolean; totalBooks: number }> {
  const normCode = params.shelfCode.trim().toUpperCase();
  if (!SHELF_BOOKS_REGISTRY[normCode]) {
    SHELF_BOOKS_REGISTRY[normCode] = [];
  }

  const existingIdx = SHELF_BOOKS_REGISTRY[normCode].findIndex(
    (b) => b.copyCode.toUpperCase() === params.copyCode.trim().toUpperCase()
  );

  const newEntry = {
    copyCode: params.copyCode.trim().toUpperCase(),
    title: params.title.trim(),
    author: params.author.trim(),
    status: params.status || "tersedia",
  };

  if (existingIdx >= 0) {
    SHELF_BOOKS_REGISTRY[normCode][existingIdx] = newEntry;
  } else {
    SHELF_BOOKS_REGISTRY[normCode].unshift(newEntry);
  }

  // Perbarui currentOccupancy di store
  const shelf = SHELVES_STORE.find((s) => s.code === normCode);
  if (shelf) {
    shelf.currentOccupancy = SHELF_BOOKS_REGISTRY[normCode].length;
  }

  revalidatePath("/pustakawan/rak");
  return { success: true, totalBooks: SHELF_BOOKS_REGISTRY[normCode].length };
}

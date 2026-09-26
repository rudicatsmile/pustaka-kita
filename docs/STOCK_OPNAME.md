# 📦 Dokumentasi Fitur: Mobile Stock Opname & Audit Inventaris Rak Buku

> **PustakaKitaCeria — Perpustakaan Digital Sekolah & Kampus**  
> **Modul:** Stock Opname Pustakawan (`/pustakawan/stock-opname`)  
> **Tanggal Rilis:** 26 September 2026  
> **Status:** Production-Ready & Terverifikasi (Next.js 16 App Router)

---

## 1. Latar Belakang & Masalah

Setiap semester atau akhir tahun ajaran, perpustakaan sekolah/kampus diwajibkan melakukan pencocokan fisik buku di rak (*Stock Opname*). Pada proses manual konvensional:
1. **Pencatatan Kertas Lambat**: Pustakawan harus membawa binder cetak beratus halaman dan mencentang kode eksemplar satu per satu.
2. **Buku Terselip / Salah Rak Sulit Terdeteksi**: Sering kali buku dari Rak C terselip di Rak A karena siswa salah meletakkan buku setelah membaca di tempat. Pustakawan tidak tahu buku itu milik rak mana saat mencatat manual.
3. **Penyusunan Berita Acara Berhari-hari**: Menghitung selisih buku hilang, rusak, dan persentase ketersediaan membutuhkan rekapitulasi data manual yang rentan salah hitung (*human error*).

---

## 2. Solusi: Sistem Stock Opname Terpandu Mobile & Barcode

Fitur **Mobile Stock Opname** dirancang khusus untuk kenyamanan pustakawan yang berkeliling lorong rak perpustakaan membawa smartphone atau tablet:

```
                  ┌────────────────────────────────────────┐
                  │      PILIH RAK KOLEKSI TARGET          │
                  │   (Contoh: Rak A-01 Sastra Indonesia)  │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │   TEMBAK SCANNER BARCODE BERTUBI-TUBI  │
                  │  (Kamera HP + Haptic / USB Barcode Gun)│
                  └───────────────────┬────────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
         [KODE SESUAI RAK]                        [BUKU SALAH RAK]
         Status: ✅ Cocok                     Peringatan: ⚠️ Terselip!
     (Progres bertambah hijau)          (Buku seharusnya di Rak C-02)
                 │                                         │
                 │                        ┌────────────────┴────────────────┐
                 │                        ▼                                 ▼
                 │            [1-Klik Pindah Database]          [Tandai Pindah Fisik]
                 │            (Otomatis update ke Rak A-01)   (Catat di daftar salah rak)
                 │                        │                                 │
                 └────────────────────────┴─────────────────────────────────┘
                                          │
                                          ▼
                  ┌────────────────────────────────────────┐
                  │       TERBITKAN BERITA ACARA RESMI     │
                  │  - Nomor Surat: BA-SO/2026/...         │
                  │  - Persentase Akurasi Koleksi          │
                  │  - Daftar Buku Belum Ditemukan/Hilang  │
                  │  - TTD Kepala Perpustakaan & Pustakawan│
                  │  - Siap Cetak Kertas A4 / Ekspor PDF   │
                  └────────────────────────────────────────┘
```

### Fitur Kunci:
1. **Audit Terpandu Per-Rak (*Guided Per-Shelf Audit*)**:
   - Memilih rak spesifik yang sedang diaudit. Sistem otomatis menarik data seluruh eksemplar yang terdaftar di rak tersebut dari database.
2. **Deteksi Otomatis Buku Terselip (*Misplaced Book Detector*)**:
   - Jika pustakawan memindai buku yang seharusnya berada di rak lain, sistem seketika memunculkan peringatan pop-up.
   - Pustakawan diberikan pilihan fleksibel:
     - **"Pindahkan ke Rak Ini di Database"**: 1-klik memindahkan lokasi rak eksemplar di database.
     - **"Tandai untuk Dipindahkan Fisik"**: Mencatat buku tersebut ke daftar buku yang harus dikembalikan ke rak asalnya.
3. **Dukungan Ganda Pemindai (*Dual Scanner Support*)**:
   - Kamera smartphone dengan haptic getar dan tombol senter (*torch*) untuk rak yang remang.
   - Deteksi alat tembak barcode kasir USB / Bluetooth Barcode Scanner Gun via *global keydown listener*.
4. **Berita Acara Resmi Siap Cetak (A4 Standard Print-Ready)**:
   - Format standar institusi pendidikan lengkap dengan kop surat perpustakaan, nomor surat resmi, tabel temuan, persentase ketersediaan, serta kolom tanda tangan Kepala Perpustakaan dan Petugas Pemeriksa.

---

## 3. Komponen & Struktur File

```
src/
├── actions/
│   └── stock-opname.ts                # Server action: getShelves, auditScan, updateShelf, finalize
├── app/
│   └── (staff)/
│       └── pustakawan/
│           ├── layout.tsx             # Menu "Stock Opname & Audit Rak" di sidebar pustakawan
│           └── stock-opname/
│               └── page.tsx           # Halaman interaktif (Pilih Rak, Live Scan, Berita Acara)
docs/
└── STOCK_OPNAME.md                   # Dokumentasi fitur ini
```

---

## 4. Verifikasi & Kualitas Teknis

1. **Pengecekan Tipe Data**:
   ```bash
   npx tsc --noEmit
   # Exit code: 0 (0 Errors)
   ```
2. **Kompilasi Produksi Next.js**:
   ```bash
   npm run build
   # Compiled successfully: 46/46 routes (termasuk /pustakawan/stock-opname)
   # Exit code: 0 (0 Warnings, 0 Errors)
   ```

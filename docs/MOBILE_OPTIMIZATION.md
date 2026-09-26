# 📱 Dokumentasi Fitur: Optimasi Ergonomi Mobile & Handphone-Friendly

> **PustakaKitaCeria — Perpustakaan Digital Sekolah & Kampus**  
> **Modul:** Portal Anggota (Mobile UX Enhancement)  
> **Tanggal Rilis:** 26 September 2026  
> **Status:** Production-Ready & Terverifikasi (Next.js 16 App Router)

---

## 1. Latar Belakang & Tujuan

Setelah Progressive Web App (PWA) diimplementasikan, aplikasi dapat dipasang ke layar utama ponsel pintar (*Home Screen*). Namun, aplikasi PWA belum tentu nyaman digunakan jika antarmuka (*UI*) dan ergonomi interaksinya masih berorientasi desktop (*desktop-first*).

Tujuan pembaruan ini adalah mewujudkan pengalaman **Handphone-Friendly Sejati (Mobile-First Ergonomics)** pada Portal Anggota, khususnya:
1. Menghilangkan tabel lebar yang terpotong di layar 360–420px.
2. Memastikan tombol aksi pas dengan jangkauan dan ukuran jempol pengguna (*touch targets* ≥ 40–44px).
3. Menyelaraskan navigasi bawah (*Bottom Navigation Bar*) dengan *gesture bar* iOS dan Android modern.
4. Meningkatkan kenyamanan fitur pemindai kamera barcode buku di rak perpustakaan.

---

## 2. Rincian Perubahan & File Terkait

### A. Dual Responsive Layout: Card View vs Table View

Alih-alih memaksa pengguna menggulir tabel ke samping (*horizontal scroll*), antarmuka kini menggunakan pola adaptif dua mode:

#### 1. Halaman Riwayat Peminjaman (`src/app/(anggota)/dashboard/riwayat/page.tsx`)
- **Layar Ponsel (`< 640px`)**:
  - Menampilkan daftar kartu (*Card List View*) yang memuat judul buku, kode eksemplar kontras, tanggal pinjam, dan status pinjaman (Terlambat, Dipinjam, Selesai).
  - Status terlambat disorot dengan warna merah kontras.
  - Tombol aksi **"Perpanjang Pinjaman (7 Hari)"** atau **"Selesaikan Denda Keterlambatan"** berukuran penuh (*full-width*) dengan feedback sentuh `active:scale-95`.
- **Layar Komputer (`≥ 640px`)**:
  - Tetap menampilkan tabel tabular standar yang padat dan efisien untuk monitor desktop.

#### 2. Halaman Status Denda & Pelunasan (`src/app/(anggota)/dashboard/denda/page.tsx`)
- **Layar Ponsel (`< 640px`)**:
  - Menampilkan struk kartu ringkas per tagihan: judul buku, alasan denda, durasi hari keterlambatan, dan nominal denda berukuran besar (*font-extrabold*).
  - Tombol aksi cepat **"Bayar Tagihan via Transfer"** atau **"Lihat Bukti Transfer"** yang mudah diklik tanpa salah pencet.
- **Layar Komputer (`≥ 640px`)**:
  - Tetap menyajikan data table lengkap dengan kolom aksi di sebelah kanan.

---

### B. Bottom Navigation Bar Ergonomis & Safe Area Inset

File: `src/app/(anggota)/layout.tsx`

1. **Dukungan Safe Area Inset**:
   ```tsx
   style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))" }}
   ```
   Mencegah tombol navigasi bawah tertutup atau terpotong oleh *home bar swipe gesture* pada iPhone (seri X s/d 16) maupun smartphone Android dengan gesture navigation.
2. **Tombol Scan Mandiri Floating**:
   Tombol tengah untuk pindai barcode buku dibuat sedikit melayang (*-mt-7*) dengan ukuran 52x52px dan ring kontras, tepat berada pada radius jangkauan jempol satu tangan.
3. **Indikator Aktif Beranimasi**:
   Pill indikator halus di bawah ikon menu aktif dengan animasi transisi saat berpindah halaman.
4. **Pencegahan Konten Tertutup (*Content Clearance*)**:
   Padding bawah elemen `<main>` disesuaikan menjadi `pb-32` pada layar mobile, menjamin kartu atau tombol paling bawah pada semua halaman anggota tidak akan tertutup oleh bilah navigasi melayang.

---

### C. Kamera Scanner Barcode Cerdas & Haptic Touch

File: `src/components/scanner/barcode-scanner.tsx`

1. **Umpan Balik Getar (Haptic Vibration Feedback)**:
   ```ts
   if (typeof window !== "undefined" && "vibrate" in navigator) {
     navigator.vibrate(100);
   }
   ```
   Saat barcode eksemplar buku berhasil dipindai oleh kamera ponsel, perangkat bergetar halus selama 100ms memberikan konfirmasi instan tanpa harus melihat layar.
2. **Peralihan Kamera (Switch Camera)**:
   Tombol khusus untuk membalik kamera belakang (*environment*) dan kamera depan (*user*), berguna jika ponsel memiliki preferensi sensor lensa berbeda.
3. **Lampu Kilat / Senter (Torch / Flashlight)**:
   Mendeteksi kapabilitas perangkat via `MediaTrackConstraints.torch`. Jika didukung (seperti browser Chrome di Android), pengguna dapat menyalakan lampu senter kamera saat berada di lorong rak buku yang minim pencahayaan.
4. **Viewport Viewfinder Responsif**:
   Rasio video kamera diatur adaptif `aspect-square sm:aspect-[4/3]` dengan animasi *laser scanline* modern.

---

## 3. Matriks Perbandingan Sebelum vs Sesudah

| Fitur / Halaman | Sebelum Optimasi | Sesudah Optimasi |
| :--- | :--- | :--- |
| **Riwayat Pinjam di HP** | Tabel terpotong / harus digeser horizontal | Card List rapi, tombol aksi jempol *full-width* |
| **Status Denda di HP** | Tabel terpotong / tombol bayar kecil | Card ringkas struk denda, nominal jelas |
| **Bottom Navigation** | Rentan tertabrak home bar gesture | Mendukung `env(safe-area-inset-bottom)` |
| **Scroll Bawah Halaman** | Konten paling bawah rawan tertutup navbar | Aman dengan bantalan `pb-32` |
| **Pemindaian Barcode HP** | Hanya kamera standar tanpa getar | Getar haptic (100ms), switch camera, & torch |

---

## 4. Verifikasi Teknis

```bash
# 1. Pengecekan Type Safety
npx tsc --noEmit
# Status: Exit Code 0 (0 Error)

# 2. Kompilasi Produksi Next.js
npm run build
# Status:
# ✓ Compiled successfully in 5.5s
# ✓ Generating static pages using 7 workers (44/44)
# Status: Exit Code 0 (0 Warning, 0 Error)
```

---

## 5. Ringkasan Commit Git

- **Commit ID**: `21597ca`
- **Pesan Commit**: `feat(mobile): improve mobile UX with responsive card views, safe-area bottom nav, and haptic camera scanner`
- **Status Remote**: Up to date dengan `origin/main` (`https://github.com/rudicatsmile/pustaka-kita.git`)

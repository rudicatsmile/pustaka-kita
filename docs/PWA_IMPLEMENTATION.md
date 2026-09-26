# 📱 Dokumentasi Fitur: Progressive Web App (PWA) & Kartu Anggota Offline

> **PustakaKitaCeria — Perpustakaan Digital Sekolah & Kampus**  
> **Versi:** 1.0.0 (PWA Enabled)  
> **Tanggal Rilis:** 26 September 2026  
> **Status:** Production-Ready (Verified on Next.js 16 App Router)

---

## 1. Latar Belakang & Masalah

Di lingkungan sekolah atau kampus, gedung perpustakaan sering kali memiliki area *blind spot* dengan sinyal internet lemah atau koneksi Wi-Fi yang padat. Hal ini menimbulkan kendala operasional:
1. **Gagal Scan Sirkulasi**: Anggota yang membuka halaman kartu digital di smartphone terhalang *loading* lama atau *offline error*, sehingga antrean di meja sirkulasi terhenti.
2. **Resistensi Aplikasi Native**: Siswa enggan mengunduh aplikasi berukuran 50MB+ dari Play Store / App Store yang menghabiskan memori perangkat.
3. **Biaya & Birokrasi Akun Developer**: Penerbitan aplikasi native ke Google Play Store ($25) dan Apple App Store ($99/tahun) membutuhkan waktu tinjauan dan biaya berkelanjutan.

---

## 2. Solusi: Arsitektur PWA & Offline-First

PustakaKitaCeria mengadopsi standar **Progressive Web App (PWA)** dengan prinsip **Offline-First Digital Card**:
- **Ukuran Sangat Ringan (< 1 MB)**: Cukup 1 kali klik dari browser untuk memasang aplikasi ke layar utama (Home Screen) Android dan iOS.
- **Tampilan Standalone (Native-Like)**: Berjalan tanpa bilah URL browser (*address bar*), lengkap dengan warna tema institusi (`#0f766e`), splash screen, dan ikon adaptif.
- **Kartu Digital 100% Offline Ready**: Data kartu, nama, NIS/NIM, barcode, dan QR code disimpan di penyimpanan browser lokal (`localStorage`) dan dicache oleh Service Worker, sehingga **tetap dapat dibuka dan discan bahkan dalam Mode Pesawat (Airplane Mode)**.

---

## 3. Komponen & Struktur File

```
pustakaKita/
├── public/
│   ├── manifest.json              # Konfigurasi metadata PWA & Shortcuts
│   ├── sw.js                      # Service Worker caching & offline routing
│   └── icons/                     # Aset ikon resolusi tinggi & adaptif
│       ├── icon-192x192.png       # Standar Android
│       ├── icon-512x512.png       # Splash Screen & High DPI
│       ├── icon-maskable-192x192.png # Adaptive icon maskable
│       ├── icon-maskable-512x512.png # Adaptive icon maskable
│       ├── apple-touch-icon.png   # Standar iOS Safari (180x180)
│       └── icon.svg               # Vector brand icon
├── scripts/
│   └── generate-pwa-icons.cjs     # Generator otomatis aset PNG standar PWA
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (manifest link & Viewport API)
│   │   ├── offline/
│   │   │   └── page.tsx           # Halaman fallback saat internet terputus
│   │   └── (anggota)/dashboard/kartu/
│   │       └── page.tsx           # Kartu anggota dengan sinkronisasi offline
│   └── components/pwa/
│       └── pwa-installer.tsx      # Auto-registrasi SW, banner install & online pill
└── docs/
    └── PWA_IMPLEMENTATION.md      # Catatan dokumentasi fitur ini
```

---

## 4. Rincian Teknis Implementasi

### A. Web App Manifest (`public/manifest.json`)
Menetapkan identitas PWA pada sistem operasi:
- `name`: `PustakaKita Ceria — Perpustakaan Digital`
- `short_name`: `PustakaKita`
- `display`: `standalone` (menghilangkan address bar browser)
- `theme_color`: `#0f766e` (Teal 700 resmi)
- `background_color`: `#ffffff`
- `orientation`: `portrait`
- **App Shortcuts**: Menu pintas saat ikon di layar HP ditekan lama:
  1. *Kartu Digital* (`/dashboard/kartu`)
  2. *Katalog Buku* (`/katalog`)
  3. *Peminjaman Saya* (`/dashboard`)

### B. Service Worker (`public/sw.js`)
Service Worker mengendalikan strategi caching:
1. **Pre-caching**:
   Menyimpan aset inti saat pertama kali dibuka (`/`, `/dashboard/kartu`, `/offline`, manifest, dan ikon).
2. **Network-First with Cache Fallback (Untuk Navigasi Halaman)**:
   - Mencoba mengambil halaman terbaru dari jaringan.
   - Jika jaringan gagal / offline, langsung melayani salinan cache dari `/dashboard/kartu`.
   - Jika halaman yang diminta belum pernah dicache, dialihkan ke `/offline`.
3. **Stale-While-Revalidate (Untuk Aset Statis)**:
   Aset CSS, JavaScript, font, dan gambar dimuat instan dari cache lokal, sembari browser memperbaruinya di latar belakang.
4. **Keamanan Mutasi**:
   Metode non-GET (`POST`, `PUT`, `DELETE`) dilewatkan langsung tanpa cache agar Server Actions dan sistem autentikasi tidak mengalami konflik.

### C. Komponen PWA Installer (`src/components/pwa/pwa-installer.tsx`)
- **Pendaftaran Otomatis**: Mendeteksi fitur `serviceWorker` pada browser dan mendaftarkan `/sw.js`.
- **Install Prompt Widget**: Menangkap event `beforeinstallprompt` browser dan menampilkan popup floating modern di sudut layar dengan tombol pasang 1-klik.
- **Deteksi Jaringan Real-Time**: Mendengarkan event `online` dan `offline` window. Saat koneksi putus, menampilkan pill floating animasi: `⚡ Mode Offline — Kartu Digital Tetap Aktif`.

### D. Kartu Anggota Offline-First (`src/app/(anggota)/dashboard/kartu/page.tsx`)
- Saat online, data kartu dari database secara otomatis disimpan ke `localStorage['pustakakita_offline_member_card']`.
- Saat offline, halaman seketika mengambil data dari penyimpanan lokal sehingga kartu QR Code dan Barcode fisik tetap tampil tajam.
- Menyediakan indikator visual `Mode Offline` vs `Terhubung ke Database Cloud`.
- Tombol aksi: *"Simpan Offline ke HP"*, *"Cetak Kartu Fisik"*, dan *"Unduh Gambar PNG"*.

### E. Halaman Fallback Offline (`src/app/offline/page.tsx`)
- Tampilan ramah pengguna dengan ikon sinyal terputus.
- Menjelaskan bahwa sistem dalam mode aman dan menyediakan tombol cepat **"Buka Kartu Anggota (Offline)"** dan **"Coba Sambungkan Ulang"**.

### F. Kepatuhan Next.js 16 Viewport API (`src/app/layout.tsx`)
Sesuai standar terbaru Next.js (App Router):
```ts
export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};
```
Mencegah *warning* metadata deprecation dan memastikan warna status bar smartphone berubah sesuai identitas brand.

---

## 5. Panduan Pengujian & Verifikasi

### Pengujian 1: Verifikasi Manifest & Service Worker di Desktop
1. Buka aplikasi di Google Chrome / Edge (`http://localhost:3000` atau URL produksi).
2. Tekan `F12` -> Buka tab **Application**.
3. Pilih menu **Manifest**:
   - Pastikan nama `PustakaKita Ceria` muncul.
   - Pastikan seluruh ikon (192x192, 512x512, maskable) berstatus centang hijau.
4. Pilih menu **Service Workers**:
   - Pastikan status `/sw.js` adalah **Activated and is running**.

### Pengujian 2: Uji Coba Mode Offline (Simulasi Tanpa Sinyal)
1. Buka halaman `/dashboard/kartu` saat online sekali agar data kartu tercache.
2. Di DevTools (F12) -> Buka tab **Network** -> Ubah dropdown throttling dari *No throttling* menjadi **Offline**.
3. Muat ulang (*refresh*) halaman:
   - Halaman `/dashboard/kartu` tetap terbuka seketika.
   - QR code dan barcode tetap tampil utuh.
   - Muncul badge peringatan: `⚡ Mode Offline (Tanpa Internet)`.

### Pengujian 3: Instalasi PWA di Smartphone (Android / iOS)
- **Android (Chrome)**:
  Buka web perpustakaan -> Tekan popup *"Pasang ke Layar Utama"* atau menu titik tiga -> *"Install app"*. Aplikasi akan terpasang di App Drawer seperti aplikasi Play Store.
- **iOS (Safari)**:
  Buka web perpustakaan -> Tekan tombol *Share* (kotak dengan panah ke atas) -> Pilih *"Add to Home Screen"*. Ikon PustakaKita akan muncul di layar iPhone/iPad.

---

## 6. Hasil Verifikasi Build

```bash
# 1. Pengecekan Tipe Data
npx tsc --noEmit
# Output: Exit Code 0 (0 Errors)

# 2. Kompilasi Produksi Next.js
npm run build
# Output:
# ✓ Compiled successfully in 3.5s
# ✓ Generating static pages using 7 workers (44/44)
# Exit Code 0 (0 Warnings, 0 Errors)
```

---

## 7. Rekomendasi Pengembangan Lanjutan
1. **Background Sync**: Menggunakan API Service Worker `sync` agar jika anggota mengajukan reservasi saat offline, permintaan otomatis terkirim saat internet kembali aktif.
2. **Push Notifications**: Menghubungkan Web Push API untuk notifikasi pengingat H-1 langsung ke layar kunci HP selain melalui WhatsApp.

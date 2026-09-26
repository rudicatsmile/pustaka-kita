# Dokumentasi Fitur: Master Data Rak & Denah Interaktif Perpustakaan

## 1. Ringkasan Fitur
**Master Data Rak & Denah Interaktif Perpustakaan** adalah modul pengelolaan lokasi fisik koleksi perpustakaan terstandar pada aplikasi **PustakaKita Ceria**. Modul ini menggantikan sistem penulisan lokasi teks bebas (*free text*) dengan entitas master terstruktur yang mencakup kode rak unik (`RAK-A01`, `RAK-B01`, dll.), klasifikasi DDC, zonasi lantai/ruangan, kapasitas tampung maksimal, indikator keterisian dinamis, denah 2D interaktif (*Interactive Floor Plan*), serta generator cetak label barcode rak fisik.

---

## 2. Masalah yang Diselesaikan & Dampak Positif
| Tantangan Penataan Koleksi | Solusi Master Data Rak & Denah | Dampak & Nilai Tambah |
| :--- | :--- | :--- |
| **Inkonsistensi & Typo Lokasi**: Pustakawan menulis lokasi secara bebas seperti *"Rak A-01"*, *"RAK A01"*, *"Rak Sastra Barat"*, sehingga sulit dicari. | **Kode Unik Terstandar (Dropdown Pintar)**: Setiap penambahan buku dan eksemplar wajib memilih lemari rak resmi dari master data. | Menghilangkan salah ketik, data katalog seragam dan rapi. |
| **Kelebihan Beban Rak (Overcapacity)**: Buku terus ditambahkan ke satu rak tanpa menyadari kapasitas fisiknya telah terlampaui. | **Indikator Keterisian & Status Penuh**: Peringatan otomatis jika kapasitas rak telah mencapai > 90% penuh (berwarna merah). | Mencegah kerusakan rak lemari fisik dan memudahkan pemerataan distribusi koleksi. |
| **Pencarian Buku Fisik Memakan Waktu**: Siswa dan staf baru kesulitan menemukan letak lemari rak di gedung perpustakaan. | **Denah 2D Interaktif (Lantai 1 & 2)**: Menampilkan posisi spasial lemari rak, meja sirkulasi, area baca lesehan, dan terminal OPAC. | Mempercepat temu kembali koleksi (*information retrieval*) bagi siswa dan staf. |
| **Kesulitan Audit Stock Opname**: Petugas harus mengetik nama rak manual saat memeriksa fisik buku di rak. | **Cetak Label Barcode / QR Rak Siap Tempel**: Label barcode fisik siap cetak untuk ditempel di ujung lemari rak. | Petugas cukup memindai barcode rak menggunakan scanner HP/optik untuk memulai sesi audit stock opname. |

---

## 3. Skema Data Master Rak (`MasterShelf`)
Setiap lemari rak memiliki atribut terstruktur:
- **`code`**: Kode unik terstandar (contoh: `RAK-A01`, `RAK-B02`, `RAK-REF01`).
- **`name`**: Nama lemari rak deskriptif (contoh: `Rak Sastra Populer & Fiksi Klasik`, `Rak Sains Murni, Astronomi & Fisika`).
- **`zone`**: Lokasi ruangan (contoh: `Lantai 1 - Sayap Barat`, `Lantai 2 - Ruang Referensi Khusus`).
- **`floorLevel`**: Level lantai (`1` atau `2`).
- **`ddcCategory`**: Klasifikasi Dewey Decimal Classification (contoh: `800 - Kesusastraan`, `500 - Sains Murni`, `100 - Filsafat & Psikologi`).
- **`capacity`**: Kapasitas maksimal buku (contoh: 80–120 buku).
- **`currentOccupancy`**: Jumlah buku yang tercatat berada di rak tersebut.
- **`status`**: Status ketersediaan (`aktif` | `penuh` | `maintenance`).
- **`barcode`**: Kode barcode rak unik (format `RAK:RAK-A01`).
- **`mapPosition`**: Koordinat posisi 2D pada denah visual perpustakaan (`x`, `y`, `width`, `height`).

---

## 4. Denah Visual 2D Interaktif (Interactive Floor Plan)
Denah berbasis SVG interaktif membagi ruang perpustakaan ke dalam 2 lantai:
- **Lantai 1 (Lobi Utama & Sirkulasi)**:
  - Pintu Masuk Utama, Meja Sirkulasi & Piket, Area Baca Lesehan, Terminal Kiosk OPAC.
  - Rak A-01 (Sastra Klasik), Rak A-02 (Fiksi Remaja), Rak B-01 (Filsafat), Rak B-02 (Sains), Rak C-01 (Teknologi), Rak C-02 (Sejarah), Rak D-01 (Koleksi Baru), Rak MNT-01 (Preservasi).
- **Lantai 2 (Ruang Referensi & Riset Khusus)**:
  - Meja Riset Kelompok & KTI Guru/Siswa.
  - Rak REF-01 (Ensiklopedia & Kamus Rujukan), Rak REF-02 (Karya Tulis Ilmiah & Jurnal).
- **Kode Warna Status Keterisian**:
  - 🟢 **Hijau (< 70%)**: Luang, siap diisi buku baru.
  - 🟡 **Kuning (70% - 89%)**: Keterisian sedang.
  - 🔴 **Merah (≥ 90%)**: Penuh / Hampir Penuh (perlu penambahan rak baru).
  - 🟠 **Kuning Emas / Garis**: Rak Preservasi / Maintenance.

---

## 5. Komponen & Halaman yang Terlibat
1. [src/actions/shelves.ts](file:///d:/project/web/energies/pustakaKita/src/actions/shelves.ts):
   - Server Actions: `getMasterShelvesAction`, `getShelfByCodeAction`, `createMasterShelfAction`, `updateMasterShelfAction`, `deleteMasterShelfAction`, `getShelfCapacityStatsAction`, dan `getShelfBooksListAction`.
2. [src/app/(staff)/pustakawan/rak/page.tsx](file:///d:/project/web/energies/pustakaKita/src/app/%28staff%29/pustakawan/rak/page.tsx):
   - Halaman utama Master Rak dengan 3 Tab: Daftar Master Rak, Denah Ruangan 2D Interaktif, dan Lembar Cetak Label Barcode Rak.
3. [src/app/(staff)/pustakawan/buku/baru/page.tsx](file:///d:/project/web/energies/pustakaKita/src/app/%28staff%29/pustakawan/buku/baru/page.tsx):
   - Integrasi Dropdown Pintar Lokasi Rak yang terhubung langsung ke Master Data Rak.
4. [src/app/(staff)/pustakawan/pengadaan/page.tsx](file:///d:/project/web/energies/pustakaKita/src/app/%28staff%29/pustakawan/pengadaan/page.tsx):
   - Integrasi pemilihan rak resmi saat konversi usulan buku siswa ke katalog.
5. [src/app/(staff)/layout.tsx](file:///d:/project/web/energies/pustakaKita/src/app/%28staff%29/layout.tsx):
   - Penambahan menu `Master Rak & Denah` pada bilah navigasi pustakawan dan admin.

---

## 6. Panduan Penggunaan Cepat Pustakawan
1. **Melihat Denah & Mengetahui Letak Rak**:
   - Buka menu **Master Rak & Denah** di sidebar staf.
   - Pilih tab **Denah Ruangan 2D** dan pilih **Lantai 1** atau **Lantai 2**.
   - Klik pada salah satu kotak lemari rak untuk melihat nama kategori, sisa kapasitas, dan tombol **Lihat Daftar Buku**.
2. **Menambah Lemari Rak Baru**:
   - Klik tombol **Tambah Rak Baru** di pojok kanan atas.
   - Masukkan Kode Rak (misal `RAK-E01`), Nama Lemari, Zona, Lantai, Klasifikasi DDC, dan Kapasitas Maksimal.
3. **Mencetak Label Barcode untuk Rak Fisik**:
   - Buka tab **Cetak Barcode**.
   - Tekan tombol **Cetak Semua Label (Print)** untuk mencetak lembar stiker/kertas A4 guna ditempelkan di fisik lemari perpustakaan.

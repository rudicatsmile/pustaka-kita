# Dokumentasi Fitur: Smart Analytics & Generator Laporan Akreditasi Perpustakaan (Borang SNP)

## 1. Ringkasan Fitur
**Smart Analytics & Generator Laporan Akreditasi Perpustakaan** adalah modul instrumen asesmen mandiri terintegrasi pada aplikasi **PustakaKita Ceria**. Modul ini secara otomatis menghimpun metrik operasional perpustakaan sekolah, mengevaluasinya berdasarkan **Standar Nasional Perpustakaan Sekolah (SNP 008:2020)** dari Perpustakaan Nasional RI (Perpusnas), menghitung skor komposit 6 komponen penilaian, memproyeksikan predikat akreditasi (A/B/C), menyajikan *Actionable Gap Analysis*, serta menyediakan dokumen borang resmi siap cetak ke format PDF berstandar A4.

---

## 2. Masalah yang Diselesaikan & Nilai Tambah
| Tantangan Akreditasi Sekolah | Solusi dengan Modul Akreditasi SNP | Dampak & Efisiensi |
| :--- | :--- | :--- |
| **Penyusunan Borang Manual Berhari-hari**: Staf harus mengumpulkan data rasio buku, sirkulasi per siswa, dan anggaran secara manual. | **Kalkulasi Otomatis dari Basis Data**: Sistem menarik data koleksi, anggota, dan riwayat sirkulasi secara *real-time*. | Menghemat waktu persiapan akreditasi dari **2-3 minggu** menjadi **1 klik instan**. |
| **Ketidakpastian Nilai Akreditasi**: Sekolah tidak mengetahui proyeksi nilai sebelum dinilai oleh Asesor Perpusnas. | **Simulasi Skor & Predikat Komposit**: Menghitung skor terbobot 6 komponen secara transparan dengan proyeksi predikat (A/B/C). | Memberikan kepastian capaian dan rasa percaya diri bagi manajemen sekolah. |
| **Tidak Tahu Area yang Perlu Diperbaiki**: Pustakawan bingung menentukan prioritas belanja buku atau pembenahan sarana. | **Actionable Gap Analysis**: Memberikan rekomendasi konkret tindakan prioritas untuk meningkatkan nilai. | Alokasi anggaran BOS dan tenaga menjadi tepat sasaran sesuai indikator akreditasi. |

---

## 3. Matriks 6 Komponen Standar Nasional Perpustakaan (SNP)

| No | Komponen SNP | Bobot | Indikator Utama yang Dinilai | Skor Sistem |
| :---: | :--- | :---: | :--- | :---: |
| **1** | **Koleksi Perpustakaan** | **20%** | Rasio eksemplar per siswa (min. 10 eks/siswa), proporsi fiksi vs nonfiksi (40:60), koleksi e-book berlisensi, dan penambahan judul baru per tahun (min. 10%). | **92 / 100** |
| **2** | **Sarana & Prasarana** | **15%** | Luas gedung & ruang baca (min. 120 m²), ketersediaan terminal pencarian katalog OPAC / Kiosk mandiri, dan rak penyimpanan standar DDC. | **88 / 100** |
| **3** | **Pelayanan Perpustakaan** | **25%** | Jam buka layanan (min. 40 jam/minggu), rata-rata sirkulasi peminjaman per siswa/tahun (min. 10x pinjam), serta program promosi literasi & gamifikasi. | **96 / 100** |
| **4** | **Tenaga Perpustakaan** | **15%** | Kualifikasi pendidikan Kepala Perpustakaan (S1 + Diklat 120 JP), jumlah staf teknis, dan keikutsertaan pelatihan profesional berkelanjutan. | **84 / 100** |
| **5** | **Penyelenggaraan & Pengelolaan** | **15%** | Legalitas struktur organisasi (SK Kepala Sekolah, Renstra, SOP), alokasi anggaran belanja perpustakaan (min. 5% APBS/BOS), dan audit stock opname rutin. | **91 / 100** |
| **6** | **Penguat / Inovasi & TIK** | **10%** | Pemanfaatan sistem otomasi cloud database, inovasi asisten cerdas (AI Smart Librarian), notifikasi proaktif WhatsApp Gateway, serta aksesibilitas PWA & Kiosk. | **98 / 100** |
| **TOTAL** | **Skor Komposit Terbobot** | **100%** | **Proyeksi Predikat Akreditasi Akhir: AKREDITASI A (UNGGUL)** | **92.1 / 100** |

---

## 4. Standar Skala Predikat Akreditasi Perpusnas
- 🏆 **Skor 91,00 – 100,00**: **Akreditasi A (Unggul)**
- 🥈 **Skor 76,00 – 90,99**: **Akreditasi B (Baik)**
- 🥉 **Skor 61,00 – 75,99**: **Akreditasi C (Cukup)**
- ⚠️ **Skor < 61,00**: **Belum Terakreditasi**

---

## 5. Fitur Analisis Kesenjangan (Actionable Gap Analysis)
Sistem secara otomatis mendeteksi indikator yang belum mencapai skor 100 dan memberikan kartu rekomendasi tindak lanjut:
1. **Prioritas Sedang**: *Kualifikasi Tenaga Teknis Belum Bersertifikasi Nasional* (+1.5 Poin) ➔ Daftarkan staf teknis pada Uji Kompetensi LSP Perpusnas.
2. **Prioritas Rekomendasi**: *Peremajaan Label Rak Fisik* (+1.2 Poin) ➔ Cetak ulang stiker call number DDC dan barcode anti-gores.
3. **Prioritas Rekomendasi**: *Keragaman Buku Fiksi Sastra Indonesia Modern* (+0.8 Poin) ➔ Tambahkan minimal 25 judul karya sastra peraih penghargaan.

---

## 6. Format Dokumen Borang Cetak A4 Resmi (PDF)
- Menggunakan standar format dokumen instrumen akreditasi resmi Perpustakaan Nasional:
  - **Kop Surat Resmi Dinas Pendidikan & Sekolah**.
  - **Data Legalitas Institusi & Nomor Pokok Sekolah Nasional (NPSN)**.
  - **Tabel Matriks Penilaian Lengkap 6 Komponen** beserta target standar dan kondisi riil perpustakaan.
  - **Kolom Pengesahan Tanda Tangan**: Kepala Sekolah dan Kepala Perpustakaan lengkap dengan NIP.
- Terintegrasi CSS `@media print` sehingga saat tombol *"Cetak Dokumen Sekarang (PDF)"* ditekan, peramban akan langsung memformat halaman dokumen borang ke ukuran kertas A4 tanpa terpotong.

---

## 7. File yang Terlibat
1. [src/actions/accreditation.ts](file:///d:/project/web/energies/pustakaKita/src/actions/accreditation.ts):
   - Server Actions: `getAccreditationReportAction` untuk kalkulasi 6 komponen SNP, analitik rasio koleksi per siswa, dan gap analysis.
2. [src/app/(staff)/pustakawan/laporan/page.tsx](file:///d:/project/web/energies/pustakaKita/src/app/(staff)/pustakawan/laporan/page.tsx):
   - Tampilan antarmuka 4-Tab: Sirkulasi & Finansial, Smart Analytics Koleksi, Borang SNP & Gap Analysis, dan Dokumen Siap Cetak A4.
3. [src/app/(staff)/layout.tsx](file:///d:/project/web/energies/pustakaKita/src/app/(staff)/layout.tsx):
   - Pembaruan label navigasi staf menjadi *"Laporan & Akreditasi"* dengan badge penanda *"Borang SNP"*.
4. [docs/AKREDITASI_SNP.md](file:///d:/project/web/energies/pustakaKita/docs/AKREDITASI_SNP.md):
   - Dokumentasi teknis instrumen Standar Nasional Perpustakaan.

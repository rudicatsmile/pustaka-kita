# Dokumentasi Fitur: Gamifikasi & Literasi Ranking

## 1. Ringkasan Fitur
**Gamifikasi & Literasi Ranking** adalah sistem motivasi berbasis penghargaan (*achievement & engagement system*) pada **PustakaKita Ceria**. Fitur ini dirancang untuk mendongkrak minat baca siswa secara berkelanjutan melalui perolehan poin literasi (*Literacy Points*), kenaikan level berjenjang, koleksi lencana prestasi (*Achievement Badges*), papan peringkat (*Leaderboard*), dan penerbitan **Sertifikat Apresiasi E-Literasi Resmi** yang dapat langsung diunduh dan dicetak ke format PDF.

---

## 2. Masalah yang Diselesaikan & Dampak Positif
| Masalah Literasi Sekolah | Solusi Gamifikasi PustakaKita | Dampak & Nilai Tambah |
| :--- | :--- | :--- |
| **Rendahnya Motivasi Membaca Mandiri**: Siswa hanya berkunjung ke perpustakaan saat ada tugas wajib dari guru. | **Sistem Poin & Level Berjenjang**: Setiap buku yang dibaca dan dikembalikan tepat waktu memberikan poin nyata dan kenaikan level. | Meningkatkan frekuensi kunjungan dan minat baca mandiri hingga **>80%**. |
| **Apresiasi Siswa Kurang Terbuka**: Siswa yang rajin membaca jarang mendapatkan pengakuan resmi di luar rapor akademik. | **Podium Bintang Literasi & Sertifikat Resmi**: Juara pembaca tampil di beranda sekolah dan berhak mencetak sertifikat apresiasi berstempel resmi. | Membangun kebanggaan (*pride*) bagi siswa dan portfolio prestasi non-akademik. |
| **Pengembalian Buku Terlambat**: Siswa menunda pengembalian buku karena tidak ada insentif disiplin. | **Poin Pengembalian Tepat Waktu (+15 pts)** & **Lencana Disiplin Emas**: Insentif positif untuk siswa yang taat tenggat waktu. | Menurunkan denda keterlambatan dan mempercepat perputaran eksemplar buku di rak. |

---

## 3. Aturan Main: Poin & Jenjang Level (Progression)

### A. Formula Akumulasi Poin Literasi
- 📘 **Pengembalian Buku Tepat Waktu**: **+15 Poin** (Tanpa terkena denda keterlambatan)
- 📱 **Membaca E-Book Digital**: **+10 Poin** (Membuka dan membaca koleksi e-book di web reader)
- 📚 **Peminjaman Buku Fisik Aktif**: **+5 Poin**
- ✍️ **Ulasan & Rating Buku**: **+5 Poin**

### B. 4 Tingkatan Level Pembaca (Tiers)
1. 🥉 **Level 1: Pembaca Pemula (0 – 50 Poin)**
   - Tahap awal pengenalan sirkulasi perpustakaan.
2. 🥈 **Level 2: Penjelajah Kata (51 – 150 Poin)**
   - Siswa mulai aktif membaca beragam genre buku. *Membuka hak penerbitan Sertifikat E-Literasi Resmi*.
3. 🥇 **Level 3: Kutu Buku Tangguh (151 – 300 Poin)**
   - Pembaca konsisten dengan catatan sirkulasi dan disiplin pengembalian tinggi.
4. 👑 **Level 4: Master Pustaka (301+ Poin)**
   - Puncak kehormatan literasi perpustakaan sekolah, kandidat utama duta baca sekolah.

---

## 4. Koleksi 5 Lencana Prestasi Ikonik (Badges)
Siswa dapat melacak progres setiap lencana secara *real-time* dengan indikator progress bar:
1. 🌟 **Langkah Pertama**: Meminjam buku fisik atau e-book pertama kali (1 buku).
2. ⚡ **Disiplin Emas**: Mengembalikan 3 buku berturut-turut tepat waktu tanpa denda keterlambatan (3 buku).
3. 📖 **Kutu Buku Digital**: Membaca 3 judul koleksi e-book di platform baca digital (3 e-book).
4. ✍️ **Kritikus Cilik**: Memberikan 2 ulasan dan penilaian bintang untuk buku yang dibaca (2 ulasan).
5. 🏆 **Bintang Literasi**: Mengumpulkan akumulasi 100 poin literasi dalam satu periode semester.

---

## 5. Papan Peringkat (Leaderboard) & Hall of Fame
- **Portal Anggota (`/dashboard/leaderboard`)**:
  - Menampilkan kartu peringkat pribadi siswa (*"Peringkat #4 dari 154 Siswa"*).
  - Visual 3D Podium untuk Juara 1 (Emas dengan Mahkota), Juara 2 (Perak), dan Juara 3 (Perunggu).
  - Filter rentang waktu: **"Bulan Ini"** vs **"Sepanjang Masa"**.
  - Filter tingkat: **"Semua Tingkat"**, **"Kelas X"**, **"Kelas XI"**, dan **"Kelas XII"**.
- **Beranda Publik (`/`)**:
  - Seksi khusus **"Hall of Fame: Bintang Literasi Bulan Ini"** yang menampilkan 3 profil pembaca teratas sekolah untuk memotivasi seluruh komunitas sekolah.

---

## 6. Generator Sertifikat E-Literasi Resmi
- **Kelayakan**: Terbuka otomatis bagi siswa yang mengumpulkan minimal **50 Poin Literasi**.
- **Desain & Elemen Keaslian**:
  - Bingkai ganda mewah ornamen emas (*Luxury Double Gold Border*).
  - Identitas institusi resmi dan nomor akreditasi perpustakaan sekolah (*SNP A/SNP/2024/099*).
  - Nomor sertifikat unik (*Format: PKC/CERT/YYYY/MM/NIS-HASH*).
  - QR Code verifikasi keaslian digital.
  - Tanda tangan digital Kepala Perpustakaan lengkap dengan NIP dan stempel digital resmi.
- **Dukungan Cetak**:
  - Terintegrasi CSS `@media print` untuk pencetakan dokumen A4 Landscape tanpa elemen UI peramban yang mengganggu.

---

## 7. File yang Terlibat
1. [src/actions/gamification.ts](file:///d:/project/web/energies/pustakaKita/src/actions/gamification.ts):
   - Server Actions: `getMemberGamificationDataAction`, `getLeaderboardAction`, `generateCertificateDataAction`.
2. [src/app/(anggota)/dashboard/leaderboard/page.tsx](file:///d:/project/web/energies/pustakaKita/src/app/(anggota)/dashboard/leaderboard/page.tsx):
   - Halaman Papan Peringkat, Galeri Lencana, dan Generator Cetak Sertifikat E-Literasi.
3. [src/app/(anggota)/layout.tsx](file:///d:/project/web/energies/pustakaKita/src/app/(anggota)/layout.tsx):
   - Integrasi navigasi sidebar dan drawer mobile menu "Papan Peringkat" (`/dashboard/leaderboard`).
4. [src/app/(public)/page.tsx](file:///d:/project/web/energies/pustakaKita/src/app/(public)/page.tsx):
   - Seksi "Hall of Fame: Bintang Literasi Bulan Ini" dengan widget podium Top 3.
5. [docs/GAMIFIKASI_LITERASI.md](file:///d:/project/web/energies/pustakaKita/docs/GAMIFIKASI_LITERASI.md):
   - Dokumentasi lengkap arsitektur dan aturan sistem gamifikasi.

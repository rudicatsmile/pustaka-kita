# Dokumentasi Fitur: Digital Reading Club & Forum Diskusi Resensi Buku

## 1. Ringkasan Fitur
**Digital Reading Club & Forum Diskusi Resensi Buku** adalah ruang interaksi sosial literasi (*social reading platform*) pada aplikasi **PustakaKita Ceria**. Fitur ini mengubah pengalaman membaca pasif menjadi kegiatan komunitas yang saling menginspirasi melalui bedah buku tematik bulanan, tantangan membaca berhadiah lencana, penulisan resensi berating bintang, kutipan emas (*favorite quotes*), proteksi spoiler alur cerita, serta panel moderasi pustakawan dengan fitur penyematan *Editor's Pick*.

---

## 2. Masalah yang Diselesaikan & Dampak Positif
| Tantangan Membaca Tradisional | Solusi Digital Reading Club | Dampak & Nilai Tambah |
| :--- | :--- | :--- |
| **Membaca Bersifat Soliter**: Siswa membaca buku sendirian tanpa wadah untuk mengekspresikan pemikiran atau bertanya tentang alur cerita. | **Klub Membaca & Feed Resensi Terpusat**: Siswa dapat membaca bersama buku pilihan bulanan, membagikan kutipan favorit, dan saling memberi *Like*. | Membangun komunitas literasi yang aktif, inklusif, dan saling mengapresiasi antar siswa. |
| **Buku Bagus Kurang Terkenal**: Siswa kesulitan memilih buku berkualitas karena tidak ada ulasan dari teman sebayanya. | **Ulasan & Rating Bintang di Detail Buku**: Menampilkan ulasan autentik, skor bintang (1-5 ⭐), dan resensi terbaik pilihan pustakawan. | Mempermudah penemuan buku berkualitas (*book discovery*) dan meningkatkan sirkulasi koleksi. |
| **Bocoran Cerita (Spoiler) Mengganggu**: Siswa enggan membaca ulasan karena takut akhir cerita terbongkar. | **Fitur Proteksi Spoiler Interaktif**: Konten ulasan yang ditandai spoiler disembunyikan sampai pembaca menekan tombol konfirmasi. | Pengalaman membaca tetap terjaga dan diskusi alur cerita dapat dilakukan secara bebas dan sopan. |

---

## 3. Komponen & Fungsionalitas Utama

### A. Forum Resensi & Kutipan di Detail Buku ([/katalog/[slug]](file:///d:/project/web/energies/pustakaKita/src/components/katalog/book-detail-client.tsx))
1. **Rata-Rata Rating Komunitas**:
   - Menghitung rata-rata skor bintang (misal: ⭐ 4.8 / 5.0) dari seluruh pembaca yang telah memposting ulasan.
2. **Form Tulis Resensi Interaktif**:
   - Pemilihan rating 1 hingga 5 bintang interaktif.
   - Kolom narasi resensi dan sudut pandang pembaca.
   - Kolom **Kutipan Emas Favorit** (*Quote of the Book*) dengan tipografi klasik khas sastra.
   - Kotak centang **Proteksi Spoiler** (*Spoiler Alert*).
   - Reward otomatis **+5 Poin Gamifikasi** dan progres menuju Lencana *"Kritikus Cilik"*.
3. **Penyematan Resensi Terbaik (Editor's Pick)**:
   - Resensi berbobot yang disematkan pustakawan mendapatkan bingkai emas dan lencana kehormatan *"Pilihan Pustakawan"*.
4. **Tombol Apresiasi (Like 👍)**:
   - Setiap siswa dapat memberikan like pada ulasan yang dianggap bermanfaat.

### B. Portal Klub Membaca Siswa ([/dashboard/klub](file:///d:/project/web/energies/pustakaKita/src/app/%28anggota%29/dashboard/klub/page.tsx))
1. **Banner Buku Pilihan Bulanan (Featured Book)**:
   - Menampilkan tema bulanan (contoh: *"Bulan Sastra & Sejarah Nusantara"*), buku pilihan, deskripsi misi, dan indikator progres partisipasi siswa (contoh: 48 dari 60 siswa telah membaca).
2. **Tab 1: Feed Resensi Terhangat**:
   - Menampilkan aliran ulasan terbaru dan paling banyak disukai dari seluruh katalog buku sekolah.
3. **Tab 2: Tantangan Membaca Bulan Ini**:
   - 3 Target capaian: (1) Baca 1 buku bertema, (2) Tulis 1 resensi bermakna, (3) Beri like pada 3 resensi rekan lain.
   - Hadiah penyelesaian: Lencana Bintang Sastra dan **+25 Poin Gamifikasi**.
4. **Tab 3: Resensi Saya**:
   - Menghimpun seluruh resensi yang pernah ditulis siswa beserta total apresiasi (like) yang diterimanya dari seluruh sekolah.

### C. Panel Pengelolaan & Moderasi Staf ([/pustakawan/klub](file:///d:/project/web/energies/pustakaKita/src/app/%28staff%29/pustakawan/klub/page.tsx))
1. **Pengaturan Tema Klub Bulanan**:
   - Form pembaruan periode bulan, tema literasi, judul buku pilihan, penulis, dan target peserta.
2. **Tabel Moderasi Resensi Lengkap**:
   - Pustakawan dapat memantau seluruh ulasan masuk secara terpusat.
   - Tombol **"Sematkan Resensi Terbaik (Editor's Pick)"** untuk menonjolkan tulisan siswa yang berbobot.
   - Tombol **"Hapus / Moderasi Ulasan"** untuk menindak komentar yang tidak pantas dengan pencatatan audit log.

---

## 4. File yang Terlibat
1. [src/actions/club.ts](file:///d:/project/web/energies/pustakaKita/src/actions/club.ts):
   - Server Actions: `getReadingClubDataAction`, `getBookReviewsAction`, `submitBookReviewAction`, `toggleLikeReviewAction`, `togglePinBestReviewAction`, `deleteOrModerateReviewAction`, dan `updateMonthlyClubChallengeAction`.
2. [src/components/katalog/book-detail-client.tsx](file:///d:/project/web/energies/pustakaKita/src/components/katalog/book-detail-client.tsx):
   - Integrasi seksi Resensi Pembaca, Rating Bintang, Kutipan Emas, dan Spoiler Protection pada halaman detail buku katalog.
3. [src/app/(anggota)/dashboard/klub/page.tsx](file:///d:/project/web/energies/pustakaKita/src/app/(anggota)/dashboard/klub/page.tsx):
   - Halaman Klub Membaca Siswa: Banner tema bulanan, Feed resensi, Tantangan literasi berhadiah lencana, dan Arsip resensi pribadi.
4. [src/app/(staff)/pustakawan/klub/page.tsx](file:///d:/project/web/energies/pustakaKita/src/app/(staff)/pustakawan/klub/page.tsx):
   - Panel Pustakawan: Pengaturan tema bulanan, penyematan Editor's Pick, dan moderasi komunitas.
5. [src/app/(anggota)/layout.tsx](file:///d:/project/web/energies/pustakaKita/src/app/(anggota)/layout.tsx):
   - Penambahan menu navigasi *"Klub Membaca"* dengan badge *"Klub"*.
6. [src/app/(staff)/layout.tsx](file:///d:/project/web/energies/pustakaKita/src/app/(staff)/layout.tsx):
   - Penambahan menu navigasi *"Klub & Resensi"* dengan badge *"Diskusi"*.
7. [docs/DIGITAL_READING_CLUB.md](file:///d:/project/web/energies/pustakaKita/docs/DIGITAL_READING_CLUB.md):
   - Dokumentasi teknis platform sosial klub membaca.

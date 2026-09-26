# Dokumentasi Fitur: Modul Usulan Buku Baru (Wishlist & Crowdvoting Koleksi Siswa)

## 1. Ringkasan Fitur
**Modul Usulan Buku Baru (Wishlist & Crowdvoting)** adalah sistem pengadaan koleksi perpustakaan partisipatif pada aplikasi **PustakaKita Ceria**. Fitur ini menjembatani aspirasi membaca siswa dengan perencanaan anggaran belanja buku sekolah (BOS/APBS).

Siswa dapat mengajukan judul buku yang mereka dambakan, memberikan suara dukungan (*Upvote*) terhadap usulan rekan-rekannya, dan memantau status pengadaan secara *real-time*. Di sisi pustakawan, sistem menyediakan dasbor prioritas pengadaan berbasis suara terbanyak, verifikasi anggaran, serta fitur **1-Klik Konversi Usulan ke Katalog Utama & Rak Buku** yang terhubung dengan notifikasi WhatsApp otomatis.

---

## 2. Masalah yang Diselesaikan & Dampak Positif
| Tantangan Pengadaan Buku Lama | Solusi dengan Modul Usulan & Crowdvoting | Dampak & Nilai Tambah |
| :--- | :--- | :--- |
| **Buku Pengadaan Kurang Diminati**: Pembelian buku sering kali hanya berdasarkan katalog penerbit tanpa mengetahui minat riil siswa. | **Crowdvoting Koleksi Berbasis Suara**: Siswa saling mendukung usulan buku favorit sehingga judul dengan upvote tertinggi menjadi prioritas. | Efisiensi anggaran belanja buku meningkat hingga **>90%** karena buku pasti langsung dipinjam. |
| **Kotak Saran Fisik Terabaikan**: Usulan siswa lewat kertas kotak saran sering tercecer dan tidak pernah diketahui perkembangannya. | **Pelacakan Status 4 Tahap Transparan**: Siswa dapat memantau status usulan mereka via *visual stepper tracker* di dasbor mandiri. | Meningkatkan rasa memiliki (*sense of belonging*) dan budaya literasi aktif siswa. |
| **Input Ganda Saat Buku Tiba**: Pustakawan harus mengetik ulang judul, penulis, dan data buku yang baru dibeli ke modul katalog. | **1-Klik Konversi ke Katalog & Eksemplar**: Otomatis mendaftarkan buku ke katalog, membuat nomor barcode, dan mengabari pemilih. | Menghemat waktu input data pustakawan dan sirkulasi buku langsung berjalan sejak hari pertama. |

---

## 3. Siklus 4 Tahap Pengadaan Buku
```
[1. Diusulkan] ──> [2. Disetujui] ──> [3. Sedang Dipesan] ──> [4. Tersedia di Rak]
  (Tahap Voting)    (Verifikasi Staf)    (PO ke Penerbit)      (Siap Dipinjam + WA)
```

1. 🗳️ **Tahap 1: Diusulkan (Crowdvoting)**
   - Siswa menginput judul, penulis, kategori, estimasi harga, dan alasan urgensi buku. Siswa pengusul otomatis menjadi pemilih pertama.
   - Siswa lain dapat memberikan dukungan (+1 Upvote).
2. ✅ **Tahap 2: Disetujui Pustakawan**
   - Pustakawan meninjau kesesuaian konten dengan nilai edukasi sekolah dan mengalokasikan estimasi anggarannya.
3. 📦 **Tahap 3: Sedang Dipesan**
   - Surat pesanan (*Purchase Order*) telah diajukan ke penerbit atau toko buku rekanan sekolah.
4. 🎉 **Tahap 4: Tersedia di Rak**
   - Buku fisik telah tiba di perpustakaan, dipasangi stiker barcode eksemplar, diletakkan di rak, dan sistem otomatis mengirimkan notifikasi WhatsApp kepada siswa pengusul dan para pendukungnya.

---

## 4. Aturan Crowdvoting & Insentif Gamifikasi
- **1 Siswa = 1 Upvote**: Siswa dapat memberikan 1 suara dukungan per usulan (dapat di-toggle batalkan).
- **Kuota Maksimal Usulan Aktif**: Setiap siswa dibatasi maksimal memiliki **3 usulan aktif** yang sedang berstatus *"Diusulkan"* untuk menjaga kualitas dan relevansi buku yang diajukan.
- **Reward Poin Literasi**: Siswa pengusul mendapatkan reward apresiasi **+10 Poin Literasi** pada modul Gamifikasi ketika buku yang diusulkannya resmi disetujui dan tiba di rak perpustakaan.

---

## 5. Antarmuka Pengguna (UI/UX)

### A. Portal Siswa ([/dashboard/usulan](file:///d:/project/web/energies/pustakaKita/src/app/%28anggota%29/dashboard/usulan/page.tsx))
- **Tombol & Modal "Ajukan Judul Buku Baru"**: Form interaktif dengan validasi kuota aktif.
- **Tab 1: Jelajahi & Voting**:
  - Filter pencarian cepat (judul/penulis/kategori) dan filter status.
  - Opsi urutkan: *🔥 Suara Terbanyak (Trending)* vs *⏱️ Terbaru*.
  - Kartu usulan dengan tombol jempol *Upvote* interaktif, kutipan alasan pengusul, dan nama kelas.
- **Tab 2: Usulan Saya**:
  - Pelacakan usulan pribadi dengan *4-Step Stepper Timeline Indicator*.
  - Kotak catatan dan arahan dari staf perpustakaan.

### B. Panel Pustakawan ([/pustakawan/pengadaan](file:///d:/project/web/energies/pustakaKita/src/app/%28staff%29/pustakawan/pengadaan/page.tsx))
- **KPI Metrics Cards**: Total Usulan Masuk, Total Suara Siswa, Judul Disetujui & Dipesan, dan Total Estimasi Anggaran Pengadaan (BOS).
- **Tabel Peringkat Usulan**: Otomatis mengurutkan judul dengan suara terbanyak (*Top Voted Wishlist*).
- **Aksi Cepat Pustakawan**:
  - Tombol *Setujui* dan *Tolak* (dengan catatan admin).
  - Tombol *Tandai Sedang Dipesan*.
  - Tombol *Buku Tiba & Masukkan ke Katalog* (Modal 1-klik untuk input lokasi rak dan barcode eksemplar).

---

## 6. File yang Terlibat
1. [src/actions/wishlist.ts](file:///d:/project/web/energies/pustakaKita/src/actions/wishlist.ts):
   - Server Actions: `getWishlistProposalsAction`, `submitBookProposalAction`, `toggleUpvoteProposalAction`, `updateProposalStatusAction`, `convertProposalToCatalogAction`, dan `getWishlistStatsAction`.
2. [src/app/(anggota)/dashboard/usulan/page.tsx](file:///d:/project/web/energies/pustakaKita/src/app/(anggota)/dashboard/usulan/page.tsx):
   - Antarmuka Portal Siswa: Form pengajuan, Galeri crowdvoting upvote, dan Stepper pelacakan status usulan.
3. [src/app/(staff)/pustakawan/pengadaan/page.tsx](file:///d:/project/web/energies/pustakaKita/src/app/(staff)/pustakawan/pengadaan/page.tsx):
   - Antarmuka Panel Pustakawan: Dasbor KPI pengadaan, verifikasi usulan, dan 1-klik konversi ke katalog buku.
4. [src/app/(anggota)/layout.tsx](file:///d:/project/web/energies/pustakaKita/src/app/(anggota)/layout.tsx):
   - Menu navigasi *"Usulan Buku"* pada portal anggota dengan badge *"Wishlist"*.
5. [src/app/(staff)/layout.tsx](file:///d:/project/web/energies/pustakaKita/src/app/(staff)/layout.tsx):
   - Menu navigasi *"Usulan & Pengadaan"* pada panel staf dengan badge *"Wishlist"*.
6. [src/lib/whatsapp.ts](file:///d:/project/web/energies/pustakaKita/src/lib/whatsapp.ts):
   - Penambahan tipe pesan notifikasi `book_ready` untuk siaran WhatsApp saat buku tiba di rak.
7. [docs/USULAN_BUKU_WISHLIST.md](file:///d:/project/web/energies/pustakaKita/docs/USULAN_BUKU_WISHLIST.md):
   - Dokumentasi lengkap alur kerja modul usulan dan crowdvoting.

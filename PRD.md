# PustakaKitaCeria

---

## 1. Ringkasan & Tujuan Aplikasi
*Bagian ini menjelaskan gambaran umum proyek agar dipahami bersama oleh pemilik ide/klien dan tim pengembang.*
- **Nama Aplikasi**: PustakaKitaCeria
- **Penjelasan Singkat**: PustakaKitaCeria adalah sistem perpustakaan digital terpadu untuk sekolah & kampus yang menghadirkan pengalaman "ceria" dalam mengelola koleksi buku — mulai dari pencarian katalog online (OPAC), peminjaman dengan scan barcode, e-book reader langsung di browser, perhitungan denda keterlambatan otomatis, hingga notifikasi WhatsApp pengingat jatuh tempo.
- **Masalah yang Diselesaikan**:
  - Proses peminjaman manual di perpustakaan sekolah/kampus masih lambat, rawan salah catat, dan menyulitkan pelaporan.
  - Anggota sulit mengetahui ketersediaan buku, riwayat pinjaman, dan besaran denda tanpa harus datang ke perpustakaan.
  - Perhitungan denda keterlambatan sering tidak konsisten dan tidak transparan akibat dilakukan manual.
  - Koleksi digital (e-book) yang dimiliki perpustakaan belum terintegrasi dan sulit diakses anggota.
  - Pustakawan tidak memiliki alat audit yang kuat untuk melacak perubahan data buku, eksemplar, dan transaksi.
  - Komunikasi pengingat jatuh tempo tidak berjalan otomatis sehingga tingkat keterlambatan tinggi.
- **Pengguna Aplikasi**:
  - **Anggota (Siswa/Mahasiswa)**: Mencari buku, melakukan reservasi, meminjam buku dengan scan barcode, membaca e-book, mengecek riwayat pinjaman & denda, serta melunasi denda via transfer manual.
  - **Pustakawan**: Mengelola buku, eksemplar, sirkulasi (pinjam/kembali), keanggotaan, verifikasi pembayaran denda, dan melihat laporan.
  - **Admin/Super Admin**: Mengelola akun pengguna, konfigurasi sistem (denda, durasi pinjam), audit log, dan integrasi WhatsApp Gateway.
  - **Pengunjung Publik**: Melihat katalog buku tanpa login (mode OPAC terbuka) sebagai bahan pertimbangan sebelum mendaftar menjadi anggota.
- **Target Keberhasilan**:
  - Proses peminjaman dan pengembalian buku selesai kurang dari 30 detik per transaksi dengan akurasi barcode 100%.
  - Pencatatan denda keterlambatan otomatis 100% akurat sesuai durasi pinjam dan tarif per hari.
  - Minimal 80% anggota aktif menggunakan fitur pengingat WhatsApp untuk menekan keterlambatan.
  - Minimal 50% koleksi fisik memiliki padanan e-book yang dapat diakses di dalam aplikasi.
  - Laporan bulanan perpustakaan dapat digenerate otomatis kapan pun dibutuhkan (tanpa rekap manual).
  - Setiap perubahan data sensitif (buku, eksemplar, denda, anggota) tercatat lengkap di audit log dan dapat dilacak per pelaku.

---

## 2. Batasan Pembuatan Sistem (Versi Awal MVP)
*Menegaskan fitur apa yang dikerjakan di versi awal dan apa yang sengaja ditunda agar aplikasi cepat selesai dan tidak membengkak (mencegah scope creep).*

### ✅ Yang Dikerjakan:
- Autentikasi login anggota menggunakan **NIS/NIM & Password** dengan registrasi mandiri (verifikasi email/WA untuk aktivasi).
- Pencarian katalog buku publik (OPAC) dengan filter kategori, penulis, tahun terbit, dan ketersediaan.
- Halaman detail buku dengan sinopsis, lokasi rak, jumlah eksemplar tersedia, dan tombol reservasi.
- Manajemen buku & eksemplar oleh pustakawan (CRUD lengkap + generate kode barcode eksemplar).
- Sirkulasi peminjaman & pengembalian dengan scan barcode (kamera/gawai) maupun input manual kode eksemplar.
- Halaman **Scan Barcode Mandiri** untuk anggota (self-checkout pinjam & self-return).
- Perhitungan denda keterlambatan otomatis berdasarkan tarif harian & durasi pinjam.
- Alur **pembayaran denda via Transfer Manual**: upload bukti transfer + verifikasi manual oleh pustakawan.
- E-book Reader built-in (mendukung PDF & EPUB) dengan progress membaca tersimpan.
- Reservasi buku saat stok habis (antrean + notifikasi WhatsApp saat buku tersedia).
- Notifikasi WhatsApp Gateway untuk: pengingat H-1 jatuh tempo, keterlambatan, denda baru, dan buku siap diambil.
- Manajemen anggota & keanggotaan (aktivasi, penonaktifan, lulus/keluar, cetak kartu anggota digital).
- Laporan & statistik (buku terpopuler, peminjaman per periode, keterlambatan, pendapatan denda).
- **Audit log** menyeluruh pada entitas buku, eksemplar, sirkulasi, denda, dan anggota.

### ⛔ Yang Tidak Dikerjakan di Versi Awal:
- Integrasi ke sistem akademik/SIAKAD sekolah/kampus (sinkronisasi data siswa otomatis).
- Payment gateway online (Midtrans/Xendit dll.) — pelunasan denda hanya via Transfer Manual di MVP.
- Aplikasi mobile native (Android/iOS) — MVP fokus Web Responsive PWA-ready.
- Fitur komunitas (ulasan publik, forum diskusi buku, gamifikasi badge pembaca).
- Multi-perpustakaan (multi-tenant) dalam satu instalasi.
- Rekomendasi buku berbasis machine learning.
- SSO (Login Google/Microsoft) — MVP hanya NIS/NIM & Password.
- Fitur cetak label barcode fisik massal (cetak via printer barcode khusus) — hanya generate kode & preview label.

---

## 3. Daftar Halaman & Struktur Menu (Pages & Routing)
*Daftar lengkap halaman yang harus dibuat, dikelompokkan berdasarkan area atau peran pengguna (Role).*

### A. Public Area (Tanpa Login)
- `/` (Beranda): Hero dengan pencarian cepat, koleksi unggulan, statistik perpustakaan, CTA daftar anggota.
- `/katalog` (OPAC — Katalog Publik): Pencarian & filter buku (kategori, penulis, tahun, ketersediaan), daftar grid buku dengan cover.
- `/katalog/[slug]` (Detail Buku): Sinopsis, info rak, jumlah eksemplar, tombol reservasi (jika login), tombol baca e-book (jika anggota).
- `/tentang` (Tentang Perpustakaan): Profil, jam operasional, visi misi, kontak.
- `/panduan` (Panduan Anggota): Cara daftar, cara pinjam, aturan denda, cara pakai scan barcode.
- `/kontak` (Kontak & Lokasi): Form kontak, peta, info WhatsApp perpustakaan.
- `/daftar` (Registrasi Anggota): Form registrasi NIS/NIM + data diri + password + nomor WhatsApp.
- `/masuk` (Login Anggota): Form login NIS/NIM & password.
- `/lupa-password`: Alur reset password via NIS/NIM + verifikasi WhatsApp/email.
- `/kebijakan-privasi` & `/syarat-ketentuan`: Dokumen legal.

### B. Member / Anggota Area (Setelah Login)
- `/dashboard` (Dasbor Anggota): Kartu ringkasan (buku dipinjam, jatuh tempo terdekat, total denda), shortcut fitur.
- `/dashboard/katalog` (Katalog Anggota): OPAC versi login dengan tombol pinjam/reservasi langsung.
- `/dashboard/riwayat` (Riwayat Peminjaman): Timeline peminjaman (aktif, selesai, terlambat), tombol perpanjang & tombol lihat denda.
- `/dashboard/reservasi` (Reservasi Saya): Daftar buku yang direservasi, status antrean, estimasi ketersediaan.
- `/dashboard/scan` (Scan Barcode Mandiri): Kamera untuk self-checkout peminjaman & self-return pengembalian.
- `/dashboard/ebook` (Koleksi E-Book Saya): Daftar e-book yang dapat diakses, progress membaca.
- `/dashboard/ebook/[id]/baca` (E-Book Reader): Reader PDF/EPUB dengan buku mark, zoom, progress auto-save.
- `/dashboard/denda` (Status Denda & Pembayaran): Rincian denda per transaksi, tombol upload bukti transfer, riwayat pembayaran.
- `/dashboard/denda/[id]/bayar` (Form Upload Bukti Transfer): Info rekening tujuan, upload foto bukti, konfirmasi nominal.
- `/dashboard/profil` (Profil & Pengaturan): Edit data diri, ganti password, setting notifikasi WhatsApp.
- `/dashboard/kartu` (Kartu Anggota Digital): Tampilan kartu dengan QR/barcode untuk ditunjukkan di perpustakaan.

### C. Pustakawan / Staff Area (Setelah Login Role Pustakawan)
- `/pustakawan` (Dasbor Pustakawan): Statistik hari ini (pinjam, kembali, terlambat, denda masuk).
- `/pustakawan/buku` (Manajemen Buku): Tabel CRUD buku (bibliografi) + filter kategori & pencarian.
- `/pustakawan/buku/baru` (Tambah Buku): Form bibliografi lengkap + upload cover.
- `/pustakawan/buku/[id]` (Edit Buku & Eksemplar): Tab Info Buku, Tab Daftar Eksemplar (generate barcode), Tab File E-Book.
- `/pustakawan/eksemplar` (Manajemen Eksemplar): Tabel semua eksemplar dengan status & lokasi rak.
- `/pustakawan/sirkulasi` (Sirkulasi Pinjam/Kembali): Panel gabungan — input NIS/NIM anggota + scan barcode buku.
- `/pustakawan/sirkulasi/pinjam` (Form Peminjaman): Pilih anggota, scan eksemplar, konfirmasi jatuh tempo.
- `/pustakawan/sirkulasi/kembali` (Form Pengembalian): Scan eksemplar → sistem cek keterlambatan & denda otomatis.
- `/pustakawan/reservasi` (Kelola Reservasi): Daftar reservasi menunggu, tandai siap diambil, notifikasi WA.
- `/pustakawan/denda` (Verifikasi Denda): Tabel denda menunggu verifikasi, lihat bukti transfer, approve/reject.
- `/pustakawan/anggota` (Manajemen Anggota): Tabel anggota + filter status keanggotaan, detail riwayat pinjam.
- `/pustakawan/laporan` (Laporan & Statistik): Kartu ringkasan + grafik + tabel data (ekspor CSV/PDF).
- `/pustakawan/laporan/peminjaman`: Laporan peminjaman per periode.
- `/pustakawan/laporan/keterlambatan`: Laporan keterlambatan & denda.
- `/pustakawan/laporan/koleksi`: Laporan koleksi (buku terpopuler, eksemplar rusak).

### D. Admin / Super Admin Area (Setelah Login Role Admin)
- `/admin` (Dasbor Admin): Overview sistem, jumlah user, aktivitas audit terbaru.
- `/admin/pengguna` (Manajemen Pengguna): CRUD user (anggota + pustakawan + admin), reset password, aktif/nonaktif.
- `/admin/kategori` (Manajemen Kategori): CRUD kategori buku.
- `/admin/pengaturan` (Pengaturan Sistem): Durasi pinjam default, tarif denda per hari, maks buku per anggota, template WhatsApp, rekening transfer tujuan.
- `/admin/whatsapp` (Konfigurasi WhatsApp Gateway): API key, nomor pengirim, uji kirim pesan, log notifikasi.
- `/admin/audit-log` (Audit Log): Tabel lengkap audit log dengan filter (user, entitas, tanggal, aksi) + diff old/new value.
- `/admin/notifikasi` (Pusat Notifikasi): Queue & log pengiriman WhatsApp, retry manual.

---

## 4. Pedoman UI/UX & Design System
*Panduan visual konkret agar AI coding assistant tidak membuat UI yang kaku atau default.*

- **Skema Warna**:
  - **Light Mode**:
    - Primary (Teal Ceria — warna utama branding): `HSL(174, 72%, 38%)`
    - Primary Foreground: `HSL(0, 0%, 100%)`
    - Secondary (Amber Hangat — aksen tombol sekunder & highlight): `HSL(38, 92%, 50%)`
    - Secondary Foreground: `HSL(30, 45%, 15%)`
    - Accent (Coral Ramah — badge & icon dekoratif): `HSL(12, 76%, 61%)`
    - Background (Putih Hangat — nyaman dibaca lama): `HSL(40, 33%, 98%)`
    - Foreground (Ink Dark): `HSL(200, 20%, 15%)`
    - Muted: `HSL(40, 20%, 94%)`
    - Muted Foreground: `HSL(200, 10%, 45%)`
    - Border: `HSL(40, 15%, 88%)`
    - Ring (Focus): `HSL(174, 72%, 38%)`
    - Destructive (Denda/Terlambat): `HSL(0, 72%, 51%)`
    - Success (Tersedia/Lunas): `HSL(142, 65%, 42%)`
    - Warning (Akan Jatuh Tempo): `HSL(38, 92%, 50%)`
  - **Dark Mode**:
    - Primary: `HSL(174, 65%, 55%)`
    - Background: `HSL(200, 25%, 8%)`
    - Foreground: `HSL(40, 20%, 96%)`
    - Border: `HSL(200, 15%, 20%)`
- **Tipografi**:
  - **Heading**: `Plus Jakarta Sans` (yang weight 600 & 700) — modern, hangat, ramah, dan identitas lokal Indonesia.
  - **Body**: `Inter` (weight 400 & 500) — sangat terbaca untuk paragraf panjang & tabel data.
  - **Mono (kode barcode/NIS)**: `JetBrains Mono` — untuk menampilkan NIS/NIM dan kode eksemplar.
  - Skala: `text-sm` (14px) base UI, `text-base` (16px) body konten, `text-3xl`–`text-5xl` untuk hero.
- **Aturan Komponen**:
  - Sudut membulat konsisten: `rounded-2xl` untuk card utama, `rounded-xl` untuk tombol & input, `rounded-full` untuk avatar & badge status.
  - Shadow: `shadow-sm` untuk card diam, `shadow-md` saat hover, `shadow-lg` untuk modal & floating bar.
  - Spacing: gap antar section `py-16` di desktop, `py-10` di mobile. Jarak antar elemen `gap-4` standar, `gap-6` di form.
  - Status Badge warna: 🟢 Tersedia/Lunas (success), 🟡 Akan Jatuh Tempo/Menunggu Verifikasi (warning), 🔴 Terlambat/Belum Bayar (destructive), 🔵 Dipinjam (primary), ⚪ Selesai (muted).
  - Tombol: 3 varian utama — `default` (primary teal), `secondary` (amber), `outline` (border teal). Semua tombol aksi destruktif tetap destructive.
  - Form: label di atas input, error message warna destructive `text-sm`, wajib ada placeholder berbahasa Indonesia yang jelas.
  - Tabel: header sticky, zebra row subtle, kolom aksi di kanan dengan Dropdown menu (Edit, Hapus, Detail). Gunakan `DataTable` shadcn/ui.
  - Empty State: setiap halaman kosong wajib punya ilustrasi + CTA jelas (bukan teks polos).
  - Loading: skeleton loading (bukan spinner full-screen) untuk pengalaman premium.
- **Nuansa & Vibe**:
  - **"Ceria, Ramah, Terpercaya"** — hangat seperti perpustakaan yang ramai dikunjungi, namun profesional untuk data akademik.
  - Banyak whitespace, sudut rounded, micro-animation halus (`transition-all duration-200`) saat hover & page transition.
  - Ilustrasi bergaya flat modern (buku, rak, pembaca) di hero & empty state.
  - Barcode scanner overlay memiliki animasi garis scan & corner brackets agar terasa premium.
  - Gunakan emoji sparingly pada copywriting (📚 ✨ 🎉) untuk nuansa ceria tanpa terkesan kekanak-kanakan.

---

## 5. Pembagian Hak Akses Pengguna
*Tabel hak akses yang menentukan siapa saja yang boleh melihat, mengedit, atau mengelola data.*

| Menu / Halaman | Publik (Tanpa Login) | Anggota (Login) | Pustakawan | Admin / Super Admin |
| :--- | :---: | :---: | :---: | :---: |
| Beranda `/` | ✅ | ✅ | ✅ | ✅ |
| Katalog OPAC `/katalog` | ✅ | ✅ | ✅ | ✅ |
| Detail Buku `/katalog/[slug]` | ✅ | ✅ | ✅ | ✅ |
| Panduan & Kontak | ✅ | ✅ | ✅ | ✅ |
| Registrasi & Login | ✅ | ❌ | ❌ | ❌ |
| Dasbor Anggota `/dashboard` | ❌ | ✅ | ✅ | ✅ |
| Reservasi Buku | ❌ | ✅ | ✅ | ✅ |
| Scan Barcode Mandiri (Pinjam/Kembali) | ❌ | ✅ | ✅ | ✅ |
| Baca E-Book | ❌ | ✅ | ✅ | ✅ |
| Lihat & Bayar Denda (Upload Bukti) | ❌ | ✅ | ✅ | ✅ |
| Dasbor Pustakawan `/pustakawan` | ❌ | ❌ | ✅ | ✅ |
| Manajemen Buku & Eksemplar | ❌ | ❌ | ✅ | ✅ |
| Sirkulasi Pinjam/Kembali | ❌ | ❌ | ✅ | ✅ |
| Verifikasi Pembayaran Denda | ❌ | ❌ | ✅ | ✅ |
| Manajemen Anggota | ❌ | ❌ | ✅ | ✅ |
| Laporan & Statistik Perpustakaan | ❌ | ❌ | ✅ | ✅ |
| Manajemen Pengguna & Role | ❌ | ❌ | ❌ | ✅ |
| Pengaturan Sistem & Tarif Denda | ❌ | ❌ | ❌ | ✅ |
| Konfigurasi WhatsApp Gateway | ❌ | ❌ | ❌ | ✅ |
| Audit Log Sistem | ❌ | ❌ | ✅ (lihat) | ✅ (lihat + ekspor) |

---

## 6. Alur Kerja dan Fitur Utama
*Menjelaskan cara kerja setiap fitur utama dalam bahasa yang mudah dipahami serta aturan logikanya.*

### A. Autentikasi & Keanggotaan (NIS/NIM & Password)
1. **Cara Kerja**: Calon anggota membuka `/daftar`, mengisi NIS/NIM, nama lengkap, kelas/jurusan, email, nomor WhatsApp aktif, dan password. Sistem mengirim kode OTP via WhatsApp untuk verifikasi. Setelah terverifikasi, akun berstatus **aktif** dan anggota dapat login dengan NIS/NIM & password untuk mengakses seluruh fitur.
2. **Aturan Sistem**:
   - NIS/NIM wajib unik dan alfanumerik (panjang 5–20 karakter), divalidasi dengan Zod di server.
   - Password minimal 8 karakter, wajib mengandung huruf & angka, di-hash dengan `bcryptjs` (cost 12).
   - OTP WhatsApp berlaku 5 menit, maksimal 3 kali kirim ulang per jam (rate-limit).
   - Akun baru otomatis berstatus `aktif` jika verifikasi berhasil; pustakawan dapat mengubah status ke `ditangguhkan` atau `lulus` kapan saja.
   - Login gagal 5 kali berturut-turut → akun terkunci 15 menit (dicatat di audit log).

### B. OPAC (Online Public Access Catalog) & Reservasi Buku
1. **Cara Kerja**: Pengunjung/anggota mencari buku di `/katalog` menggunakan kata kunci (judul/penulis/ISBN) atau filter kategori/tahun/ketersediaan. Klik buku → halaman detail menampilkan sinopsis, lokasi rak, jumlah eksemplar tersedia. Jika eksemplar habis dan anggota sudah login, tombol **Reservasi** muncul. Setelah reservasi, anggota masuk antrean dan akan dinotifikasi via WhatsApp saat buku siap diambil (maks 2×24 jam sebelum kedaluwarsa).
2. **Aturan Sistem**:
   - Pencarian mendukung *full-text search* PostgreSQL pada kolom `title`, `author`, dan `isbn`.
   - Maksimal 3 reservasi aktif per anggota.
   - Reservasi kedaluwarsa otomatis jika tidak diambil dalam 2×24 jam; antrean berpindah ke anggota berikutnya + notifikasi WhatsApp.
   - Buku tipe `ebook` tidak dapat direservasi (langsung dibaca di reader).

### C. Sirkulasi Peminjaman & Pengembalian (Pustakawan)
1. **Cara Kerja**: Pustakawan membuka `/pustakawan/sirkulasi/pinjam`, memasukkan NIS/NIM anggota → data anggota muncul. Lalu scan barcode eksemplar via kamera (atau input manual). Sistem memvalidasi (stok tersedia, kuota pinjam belum tercapai, tidak ada denda tertunggak melebihi batas). Konfirmasi → transaksi tersimpan dengan jatuh tempo otomatis. Untuk pengembalian, pustakawan membuka `/pustakawan/sirkulasi/kembali`, scan barcode eksemplar → sistem menghitung keterlambatan + denda otomatis, ubah status eksemplar menjadi `tersedia`, dan generate tagihan denda jika telat.
2. **Aturan Sistem**:
   - Durasi pinjam default: **7 hari** (dapat dikonfigurasi Admin).
   - Maksimum pinjam: **3 buku** aktif per anggota.
   - Tarif denda default: **Rp 1.000 / hari / eksemplar** (dapat dikonfigurasi).
   - Perpanjangan (renewal) hanya 1× dan hanya jika **belum terlambat**.
   - Jika denda tertunggak > Rp 50.000 → anggota otomatis diblokir dari pinjam baru sampai denda dilunasi.
   - Eksemplar hilang/rusak → status diubah manual oleh pustakawan + generate tagihan penggantian.

### D. Scan Barcode Mandiri (Anggota)
1. **Cara Kerja**: Anggota membuka `/dashboard/scan`, mengizinkan akses kamera, lalu scan barcode eksemplar di belakang buku. Sistem langsung memvalidasi & menampilkan ringkasan peminjaman → tombol konfirmasi. Untuk pengembalian mandiri, anggota scan buku yang sedang dipinjam, sistem menghitung denda, dan transaksi tersimpan.
2. **Aturan Sistem**:
   - Menggunakan library `html5-qrcode` (kamera browser) — fallback input manual jika kamera gagal.
   - Validasi tetap di server: kuota, keterlambatan, dan denda dihitung otomatis.
   - Self-service hanya aktif jika Admin mengaktifkan opsi `self_checkout_enabled` di pengaturan sistem.
   - Setiap scan & transaksi dicatat di audit log dengan IP & user-agent.

### E. Perhitungan Denda Keterlambatan Otomatis
1. **Cara Kerja**: Sistem menjalankan *cronjob* harian (00:05 setiap hari) untuk memeriksa semua transaksi berstatus `dipinjam` yang melewati `due_date`. Sistem otomatis membuat/memperbarui record `fines` dengan `amount = days_late × fine_per_day`. Anggota menerima notifikasi WhatsApp bahwa denda bertambah. Denda juga secara real-time dihitung saat pengembalian dilakukan.
2. **Aturan Sistem**:
   - Tarif denda default `Rp 1.000/hari`, dapat diubah Admin di `/admin/pengaturan`.
   - Hari libur nasional dapat dikonfigurasi sebagai *hari bebas denda* (opsional).
   - Denda berhenti bertambah saat buku dikembalikan (frozen amount).
   - Denda tidak bisa dihapus, hanya dapat di-*waive* (dibebaskan) oleh Pustakawan/Admin dengan catatan alasan (wajib masuk audit log).

### F. Pelunasan Denda via Transfer Manual
1. **Cara Kerja**: Anggota membuka `/dashboard/denda`, melihat daftar denda belum bayar. Klik **Bayar via Transfer** → halaman menampilkan nomor rekening perpustakaan + nominal persis. Anggota transfer via mobile banking, simpan foto/screenshot bukti, lalu upload di `/dashboard/denda/[id]/bayar`. Status denda berubah menjadi **Menunggu Verifikasi**. Pustakawan membuka `/pustakawan/denda`, memeriksa bukti, lalu **approve** (status → Lunas, akun otomatis unblocked) atau **reject** (status balik ke Belum Bayar + catatan alasan).
2. **Aturan Sistem**:
   - File bukti transfer: JPG/PNG/PDF, maks 3 MB, diupload ke Supabase Storage.
   - Pustakawan dapat membebaskan denda penuh (`dibebaskan`) dengan alasan wajib diisi (contoh: kerusakan buku akibat force majeure).
   - Semua aksi approve/reject/release oleh pustakawan dicatat lengkap di `audit_logs`.
   - Notifikasi WhatsApp otomatis terkirim saat status denda berubah.

### G. E-Book Reader & Koleksi Digital
1. **Cara Kerja**: Anggota membuka `/dashboard/ebook`, memilih e-book, dan langsung masuk ke reader `/dashboard/ebook/[id]/baca`. Reader mendukung PDF & EPUB dengan fitur: navigasi halaman, zoom, bookmark halaman terakhir, mode baca malam, dan auto-save progress per 10 detik.
2. **Aturan Sistem**:
   - Format yang didukung: `.pdf` (react-pdf) & `.epub` (epub.js).
   - File e-book disimpan di Supabase Storage privat; akses via *signed URL* berlaku 1 jam.
   - Progress membaca tersimpan di tabel `ebook_progress` (`last_page`, `progress_percent`, `updated_at`).
   - Anggota hanya dapat membaca e-book yang dipinjam/dimiliki.

### H. Notifikasi WhatsApp Gateway
1. **Cara Kerja**: Sistem mengirim pesan WhatsApp otomatis via provider **Fonnte** (bisa diganti Wablas/WA Business API lain) untuk event: (1) OTP registrasi, (2) pengingat H-1 jatuh tempo, (3) keterlambatan + denda bertambah, (4) buku reservasi siap diambil, (5) denda lunas/menunggu verifikasi, (6) akun diaktifkan/ditangguhkan.
2. **Aturan Sistem**:
   - Semua pesan masuk ke tabel `notifications` dengan status `pending` → `terkirim`/`gagal`.
   - Retry otomatis 3× dengan exponential backoff untuk status `gagal`.
   - Template pesan dikustom oleh Admin di `/admin/whatsapp`.
   - Rate-limit: maks 1 pesan per nomor per menit, kecuali notifikasi kritis (OTP).

### I. Manajemen Buku & Eksemplar (Pustakawan)
1. **Cara Kerja**: Pustakawan menambah buku baru di `/pustakawan/buku/baru` (upload cover, isi metadata). Setelah tersimpan, buka tab "Eksemplar" untuk membuat N eksemplar dengan kode barcode unik dan lokasi rak. Setiap eksemplar memiliki status: `tersedia`, `dipinjam`, `rusak`, `hilang`, `perbaikan`.
2. **Aturan Sistem**:
   - ISBN divalidasi format (10/13 digit). Boleh kosong bila tidak tersedia.
   - Kode eksemplar di-generate format: `PKC-<KODE-BUKU>-<NOMOR-URUT>` (contoh: `PKC-2024-001-003`).
   - Setiap perubahan metadata buku/eksemplar dicatat lengkap di `audit_logs` (old_value & new_value JSONB).
   - Buku hanya dapat dihapus (soft delete) jika tidak ada transaksi aktif.

### J. Laporan & Statistik Perpustakaan
1. **Cara Kerja**: Pustakawan membuka `/pustakawan/laporan`, memilih periode (hari/minggu/bulan/custom). Sistem menampilkan: jumlah peminjaman, pengembalian, keterlambatan, buku terpopuler, anggota paling aktif, total denda terkumpul. Tombol **Ekspor** dapat menghasilkan CSV/PDF.
2. **Aturan Sistem**:
   - Data laporan di-cache 5 menit untuk performa.
   - Ekspor PDF menggunakan library `@react-pdf/renderer`.
   - Statistik grafik menggunakan `recharts`.

### K. Audit Log (Lintas Modul)
1. **Cara Kerja**: Setiap aksi CUD (Create/Update/Delete) pada entitas **buku, eksemplar, sirkulasi, denda, anggota** otomatis menulis satu baris di `audit_logs` dengan field: aktor, aksi, entitas, ID, deskripsi, nilai lama (JSONB), nilai baru (JSONB), IP, user-agent, timestamp. Admin/Pustakawan dapat memfilter di `/admin/audit-log`.
2. **Aturan Sistem**:
   - Audit log bersifat **append-only** (tidak dapat diubah/dihapus oleh siapa pun kecuali Admin dengan alasan jelas, dicatat kembali sebagai audit entry baru).
   - Retention minimum 2 tahun.
   - Setiap entry menyimpan `request_id` untuk melacak satu sesi request HTTP.
   - Filter wajib: rentang tanggal, aktor, jenis entitas, jenis aksi (`create`/`update`/`delete`/`waive`/`verify`).

---

## 7. Alur Navigasi & Arsitektur Layout
*Peta navigasi alur halaman dan struktur tata letak (layout).*

### Arsitektur Layout (Persisten)
- **Public Layout**: Header dengan logo PustakaKitaCeria, navigasi (Beranda, Katalog, Tentang, Panduan, Kontak), pencarian cepat, tombol Masuk/Daftar. Footer dengan info kontak, jam operasional, link kebijakan, dan mini-map.
- **Anggota Layout (Dashboard)**: Sidebar kiri (fixed, collapsible di mobile) berisi menu dasbor anggota, Header atas menampilkan notifikasi, avatar, dan quickscan. Bottom nav di mobile untuk shortcut utama.
- **Pustakawan/Admin Layout**: Sidebar kiri dengan grup menu (Katalog, Sirkulasi, Anggota, Denda, Laporan, Audit, Pengaturan), Header atas dengan pencarian global, notifikasi sistem, dan user menu.

### Bagan Alur (Flowchart)

```mermaid
flowchart TD
    A[Pengunjung] --> B[Beranda PustakaKitaCeria]
    B --> C{Sudah Punya Akun?}
    C -- Belum --> D[Registrasi NIS/NIM + Verifikasi OTP WhatsApp]
    C -- Sudah --> E[Login NIS/NIM & Password]
    D --> E
    E --> F{Role Pengguna?}
    F -- Anggota --> G[Dashboard Anggota]
    F -- Pustakawan --> H[Dashboard Pustakawan]
    F -- Admin --> I[Dashboard Admin]

    G --> G1[Cari Katalog OPAC]
    G --> G2[Riwayat & Jatuh Tempo]
    G --> G3[Scan Barcode Mandiri]
    G --> G4[Koleksi E-Book Reader]
    G --> G5[Status Denda & Pembayaran]

    G1 --> R1[Reservasi Buku]
    R1 --> R2[Buku Siap Diambil via WhatsApp]
    R2 --> S1[Ambil di Perpustakaan / Self-Checkout]

    G3 --> L1[Konfirmasi Pinjam / Kembali]
    L1 --> L2{Ada Keterlambatan?}
    L2 -- Ya --> F1[Generate Denda Otomatis]
    L2 -- Tidak --> L3[Transaksi Selesai]

    G5 --> F1
    F1 --> P1[Upload Bukti Transfer Manual]
    P1 --> P2[Status: Menunggu Verifikasi]
    P2 --> P3{Pustakawan Verifikasi}
    P3 -- Approve --> P4[Denda Lunas + Akun Unblocked]
    P3 -- Reject --> P5[Denda Belum Bayar + Catatan Alasan]

    H --> H1[Manajemen Buku & Eksemplar]
    H --> H2[Sirkulasi Pinjam/Kembali]
    H --> H3[Verifikasi Denda]
    H --> H4[Manajemen Anggota]
    H --> H5[Laporan & Statistik]

    I --> I1[Manajemen Pengguna]
    I --> I2[Pengaturan Sistem & Tarif]
    I --> I3[Konfigurasi WhatsApp Gateway]
    I --> I4[Audit Log Sistem]

    H1 --> AU[Audit Log - Tercatat Otomatis]
    H2 --> AU
    H3 --> AU
    H4 --> AU
    H5 --> WA[Kirim Notifikasi WhatsApp]
    I3 --> WA
    F1 --> WA
    R2 --> WA

    WA --> N1[Notifikasi Terkirim ke Anggota]
    AU --> N2[Admin Dapat Audit Trail Lengkap]
```

---

## 8. Kebutuhan Non-Fungsional (SEO, Keamanan, & Performa)
*Syarat wajib agar website siap rilis ke publik (production-ready).*

- **SEO**:
  - Wajib menggunakan `generateMetadata` Next.js dinamis untuk `<title>`, meta description, dan Open Graph (OG) tags pada setiap halaman publik (`/`, `/katalog`, `/katalog/[slug]`, `/tentang`, `/panduan`).
  - Wajib membuat `sitemap.xml` (via `next-sitemap`) dan `robots.txt`.
  - Wajib menyertakan **JSON-LD schema** `Book` dan `Library` pada halaman detail buku untuk rich snippet Google.
  - Tag `<img alt>` wajib deskriptif dengan judul & penulis buku.
  - Konten halaman publik wajib SSR (Server-Side Rendering), bukan client-side rendering, agar terindeks Google.

- **Keamanan**:
  - Validasi input **sisi server wajib** menggunakan Zod pada setiap Server Action & Route Handler.
  - Sanitasi HTML output untuk mencegah XSS (gunakan `DOMPurify` untuk konten sinopsis yang kaya format).
  - Proteksi CSRF pada semua form POST (Next.js Server Actions sudah memberi proteksi by default, plus verifikasi Origin header).
  - Password di-hash menggunakan `bcryptjs` (cost 12). Jangan pernah log password.
  - Rate-limiting pada endpoint sensitif: login, OTP, registrasi, upload bukti (10 request/menit/IP).
  - Role-based middleware Next.js (`middleware.ts`) melindungi rute `/dashboard/*`, `/pustakawan/*`, `/admin/*`.
  - Signed URL Supabase Storage untuk file e-book & bukti transfer (kedaluwarsa 1 jam).
  - HTTPS wajib di production; HSTS header diaktifkan.
  - Security headers tambahan via `next.config.js`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

- **Performa**:
  - Optimasi gambar otomatis dengan `next/image` (WebP/AVIF).
  - Lazy loading komponen berat (E-Book Reader, Barcode Scanner, Chart) via `dynamic import`.
  - Caching data publik (katalog) menggunakan `unstable_cache` Next.js dengan revalidate 60 detik.
  - Index database pada kolom yang sering dicari: `books.title`, `books.author`, `books.isbn`, `users.nis_nim`, `book_copies.copy_code`, `loans.due_date`.
  - Full-text search menggunakan PostgreSQL `tsvector` + GIN index.
  - Target Lighthouse score ≥ 90 untuk Performance & SEO pada halaman publik.
  - Kompresi response via Brotli (Vercel default) & gzip fallback.

- **Observabilitas & Audit**:
  - Setiap request menghasilkan `X-Request-ID` yang dicatat di `audit_logs.request_id`.
  - Log error terpusat (opsional Sentry) untuk production.
  - Retensi audit log minimal 2 tahun.

---

## 9. Panduan Bahasa, Copywriting, & Data Dummy
*Panduan nada bicara (Tone of Voice) dan contoh data agar prototipe terasa nyata.*

- **Gaya Bahasa**: Ramah, hangat, profesional, membumi — menyapa dengan "Kamu" di area anggota muda & "Anda" di area pustakawan/admin. Hindari jargon teknis di UI publik (contoh: ganti "Endpoint" → "Alur", "Autentikasi" → "Masuk"). Copywriting CTA bersifat mengundang (contoh: "Yuk, Cari Buku Favoritmu!", bukan "Cari").

- **Instruksi Data Dummy**: JANGAN PERNAH MENGGUNAKAN "Lorem Ipsum". Selalu gunakan data dummy berbahasa Indonesia yang relevan dengan konteks aplikasi.

- **Contoh Data Dummy Spesifik**:
  - **Akun Anggota (Siswa)**:
    - NIS: `2024001`, Nama: `Budi Santoso`, Kelas: `XII IPA 2`, WA: `081234567890`, Status: `aktif`.
    - NIS: `2024002`, Nama: `Siti Nurhaliza Putri`, Kelas: `XI IPS 1`, WA: `081234567891`, Status: `aktif`.
  - **Akun Anggota (Mahasiswa)**:
    - NIM: `2024010001`, Nama: `Raka Aditya Pratama`, Prodi: `Teknik Informatika`, Angkatan: `2024`.
  - **Akun Pustakawan**:
    - NIP: `PK2024001`, Nama: `Ibu Dewi Anggraini, S.IP.`, Jabatan: `Kepala Pustakawan`.
  - **Kategori Buku**: `Fiksi Indonesia`, `Sains & Teknologi`, `Sejarah & Biografi`, `Filsafat`, `Referensi Akademik`, `Komik & Novel Grafis`.
  - **Buku Fiksi**:
    - Judul: `Laskar Pelangi`, Penulis: `Andrea Hirata`, Penerbit: `Bentang Pustaka`, Tahun: `2005`, ISBN: `9789793062792`.
    - Judul: `Bumi Manusia`, Penulis: `Pramoedya Ananta Toer`, Penerbit: `Hasta Mitra`, Tahun: `1980`, ISBN: `9789799731234`.
    - Judul: `Pulang`, Penulis: `Leila S. Chudori`, Penerbit: `Kepustakaan Populer Gramedia`, Tahun: `2012`, ISBN: `9789799104123`.
  - **Buku Non-Fiksi**:
    - Judul: `Filosofi Teras`, Penulis: `Henry Manampiring`, Penerbit: `Kompas`, Tahun: `2018`, ISBN: `9786024125189`.
    - Judul: `Sapiens: Riwayat Singkat Umat Manusia`, Penulis: `Yuval Noah Harari`, Penerbit: `Kepustakaan Populer Gramedia`, Tahun: `2017`.
  - **Contoh Kode Eksemplar**: `PKC-2024-001-001` s/d `PKC-2024-001-005` (5 salinan Laskar Pelangi).
  - **Contoh Lokasi Rak**: `Rak A-01 (Fiksi)`, `Rak B-04 (Sains)`, `Rak C-02 (Referensi)`.
  - **Contoh Transaksi Peminjaman**: Budi Santoso meminjam `Laskar Pelangi (PKC-2024-001-002)` tanggal `2024-11-05`, jatuh tempo `2024-11-12`, dikembalikan `2024-11-14` (terlambat 2 hari, denda `Rp 2.000`).
  - **Contoh Denda**: Status `Menunggu Verifikasi`, jumlah `Rp 2.000`, bukti transfer `bukti-transfer-budi-20241114.jpg`.
  - **Contoh Audit Log**: `Aksi: update | Entitas: book_copies | Aktor: Ibu Dewi | Kode: PKC-2024-001-002 | Perubahan: status "dipinjam" → "tersedia" | Timestamp: 2024-11-14 15:32:01`.
  - **Contoh Pesan WhatsApp**:
    - Pengingat: `Halo Budi! 📚 Buku "Laskar Pelangi" kamu harus dikembalikan besok, 12 Nov 2024 ya. Yuk kembalikan tepat waktu! - PustakaKitaCeria`.
    - Denda: `Hai Siti! Buku kamu terlambat 2 hari. Denda saat ini Rp 2.000. Bayar via transfer & upload bukti di https://pustakakita.sch.id/dashboard/denda 🙏`.

---

## 10. Fondasi Teknis (Untuk Tim Pengembang / Programmer & AI)
*Petunjuk arsitektur teknis spesifik.*

- **Bahasa & Framework**: **Next.js 15 (App Router)** + **TypeScript** — dipilih karena unggul untuk SEO halaman katalog publik (SSR/SSG), mendukung Server Actions untuk CRUD cepat, dan ekosistem shadcn/ui yang kaya.
- **Tampilan Antarmuka (UI)**: **Tailwind CSS v3** + **shadcn/ui** (Radix-based) + **Lucide Icons** + **Plus Jakarta Sans** & **Inter** (via `next/font`).
- **Autentikasi**: **NextAuth.js (Auth.js v5)** dengan **Credentials Provider** (NIS/NIM + Password) dan strategi **JWT session**. Password di-hash dengan **bcryptjs**. OTP WhatsApp diverifikasi via tabel `otp_tokens` dengan TTL 5 menit.
- **Basis Data (Database)**: **Neon PostgreSQL (Serverless)** + **Drizzle ORM** + **drizzle-kit** untuk migrasi. Full-text search menggunakan `tsvector` + GIN index.
- **Penyimpanan File (Storage)**: **Supabase Storage** — 3 bucket privat: `book-covers`, `ebook-files`, `payment-proofs`. Akses via signed URL.
- **Barcode Scanning**: **html5-qrcode** (kamera browser, gratis, ringan) + fallback input manual.
- **E-Book Reader**: **react-pdf** (PDF) + **epub.js** (EPUB) dengan mode malam & auto-save progress.
- **Chart & Laporan**: **recharts** + **@react-pdf/renderer** untuk ekspor PDF.
- **WhatsApp Gateway**: **Fonnte** (API key based) — mudah diintegrasikan, harga terjangkau, mendukung pengiriman gambar & teks; provider dapat diganti ke Wablas/Vonage di pengaturan.
- **Cronjob**: **Vercel Cron** (harian 00:05) via route handler `/api/cron/overdue-check`, diproteksi `CRON_SECRET`.
- **Validasi**: **Zod** untuk semua form & Server Action input.
- **Testing**: **Vitest** (unit) + **Playwright** (E2E happy path).

### Struktur Skema Database Nyata
*(TypeScript Drizzle ORM — file `src/db/schema.ts`)*

```typescript
import {
  pgTable, pgEnum, uuid, text, varchar, integer, boolean,
  timestamp, decimal, jsonb, index, uniqueIndex
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ============ ENUMS ============
export const userRoleEnum = pgEnum("user_role", ["anggota", "pustakawan", "admin"]);
export const memberStatusEnum = pgEnum("member_status", ["aktif", "nonaktif", "ditangguhkan", "lulus", "keluar"]);
export const bookTypeEnum = pgEnum("book_type", ["fisik", "ebook", "keduanya"]);
export const copyStatusEnum = pgEnum("copy_status", ["tersedia", "dipinjam", "rusak", "hilang", "perbaikan"]);
export const loanStatusEnum = pgEnum("loan_status", ["pending", "dipinjam", "dikembalikan", "terlambat", "hilang"]);
export const reservationStatusEnum = pgEnum("reservation_status", ["menunggu", "siap", "terpenuhi", "dibatalkan", "kedaluwarsa"]);
export const fineStatusEnum = pgEnum("fine_status", ["belum_bayar", "menunggu_verifikasi", "lunas", "dibebaskan"]);
export const notifStatusEnum = pgEnum("notification_status", ["pending", "terkirim", "gagal"]);
export const notifChannelEnum = pgEnum("notification_channel", ["whatsapp", "email", "inapp"]);
export const auditActionEnum = pgEnum("audit_action", ["create", "update", "delete", "verify", "waive", "login", "logout"]);

// ============ USERS ============
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  nisNim: varchar("nis_nim", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 160 }).unique(),
  phoneWa: varchar("phone_wa", { length: 20 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("anggota"),
  memberStatus: memberStatusEnum("member_status").notNull().default("aktif"),
  classOrMajor: varchar("class_or_major", { length: 80 }),
  avatarUrl: text("avatar_url"),
  isVerified: boolean("is_verified").notNull().default(false),
  failedLoginCount: integer("failed_login_count").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  joinDate: timestamp("join_date", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  roleIdx: index("users_role_idx").on(t.role),
  statusIdx: index("users_status_idx").on(t.memberStatus),
}));

// ============ OTP TOKENS ============
export const otpTokens = pgTable("otp_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  code: varchar("code", { length: 8 }).notNull(),
  purpose: varchar("purpose", { length: 40 }).notNull(), // "register", "reset_password"
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============ CATEGORIES ============
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 80 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============ BOOKS (Bibliografi) ============
export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  author: varchar("author", { length: 120 }).notNull(),
  publisher: varchar("publisher", { length: 120 }),
  isbn: varchar("isbn", { length: 20 }),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  description: text("description"),
  coverUrl: text("cover_url"),
  publicationYear: integer("publication_year"),
  language: varchar("language", { length: 40 }).default("Indonesia"),
  pages: integer("pages"),
  bookType: bookTypeEnum("book_type").notNull().default("fisik"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  titleIdx: index("books_title_idx").on(t.title),
  authorIdx: index("books_author_idx").on(t.author),
  isbnIdx: index("books_isbn_idx").on(t.isbn),
}));

// ============ BOOK COPIES (Eksemplar) ============
export const bookCopies = pgTable("book_copies", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id").references(() => books.id, { onDelete: "cascade" }).notNull(),
  copyCode: varchar("copy_code", { length: 40 }).notNull().unique(), // PKC-2024-001-001
  status: copyStatusEnum("status").notNull().default("tersedia"),
  shelfLocation: varchar("shelf_location", { length: 40 }), // Rak A-01
  conditionNote: text("condition_note"),
  acquisitionDate: timestamp("acquisition_date", { withTimezone: true }),
  acquisitionPrice: decimal("acquisition_price", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  copyCodeIdx: uniqueIndex("book_copies_code_idx").on(t.copyCode),
  statusIdx: index("book_copies_status_idx").on(t.status),
}));

// ============ EBOOKS ============
export const ebooks = pgTable("ebooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id").references(() => books.id, { onDelete: "cascade" }).notNull(),
  fileUrl: text("file_url").notNull(), // Supabase storage path
  fileFormat: varchar("file_format", { length: 8 }).notNull(), // pdf | epub
  fileSizeBytes: integer("file_size_bytes"),
  readCount: integer("read_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============ EBOOK PROGRESS ============
export const ebookProgress = pgTable("ebook_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  ebookId: uuid("ebook_id").references(() => ebooks.id, { onDelete: "cascade" }).notNull(),
  lastPage: integer("last_page").notNull().default(1),
  progressPercent: integer("progress_percent").notNull().default(0),
  lastReadAt: timestamp("last_read_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueUserEbook: uniqueIndex("unique_user_ebook").on(t.userId, t.ebookId),
}));

// ============ LOANS (Peminjaman) ============
export const loans = pgTable("loans", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id").references(() => users.id, { onDelete: "restrict" }).notNull(),
  copyId: uuid("copy_id").references(() => bookCopies.id, { onDelete: "restrict" }).notNull(),
  handledBy: uuid("handled_by").references(() => users.id, { onDelete: "set null" }),
  borrowedAt: timestamp("borrowed_at", { withTimezone: true }).defaultNow().notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  returnedAt: timestamp("returned_at", { withTimezone: true }),
  status: loanStatusEnum("status").notNull().default("dipinjam"),
  renewedCount: integer("renewed_count").notNull().default(0),
  isSelfCheckout: boolean("is_self_checkout").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  memberIdx: index("loans_member_idx").on(t.memberId),
  statusIdx: index("loans_status_idx").on(t.status),
  dueDateIdx: index("loans_due_date_idx").on(t.dueDate),
}));

// ============ RESERVATIONS ============
export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  bookId: uuid("book_id").references(() => books.id, { onDelete: "cascade" }).notNull(),
  reservedAt: timestamp("reserved_at", { withTimezone: true }).defaultNow().notNull(),
  status: reservationStatusEnum("status").notNull().default("menunggu"),
  readyAt: timestamp("ready_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  notifiedAt: timestamp("notified_at", { withTimezone: true }),
  queuePosition: integer("queue_position"),
});

// ============ FINES (Denda) ============
export const fines = pgTable("fines", {
  id: uuid("id").primaryKey().defaultRandom(),
  loanId: uuid("loan_id").references(() => loans.id, { onDelete: "cascade" }).notNull(),
  memberId: uuid("member_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  daysLate: integer("days_late").notNull().default(0),
  reason: text("reason"),
  status: fineStatusEnum("status").notNull().default("belum_bayar"),
  paymentMethod: varchar("payment_method", { length: 40 }).default("transfer_manual"),
  proofUrl: text("proof_url"), // Supabase storage path
  paidAt: timestamp("paid_at", { withTimezone: true }),
  verifiedBy: uuid("verified_by").references(() => users.id, { onDelete: "set null" }),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  waiveReason: text("waive_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  statusIdx: index("fines_status_idx").on(t.status),
  memberIdx: index("fines_member_idx").on(t.memberId),
}));

// ============ NOTIFICATIONS ============
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  channel: notifChannelEnum("channel").notNull().default("whatsapp"),
  type: varchar("type", { length: 40 }).notNull(), // otp, due_reminder, overdue, fine_created, fine_verified, reservation_ready
  recipient: varchar("recipient", { length: 20 }).notNull(),
  message: text("message").notNull(),
  status: notifStatusEnum("status").notNull().default("pending"),
  retryCount: integer("retry_count").notNull().default(0),
  referenceType: varchar("reference_type", { length: 40 }),
  referenceId: uuid("reference_id"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============ AUDIT LOGS ============
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  actorName: varchar("actor_name", { length: 120 }),
  action: auditActionEnum("action").notNull(),
  entityType: varchar("entity_type", { length: 60 }).notNull(), // book, book_copy, loan, fine, user
  entityId: uuid("entity_id"),
  description: text("description"),
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  requestId: varchar("request_id", { length: 60 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  actorIdx: index("audit_actor_idx").on(t.actorId),
  entityIdx: index("audit_entity_idx").on(t.entityType, t.entityId),
  createdIdx: index("audit_created_idx").on(t.createdAt),
}));

// ============ SETTINGS ============
export const settings = pgTable("settings", {
  key: varchar("key", { length: 60 }).primaryKey(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============ RELATIONS (Ringkas) ============
export const booksRelations = relations(books, ({ one, many }) => ({
  category: one(categories, { fields: [books.categoryId], references: [categories.id] }),
  copies: many(bookCopies),
  ebooks: many(ebooks),
}));

export const loansRelations = relations(loans, ({ one }) => ({
  member: one(users, { fields: [loans.memberId], references: [users.id] }),
  copy: one(bookCopies, { fields: [loans.copyId], references: [bookCopies.id] }),
  handler: one(users, { fields: [loans.handledBy], references: [users.id] }),
}));
```

### Variabel Lingkungan (`.env.example`)

```env
# ======== App ========
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ======== Database (Neon PostgreSQL) ========
DATABASE_URL=postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/pustakakita?sslmode=require

# ======== Auth (NextAuth v5) ========
NEXTAUTH_SECRET=isi_dengan_random_32_karakter
NEXTAUTH_URL=http://localhost:3000
SESSION_MAX_AGE_DAYS=7
BCRYPT_COST=12

# ======== Supabase Storage (Cover, E-Book, Bukti Transfer) ========
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
SUPABASE_BUCKET_COVERS=book-covers
SUPABASE_BUCKET_EBOOKS=ebook-files
SUPABASE_BUCKET_PROOFS=payment-proofs

# ======== WhatsApp Gateway (Fonnte) ========
WHATSAPP_PROVIDER=fonnte
WHATSAPP_API_URL=https://api.fonnte.com/send
WHATSAPP_API_KEY=isi_token_fonnte
WHATSAPP_SENDER_NUMBER=081234567890
WHATSAPP_RATE_LIMIT_PER_MINUTE=60

# ======== Cronjob Secret ========
CRON_SECRET=random_string_untuk_verifikasi_cron

# ======== Aturan Perpustakaan (Default, dapat diubah di Admin) ========
DEFAULT_LOAN_DURATION_DAYS=7
DEFAULT_FINE_PER_DAY=1000
MAX_BOOKS_PER_MEMBER=3
MAX_RENEWALS=1
MAX_FINE_BLOCK_THRESHOLD=50000

# ======== Rekening Transfer Manual (Default) ========
BANK_NAME=Bank Mandiri
BANK_ACCOUNT_NUMBER=1370012345678
BANK_ACCOUNT_NAME=SMK Nusantara - Perpustakaan PustakaKitaCeria

# ======== Audit Log ========
AUDIT_RETENTION_YEARS=2
```

---

## 11. Tahapan Pengerjaan & Task Breakdown (Actionable Work Breakdown Structure)
*Daftar tugas terstruktur dan terurut (Atomic Tasks) dengan format checklist markdown `- [ ] **Task X.Y**`. Dirancang khusus agar pengguna dapat menginstruksikan AI Coding Assistant (Antigravity, Cursor, Claude Code, Roo Code, dll.) untuk mengeksekusi proyek langkah demi langkah secara terukur, modular, dan bebas dari kehabisan context window.*

### 🚀 FASE 1: Fondasi Proyek, UI/UX, & Semua Halaman (Dummy Data)
*Tujuan: Membangun seluruh antarmuka visual secara 100% lengkap dan responsif menggunakan data dummy sebelum menyentuh database.*

- [ ] **Task 1.1 (Foundations & Design System)**: Inisialisasi proyek Next.js 15 + TypeScript + Tailwind CSS, konfigurasi `next.config.js` (image domains: Supabase), pasang `next/font` (Plus Jakarta Sans & Inter), install base shadcn/ui components (Button, Card, Input, Dialog, Table, Badge, Dropdown, Tabs, Sheet, Tooltip, Toast, Skeleton, Form, Select), install Lucide Icons, dan set CSS variable token warna PustakaKitaCeria (Teal Ceria, Amber Hangat, Coral Ramah) di `globals.css`.
- [ ] **Task 1.2 (Layouts & Persistent Navigation)**: Buat Root Layout dengan konfigurasi `next/font` & provider (ThemeProvider, Toaster). Buat **Public Layout** dengan Header/Navbar + Footer responsive, **Anggota Layout** di route group `(anggota)` dengan Sidebar kiri + Header kecil + Bottom Nav mobile, dan **Staff Layout** di route group `(staff)` dengan Sidebar grup menu (Katalog, Sirkulasi, Anggota, Denda, Laporan, Audit, Pengaturan).
- [ ] **Task 1.3 (Public Pages)**: Bangun seluruh halaman publik dengan data dummy: `/` (Hero + pencarian cepat + koleksi unggulan + statistik), `/katalog` (grid buku + filter kategori/tahun/ketersediaan + search bar), `/katalog/[slug]` (detail buku + eksemplar tersedia + CTA reservasi), `/tentang`, `/panduan`, `/kontak`, `/kebijakan-privasi`, `/syarat-ketentuan`.
- [ ] **Task 1.4 (Auth Pages - UI Only)**: Bangun halaman `/daftar` (form 6-step: NIS/NIM, data diri, WA, password, OTP input, sukses), `/masuk` (form NIS/NIM & Password), `/lupa-password` (form NIS/NIM + OTP + reset password). Semua form pakai `react-hook-form` + Zod, submit hanya memunculkan toast "Mock submit berhasil".
- [ ] **Task 1.5 (Anggota Pages - Dummy Data)**: Bangun seluruh halaman `/dashboard`, `/dashboard/katalog`, `/dashboard/riwayat` (timeline pinjaman aktif/selesai/terlambat), `/dashboard/reservasi`, `/dashboard/scan` (UI overlay kamera + animasi garis scan, tanpa kamera asli dulu), `/dashboard/ebook` (grid koleksi digital + progress bar), `/dashboard/ebook/[id]/baca` (UI reader dengan toolbar & mode malam mock), `/dashboard/denda` (tabel denda status berwarna), `/dashboard/denda/[id]/bayar` (form upload bukti + info rekening), `/dashboard/profil`, `/dashboard/kartu` (kartu anggota digital dengan QR/barcode mock).
- [ ] **Task 1.6 (Pustakawan Pages - Dummy Data)**: Bangun seluruh halaman `/pustakawan` (dasbor statistik), `/pustakawan/buku` (DataTable CRUD + search + filter kategori), `/pustakawan/buku/baru` (form lengkap), `/pustakawan/buku/[id]` (Tab Info / Eksemplar / E-Book dengan generate kode mock), `/pustakawan/eksemplar` (DataTable eksemplar), `/pustakawan/sirkulasi` + sub-halaman `pinjam` & `kembali` (form input NIS + scan barcode mock + ringkasan transaksi), `/pustakawan/reservasi`, `/pustakawan/denda` (verifikasi bukti transfer dengan modal preview), `/pustakawan/anggota`, `/pustakawan/laporan` (+ 3 sub laporan: peminjaman, keterlambatan, koleksi) dengan chart `recharts` dan tombol ekspor (mock).
- [ ] **Task 1.7 (Admin Pages - Dummy Data)**: Bangun seluruh halaman `/admin`, `/admin/pengguna` (DataTable user), `/admin/kategori`, `/admin/pengaturan` (form tarif denda, durasi pinjam, template WA, rekening transfer), `/admin/whatsapp` (form API key + tombol uji kirim), `/admin/notifikasi` (log WA dengan filter status), `/admin/audit-log` (DataTable dengan filter aktor/entitas/tanggal + modal diff old/new value JSON viewer).

### 💾 FASE 2: Database, Autentikasi, & Integrasi Data Dinamis
*Tujuan: Menghidupkan aplikasi dengan database nyata, sistem autentikasi pengguna, dan API/Server Actions.*

- [ ] **Task 2.1 (Database Schema & Migrations)**: Setup Neon PostgreSQL + Drizzle ORM, tulis file `src/db/schema.ts` lengkap (tabel `users`, `otp_tokens`, `categories`, `books`, `book_copies`, `ebooks`, `ebook_progress`, `loans`, `reservations`, `fines`, `notifications`, `audit_logs`, `settings`), jalankan `drizzle-kit generate` + `drizzle-kit push`, buat index & full-text-search `tsvector` untuk `books`, dan buat script `seed.ts` berisi data dummy Indonesia (Laskar Pelangi, Bumi Manusia, Filosofi Teras, dll.).
- [ ] **Task 2.2 (Authentication & Route Middleware)**: Konfigurasi NextAuth v5 Credentials Provider dengan NIS/NIM + password (bcryptjs), implementasi registrasi anggota + OTP WhatsApp, lupa-password via OTP, session JWT, dan buat `middleware.ts` untuk melindungi rute `(anggota)`, `(staff)`, `/admin` sesuai role. Implementasi rate-limit login (5 gagal → lock 15 menit).
- [ ] **Task 2.3 (Server Actions & API Endpoints)**: Buat seluruh Server Actions bertipe Zod untuk CRUD pada entitas: `books` (create/update/delete/list/detail), `book_copies` (generate barcode `PKC-YYYY-NNN-NNN`, update status), `ebooks` (upload ke Supabase Storage), `loans` (create/return/renew/self-checkout), `reservations` (create/cancel/fulfill), `fines` (upload bukti, verify, waive), `users` (CRUD oleh admin), `categories`, `settings` (get/update), dan buat utilitas `writeAuditLog()` yang otomatis dipanggil setiap CUD.
- [ ] **Task 2.4 (Frontend Data Binding & Real-Time Validation)**: Hubungkan semua halaman dari Fase 1 dengan Server Actions: katalog dinamis dari database (dengan caching `unstable_cache` 60 detik), dasbor anggota menampilkan data pinjaman & denda real dari `loans` & `fines`, sirkulasi pustakawan (scan → fetch `book_copies` & validate stok), halaman verifikasi denda (load `fines` + Supabase signed URL untuk bukti), laporan agregasi via SQL group by, audit log query dengan pagination.
- [ ] **Task 2.5 (Barcode Scanner Real Implementation)**: Integrasikan `html5-qrcode` di `/dashboard/scan` dan `/pustakawan/sirkulasi/pinjam|kembali`, dengan fallback input manual, validasi kode eksemplar real-time ke server, dan tampilkan ringkasan transaksi sebelum konfirmasi.
- [ ] **Task 2.6 (E-Book Reader Real Implementation)**: Integrasikan `react-pdf` (PDF) dan `epub.js` (EPUB) di `/dashboard/ebook/[id]/baca`, implementasi auto-save `ebook_progress` setiap 10 detik, mode malam, zoom, dan navigasi halaman. Akses file via Supabase signed URL (exp 1 jam).
- [ ] **Task 2.7 (Cronjob Denda Otomatis)**: Buat route handler `/api/cron/overdue-check` diproteksi `CRON_SECRET`, dijalankan harian 00:05 via Vercel Cron: scan `loans` yang lewat `due_date`, update status ke `terlambat`, create/update `fines`, kirim notifikasi WhatsApp, dan tulis audit log.

### 🌐 FASE 3: Integrasi WhatsApp, Keamanan, SEO, Deployment, & Audit Final
*Tujuan: Menyempurnakan integrasi eksternal, optimasi performa, keamanan, dan rilis ke production.*

- [ ] **Task 3.1 (WhatsApp Gateway Integration)**: Buat service `src/lib/whatsapp.ts` (Fonnte API) dengan retry 3× exponential backoff, integrasi trigger di seluruh event: OTP registrasi, H-1 jatuh tempo (cron harian), keterlambatan, denda baru, denda menunggu verifikasi, denda lunas, reservasi siap, akun ditangguhkan. Tulis semua ke `notifications` dengan status `pending/terkirim/gagal`. Buat halaman `/admin/whatsapp` dengan tombol "Kirim Pesan Uji".
- [ ] **Task 3.2 (Non-Functional Requirements & Security)**: Terapkan `generateMetadata` dinamis (title, description, OG tags) di seluruh halaman publik, JSON-LD `Book` & `Library` di detail buku, `sitemap.xml` + `robots.txt` via `next-sitemap`; aktifkan security headers di `next.config.js` (`X-Frame-Options: DENY`, `HSTS`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`); implementasi rate-limiting (`@upstash/ratelimit` atau in-memory) di login/OTP/upload; validasi Zod pada 100% Server Actions; sanitasi HTML output dengan `DOMPurify` untuk sinopsis; signed URL Supabase exp 1 jam; dan pastikan `middleware.ts` memblokir akses tanpa role.
- [ ] **Task 3.3 (Testing & Bugfix End-to-End)**: Jalankan Playwright E2E untuk happy-path: Registrasi → OTP → Login → Cari Katalog → Reservasi → Pinjam via Scan → Jatuh Tempo → Denda → Upload Bukti → Verifikasi Pustakawan → Lunas → Self-Return. Uji responsive di mobile (360px), tablet (768px), desktop (1440px). Fix semua bug visual, query lambat (analyze dengan `EXPLAIN ANALYZE`), dan edge case (stok habis, barcode tidak dikenal, file upload > 3MB).
- [ ] **Task 3.4 (Production Build & Deployment)**: Konfigurasi `.env.production` lengkap, verifikasi `npm run build` lulus tanpa warning/error, setup Vercel project + Neon production branch + Supabase production bucket + Fonnte production API key + `CRON_SECRET`, jalankan migrasi di production, aktifkan Vercel Cron 00:05, deploy, sinkronisasi domain custom, dan lakukan smoke test E2E di production.
- [ ] **Task 3.5 (Seed Data Production & Audit Log Final Check)**: Insert kategori resmi (Fiksi Indonesia, Sains & Teknologi, Sejarah & Biografi, Filsafat, Referensi Akademik, Komik), import koleksi buku awal (±30 judul klasik Indonesia), buat 1 akun Pustakawan + 1 akun Admin, verifikasi seluruh aksi CUD tercatat di `audit_logs` (create buku → cek log; verify denda → cek log; waive denda → cek log), dan pastikan filter audit log (aktor, entitas, tanggal, aksi) berfungsi.

---


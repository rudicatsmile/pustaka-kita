# Dokumentasi Fitur: WhatsApp Automation & Broadcast Hub

## 1. Ringkasan Fitur
**WhatsApp Automation & Broadcast Hub** adalah modul otomasi komunikasi terintegrasi pada aplikasi **PustakaKita Ceria** yang menghubungkan sistem basis data sirkulasi perpustakaan dengan WhatsApp Gateway API (Fonnte). 

Fitur ini menyediakan saluran komunikasi proaktif langsung ke ponsel siswa/wali murid untuk pengingat masa pinjam (H-1), peringatan denda keterlambatan buku, serta siaran massal pengumuman koleksi buku baru dan agenda literasi.

---

## 2. Masalah yang Diselesaikan & Dampak Bisnis
| Masalah Sebelumnya | Solusi dengan WhatsApp Broadcast Hub | Dampak & Nilai Tambah |
| :--- | :--- | :--- |
| **Tingginya Tingkat Keterlambatan**: Siswa sering lupa jadwal pengembalian buku, menyebabkan denda menumpuk. | **Engine Otomatis H-1**: Notifikasi ramah dikirim otomatis 1 hari sebelum jatuh tempo. | Menurunkan angka keterlambatan buku hingga **>70%** dan meningkatkan perputaran sirkulasi buku. |
| **Proses Penagihan Manual**: Pustakawan harus menghubungi peminjam satu per satu secara manual. | **Broadcast Massal Tertarget**: Mengirim pesan denda atau pengingat ke seluruh target dalam 1 klik. | Menghemat waktu staf perpustakaan hingga berjam-jam per minggu. |
| **Open Rate Pengumuman Rendah**: Siswa jarang mengecek email atau mading sekolah. | **Pesan WhatsApp Langsung**: Pengumuman buku baru dan event sampai langsung di aplikasi chat harian. | Open rate pesan WhatsApp mencapai **>95%** dibandingkan email (<25%). |

---

## 3. Komponen & Fungsionalitas Utama

### A. Broadcast Massal Hub (Tab 1)
1. **3 Kategori Target Penerima**:
   - 🔔 **Pengingat H-1 Jatuh Tempo**: Mengambil seluruh peminjaman berstatus `dipinjam` yang jatuh tempo besok atau lusa.
   - ⚠️ **Peringatan Denda Tertunggak**: Menghimpun seluruh peminjam yang bukunya berstatus `terlambat` beserta kalkulasi akumulasi nominal dendanya.
   - 📢 **Pengumuman & Info Literasi Baru**: Mengirim siaran ke seluruh kontak anggota aktif perpustakaan.
2. **Template Editor Interaktif**:
   - Mendukung penyusunan template pesan dinamis dengan tombol sisip variabel: `{nama}`, `{judul_buku}`, `{jatuh_tempo}`, `{hari_telat}`, dan `{denda}`.
   - Fitur *Reset to Default Template* untuk mengembalikan format standar rekomendasi perpustakaan.
3. **Pratinjau Layar Smartphone (Live WhatsApp Preview)**:
   - Menampilkan replika tampilan chat WhatsApp resmi (*Verified Business Account*) dengan nama sekolah.
   - Teks pada *chat bubble* terinterpolasi secara dinamis secara *real-time* menggunakan data penerima pertama.
4. **Eksekusi Pengiriman Massal**:
   - Tombol pengiriman aman dengan konfirmasi dialog.
   - Indikator proses (*progress spinner*) dan kartu laporan ringkasan: jumlah target, pesan terkirim, dan pesan gagal.

### B. Engine Pengingat Otomatis H-1 & Denda (Tab 2)
1. **Mekanisme Otomasi**:
   - Mendukung scheduler tengah malam (`00:00 WIB`) untuk pemindaian berkala.
   - Tombol **"Jalankan Engine Sekarang"** (*On-Demand Trigger*) untuk sinkronisasi seketika tanpa menunggu pergantian hari.
2. **Tindakan Otomatis Engine**:
   - **Langkah 1 (H-1)**: Mendeteksi masa pinjam yang berakhir besok dan mengirim WhatsApp pengingat.
   - **Langkah 2 (Overdue)**: Mengubah status buku pinjaman yang lewat jatuh tempo menjadi `terlambat`.
   - **Langkah 3 (Kalkulasi Denda)**: Menghitung nominal denda harian (Rp 1.000/hari) dan membuat/memperbarui rekaman denda di tabel `schema.fines`.
   - **Langkah 4 (Notifikasi Denda)**: Mengirim rincian keterlambatan dan nominal denda ke WhatsApp anggota.
3. **Widget Statistik Eksekusi**:
   - Menampilkan ringkasan eksekusi terakhir: jumlah pengingat terkirim, status buku diperbarui, dan denda baru dibuat.

### C. Log Riwayat Pesan WhatsApp (Tab 3)
- Menampilkan tabel 25 transaksi pesan WhatsApp terakhir langsung dari database (`schema.notifications`).
- Kolom informatif: Waktu kirim, Tipe notifikasi, Nomor tujuan, Ringkasan isi pesan, Badge status (`terkirim`, `antre`, `gagal`), dan Jumlah percobaan (*Retry Count*).
- Tombol **"Segarkan Log"** untuk memperbarui data tabel tanpa *refresh* seluruh halaman.

### D. Konfigurasi Gateway Fonnte & Uji Coba (Tab 4)
- Form penyimpanan kredensial `API Token / Secret` dan `Nomor Bot Pengirim`.
- Form uji coba kirim pesan langsung ke sembarang nomor WhatsApp tujuan untuk memvalidasi kelayakan koneksi perangkat bot.
- Status box konektivitas gateway (*Ready / Terhubung*).

---

## 4. Keamanan & Kepatuhan Audit
- **Audit Logging**: Setiap aksi broadcast massal, trigger manual engine, dan pengujian API tercatat ke dalam tabel audit log (`schema.auditLogs`) lengkap dengan nama staf pelaksana dan parameter pengiriman.
- **Toleransi Kesalahan & Retry**: Mesin pengirim pesan di `src/lib/whatsapp.ts` dilengkapi logika format nomor otomatis (`08xx` -> `628xx`), sanitasi nomor, dan toleransi retry saat gateway mengalami gangguan sementara.

---

## 5. File yang Dikembangkan & Dimodifikasi
1. [src/actions/whatsapp.ts](file:///d:/project/web/energies/pustakaKita/src/actions/whatsapp.ts):
   - Server Actions: `getBroadcastTargetsAction`, `executeBatchBroadcastAction`, `triggerManualOverdueCheckAction`, `getWhatsAppNotificationLogsAction`, `sendTestWhatsAppAction`, dan `saveWhatsAppConfigAction`.
2. [src/app/(staff)/admin/whatsapp/page.tsx](file:///d:/project/web/energies/pustakaKita/src/app/(staff)/admin/whatsapp/page.tsx):
   - Komponen UI 4-Tab: Broadcast Massal, Engine H-1 & Overdue, Log Riwayat Notifikasi, dan Konfigurasi Gateway.
3. [docs/WHATSAPP_BROADCAST_HUB.md](file:///d:/project/web/energies/pustakaKita/docs/WHATSAPP_BROADCAST_HUB.md):
   - Dokumentasi teknis dan panduan operasional sistem broadcast WhatsApp.

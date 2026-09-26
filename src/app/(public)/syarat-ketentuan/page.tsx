import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan Layanan | PustakaKitaCeria",
  description: "Aturan dan syarat peminjaman buku, batas waktu pengembalian, sanksi keterlambatan, dan etika pemanfaatan fasilitas perpustakaan PustakaKitaCeria.",
};

export default function SyaratKetentuanPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-3">
        <Badge variant="default" className="font-bold">
          Dokumen Legalitas
        </Badge>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground">
          Syarat & Ketentuan Anggota PustakaKitaCeria
        </h1>
        <p className="text-xs text-muted-foreground">
          Berlaku untuk seluruh civitas akademika pemegang kartu perpustakaan
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-sm text-foreground/80 leading-relaxed space-y-6">
        <section className="space-y-2">
          <h2 className="font-heading text-lg font-bold text-foreground">1. Keanggotaan & Akun</h2>
          <p>
            Setiap anggota wajib mendaftar menggunakan NIS atau NIM yang sah. Anggota bertanggung jawab penuh atas kerahasiaan kata sandi dan seluruh transaksi sirkulasi yang dilakukan menggunakan akun pribadinya.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-bold text-foreground">2. Aturan Peminjaman Buku</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Maksimal peminjaman bersamaan adalah 3 (tiga) eksemplar buku fisik.</li>
            <li>Durasi peminjaman standar adalah 7 (tujuh) hari kalender sejak tanggal checkout.</li>
            <li>Perpanjangan peminjaman dapat diajukan 1 (satu) kali dengan syarat buku belum terlambat dan tidak memiliki antrean reservasi dari anggota lain.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-bold text-foreground">3. Denda Keterlambatan & Ganti Rugi</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Denda keterlambatan ditetapkan sebesar Rp 1.000 per hari per eksemplar buku.</li>
            <li>Pelunasan denda dilakukan melalui transfer manual ke rekening resmi perpustakaan dan mengunggah bukti bayar yang sah.</li>
            <li>Buku yang hilang atau rusak berat menjadi tanggung jawab peminjam untuk mengganti dengan judul yang sama atau membayar nilai penggantian sesuai harga perolehan buku.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-bold text-foreground">4. Hak Cipta Koleksi E-Book</h2>
          <p>
            Koleksi e-book hanya diperkenankan untuk dibaca di dalam aplikasi e-book reader PustakaKitaCeria. Dilarang keras mengunduh, menggandakan, mendistribusikan, atau menyalahgunakan hak cipta penerbit e-book secara ilegal.
          </p>
        </section>
      </div>
    </div>
  );
}

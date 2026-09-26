import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | PustakaKitaCeria",
  description: "Kebijakan perlindungan data pribadi dan privasi anggota perpustakaan digital PustakaKitaCeria.",
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-3">
        <Badge variant="default" className="font-bold">
          Dokumen Legalitas
        </Badge>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground">
          Kebijakan Privasi PustakaKitaCeria
        </h1>
        <p className="text-xs text-muted-foreground">
          Terakhir diperbarui: 26 September 2026 • Versi 1.0.0
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-sm text-foreground/80 leading-relaxed space-y-6">
        <section className="space-y-2">
          <h2 className="font-heading text-lg font-bold text-foreground">1. Pendahuluan</h2>
          <p>
            PustakaKitaCeria berkomitmen melindungi data pribadi seluruh anggota civitas akademika
            (siswa, mahasiswa, guru, dosen, dan staf). Kebijakan privasi ini menjelaskan bagaimana kami
            mengumpulkan, menggunakan, menyimpan, dan mengamankan data Anda dalam sistem perpustakaan
            digital kami.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-bold text-foreground">2. Data yang Kami Kumpulkan</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Data Identitas Akademik:</strong> Nomor Induk Siswa/Mahasiswa (NIS/NIM), Nama Lengkap, Kelas/Program Studi.</li>
            <li><strong>Data Kontak:</strong> Nomor WhatsApp aktif dan alamat surel sekolah/kampus.</li>
            <li><strong>Data Sirkulasi:</strong> Riwayat peminjaman buku fisik, eksemplar yang direservasi, catatan denda, dan bukti transfer pembayaran.</li>
            <li><strong>Data Aktivitas E-Book:</strong> Halaman terakhir dibaca dan persentase progres membaca.</li>
            <li><strong>Data Log Audit:</strong> Alamat IP, jenis peramban, dan waktu setiap kali melakukan aksi peminjaman atau perubahan data.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-bold text-foreground">3. Penggunaan Data</h2>
          <p>
            Data yang dikumpulkan semata-mata digunakan untuk kepentingan operasional perpustakaan, antara lain:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Memvalidasi keanggotaan dan kuota pinjaman buku.</li>
            <li>Mengirimkan notifikasi pengingat jatuh tempo H-1 via WhatsApp Gateway.</li>
            <li>Memverifikasi pelunasan denda keterlambatan melalui transfer manual.</li>
            <li>Menyusun laporan analitik buku terpopuler dan statistik keanggotaan sekolah.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-bold text-foreground">4. Keamanan & Retensi Data</h2>
          <p>
            Seluruh kata sandi anggota di-hash secara aman menggunakan algoritma bcrypt (cost 12) dan tidak pernah disimpan dalam format teks biasa. Bukti transfer dan file digital disimpan pada penyimpanan terlindungi dengan tautan bertanda tangan digital (signed URL) yang kedaluwarsa otomatis.
          </p>
        </section>
      </div>
    </div>
  );
}

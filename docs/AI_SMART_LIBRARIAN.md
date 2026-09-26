# 🤖 Dokumentasi Fitur: AI Smart Librarian & Semantic Search

> **PustakaKitaCeria — Perpustakaan Digital Sekolah & Kampus**  
> **Modul:** Asisten Pustakawan AI & Pencarian Semantik  
> **Tanggal Rilis:** 26 September 2026  
> **Status:** Production-Ready & Terverifikasi (Next.js 16 App Router)

---

## 1. Latar Belakang & Masalah

Pada sistem perpustakaan konvensional (OPAC), pencarian buku bergantung pada kecocokan teks persis (*exact string match*):
1. **Kegagalan Pencarian Abstrak**: Ketika siswa mencari *"buku yang membahas asal usul tata surya untuk anak SMA"* atau *"novel misteri remaja yang menegangkan"*, mesin pencari biasa menghasilkan nol buku jika kata-kata tersebut tidak ada di judul.
2. **Keterbatasan Asistensi Literasi**: Siswa sering ragu atau malu bertanya kepada petugas perpustakaan di meja sirkulasi mengenai rekomendasi bacaan atau aturan denda dan kuota.
3. **Informasi Lokasi Rak Terpisah**: Hasil pencarian sering kali tidak langsung mengarahkan siswa ke nomor rak fisik tempat buku tersimpan di perpustakaan.

---

## 2. Solusi: Arsitektur Hybrid AI Smart Librarian

PustakaKitaCeria menghadirkan **Asisten Pustakawan Cerdas AI** dengan arsitektur **Hybrid**:

```
                       ┌───────────────────────────────┐
                       │   Pertanyaan Siswa / Anggota  │
                       └───────────────┬───────────────┘
                                       │
                                       ▼
                     ┌───────────────────────────────────┐
                     │   Grounding Data Katalog Real-Time│
                     │  (Database PostgreSQL Neon)      │
                     └─────────────────┬─────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        [Ada GEMINI_API_KEY]                     [Tanpa API Key / Fallback]
     Google Gemini 1.5 Flash                Built-in Semantic & Rule Engine
   (Natural LLM conversational)             (NLP Tokenization, Fuzzy Scorer,
                                             & Library Policy Fact Checker)
                    │                                     │
                    └──────────────────┬──────────────────┘
                                       │
                                       ▼
                     ┌───────────────────────────────────┐
                     │   Output Respons Interaktif:      │
                     │   - Jawaban Ramah & Sinopsis      │
                     │   - Mini Card Buku (Cover + Rak)  │
                     │   - Rekomendasi Pertanyaan Lanjutan│
                     └───────────────────────────────────┘
```

### Fitur Kunci:
1. **Floating AI Chatbot Global (`<AiLibrarianChat />`)**:
   - Widget melayang di sudut kanan bawah yang dapat diakses dari beranda, katalog, hingga dashboard anggota.
   - Dilengkapi avatar animasi gradien, indikator status aktif, chip pertanyaan saran otomatis, dan riwayat percakapan.
2. **Mode Pencarian Cerdas Semantik di Katalog OPAC (`/katalog`)**:
   - Tombol toggle *"✨ Mode Cerdas AI (Semantik)"* di bilah pencarian katalog.
   - Menganalisis maksud pencarian pengguna dan menampilkan banner wawasan AI (*AI Insight Box*) sebelum daftar buku yang cocok.
3. **Panduan Fisik Nomor Rak & Eksemplar**:
   - Setiap buku yang direkomendasikan langsung mencantumkan nomor rak penyimpanan fisik (misal: `📍 Rak B-02 (Sains)`) serta jumlah eksemplar yang sedang tersedia untuk dipinjam.
4. **Pusat Informasi Kebijakan Perpustakaan**:
   - Mampu menjawab otomatis seputar aturan kuota pinjam (maksimal 3 buku), durasi masa pinjam (7 hari), tarif denda (Rp 1.000/hari), hingga jam operasional sekolah.

---

## 3. Komponen & Struktur File

```
src/
├── actions/
│   └── ai-librarian.ts                # Server action: askAiLibrarianAction & semanticSearchBooksAction
├── components/
│   ├── ai/
│   │   └── ai-librarian-chat.tsx      # Floating chat widget component
│   └── katalog/
│       └── katalog-page-client.tsx    # Mode AI toggle & AI insight banner
├── app/
│   └── layout.tsx                     # Mount global <AiLibrarianChat />
docs/
└── AI_SMART_LIBRARIAN.md             # Dokumentasi fitur ini
```

---

## 4. Konfigurasi Lingkungan (Opsional)

Fitur ini bekerja **100% out-of-the-box** tanpa API key berkat *Built-in Semantic Engine*. Namun, untuk pengalaman LLM percakapan paling fleksibel, pengelola perpustakaan cukup menambahkan Google Gemini API Key di `.env.local`:

```env
# Opsional: Untuk mengaktifkan Gemini 1.5 Flash LLM
GEMINI_API_KEY="AIzaSy..."
```

---

## 5. Verifikasi & Kualitas Teknis

1. **Pengecekan Tipe Data**:
   ```bash
   npx tsc --noEmit
   # Exit code: 0 (0 Errors)
   ```
2. **Kompilasi Produksi Next.js**:
   ```bash
   npm run build
   # Compiled successfully: 45/45 routes
   # Exit code: 0 (0 Warnings, 0 Errors)
   ```

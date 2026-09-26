# Dokumentasi Fitur: Smart Reading Analytics & Personalisasi Minat Baca (AI Reading DNA)

## 1. Ringkasan Fitur
**Smart Reading Analytics & Personalisasi Minat Baca (AI Reading DNA)** adalah platform analitik literasi mutakhir berbasis profil psikografis dan data aktivitas membaca pada aplikasi **PustakaKita Ceria**. Modul ini memetakan kebiasaan membaca siswa ke dalam **6 Arketipe Persona AI Reading DNA**, menyajikan visualisasi **Radar Chart 5 Dimensi Literasi**, melacak resolusi membaca tahunan (*Reading Challenge 2026*), menghadirkan kurasi rekomendasi buku dengan *AI Match Score* 90%+, serta menyediakan panel peta minat baca antarkelas dengan deteksi dini siswa inaktif (*Early Intervention via WhatsApp*).

---

## 2. Masalah yang Diselesaikan & Dampak Positif
| Tantangan Literasi Konvensional | Solusi AI Reading DNA | Dampak & Nilai Tambah |
| :--- | :--- | :--- |
| **Rekomendasi Bersifat Acak**: Siswa bingung memilih buku berikutnya karena katalog hanya diurutkan berdasarkan buku baru atau abjad. | **Kurasi Rekomendasi Cerdas (AI Match 90%+)**: Setiap buku disandingkan dengan argumen alasan personal (*"Mengapa buku ini cocok untukmu"*). | Meningkatkan rasio penyelesaian buku (*book completion rate*) dan kepuasan membaca siswa. |
| **Membaca Dianggap Beban Monoton**: Siswa tidak memiliki cerminan identitas diri dalam perjalanan literasinya. | **6 Arketipe Persona & Radar Spider Chart**: Siswa bangga mengetahui identitas literasinya (misal: *Sang Filosof Muda*, *Penjelajah Sains*). | Menumbuhkan rasa bangga (*literary identity*) dan mendorong siswa terus menaikkan level membaca. |
| **Siswa Inaktif Tidak Terdeteksi**: Pustakawan baru menyadari siswa tidak pernah meminjam buku saat akhir tahun ajaran. | **Deteksi Dini Inaktif (> 30 Hari) & Sapaan WA**: Sistem mendeteksi otomatis siswa yang pasif dan menyediakan tombol sapaan WhatsApp personal. | Mencegah *learning loss* dan menjangkau siswa yang membutuhkan pendampingan secara proaktif. |
| **Pengadaan Buku Tidak Sesuai Kebutuhan**: Pustakawan membeli buku berdasarkan selera pasar umum, bukan kebutuhan nyata siswa. | **Analisis Kesenjangan Koleksi (BOS Gap Analysis)**: Memetakan defisit judul per kategori berdasarkan arketipe siswa dominan di sekolah. | Belanja dana BOS buku menjadi tepat sasaran dan langsung diserbu peminjam. |

---

## 3. Arsitektur 6 Archetype Persona AI Reading DNA
Sistem mengelompokkan kebiasaan membaca siswa ke dalam 6 arketipe unik:

1. **`sang_filosof` (Sang Filosof Muda)**:
   - **Karakter**: Pembaca kontemplatif yang menyukai filsafat terapan, pengembangan diri, dan refleksi etika hidup.
   - **Level**: *Tingkat IV - Pemikir Kritis*.
   - **Contoh Buku Favorit**: *Filosofi Teras*, *Atomic Habits*, *Men's Search for Meaning*.
2. **`penjelajah_sains` (Penjelajah Sains & Kosmos)**:
   - **Karakter**: Memiliki rasa ingin tahu tinggi terhadap hukum fisika, astronomi, biologi eksperimental, dan STEM.
   - **Level**: *Tingkat IV - Saintis Handal*.
   - **Contoh Buku Favorit**: *Kosmos (Carl Sagan)*, *A Brief History of Time*, *Ensiklopedia Anatomi Tubuh*.
3. **`arsitek_imajinasi` (Arsitek Imajinasi Fantasi)**:
   - **Karakter**: Berimajinasi tinggi, menyukai *worldbuilding* kompleks, novel fantasi, fiksi spekulatif, dan sci-fi.
   - **Level**: *Tingkat V - Penjelajah Realitas*.
   - **Contoh Buku Favorit**: *Bumi Series (Tere Liye)*, *The Lord of the Rings*, *Harry Potter*.
4. **`sejarawan_analitis` (Sejarawan Analitis)**:
   - **Karakter**: Teliti menelusuri sejarah peradaban, biografi negarawan, dan dinamika sosial masyarakat.
   - **Level**: *Tingkat III - Pengamat Peradaban*.
   - **Contoh Buku Favorit**: *Sapiens*, *Biografi Bung Karno*, *Sejarah Nusantara*.
5. **`inovator_teknologi` (Inovator Teknologi Cilik)**:
   - **Karakter**: Berorientasi pada rekayasa perangkat lunak, koding, kecerdasan buatan, dan sains terapan modern.
   - **Level**: *Tingkat IV - Insinyur Digital*.
   - **Contoh Buku Favorit**: *Dasar Pemrograman Python*, *Kecerdasan Buatan untuk Pemula*, *Clean Code*.
6. **`pujangga_sastra` (Pujangga Sastra & Budaya)**:
   - **Karakter**: Peka terhadap keindahan diksi, prosa liris, antologi puisi, serta sastra klasik Indonesia.
   - **Level**: *Tingkat IV - Kurator Diksi*.
   - **Contoh Buku Favorit**: *Hujan Bulan Juni*, *Cantik Itu Luka*, *Laskar Pelangi*.

---

## 4. Spektrum Radar Chart 5 Dimensi Literasi
Visualisasi SVG Spider Chart mengukur kekuatan literasi dalam 5 sumbu komprehensif (skala 0 - 100%):
- **Kedalaman Narasi (*Narrative Depth*)**: Kemampuan mencerna teks bertema filosofis, kompleks, atau berlapis.
- **Pengetahuan Faktual (*Factual Knowledge*)**: Keterpaparan terhadap bacaan nonfiksi, data riset, sains, dan sejarah.
- **Imajinasi & Kreativitas (*Creativity*)**: Keterlibatan dalam fiksi spekulatif, metafora, dan pembangunan dunia imajinatif.
- **Konsistensi Membaca (*Reading Consistency*)**: Stabilitas durasi harian, streak membaca, dan ketepatan pengembalian buku.
- **Keberagaman Genre (*Genre Diversity*)**: Rentang variasi kategori buku yang dijelajahi dalam satu tahun ajaran.

---

## 5. Komponen & Antarmuka Utama

### A. Portal Siswa ([/dashboard/reading-dna](file:///d:/project/web/energies/pustakaKita/src/app/%28anggota%29/dashboard/reading-dna/page.tsx))
1. **Kartu Persona Arketipe**:
   - Tampilan gradasi dinamis bercahaya, badge level, kutipan filosofis pembaca, dan ringkasan keunikan diri.
2. **Interactive SVG Spider / Radar Chart**:
   - Visualisasi jaring laba-laba interaktif 5 dimensi lengkap dengan progress bar dan angka persentase.
3. **Kekuatan Utama & Tips Pertumbuhan**:
   - Catatan analisis kekuatan membaca siswa dan saran pengembangan minat baca selanjutnya.
4. **Tantangan Target Buku 2026 (*Reading Challenge*)**:
   - Penghitung jumlah buku tamat (contoh: 14 / 20 buku - 70%), proyeksi estimasi waktu penyelesaian, serta fitur pengubah target mandiri (*Inline Goal Editor*).
5. **Distribusi Kategori Bacaan**:
   - Visualisasi proporsi genre favorit (Pengembangan Diri 43%, Sains 21%, Sastra 21%, Teknologi 15%).
6. **Kurasi Rekomendasi Buku AI (Match Score 90%+)**:
   - Kartu buku rekomendasi lengkap dengan persentase kecocokan, argumen alasan AI, lokasi rak buku, status stok eksemplar, dan tombol langsung Pinjam / Baca E-Book.

### B. Panel Pustakawan ([/pustakawan/reading-dna](file:///d:/project/web/energies/pustakaKita/src/app/%28staff%29/pustakawan/reading-dna/page.tsx))
1. **Ringkasan KPI Sekolah**:
   - Total Siswa Teranalisis, Partisipasi Rata-Rata (%), Arketipe Terpopuler, dan Jumlah Siswa Butuh Intervensi.
2. **Tab 1: Peta Antarkelas**:
   - Matriks perbandingan kelas (XII MIPA 1, XI MIPA 1, X IPS 2, dll) mencakup tingkat partisipasi, arketipe dominan kelas, genre favorit, dan rata-rata buku dibaca.
3. **Tab 2: Deteksi Siswa Inaktif (*Early Intervention*)**:
   - Tabel siswa yang inaktif membaca > 30 hari.
   - Rekomendasi topik potensial sesuai minat tersembunyi siswa.
   - Tombol **"Kirim Sapaan Rekomendasi WA"** untuk menyapa siswa secara personal lewat WhatsApp resmi perpustakaan.
4. **Tab 3: Saran Belanja Koleksi (*BOS Gap Analysis*)**:
   - Analisis defisit judul koleksi di rak fisik dibandingkan antusiasme arketipe siswa untuk memandu pengadaan buku baru dana BOS.

---

## 6. File yang Terlibat
1. [src/actions/reading-dna.ts](file:///d:/project/web/energies/pustakaKita/src/actions/reading-dna.ts):
   - Definisi tipe: `ReadingArchetype`, `ReadingDimensions`, `ReadingAnalyticsProfile`, `AiBookRecommendation`, `ClassAggregateAnalytics`, dan `InterventionStudent`.
   - Server Actions: `getStudentReadingDnaAction`, `getAiBookRecommendationsAction`, `updateReadingGoalAction`, `getClassAggregateAnalyticsAction`, `getInterventionStudentsAction`, dan `sendReadingNudgeWhatsAppAction`.
2. [src/app/(anggota)/dashboard/reading-dna/page.tsx](file:///d:/project/web/energies/pustakaKita/src/app/%28anggota%29/dashboard/reading-dna/page.tsx):
   - Antarmuka AI Reading DNA siswa: Arketipe card, SVG Radar Chart, Reading Challenge 2026, dan kurasi rekomendasi AI.
3. [src/app/(staff)/pustakawan/reading-dna/page.tsx](file:///d:/project/web/energies/pustakaKita/src/app/%28staff%29/pustakawan/reading-dna/page.tsx):
   - Panel pustakawan: Peta minat baca kelas, deteksi dini siswa inaktif, dan analisis belanja koleksi BOS.
4. [src/app/(anggota)/layout.tsx](file:///d:/project/web/energies/pustakaKita/src/app/%28anggota%29/layout.tsx):
   - Integrasi navigasi menu `AI Reading DNA` pada sidebar siswa.
5. [src/app/(staff)/layout.tsx](file:///d:/project/web/energies/pustakaKita/src/app/%28staff%29/layout.tsx):
   - Integrasi navigasi menu `Peta Minat Baca AI` pada sidebar pustakawan.

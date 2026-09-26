"use server";

import { db, schema } from "@/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { DUMMY_BOOKS, DUMMY_COPIES, SYSTEM_CONFIG } from "@/data/dummy";

export interface AiLibrarianBookRecommendation {
  id: string;
  title: string;
  author: string;
  category: string;
  coverUrl: string | null;
  shelfLocation: string;
  availableCopies: number;
  totalCopies: number;
  slug: string;
  synopsisSnippet: string;
}

export interface AiLibrarianResponse {
  success: boolean;
  message: string;
  recommendedBooks: AiLibrarianBookRecommendation[];
  suggestedQuestions: string[];
  source: "gemini_api" | "built_in_semantic_engine";
}

/**
 * Mengambil ringkasan katalog buku dari database untuk grounding AI.
 */
async function getCatalogGroundingData() {
  if (db) {
    try {
      const bookList = await db.query.books.findMany({
        where: eq(schema.books.isActive, true),
        with: {
          category: true,
          copies: true,
        },
        limit: 40,
      });

      if (bookList.length > 0) {
        return bookList.map((b) => {
          const available = b.copies?.filter((c) => c.status === "tersedia").length || 0;
          const shelf = b.copies?.[0]?.shelfLocation || "Rak Koleksi Umum";
          return {
            id: b.id,
            title: b.title,
            author: b.author,
            category: b.category?.name || "Umum",
            description: b.description || "Buku koleksi perpustakaan.",
            coverUrl: b.coverUrl,
            slug: b.slug,
            shelfLocation: shelf,
            availableCopies: available,
            totalCopies: b.copies?.length || 1,
          };
        });
      }
    } catch (e) {
      console.warn("DB getCatalogGroundingData error, fallback to dummy:", e);
    }
  }

  // Fallback ke dummy books
  return DUMMY_BOOKS.map((b) => {
    const copies = DUMMY_COPIES.filter((c) => c.bookId === b.id);
    const available = copies.filter((c) => c.status === "tersedia").length;
    const shelf = copies[0]?.shelfLocation || "Rak Utama";
    return {
      id: b.id,
      title: b.title,
      author: b.author,
      category: b.category,
      description: b.synopsis || "Buku perpustakaan.",
      coverUrl: b.coverUrl,
      slug: b.slug,
      shelfLocation: shelf,
      availableCopies: available,
      totalCopies: copies.length || 1,
    };
  });
}

/**
 * Built-in Smart Semantic & Rule Engine
 */
function processBuiltInSemanticEngine(
  query: string,
  catalog: Array<{
    id: string;
    title: string;
    author: string;
    category: string;
    description: string;
    coverUrl: string | null;
    slug: string;
    shelfLocation: string;
    availableCopies: number;
    totalCopies: number;
  }>
): AiLibrarianResponse {
  const q = query.toLowerCase();

  // 1. Cek Pertanyaan Aturan & Fasilitas Perpustakaan
  if (q.includes("jam") || q.includes("buka") || q.includes("tutup") || q.includes("jadwal")) {
    return {
      success: true,
      message: `Perpustakaan PustakaKita buka setiap hari **Senin – Jumat pukul 07.30 – 16.00 WIB**, dan **Sabtu pukul 08.00 – 12.00 WIB**. Untuk hari Minggu dan libur nasional, perpustakaan tutup. Layanan sirkulasi mandiri di Kiosk Lobi tetap siap melayani selama gedung terbuka!`,
      recommendedBooks: [],
      suggestedQuestions: [
        "Berapa batas waktu peminjaman buku?",
        "Berapa denda jika terlambat mengembalikan?",
        "Rekomendasi novel fiksi terbaik",
      ],
      source: "built_in_semantic_engine",
    };
  }

  if (q.includes("denda") || q.includes("telat") || q.includes("terlambat") || q.includes("tarif")) {
    return {
      success: true,
      message: `Tarif denda keterlambatan di PustakaKita adalah **Rp ${SYSTEM_CONFIG.finePerDay.toLocaleString("id-ID")} per hari per eksemplar buku**. Batas maksimal akumulasi denda sebelum akun diblokir adalah **Rp ${SYSTEM_CONFIG.fineBlockThreshold.toLocaleString("id-ID")}**. Pembayaran denda dapat dilakukan via transfer bank di menu Dasbor Denda atau konfirmasi langsung ke pustakawan.`,
      recommendedBooks: [],
      suggestedQuestions: [
        "Bagaimana cara memperpanjang pinjaman?",
        "Berapa maksimal buku yang boleh dipinjam?",
        "Buku pemrograman web pemula",
      ],
      source: "built_in_semantic_engine",
    };
  }

  if (q.includes("berapa") && (q.includes("pinjam") || q.includes("buku") || q.includes("kuota") || q.includes("lama"))) {
    return {
      success: true,
      message: `Setiap anggota terdaftar berhak meminjam maksimal **${SYSTEM_CONFIG.maxBooksPerMember} eksemplar buku** secara bersamaan. Durasi peminjaman standar adalah **${SYSTEM_CONFIG.loanDurationDays} hari kalender**, dan Anda dapat memperpanjang masa pinjam sebanyak 1 kali (tambahan 7 hari) melalui menu Riwayat di Dasbor Anggota jika buku belum dipesan orang lain.`,
      recommendedBooks: [],
      suggestedQuestions: [
        "Cara pinjam buku di Kiosk lobi",
        "Rekomendasi buku teknologi dan AI",
        "Koleksi e-book yang bisa dibaca online",
      ],
      source: "built_in_semantic_engine",
    };
  }

  if (q.includes("kiosk") || q.includes("mandiri") || q.includes("scan")) {
    return {
      success: true,
      message: `Terminal Kiosk Mandiri lobi memungkinkan Anda meminjam dan mengembalikan buku tanpa mengantre di meja pustakawan! Cukup bawa kartu anggota digital di ponsel pintar Anda (bisa dibuka offline) atau ketik NIS/NIM di layar sentuh, lalu scan barcode buku menggunakan kamera atau barcode gun yang tersedia.`,
      recommendedBooks: [],
      suggestedQuestions: [
        "Buka menu Kiosk Lobi sekarang",
        "Cara cek kartu anggota offline",
        "Rekomendasi buku sains dan fisika",
      ],
      source: "built_in_semantic_engine",
    };
  }

  // 2. Pencarian & Rekomendasi Buku Semantik
  const tokens = q
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scoredBooks = catalog.map((b) => {
    let score = 0;
    const titleLower = b.title.toLowerCase();
    const catLower = b.category.toLowerCase();
    const descLower = b.description.toLowerCase();
    const authorLower = b.author.toLowerCase();

    // Direct phrase match
    if (titleLower.includes(q)) score += 15;
    if (catLower.includes(q)) score += 10;
    if (descLower.includes(q)) score += 8;

    // Tokenized relevance
    for (const t of tokens) {
      if (titleLower.includes(t)) score += 5;
      if (catLower.includes(t)) score += 4;
      if (descLower.includes(t)) score += 2;
      if (authorLower.includes(t)) score += 3;
    }

    // Keyword topic boosters
    if (q.includes("pemula") || q.includes("dasar") || q.includes("belajar")) {
      if (titleLower.includes("dasar") || titleLower.includes("pemula") || descLower.includes("pemula")) {
        score += 6;
      }
    }
    if (q.includes("novel") || q.includes("cerita") || q.includes("fiksi") || q.includes("seru")) {
      if (catLower.includes("fiksi") || catLower.includes("sastra") || catLower.includes("novel")) {
        score += 8;
      }
    }
    if (q.includes("teknologi") || q.includes("coding") || q.includes("komputer") || q.includes("program")) {
      if (catLower.includes("teknologi") || catLower.includes("komputer") || descLower.includes("web") || descLower.includes("coding")) {
        score += 8;
      }
    }
    if (q.includes("sains") || q.includes("fisika") || q.includes("alam") || q.includes("alam semesta")) {
      if (catLower.includes("sains") || titleLower.includes("fisika") || descLower.includes("kosmos")) {
        score += 8;
      }
    }
    if (q.includes("sejarah") || q.includes("dunia") || q.includes("bangsa")) {
      if (catLower.includes("sejarah") || descLower.includes("sejarah")) {
        score += 8;
      }
    }

    return { ...b, score };
  });

  scoredBooks.sort((a, b) => b.score - a.score);
  const bestMatches = scoredBooks.filter((b) => b.score > 0).slice(0, 3);

  if (bestMatches.length > 0) {
    const bookTitles = bestMatches.map((b) => `**"${b.title}"** karya ${b.author} (*${b.category}*, di **${b.shelfLocation}**)`).join(", ");
    
    return {
      success: true,
      message: `Tentu! Berdasarkan pencarian Anda tentang *"${query}"*, saya merekomendasikan koleksi buku berikut yang sangat sesuai untuk Anda baca:\n\n${bestMatches
        .map(
          (b, idx) =>
            `${idx + 1}. **${b.title}** (${b.author}) — Tersedia ${b.availableCopies} eksemplar di **${b.shelfLocation}**.\n   *Ringkasan:* ${b.description.slice(0, 110)}...`
        )
        .join("\n\n")}\n\nAnda dapat langsung menuju nomor rak tersebut atau memesannya melalui katalog online perpustakaan.`,
      recommendedBooks: bestMatches.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        category: b.category,
        coverUrl: b.coverUrl,
        shelfLocation: b.shelfLocation,
        availableCopies: b.availableCopies,
        totalCopies: b.totalCopies,
        slug: b.slug,
        synopsisSnippet: b.description.slice(0, 120),
      })),
      suggestedQuestions: [
        `Di mana letak rak ${bestMatches[0].shelfLocation}?`,
        "Apakah ada buku lain dalam kategori serupa?",
        "Bagaimana cara meminjam lewat Kiosk Lobi?",
      ],
      source: "built_in_semantic_engine",
    };
  }

  // Jika tidak ada kata kunci yang persis cocok, berikan rekomendasi umum terpopuler
  const popular = catalog.slice(0, 3);
  return {
    success: true,
    message: `Halo! Saya adalah **PustakaKita Smart AI Librarian**. Saya siap membantu Anda menemukan buku bacaan yang tepat, menjelaskan materi, atau memberikan informasi aturan sirkulasi perpustakaan.\n\nUntuk topik *"${query}"*, Anda juga dapat menelusuri koleksi rekomendasi populer kami di bawah ini:`,
    recommendedBooks: popular.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      category: b.category,
      coverUrl: b.coverUrl,
      shelfLocation: b.shelfLocation,
      availableCopies: b.availableCopies,
      totalCopies: b.totalCopies,
      slug: b.slug,
      synopsisSnippet: b.description.slice(0, 120),
    })),
    suggestedQuestions: [
      "Rekomendasikan buku pemrograman web untuk pemula",
      "Buku sains tentang antariksa dan fisika",
      "Berapa hari batas peminjaman buku?",
    ],
    source: "built_in_semantic_engine",
  };
}

/**
 * Server Action Utama untuk Percakapan Pustakawan AI
 */
export async function askAiLibrarianAction(params: {
  query: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<AiLibrarianResponse> {
  const queryClean = params.query.trim();
  if (!queryClean) {
    return {
      success: false,
      message: "Harap ketikkan pertanyaan atau topik buku yang ingin Anda tanyakan.",
      recommendedBooks: [],
      suggestedQuestions: [],
      source: "built_in_semantic_engine",
    };
  }

  const catalog = await getCatalogGroundingData();

  // Cek apakah GEMINI_API_KEY tersedia di environment
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (geminiApiKey) {
    try {
      const catalogSummary = catalog
        .map(
          (b) =>
            `- ID: ${b.id} | Judul: "${b.title}" | Penulis: ${b.author} | Kategori: ${b.category} | Rak: ${b.shelfLocation} | Tersedia: ${b.availableCopies} dari ${b.totalCopies} | Sinopsis: ${b.description.slice(0, 150)}`
        )
        .join("\n");

      const systemPrompt = `Anda adalah "PustakaKita Smart AI Librarian", pustakawan digital ramah, cerdas, dan suportif di perpustakaan sekolah/kampus PustakaKita Ceria.
Tugas Anda:
1. Menjawab pertanyaan siswa/anggota dengan bahasa Indonesia yang hangat, sopan, dan memotivasi literasi.
2. Merekomendasikan buku nyata yang ADA di database perpustakaan kami.
3. Selalu sebutkan judul buku yang cocok, penulis, lokasi rak perpustakaan, dan ketersediaan buku.
4. Jika ditanya aturan perpustakaan: Kuota pinjam maksimal 3 buku, masa pinjam 7 hari (bisa perpanjang 1x), denda Rp 1.000/hari/buku, jam buka Senin-Jumat 07.30-16.00 WIB & Sabtu 08.00-12.00 WIB.

Berikut data katalog buku perpustakaan yang TERSEDIA:
${catalogSummary}

Format keluaran: Jawab langsung percakapan secara natural dalam markdown. Sertakan rekomendasi buku relevan dari daftar di atas.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${systemPrompt}\n\nPertanyaan Anggota: "${queryClean}"`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiText) {
          // Cari buku yang disebutkan dalam respons AI
          const matchedBooks = catalog.filter((b) =>
            aiText.toLowerCase().includes(b.title.toLowerCase())
          );

          return {
            success: true,
            message: aiText,
            recommendedBooks: (matchedBooks.length > 0 ? matchedBooks : catalog.slice(0, 2)).map(
              (b) => ({
                id: b.id,
                title: b.title,
                author: b.author,
                category: b.category,
                coverUrl: b.coverUrl,
                shelfLocation: b.shelfLocation,
                availableCopies: b.availableCopies,
                totalCopies: b.totalCopies,
                slug: b.slug,
                synopsisSnippet: b.description.slice(0, 120),
              })
            ),
            suggestedQuestions: [
              "Di mana letak rak koleksi tersebut?",
              "Berapa batas waktu peminjaman buku?",
              "Cara pinjam buku di Kiosk lobi",
            ],
            source: "gemini_api",
          };
        }
      }
    } catch (apiErr) {
      console.warn("Gemini API call failed, switching to Smart Built-in Engine:", apiErr);
    }
  }

  // Fallback / Built-in Semantic Engine jika tanpa API key atau jika API error
  return processBuiltInSemanticEngine(queryClean, catalog);
}

/**
 * Server Action untuk Pencarian Cerdas Semantik di Halaman Katalog
 */
export async function semanticSearchBooksAction(naturalQuery: string) {
  const catalog = await getCatalogGroundingData();
  const res = processBuiltInSemanticEngine(naturalQuery, catalog);
  return {
    success: true,
    results: res.recommendedBooks,
    summary: res.message,
    source: res.source,
  };
}

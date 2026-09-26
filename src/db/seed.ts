import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import * as bcrypt from "bcryptjs";
import { db, schema } from "./index";
import {
  DUMMY_CATEGORIES,
  DUMMY_BOOKS,
  DUMMY_COPIES,
  DUMMY_MEMBERS,
  DUMMY_LOANS,
  DUMMY_FINES,
  DUMMY_EBOOKS,
  SYSTEM_CONFIG,
} from "../data/dummy";

export async function seedDatabase() {
  if (!db) {
    console.error("Database client not configured (DATABASE_URL empty). Skipping remote seed.");
    return;
  }

  console.log("🚀 Memulai seeding database PustakaKitaCeria ke Neon PostgreSQL...");

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash("password123", salt);

  try {
    // 1. Insert Categories
    console.log("📦 Seeding categories...");
    const categoryMap = new Map<string, string>(); // category name -> uuid
    for (const cat of DUMMY_CATEGORIES) {
      const inserted = await db
        .insert(schema.categories)
        .values({
          name: cat.name,
          slug: cat.slug,
          description: cat.desc,
        })
        .onConflictDoUpdate({
          target: schema.categories.slug,
          set: { name: cat.name, description: cat.desc },
        })
        .returning();

      if (inserted[0]) {
        categoryMap.set(cat.name, inserted[0].id);
      }
    }
    console.log(`✓ ${categoryMap.size} categories berhasil di-seed`);

    // 2. Insert Users
    console.log("👤 Seeding users...");
    const userMap = new Map<string, string>(); // nisNim -> uuid
    for (const user of DUMMY_MEMBERS) {
      const inserted = await db
        .insert(schema.users)
        .values({
          nisNim: user.nisNim,
          name: user.name,
          email: user.email,
          phoneWa: user.phoneWa,
          passwordHash: defaultPasswordHash,
          role: user.role,
          memberStatus: user.memberStatus,
          classOrMajor: user.classOrMajor,
          isVerified: true,
        })
        .onConflictDoUpdate({
          target: schema.users.nisNim,
          set: {
            name: user.name,
            phoneWa: user.phoneWa,
            role: user.role,
            memberStatus: user.memberStatus,
            classOrMajor: user.classOrMajor,
          },
        })
        .returning();

      if (inserted[0]) {
        userMap.set(user.nisNim, inserted[0].id);
      }
    }
    console.log(`✓ ${userMap.size} users berhasil di-seed (password default: password123)`);

    // 3. Insert Books
    console.log("📚 Seeding books...");
    const bookMap = new Map<string, string>(); // title prefix -> uuid
    for (const book of DUMMY_BOOKS) {
      const catId = categoryMap.get(book.category) || null;
      const inserted = await db
        .insert(schema.books)
        .values({
          title: book.title,
          slug: book.slug,
          author: book.author,
          publisher: book.publisher,
          isbn: book.isbn,
          categoryId: catId,
          description: book.synopsis,
          coverUrl: book.coverUrl,
          publicationYear: book.publicationYear,
          pages: book.pages,
          language: book.language,
          bookType: book.bookType,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: schema.books.slug,
          set: {
            title: book.title,
            author: book.author,
            categoryId: catId,
            coverUrl: book.coverUrl,
            bookType: book.bookType,
          },
        })
        .returning();

      if (inserted[0]) {
        bookMap.set(book.title.toLowerCase().trim(), inserted[0].id);
      }
    }
    console.log(`✓ ${bookMap.size} books berhasil di-seed`);

    // 4. Insert Book Copies (Eksemplar & Barcode)
    console.log("🏷️ Seeding book copies (eksemplar)...");
    const copyMap = new Map<string, { copyId: string; bookId: string }>(); // copyCode -> { copyId, bookId }
    for (const copy of DUMMY_COPIES) {
      // Find corresponding book ID
      let matchedBookId: string | null = null;
      for (const [titleKey, bId] of bookMap.entries()) {
        if (copy.bookTitle.toLowerCase().includes(titleKey.split(" ")[0])) {
          matchedBookId = bId;
          break;
        }
      }
      if (!matchedBookId) {
        matchedBookId = Array.from(bookMap.values())[0];
      }

      const inserted = await db
        .insert(schema.bookCopies)
        .values({
          bookId: matchedBookId,
          copyCode: copy.copyCode,
          status: copy.status,
          shelfLocation: copy.shelfLocation,
          conditionNote: copy.conditionNote || "Kondisi baik",
          acquisitionDate: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.bookCopies.copyCode,
          set: {
            status: copy.status,
            shelfLocation: copy.shelfLocation,
          },
        })
        .returning();

      if (inserted[0]) {
        copyMap.set(copy.copyCode.toLowerCase().trim(), {
          copyId: inserted[0].id,
          bookId: matchedBookId,
        });
      }
    }
    console.log(`✓ ${copyMap.size} book copies/barcodes berhasil di-seed`);

    // 5. Insert Ebooks
    console.log("📱 Seeding ebooks...");
    let ebookCount = 0;
    for (const eb of DUMMY_EBOOKS) {
      let matchedBookId: string | null = null;
      for (const [titleKey, bId] of bookMap.entries()) {
        if (eb.title.toLowerCase().includes(titleKey.split(" ")[0])) {
          matchedBookId = bId;
          break;
        }
      }
      if (!matchedBookId) {
        matchedBookId = Array.from(bookMap.values())[0];
      }

      await db
        .insert(schema.ebooks)
        .values({
          bookId: matchedBookId,
          fileUrl: `https://storage.pustakakitaceria.sch.id/ebooks/${eb.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`,
          fileFormat: eb.fileFormat || "pdf",
          fileSizeBytes: eb.fileSizeBytes || 5000000,
          readCount: 12,
          isActive: true,
        })
        .onConflictDoNothing();
      ebookCount++;
    }
    console.log(`✓ ${ebookCount} ebooks berhasil di-seed`);

    // 6. Insert Loans (Transaksi Peminjaman)
    console.log("🔄 Seeding loans...");
    const loanMap = new Map<string, string>(); // dummyLoanId -> realLoanId
    const staffId = Array.from(userMap.values())[1] || Array.from(userMap.values())[0];

    for (const dummyLoan of DUMMY_LOANS) {
      const memberId = userMap.get(dummyLoan.memberNisNim) || Array.from(userMap.values())[0];
      const copyInfo = copyMap.get(dummyLoan.copyCode.toLowerCase().trim()) || Array.from(copyMap.values())[0];

      if (memberId && copyInfo) {
        const borrowedAt = dummyLoan.borrowedAt ? new Date(dummyLoan.borrowedAt) : new Date();
        const dueDate = dummyLoan.dueDate ? new Date(dummyLoan.dueDate) : new Date(Date.now() + 7 * 86400000);
        const returnedAt = dummyLoan.returnedAt ? new Date(dummyLoan.returnedAt) : null;

        const inserted = await db
          .insert(schema.loans)
          .values({
            memberId,
            copyId: copyInfo.copyId,
            handledBy: staffId,
            borrowedAt,
            dueDate,
            returnedAt,
            status: dummyLoan.status,
            renewedCount: dummyLoan.renewedCount || 0,
            isSelfCheckout: false,
            notes: "Seeded initial transaction",
          })
          .returning();

        if (inserted[0]) {
          loanMap.set(dummyLoan.id, inserted[0].id);
        }
      }
    }
    console.log(`✓ ${loanMap.size} loan transactions berhasil di-seed`);

    // 7. Insert Fines (Denda)
    console.log("💰 Seeding fines...");
    let fineCount = 0;
    for (const dummyFine of DUMMY_FINES) {
      const memberId = userMap.get(dummyFine.memberNisNim) || Array.from(userMap.values())[0];
      const loanId = loanMap.get(dummyFine.loanId) || Array.from(loanMap.values())[0];

      if (memberId && loanId) {
        await db
          .insert(schema.fines)
          .values({
            loanId,
            memberId,
            amount: dummyFine.amount.toString(),
            daysLate: dummyFine.daysLate,
            status: dummyFine.status,
            paymentMethod: dummyFine.paymentMethod,
            proofUrl: dummyFine.proofUrl || null,
            paidAt: dummyFine.paidAt ? new Date(dummyFine.paidAt) : null,
            reason: dummyFine.reason || `Keterlambatan ${dummyFine.daysLate} hari pengembalian buku`,
          })
          .onConflictDoNothing();
        fineCount++;
      }
    }
    console.log(`✓ ${fineCount} fines records berhasil di-seed`);

    // 8. Insert System Settings
    console.log("⚙️ Seeding settings...");
    await db
      .insert(schema.settings)
      .values([
        {
          key: "loan_duration_days",
          value: { days: SYSTEM_CONFIG.loanDurationDays },
          description: "Durasi peminjaman standar dalam hari",
        },
        {
          key: "fine_per_day",
          value: { amount: SYSTEM_CONFIG.finePerDay },
          description: "Tarif denda keterlambatan per hari (Rp)",
        },
        {
          key: "fine_block_threshold",
          value: { threshold: SYSTEM_CONFIG.fineBlockThreshold },
          description: "Batas akumulasi denda untuk pemblokiran peminjaman (Rp)",
        },
        {
          key: "max_books_per_member",
          value: { maxBooks: SYSTEM_CONFIG.maxBooksPerMember },
          description: "Maksimal buku yang dapat dipinjam secara bersamaan",
        },
        {
          key: "max_renewals",
          value: { maxRenewals: SYSTEM_CONFIG.maxRenewals },
          description: "Maksimal perpanjangan masa pinjam",
        },
        {
          key: "bank_account",
          value: {
            bankName: SYSTEM_CONFIG.bankName,
            accountNumber: SYSTEM_CONFIG.bankAccountNumber,
            accountName: SYSTEM_CONFIG.bankAccountName,
          },
          description: "Rekening resmi perpustakaan untuk transfer manual denda",
        },
      ])
      .onConflictDoNothing();
    console.log("✓ Settings konfigurasi sistem berhasil di-seed");

    // 9. Insert Initial Audit Log
    console.log("📝 Seeding audit log inisialisasi...");
    await db
      .insert(schema.auditLogs)
      .values({
        actorName: "System Initializer",
        action: "create",
        entityType: "database_seed",
        description: "Inisialisasi skema dan seeding database awal PustakaKitaCeria ke Neon PostgreSQL",
        ipAddress: "127.0.0.1",
        userAgent: "Drizzle Seed CLI",
      });

    console.log("\n=======================================================");
    console.log("🎉 SEEDING DATABASE SELESAI 100% SUKSES!");
    console.log("=======================================================");
  } catch (error) {
    console.error("❌ Gagal melakukan seeding database:", error);
    throw error;
  }
}

// Support running directly via `npm run db:seed`
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

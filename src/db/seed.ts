import * as bcrypt from "bcryptjs";
import { db, schema } from "./index";
import {
  DUMMY_CATEGORIES,
  DUMMY_BOOKS,
  DUMMY_COPIES,
  DUMMY_MEMBERS,
  SYSTEM_CONFIG,
} from "../data/dummy";

export async function seedDatabase() {
  if (!db) {
    console.log("Database client not configured (DATABASE_URL empty). Skipping remote seed.");
    return;
  }

  console.log("Memulai seeding database PustakaKitaCeria...");

  const salt = await bcrypt.genSalt(12);
  const defaultPasswordHash = await bcrypt.hash("password123", salt);

  try {
    // 1. Insert Categories
    console.log("Seeding categories...");
    for (const cat of DUMMY_CATEGORIES) {
      await db
        .insert(schema.categories)
        .values({
          name: cat.name,
          slug: cat.slug,
          description: cat.desc,
        })
        .onConflictDoNothing();
    }

    // 2. Insert Users
    console.log("Seeding users...");
    for (const user of DUMMY_MEMBERS) {
      await db
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
        .onConflictDoNothing();
    }

    // 3. Insert Books
    console.log("Seeding books...");
    for (const book of DUMMY_BOOKS) {
      await db
        .insert(schema.books)
        .values({
          title: book.title,
          slug: book.slug,
          author: book.author,
          publisher: book.publisher,
          isbn: book.isbn,
          description: book.synopsis,
          coverUrl: book.coverUrl,
          publicationYear: book.publicationYear,
          pages: book.pages,
          language: book.language,
          bookType: book.bookType,
        })
        .onConflictDoNothing();
    }

    // 4. Insert Settings
    console.log("Seeding settings...");
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
          description: "Tarif denda keterlambatan per hari",
        },
        {
          key: "bank_account",
          value: {
            bankName: SYSTEM_CONFIG.bankName,
            accountNumber: SYSTEM_CONFIG.bankAccountNumber,
            accountName: SYSTEM_CONFIG.bankAccountName,
          },
          description: "Rekening resmi transfer manual denda",
        },
      ])
      .onConflictDoNothing();

    console.log("Seeding database selesai 100%! 🎉");
  } catch (error) {
    console.error("Gagal melakukan seeding:", error);
  }
}

// Support running directly via `npx tsx src/db/seed.ts`
if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

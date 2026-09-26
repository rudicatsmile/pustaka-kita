import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  decimal,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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
export const users = pgTable(
  "users",
  {
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
  },
  (t) => [
    index("users_role_idx").on(t.role),
    index("users_status_idx").on(t.memberStatus),
  ]
);

// ============ OTP TOKENS ============
export const otpTokens = pgTable("otp_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
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
export const books = pgTable(
  "books",
  {
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
  },
  (t) => [
    index("books_title_idx").on(t.title),
    index("books_author_idx").on(t.author),
    index("books_isbn_idx").on(t.isbn),
  ]
);

// ============ BOOK COPIES (Eksemplar) ============
export const bookCopies = pgTable(
  "book_copies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .references(() => books.id, { onDelete: "cascade" })
      .notNull(),
    copyCode: varchar("copy_code", { length: 40 }).notNull().unique(), // PKC-2024-001-001
    status: copyStatusEnum("status").notNull().default("tersedia"),
    shelfLocation: varchar("shelf_location", { length: 40 }), // Rak A-01
    conditionNote: text("condition_note"),
    acquisitionDate: timestamp("acquisition_date", { withTimezone: true }),
    acquisitionPrice: decimal("acquisition_price", { precision: 12, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("book_copies_code_idx").on(t.copyCode),
    index("book_copies_status_idx").on(t.status),
  ]
);

// ============ EBOOKS ============
export const ebooks = pgTable("ebooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id")
    .references(() => books.id, { onDelete: "cascade" })
    .notNull(),
  fileUrl: text("file_url").notNull(),
  fileFormat: varchar("file_format", { length: 8 }).notNull(), // pdf | epub
  fileSizeBytes: integer("file_size_bytes"),
  readCount: integer("read_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============ EBOOK PROGRESS ============
export const ebookProgress = pgTable(
  "ebook_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    ebookId: uuid("ebook_id")
      .references(() => ebooks.id, { onDelete: "cascade" })
      .notNull(),
    lastPage: integer("last_page").notNull().default(1),
    progressPercent: integer("progress_percent").notNull().default(0),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("unique_user_ebook").on(t.userId, t.ebookId),
  ]
);

// ============ LOANS (Peminjaman) ============
export const loans = pgTable(
  "loans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    memberId: uuid("member_id")
      .references(() => users.id, { onDelete: "restrict" })
      .notNull(),
    copyId: uuid("copy_id")
      .references(() => bookCopies.id, { onDelete: "restrict" })
      .notNull(),
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
  },
  (t) => [
    index("loans_member_idx").on(t.memberId),
    index("loans_status_idx").on(t.status),
    index("loans_due_date_idx").on(t.dueDate),
  ]
);

// ============ RESERVATIONS ============
export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  bookId: uuid("book_id")
    .references(() => books.id, { onDelete: "cascade" })
    .notNull(),
  reservedAt: timestamp("reserved_at", { withTimezone: true }).defaultNow().notNull(),
  status: reservationStatusEnum("status").notNull().default("menunggu"),
  readyAt: timestamp("ready_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  notifiedAt: timestamp("notified_at", { withTimezone: true }),
  queuePosition: integer("queue_position"),
});

// ============ FINES (Denda) ============
export const fines = pgTable(
  "fines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    loanId: uuid("loan_id")
      .references(() => loans.id, { onDelete: "cascade" })
      .notNull(),
    memberId: uuid("member_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    daysLate: integer("days_late").notNull().default(0),
    reason: text("reason"),
    status: fineStatusEnum("status").notNull().default("belum_bayar"),
    paymentMethod: varchar("payment_method", { length: 40 }).default("transfer_manual"),
    proofUrl: text("proof_url"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    verifiedBy: uuid("verified_by").references(() => users.id, { onDelete: "set null" }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    waiveReason: text("waive_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("fines_status_idx").on(t.status),
    index("fines_member_idx").on(t.memberId),
  ]
);

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
export const auditLogs = pgTable(
  "audit_logs",
  {
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
  },
  (t) => [
    index("audit_actor_idx").on(t.actorId),
    index("audit_entity_idx").on(t.entityType, t.entityId),
    index("audit_created_idx").on(t.createdAt),
  ]
);

// ============ SETTINGS ============
export const settings = pgTable("settings", {
  key: varchar("key", { length: 60 }).primaryKey(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============ RELATIONS ============
export const booksRelations = relations(books, ({ one, many }) => ({
  category: one(categories, { fields: [books.categoryId], references: [categories.id] }),
  copies: many(bookCopies),
  ebooks: many(ebooks),
}));

export const bookCopiesRelations = relations(bookCopies, ({ one, many }) => ({
  book: one(books, { fields: [bookCopies.bookId], references: [books.id] }),
  loans: many(loans),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
  member: one(users, { fields: [loans.memberId], references: [users.id] }),
  copy: one(bookCopies, { fields: [loans.copyId], references: [bookCopies.id] }),
  handler: one(users, { fields: [loans.handledBy], references: [users.id] }),
  fines: many(fines),
}));

export const finesRelations = relations(fines, ({ one }) => ({
  loan: one(loans, { fields: [fines.loanId], references: [loans.id] }),
  member: one(users, { fields: [fines.memberId], references: [users.id] }),
  verifier: one(users, { fields: [fines.verifiedBy], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  loans: many(loans),
  fines: many(fines),
  reservations: many(reservations),
}));

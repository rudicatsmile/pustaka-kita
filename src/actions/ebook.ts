"use server";

import { revalidatePath } from "next/cache";
import { DUMMY_EBOOKS } from "@/data/dummy";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export async function saveEbookProgressAction(params: {
  ebookId: string;
  userId?: string;
  page: number;
  totalPages: number;
}) {
  const eb = DUMMY_EBOOKS.find((e) => e.id === params.ebookId);
  const progressPercent = Math.min(
    100,
    Math.round((params.page / params.totalPages) * 100)
  );

  if (eb) {
    eb.lastPage = params.page;
    eb.progressPercent = progressPercent;
    eb.lastReadAt = new Date().toISOString().replace("T", " ").substring(0, 16);
  }

  // Update DB if connected
  if (db && params.userId) {
    try {
      await db
        .insert(schema.ebookProgress)
        .values({
          userId: params.userId,
          ebookId: params.ebookId,
          lastPage: params.page,
          progressPercent,
          lastReadAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [schema.ebookProgress.userId, schema.ebookProgress.ebookId],
          set: {
            lastPage: params.page,
            progressPercent,
            lastReadAt: new Date(),
          },
        });
    } catch (e) {
      console.warn("DB save ebook progress error:", e);
    }
  }

  revalidatePath("/dashboard/ebook");
  return {
    success: true,
    progressPercent,
    savedAt: new Date().toLocaleTimeString("id-ID"),
  };
}

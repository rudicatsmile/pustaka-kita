"use server";

import { revalidatePath } from "next/cache";
import { DUMMY_EBOOKS } from "@/data/dummy";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function getEbookDetailAction(ebookId: string) {
  if (db) {
    try {
      const eb = await db.query.ebooks.findFirst({
        where: eq(schema.ebooks.id, ebookId),
        with: { book: true },
      });

      if (eb) {
        return {
          id: eb.id,
          title: eb.book?.title || "Judul E-Book",
          author: eb.book?.author || "Penulis",
          fileUrl: eb.fileUrl,
          fileFormat: eb.fileFormat,
          totalPages: eb.book?.pages || 250,
          lastPage: 1,
        };
      }
    } catch (e) {
      console.warn("DB get ebook detail error, fallback:", e);
    }
  }

  const dummy = DUMMY_EBOOKS.find((e) => e.id === ebookId) || DUMMY_EBOOKS[0];
  return {
    id: dummy.id,
    title: dummy.title,
    author: dummy.author,
    fileUrl: ((dummy as unknown as Record<string, unknown>).fileUrl as string) || "/sample.pdf",
    fileFormat: dummy.fileFormat,
    totalPages: dummy.totalPages || 300,
    lastPage: dummy.lastPage || 1,
  };
}

export async function saveEbookProgressAction(params: {
  ebookId: string;
  userId?: string;
  page: number;
  totalPages: number;
}) {
  let session = null;
  try {
    session = await auth();
  } catch {}
  const userId = params.userId || session?.user?.id;

  const progressPercent = Math.min(
    100,
    Math.round((params.page / params.totalPages) * 100)
  );

  // Update DB
  if (db && userId) {
    try {
      await db
        .insert(schema.ebookProgress)
        .values({
          userId: userId,
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

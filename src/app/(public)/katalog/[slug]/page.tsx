import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBookBySlugAction } from "@/actions/books";
import { sanitizeHtml, stripHtml } from "@/lib/sanitize";
import { BookDetailClient } from "@/components/katalog/book-detail-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const { book } = await getBookBySlugAction(resolved.slug);

  if (!book) {
    return {
      title: "Buku Tidak Ditemukan | PustakaKitaCeria",
    };
  }

  const plainDesc = stripHtml(book.synopsis || "").substring(0, 160);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pustakakitaceria.sch.id";
  const canonicalUrl = `${baseUrl}/katalog/${book.slug}`;

  return {
    title: `${book.title} - ${book.author} | Perpustakaan PustakaKitaCeria`,
    description: plainDesc,
    keywords: [book.title, book.author, book.category, "perpustakaan digital", "katalog buku", "PustakaKitaCeria"],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${book.title} | PustakaKitaCeria`,
      description: plainDesc,
      url: canonicalUrl,
      siteName: "PustakaKitaCeria",
      images: [
        {
          url: book.coverUrl,
          width: 800,
          height: 1060,
          alt: `Sampul buku ${book.title}`,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${book.title} - ${book.author}`,
      description: plainDesc,
      images: [book.coverUrl],
    },
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const resolved = await params;
  const { book, copies } = await getBookBySlugAction(resolved.slug);

  if (!book) {
    notFound();
  }

  const cleanSynopsis = sanitizeHtml(book.synopsis || "");

  // Structured Data (JSON-LD) for Google Rich Snippets: Book & Library
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Book",
        "@id": `https://pustakakitaceria.sch.id/katalog/${book.slug}#book`,
        "name": book.title,
        "author": {
          "@type": "Person",
          "name": book.author,
        },
        "publisher": {
          "@type": "Organization",
          "name": book.publisher,
        },
        "isbn": book.isbn,
        "datePublished": book.publicationYear.toString(),
        "numberOfPages": book.pages,
        "inLanguage": "id",
        "bookFormat":
          book.bookType === "ebook"
            ? "https://schema.org/EBook"
            : "https://schema.org/Hardcover",
        "image": book.coverUrl,
        "description": stripHtml(book.synopsis || ""),
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": (book.rating || 4.8).toString(),
          "reviewCount": (book.readCount || 10).toString(),
        },
      },
      {
        "@type": "Library",
        "@id": "https://pustakakitaceria.sch.id/#library",
        "name": "Perpustakaan PustakaKitaCeria",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Jl. Pendidikan No. 45, Kompleks Kampus Merdeka",
          "addressLocality": "Jakarta Selatan",
          "addressCountry": "ID",
        },
        "telephone": "+62 21 7890 1234",
      },
    ],
  };

  return (
    <>
      {/* Inject JSON-LD Rich Snippet Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BookDetailClient
        book={book as any}
        copies={copies as any}
        sanitizedSynopsis={cleanSynopsis}
      />
    </>
  );
}

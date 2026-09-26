import { Metadata } from "next";
import { notFound } from "next/navigation";
import { DUMMY_BOOKS, DUMMY_COPIES } from "@/data/dummy";
import { sanitizeHtml, stripHtml } from "@/lib/sanitize";
import { BookDetailClient } from "@/components/katalog/book-detail-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const book = DUMMY_BOOKS.find((b) => b.slug === resolved.slug) || DUMMY_BOOKS[0];

  const plainDesc = stripHtml(book.synopsis).substring(0, 160);
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
  const book = DUMMY_BOOKS.find((b) => b.slug === resolved.slug) || DUMMY_BOOKS[0];

  if (!book) {
    notFound();
  }

  const copies = DUMMY_COPIES.filter((c) =>
    c.bookTitle.toLowerCase().includes(book.title.toLowerCase().split(" ")[0])
  );

  const cleanSynopsis = sanitizeHtml(book.synopsis);

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
        "description": stripHtml(book.synopsis),
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": book.rating.toString(),
          "reviewCount": book.readCount.toString(),
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
        book={book}
        copies={copies}
        sanitizedSynopsis={cleanSynopsis}
      />
    </>
  );
}

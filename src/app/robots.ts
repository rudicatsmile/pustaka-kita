import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pustakakitaceria.sch.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/katalog", "/tentang", "/panduan", "/kontak", "/kebijakan-privasi", "/syarat-ketentuan"],
        disallow: ["/dashboard/", "/pustakawan/", "/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

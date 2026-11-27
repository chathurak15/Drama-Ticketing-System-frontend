export const dynamic = "force-dynamic";

export async function GET() {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://naataka.lk";
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1/";

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/dramas</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/shows</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${BASE_URL}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${BASE_URL}/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`;

  try {
    const cleanApiUrl = API_URL.endsWith("/") ? API_URL : `${API_URL}/`;
    const res = await fetch(`${cleanApiUrl}seo/sitemap`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data?.dramas && Array.isArray(data.dramas)) {
        for (const d of data.dramas) {
          const slug = d.slug || d.id;
          xml += `
  <url>
    <loc>${BASE_URL}/drama/${slug}</loc>
    <changefreq>${d.changefreq || "weekly"}</changefreq>
    <priority>${d.priority || 0.85}</priority>
  </url>`;
        }
      }
      if (data?.shows && Array.isArray(data.shows)) {
        for (const s of data.shows) {
          const slug = s.slug || s.showId;
          xml += `
  <url>
    <loc>${BASE_URL}/show/${slug}</loc>
    <changefreq>${s.changefreq || "daily"}</changefreq>
    <priority>${s.priority || 0.95}</priority>
  </url>`;
        }
      }
    }
  } catch (e) {
    console.warn("Dynamic sitemap fetch error:", e.message);
  }

  xml += `
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

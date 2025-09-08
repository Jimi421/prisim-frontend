export const config = { runtime: "edge" };

type Env = {
  JIMI_DB: D1Database;
  PRISIM_BUCKET: R2Bucket;
};

// Small helper to send JSON responses from Edge API routes
function json(body: unknown, init: number | ResponseInit = 200) {
  const initObj = typeof init === "number" ? { status: init } : init;
  return new Response(JSON.stringify(body), {
    ...initObj,
    headers: { "content-type": "application/json; charset=utf-8", ...(initObj as any)?.headers },
  });
}

export default async function handler(req: Request, ctx: any) {
  const env: Env = (ctx as any).env ?? (globalThis as any).env; // for Next-on-Pages / Cloudflare Pages
  const url = new URL(req.url);
  const slug = url.pathname.split("/").pop() || "";

  if (!slug) return json({ error: "Missing slug" }, 400);

  try {
    // 1) Fetch gallery meta
    const galleryStmt = env.JIMI_DB.prepare(
      `SELECT id, title FROM galleries WHERE slug = ? LIMIT 1`
    ).bind(slug);

    const galleryRes = await galleryStmt.all(); // no generic; D1Result<any>
    const gallery = (galleryRes.results as any[])[0];

    if (!gallery) return json({ title: slug, images: [] }); // not found, safe empty

    // 2) Fetch images for that gallery
    const imagesStmt = env.JIMI_DB.prepare(
      `SELECT id, key, url, caption
       FROM images
       WHERE gallery_id = ?
       ORDER BY created_at DESC`
    ).bind(gallery.id);

    const imagesRes = await imagesStmt.all();
    const images = (imagesRes.results as any[]) ?? [];

    // If you store only the R2 object key, you can derive a URL here if needed.
    // For now, pass through whatever columns exist (key/url/caption).
    return json({ title: gallery.title ?? slug, images });
  } catch (err: any) {
    console.error("DB error (gallery slug):", err);
    return json({ error: "Database error" }, 500);
  }
}


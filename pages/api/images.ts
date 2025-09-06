// pages/api/images.ts
import type { NextApiRequest, NextApiResponse } from "next";

type ItemRow = {
  id: string;
  gallery_id: string;
  key: string;         // R2 object key
  mime: string;
  title: string;
  tags: string;        // JSON array string
  favorite: number;    // 0/1
  created_at: number;  // unix seconds
};

type GalleryRow = { id: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      res.status(405).end("Method Not Allowed");
      return;
    }

    // Cloudflare Pages (next-on-pages) exposes bindings on globalThis.env
    // We also fall back to global env names if you used JIMI_DB earlier.
    const env: any = (globalThis as any)?.env ?? {};
    const DB = env.DB ?? env.JIMI_DB;   // support either binding name

    if (!DB?.prepare) {
      res.status(500).json({ error: "Database not configured (DB binding missing)" });
      return;
    }

    // Optional filter: ?slug=my-gallery
    const slug = req.query.slug ? String(req.query.slug) : undefined;

    let galleryId: string | undefined;
    if (slug) {
      const g = (await DB.prepare("SELECT id FROM galleries WHERE slug = ?")
        .bind(slug)
        .first()) as GalleryRow | null;

      if (!g?.id) {
        res.status(404).json({ error: "Gallery not found" });
        return;
      }
      galleryId = g.id;
    }

    const stmt = galleryId
      ? DB.prepare(
          "SELECT id, gallery_id, key, mime, title, tags, favorite, created_at \
           FROM items WHERE gallery_id = ? ORDER BY created_at DESC"
        ).bind(galleryId)
      : DB.prepare(
          "SELECT id, gallery_id, key, mime, title, tags, favorite, created_at \
           FROM items ORDER BY created_at DESC"
        );

    const { results } = await stmt.all();
    res.status(200).json(results as ItemRow[]);
  } catch (err: any) {
    console.error("images API error:", err);
    res.status(500).json({ error: String(err?.message || err) });
  }
}


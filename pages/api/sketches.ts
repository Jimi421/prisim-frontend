// pages/api/sketches.ts
import type { NextApiRequest, NextApiResponse } from "next";

type ItemRow = {
  id: string;
  gallery_id: string;
  key: string;
  mime: string;
  title: string;
  tags: string;       // JSON array string
  favorite: number;   // 0/1
  created_at: number; // unix seconds
};
type GalleryRow = { id: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

    const env: any = (globalThis as any)?.env ?? {};
    const DB = env.DB ?? env.JIMI_DB;
    const R2: R2Bucket | undefined =
      env.PRISIM_R2 ?? env.BUCKET ?? env.ASSETS ?? env.PRISIM_BUCKET; // tolerant

    if (!DB?.prepare) return res.status(500).json({ error: "Database not configured" });
    // R2 is optional here; we’ll only use it to probe existence if present.

    const slug = req.query.slug ? String(req.query.slug) : undefined;

    let galleryId: string | undefined;
    if (slug) {
      const g = (await DB.prepare("SELECT id FROM galleries WHERE slug = ?")
        .bind(slug)
        .first()) as GalleryRow | null;
      if (!g?.id) return res.status(404).json({ error: "Gallery not found" });
      galleryId = g.id;
    }

    // Match JSON array string that contains "sketch"
    const baseSQL =
      "SELECT id, gallery_id, key, mime, title, tags, favorite, created_at " +
      "FROM items WHERE tags LIKE '%\"sketch\"%'";
    const sql = galleryId ? `${baseSQL} AND gallery_id = ? ORDER BY created_at DESC`
                          : `${baseSQL} ORDER BY created_at DESC`;

    const stmt = galleryId ? DB.prepare(sql).bind(galleryId) : DB.prepare(sql);
    const { results } = await stmt.all();

    // Optionally annotate with a boolean if the object exists in R2
    const enriched = await Promise.all(
      (results as ItemRow[]).map(async (row) => {
        if (!R2?.head) return { ...row, exists: null as boolean | null };
        try {
          const head = await R2.head(row.key);
          return { ...row, exists: !!head };
        } catch {
          return { ...row, exists: false };
        }
      })
    );

    return res.status(200).json(enriched);
  } catch (err: any) {
    console.error("sketches API error:", err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
}


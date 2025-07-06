import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const env: any = (global as any).env || {};

  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  if (!env.JIMI_DB || typeof env.JIMI_DB.prepare !== "function") {
    res.status(500).json({ error: "Database not configured" });
    return;
  }

  const gallery = req.query.gallery as string | undefined;

  try {
    let stmt: any;
    if (gallery) {
      stmt = env.JIMI_DB.prepare(`
        SELECT i.id, i.url, COALESCE(i.title, '') AS title, g.slug AS gallery
        FROM images i
        JOIN gallery_images gi ON gi.image_id = i.id
        JOIN galleries g ON g.id = gi.gallery_id
        WHERE g.slug = ?
        ORDER BY gi.position, i.created_at DESC
      `).bind(gallery);
    } else {
      stmt = env.JIMI_DB.prepare(`
        SELECT i.id, i.url, COALESCE(i.title, '') AS title, g.slug AS gallery
        FROM images i
        JOIN gallery_images gi ON gi.image_id = i.id
        JOIN galleries g ON g.id = gi.gallery_id
        ORDER BY g.name, gi.position, i.created_at DESC
      `);
    }
    const { results } = await stmt.all();
    res.status(200).json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
}

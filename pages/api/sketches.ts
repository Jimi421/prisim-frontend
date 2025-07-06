import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const env: any = (global as any).env || {};

  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  if (!env.JIMI_DB || typeof env.JIMI_DB.prepare !== "function") {
    res.status(500).json({ ok: false, error: "Database not configured" });
    return;
  }

  try {
    const stmt = env.JIMI_DB.prepare(`
      SELECT id, slug, title, style, black_and_white, notes, url, created_at, gallery
      FROM gallery_sketches
      ORDER BY created_at DESC
    `);
    const { results: sketches } = await stmt.all();
    res.status(200).json({ ok: true, sketches });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message || "Server error" });
  }
}

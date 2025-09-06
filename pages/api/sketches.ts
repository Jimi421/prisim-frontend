import type { NextApiRequest, NextApiResponse } from "next";

type ItemRow = {
  id: string;
  gallery_id: string;
  key: string;
  mime: string;
  title: string;
  tags: string;
  favorite: number;
  created_at: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

    const env: any = (globalThis as any)?.env ?? {};
    const DB = env.DB ?? env.JIMI_DB;
    if (!DB?.prepare) return res.status(500).json({ error: "Database not configured" });

    // If you filter sketches by tag “sketch” or a dedicated table, adjust the query here.
    const { results } = await DB.prepare(
      "SELECT id, gallery_id, key, mime, title, tags, favorite, created_at \
       FROM items ORDER BY created_at DESC"
    ).all();

    return res.status(200).json(results as ItemRow[]);
  } catch (err: any) {
    console.error("sketches API error:", err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
}


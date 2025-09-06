import type { NextApiRequest, NextApiResponse } from "next";

type GalleryRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  created_at: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const env: any = (globalThis as any)?.env ?? {};
    const DB = env.DB ?? env.JIMI_DB;
    if (!DB?.prepare) return res.status(500).json({ error: "Database not configured" });

    if (req.method === "GET") {
      const { results } = await DB.prepare(
        "SELECT id, slug, title, description, created_at FROM galleries ORDER BY created_at DESC"
      ).all();
      return res.status(200).json(results as GalleryRow[]);
    }

    if (req.method === "POST") {
      const { slug, title, description = "" } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!slug || !title) return res.status(400).json({ error: "Missing slug or title" });

      const id = crypto.randomUUID();
      await DB.prepare("INSERT INTO galleries (id, slug, title, description) VALUES (?, ?, ?, ?)")
        .bind(id, slug, title, description).run();

      return res.status(201).json({ id, slug, title, description });
    }

    return res.status(405).end("Method Not Allowed");
  } catch (err: any) {
    console.error("gallery API error:", err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
}


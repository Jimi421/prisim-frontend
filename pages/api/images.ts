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
    const R2: R2Bucket | undefined =
      env.PRISIM_R2 ?? env.BUCKET ?? env.ASSETS ?? env.PRISIM_BUCKET;

    if (!DB?.prepare) return res.status(500).json({ error: "Database not configured" });
    if (!R2?.get) return res.status(500).json({ error: "R2 bucket not configured" });

    const { results } = await DB.prepare(
      "SELECT id, gallery_id, key, mime, title, tags, favorite, created_at \
       FROM items ORDER BY created_at DESC"
    ).all();

    // Attach signed URLs for preview
    const enriched = await Promise.all(
      (results as ItemRow[]).map(async (row) => {
        try {
          const obj = await R2.head(row.key);
          const url = obj ? `https://pub-${env.PRISIM_R2 || env.BUCKET}.r2.dev/${row.key}` : null;
          return { ...row, url };
        } catch {
          return { ...row, url: null };
        }
      })
    );

    return res.status(200).json(enriched);
  } catch (err: any) {
    console.error("images API error:", err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
}


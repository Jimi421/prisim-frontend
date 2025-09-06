import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: { bodyParser: false } // we handle multipart ourselves
};

type GalleryRow = { id: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

    const env: any = (globalThis as any)?.env ?? {};
    const DB = env.DB ?? env.JIMI_DB;
    const ASSETS: R2Bucket | undefined = env.ASSETS;
    if (!DB?.prepare) return res.status(500).json({ error: "Database not configured" });
    if (!ASSETS?.put) return res.status(500).json({ error: "R2 bucket not configured" });

    const contentType = req.headers["content-type"] || "";
    if (!String(contentType).includes("multipart/form-data")) {
      return res.status(400).json({ error: "Expected multipart/form-data" });
    }

    // Convert Node stream -> Web Response to use .formData()
    const webResp = new (globalThis as any).Response(req as any, { headers: { "content-type": String(contentType) } });
    const form = await webResp.formData();

    const file = form.get("file") as File | null;
    const gallerySlug = String(form.get("gallery") || "");

    if (!file) return res.status(400).json({ error: "Missing file" });
    if (!gallerySlug) return res.status(400).json({ error: "Missing gallery slug" });

    const g = (await DB.prepare("SELECT id FROM galleries WHERE slug=?").bind(gallerySlug).first()) as GalleryRow | null;
    if (!g?.id) return res.status(404).json({ error: "Gallery not found" });

    const objectKey = `${gallerySlug}/${Date.now()}-${file.name}`;

    await ASSETS.put(objectKey, (file as any).stream(), {
      httpMetadata: { contentType: (file as any).type }
    });

    const id = crypto.randomUUID();
    await DB.prepare(
      "INSERT INTO items (id, gallery_id, key, mime, title) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, g.id, objectKey, (file as any).type, file.name).run();

    return res.status(201).json({ id, key: objectKey });
  } catch (err: any) {
    console.error("uploads API error:", err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
}


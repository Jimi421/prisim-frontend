// pages/api/gallery.ts
import type { NextRequest } from "next/server";
import { NextResponse }          from "next/server";
import { getRequestContext }     from "@cloudflare/next-on-pages";

export const config = { runtime: "edge" };

export default async function handler(req: NextRequest) {
  if (req.method !== "GET") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  // 🌟 Pull your bound D1 instance out of the request context
  const { env } = getRequestContext(); :contentReference[oaicite:4]{index=4}

  // Read ?gallery= from the URL, default to "default"
  const url     = new URL(req.url);
  const gallery = url.searchParams.get("gallery")?.trim() || "default";

  // SQL: if a gallery name is provided, filter; otherwise return all
  const sql = gallery
    ? `SELECT slug AS id, title, '/api/'||slug AS url, gallery
         FROM gallery_sketches
        WHERE gallery = ?
        ORDER BY created_at DESC`
    : `SELECT slug AS id, title, '/api/'||slug AS url, gallery
         FROM gallery_sketches
        ORDER BY created_at DESC`;

  try {
    const stmt = gallery
      ? env.JIMI_DB.prepare(sql).bind(gallery)
      : env.JIMI_DB.prepare(sql);
    const { results } = await stmt.all();

    return NextResponse.json(results);
  } catch (err: any) {
    console.error("Error fetching gallery:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// pages/api/gallery.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const config = { runtime: "edge" };

export default async function handler(req: NextRequest) {
  if (req.method !== "GET")
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });

  const { env } = getRequestContext();
  const url = new URL(req.url);
  const gallery = url.searchParams.get("gallery")?.trim() || "";

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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


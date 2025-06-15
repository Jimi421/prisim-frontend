// pages/api/gallery.ts
import { NextRequest, NextResponse } from "next/server";
import { env } from "../../lib/db";  // adjust path if your db binding is elsewhere

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const gallery = url.searchParams.get("gallery")?.trim();

  // Base SQL (returns slug, title, url and gallery name)
  const base = `
    SELECT
      slug   AS id,
      title,
      '/api/' || slug AS url,
      gallery
    FROM gallery_sketches
  `;

  // Append a filter if ?gallery=<name> was passed
  const sql = gallery
    ? base + ` WHERE gallery = ?`
    : base;
  
  const stmt = gallery
    ? env.JIMI_DB.prepare(sql).bind(gallery)
    : env.JIMI_DB.prepare(sql);

  const { results } = await stmt.all();
  return NextResponse.json(results);
}


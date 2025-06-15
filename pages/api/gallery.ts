// pages/api/gallery.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const config = {
  runtime: "edge",
};

export default async function GET(request: NextRequest) {
  // pull your D1 binding out of the edge context
  const { env } = getRequestContext();

  // read the "gallery" param (default to "default")
  const url = new URL(request.url);
  const gallery = url.searchParams.get("gallery")?.trim() || "default";

  // only return sketches from that gallery, ordered by newest first
  const sql = `
    SELECT
      slug AS id,
      title,
      '/api/' || slug AS url
    FROM gallery_sketches
    WHERE gallery = ?
    ORDER BY created_at DESC
  `;

  try {
    const stmt = env.JIMI_DB.prepare(sql).bind(gallery);
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


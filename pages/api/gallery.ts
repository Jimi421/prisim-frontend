// pages/api/gallery.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const config = { runtime: "edge" };

export default async function GET(request: NextRequest) {
  const { env } = getRequestContext();
  const url = new URL(request.url);

  // Grab the optional ?gallery= parameter
  const galleryParam = url.searchParams.get("gallery")?.trim();

  // Build SQL dynamically: no WHERE clause if no galleryParam
  let sql: string;
  let stmt: ReturnType<typeof env.JIMI_DB.prepare>;

  if (!galleryParam) {
    // 1️⃣ No filter: return everything
    sql = `
      SELECT
        slug AS id,
        title,
        gallery,
        '/api/' || slug AS url
      FROM gallery_sketches
      ORDER BY created_at DESC
    `;
    stmt = env.JIMI_DB.prepare(sql);
  } else {
    // 2️⃣ Filtered by specific gallery
    sql = `
      SELECT
        slug AS id,
        title,
        gallery,
        '/api/' || slug AS url
      FROM gallery_sketches
      WHERE gallery = ?
      ORDER BY created_at DESC
    `;
    stmt = env.JIMI_DB.prepare(sql).bind(galleryParam);
  }

  try {
    const { results } = await stmt.all();
    // Return an array of { id, title, gallery, url }
    return NextResponse.json(results);
  } catch (err: any) {
    console.error("Error fetching gallery:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// pages/api/gallery.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  // Only allow GET
  if (req.method !== "GET") {
    return NextResponse.json(
      { error: "Method Not Allowed" },
      { status: 405 }
    );
  }

  // Pull your bound D1 instance out of the request context
  const { env } = getRequestContext();

  // Read ?gallery= from the URL, defaulting to "default"
  const url = new URL(req.url);
  const gallery = url.searchParams.get("gallery") || "default";

  try {
    // Prepare & run the query
    const stmt = env.JIMI_DB.prepare(`
      SELECT
        slug            AS id,
        title,
        '/api/' || slug AS url
      FROM gallery_sketches
      WHERE gallery = ?
      ORDER BY rowid DESC
    `);

    const { results } = await stmt.bind(gallery).all();

    // Return results as JSON
    return NextResponse.json(results);
  } catch (err: any) {
    console.error("Error fetching gallery:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


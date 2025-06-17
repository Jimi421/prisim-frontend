// pages/api/gallery.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// ❌ Removed: export const config = { runtime: "edge" };

export default async function GET(request: NextRequest) {
  const { env } = getCloudflareContext();
  const url = new URL(request.url);
  const galleryParam = url.searchParams.get("gallery")?.trim();

  const tableName = "sketches";  // adjust if needed

  let baseQuery = `
    SELECT slug AS id, title, gallery, file_key
    FROM ${tableName}
    {{WHERE}}
    ORDER BY created_at DESC
  `;
  const params: unknown[] = [];

  if (galleryParam) {
    baseQuery = baseQuery.replace("{{WHERE}}", "WHERE gallery = ?");
    params.push(galleryParam);
  } else {
    baseQuery = baseQuery.replace("{{WHERE}}", "");
  }

  try {
    const stmt = env.JIMI_DB.prepare(baseQuery);
    if (params.length) stmt.bind(...params);
    const { results } = await stmt.all();

    const items = results.map((r: any) => ({
      id: r.id,
      title: r.title,
      gallery: r.gallery,
      url: `/api/${r.file_key}`,
    }));

    return NextResponse.json(items);
  } catch (err: any) {
    console.error("Error fetching gallery:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

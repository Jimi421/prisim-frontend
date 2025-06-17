import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default async function handler(request: NextRequest) {
  const { env } = getCloudflareContext();
  try {
    const { results } = await env.JIMI_DB
      .prepare("SELECT * FROM gallery_sketches ORDER BY created_at DESC")
      .all();

    return NextResponse.json({ ok: true, sketches: results });
  } catch (err: any) {
    console.error("Error fetching sketches:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

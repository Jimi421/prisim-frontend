// pages/api/images.ts
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ❌ Removed: export const config = { runtime: "edge" };

export default async function handler(request: NextRequest) {
  const { env } = getCloudflareContext();

  try {
    // Adjust your table name if needed
    const { results } = await env.JIMI_DB
      .prepare("SELECT * FROM images")
      .all();

    return NextResponse.json(results);
  } catch (err: any) {
    console.error("Images API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

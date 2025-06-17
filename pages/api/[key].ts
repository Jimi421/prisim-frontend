// pages/api/[key].ts
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default async function handler(request: NextRequest) {
  const { env } = getCloudflareContext();

  // Extract the file key from the path
  const url = new URL(request.url);
  const key = url.pathname.split("/").pop();
  if (!key) {
    return NextResponse.json({ ok: false, error: "No key in URL" }, { status: 400 });
  }

  try {
    const object = await env.PRISIM_BUCKET.get(key);
    if (!object) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    return new Response(object.body, {
      headers: { "Content-Type": object.httpMetadata.contentType },
    });
  } catch (err: any) {
    console.error("Fetch image error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Internal Error" },
      { status: 500 }
    );
  }
}


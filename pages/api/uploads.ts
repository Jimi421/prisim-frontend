// pages/api/uploads.ts
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ❌ Removed: export const config = { runtime: "edge" };

export default async function handler(request: NextRequest) {
  const { env } = getCloudflareContext();

  // Only allow POST
  if (request.method !== "POST") {
    return NextResponse.json(
      { ok: false, error: `Method ${request.method} Not Allowed` },
      { status: 405 }
    );
  }

  // Must be multipart/form-data
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { ok: false, error: "Invalid content type" },
      { status: 400 }
    );
  }

  // Parse the form
  const form = await request.formData();
  const file = form.get("file");
  const title = form.get("title")?.toString() ?? "untitled";
  const style = form.get("style")?.toString() ?? "";
  const notes = form.get("notes")?.toString() ?? "";
  const blackAndWhite = form.get("blackAndWhite") === "on";

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Missing file" },
      { status: 400 }
    );
  }

  // Generate a unique key
  const key = crypto.randomUUID() + "-" + file.name;
  const arrayBuffer = await file.arrayBuffer();

  try {
    // Write to R2
    await env.PRISIM_BUCKET.put(key, arrayBuffer, {
      httpMetadata: { contentType: file.type },
    });

    // Insert metadata into D1 (adjust table & columns as needed)
    await env.JIMI_DB.prepare(
      `INSERT INTO sketches (slug, title, gallery, file_key, notes, black_and_white)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(key, title, style, key, notes, blackAndWhite ? 1 : 0).run();

    return NextResponse.json({ ok: true, key });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Internal Error" },
      { status: 500 }
    );
  }
}


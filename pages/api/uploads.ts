// pages/api/uploads.ts
import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextResponse } from "next/server";

export const config = { runtime: "edge" };

export async function POST(request: Request) {
  const { env } = getRequestContext();

  try {
    // 1. Validate multipart
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { ok: false, error: "Invalid content type" },
        { status: 400 }
      );
    }

    // 2. Parse form
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Missing file" },
        { status: 400 }
      );
    }

    // 3. Extract metadata
    const title = (form.get("title") || "").toString();
    const style = (form.get("style") || "").toString();
    const notes = (form.get("notes") || "").toString();
    const bwVal = form.get("blackAndWhite");
    const blackAndWhite = bwVal === "1" || bwVal === "true";

    // 4. Upload to R2
    const key = crypto.randomUUID();
    const arrayBuffer = await file.arrayBuffer();
    await env.PRISIM_BUCKET.put(key, arrayBuffer, {
      httpMetadata: { contentType: file.type },
    });

    // 5. Write to D1
    const url = `/api/${key}`;
    await env.JIMI_DB.prepare(
      `INSERT INTO gallery_sketches
        (slug, title, style, black_and_white, notes, url)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
    )
      .bind(key, title, style, blackAndWhite ? 1 : 0, notes, url)
      .run();

    // 6. Return success JSON
    return NextResponse.json({ ok: true, key }, { status: 200 });
  } catch (err: any) {
    console.error("Upload error:", err);
    // Always return JSON on errors
    return NextResponse.json(
      { ok: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}


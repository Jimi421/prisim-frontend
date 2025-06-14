import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextResponse } from "next/server";

export const config = { runtime: "edge" };

export default async function handler(request: Request) {
  const { env } = getRequestContext();
  try {
    const ct = request.headers.get("content-type") || "";
    if (!ct.includes("multipart/form-data")) {
      return NextResponse.json({ ok: false, error: "Invalid content type" }, { status: 400 });
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
    }

    const title = form.get("title")?.toString() || "";
    const style = form.get("style")?.toString() || "";
    const notes = form.get("notes")?.toString() || "";
    const bwVal = form.get("blackAndWhite");
    const blackAndWhite = bwVal === "1" || bwVal === "true";

    const key = crypto.randomUUID();
    const buf = await file.arrayBuffer();
    await env.PRISIM_BUCKET.put(key, buf, {
      httpMetadata: { contentType: file.type },
    });

    const url = `/api/${key}`;
    await env.JIMI_DB.prepare(
      `INSERT INTO gallery_sketches
         (slug, title, style, black_and_white, notes, url)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
    )
      .bind(key, title, style, blackAndWhite ? 1 : 0, notes, url)
      .run();

    return NextResponse.json({ ok: true, key });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}


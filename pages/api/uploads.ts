export const config = { runtime: "edge" };

type Env = {
  PRISIM_BUCKET: R2Bucket;
  JIMI_DB: D1Database;
};

function json(body: unknown, init: number | ResponseInit = 200) {
  const initObj = typeof init === "number" ? { status: init } : init;
  return new Response(JSON.stringify(body), {
    ...initObj,
    headers: { "content-type": "application/json; charset=utf-8", ...(initObj as any)?.headers },
  });
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function handler(req: Request, ctx: any) {
  const env: Env = (ctx as any).env ?? (globalThis as any).env;

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      // Edge runtime supports formData() on Request
      const form = await req.formData();
      const file = form.get("file");
      const keyFromForm = form.get("key")?.toString();
      const title = form.get("title")?.toString() || "";
      const style = form.get("style")?.toString() || "";
      const notes = form.get("notes")?.toString() || "";
      const gallery = form.get("gallery")?.toString() || "";
      const blackAndWhite = form.get("blackAndWhite") ? 1 : 0;

      if (!(file instanceof File)) {
        return json({ error: "Missing file" }, 400);
      }

      const key = keyFromForm || `${Date.now()}-${file.name}`;
      // Upload to R2
      await env.PRISIM_BUCKET.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type || "application/octet-stream" },
      });

      const slug = `${slugify(title)}-${Date.now()}`;
      const url = `/api/files/${encodeURIComponent(key)}`;

      const insertRes = await env.JIMI_DB.prepare(
        `INSERT INTO sketches (slug, title, style, black_and_white, notes, url, gallery)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(slug, title, style, blackAndWhite, notes, url, gallery)
        .run();

      const rowRes = await env.JIMI_DB.prepare(
        `SELECT id, slug, title, style, black_and_white, notes, url, gallery, created_at
         FROM sketches WHERE id = ?`
      )
        .bind(insertRes.meta.last_row_id)
        .all();

      const sketch = (rowRes.results as any[])[0];

      return json({ ok: true, sketch });
    }

    // Raw body upload (fallback)
    const key = new URL(req.url).searchParams.get("key") || `${Date.now()}.bin`;
    const buf = await req.arrayBuffer();
    await env.PRISIM_BUCKET.put(key, buf);

    return json({ ok: true, key });
  } catch (err: any) {
    console.error("Upload error:", err);
    return json({ ok: false, error: "Upload failed" }, 500);
  }
}


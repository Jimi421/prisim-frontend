import { getRequestContext } from "@cloudflare/next-on-pages";

export const config = { runtime: "edge" };

export async function POST(request: Request) {
  const { env } = getRequestContext(); // ✅ Access R2 and D1 bindings here

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing file" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const title = (form.get("title") || "").toString();
    const style = (form.get("style") || "").toString();
    const notes = (form.get("notes") || "").toString();
    const bwVal = form.get("blackAndWhite");
    const blackAndWhite = bwVal === "1" || bwVal === "true";

    const key = crypto.randomUUID();
    const arrayBuffer = await file.arrayBuffer();

    await env.PRISIM_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    const url = `/api/${key}`;
    await env.JIMI_DB.prepare(
      `INSERT INTO gallery_sketches (slug, title, style, black_and_white, notes, url)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
    )
      .bind(key, title, style, blackAndWhite ? 1 : 0, notes, url)
      .run();

    return new Response(
      JSON.stringify({ ok: true, key }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Upload error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}


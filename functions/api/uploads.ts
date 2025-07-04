// /functions/api/uploads.ts
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const title = formData.get("title");
    const style = formData.get("style");
    const blackAndWhite = formData.get("blackAndWhite") === "true" ? 1 : 0;
    const notes = formData.get("notes") || "";
    if (!(file instanceof File)) {
      return Response.json({ ok: false, error: "Missing file" }, { status: 400 });
    }

    // Create a unique key
    const ext = file.name.split(".").pop();
    const key = `sketches/${crypto.randomUUID()}.${ext}`;

    // Upload to R2
    await env.PRISIM_BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type }
    });

    // Save to D1 (assume 'sketches' table with matching columns)
    await env.JIMI_DB.prepare(`
      INSERT INTO sketches (slug, title, style, black_and_white, notes, url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      key, // slug
      title,
      style,
      blackAndWhite,
      notes,
      `https://pub-cdn.cloudflare.dev/${env.PRISIM_BUCKET.bucket_name}/${key}` || key,
    ).run();

    return Response.json({ ok: true, key });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message || "Upload server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


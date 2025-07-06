// /functions/api/uploads.ts

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const title = formData.get("title")?.toString() || "";
    const style = formData.get("style")?.toString() || "";
    const notes = formData.get("notes")?.toString() || "";
    const blackAndWhite = formData.get("blackAndWhite") === "true" ? 1 : 0;
    const gallery = formData.get("gallery")?.toString() || "";
    // Generate a slug/key for this upload
    const ext = (file instanceof File && file.name.includes(".")) ? file.name.split(".").pop() : "png";
    const slug = crypto.randomUUID();
    const key = `gallery_sketches/${slug}.${ext}`;

    if (!(file instanceof File)) {
      return Response.json({ ok: false, error: "No file uploaded" }, { status: 400 });
    }

    // Upload file to R2
    await env.PRISIM_BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type }
    });

    // Build the public URL for the image (adjust as needed for your R2 setup)
    const url = `https://pub-cdn.cloudflare.dev/${env.PRISIM_BUCKET.bucket_name}/${key}`;

    // Insert metadata into D1
    await env.JIMI_DB.prepare(`
      INSERT INTO gallery_sketches 
        (slug, title, style, notes, black_and_white, created_at, url, gallery)
      VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?)
    `).bind(
      slug,      // slug (unique id)
      title,
      style,
      notes,
      blackAndWhite,
      url,
      gallery
    ).run();

    return Response.json({ ok: true, key, url, slug });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message || "Upload server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


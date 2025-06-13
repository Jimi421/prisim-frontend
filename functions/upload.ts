export const config = {
  runtime: "experimental-edge",
};

export async function POST(request: Request, context: any) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ ok: false, error: "No file uploaded." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Required metadata fields
    const title = formData.get("title")?.toString() || "Untitled";
    const style = formData.get("style")?.toString() || "";
    const notes = formData.get("notes")?.toString() || "";
    const blackAndWhite = formData.get("blackAndWhite") === "true";

    // Generate unique key and R2-friendly filename
    const key = `${Date.now()}_${file.name}`;
    const url = `/api/r2/${key}`; // ✅ this is the public route

    // Upload to R2
    await context.env.PRISIM_BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    // Save metadata to D1
    await context.env.JIMI_DB.prepare(
      `INSERT INTO gallery_sketches (slug, title, style, black_and_white, notes, url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      key.replace(/\.\w+$/, ""), // slug (without extension)
      title,
      style,
      blackAndWhite ? 1 : 0,
      notes,
      url
    ).run();

    return new Response(JSON.stringify({ ok: true, key, url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


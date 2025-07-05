// /functions/api/gallery.ts
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const gallery = url.searchParams.get("gallery");

  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    let stmt;
    if (gallery) {
      // Return all sketches for a specific gallery/group name
      stmt = env.JIMI_DB.prepare(`
        SELECT id, slug, title, style, notes, black_and_white, created_at, url, gallery
        FROM gallery_sketches
        WHERE gallery = ?
        ORDER BY created_at DESC
      `).bind(gallery);
    } else {
      // Return all sketches, newest first
      stmt = env.JIMI_DB.prepare(`
        SELECT id, slug, title, style, notes, black_and_white, created_at, url, gallery
        FROM gallery_sketches
        ORDER BY created_at DESC
      `);
    }
    const { results } = await stmt.all();
    return Response.json(results);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

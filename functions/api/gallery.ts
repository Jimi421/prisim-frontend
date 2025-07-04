// /functions/api/gallery.ts
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const gallery = url.searchParams.get("gallery");

  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    if (gallery) {
      // Return images for this gallery
      const stmt = env.JIMI_DB.prepare(`
        SELECT i.id, i.url, COALESCE(i.title, '') AS title, g.slug AS gallery
        FROM images i
        JOIN gallery_images gi ON gi.image_id = i.id
        JOIN galleries g ON g.id = gi.gallery_id
        WHERE g.slug = ?
        ORDER BY gi.position, i.created_at DESC
      `).bind(gallery);
      const { results } = await stmt.all();
      return Response.json(results);
    } else {
      // Return all galleries for dropdown/filter
      const stmt = env.JIMI_DB.prepare(`
        SELECT slug, name
        FROM galleries
        ORDER BY name
      `);
      const { results } = await stmt.all();
      return Response.json(results);
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


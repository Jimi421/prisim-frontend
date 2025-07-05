export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  try {
    const stmt = env.JIMI_DB.prepare(`
      SELECT id, slug, title, style, black_and_white, notes, url, created_at, gallery
      FROM gallery_sketches
      ORDER BY created_at DESC
    `);
    const { results: sketches } = await stmt.all();
    return Response.json({ ok: true, sketches });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message || "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

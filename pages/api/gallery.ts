// functions/api/gallery.ts

export const onRequestGet: PagesFunction<{ DB: D1Database }> = async ({ env }) => {
  try {
    // Define the shape of your gallery row
    type GalleryRow = {
      id: string;
      slug: string;
      title: string;
      description: string;
      created_at: number;
    };

    const stmt = env.DB.prepare(
      "SELECT id, slug, title, description, created_at FROM galleries ORDER BY created_at DESC"
    );

    // No generics here — cast the result after
    const { results } = await stmt.all();
    return Response.json(results as GalleryRow[]);
  } catch (err: any) {
    console.error("Database query error (gallery GET):", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch galleries", details: String(err) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
};

export const onRequestPost: PagesFunction<{ DB: D1Database }> = async ({ request, env }) => {
  try {
    const body = await request.json<{ slug: string; title: string; description?: string }>();
    const { slug, title, description = "" } = body;

    if (!slug || !title) {
      return new Response(
        JSON.stringify({ error: "Missing slug or title" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const id = crypto.randomUUID();

    await env.DB.prepare(
      "INSERT INTO galleries (id, slug, title, description) VALUES (?, ?, ?, ?)"
    )
      .bind(id, slug, title, description)
      .run();

    return Response.json({ id, slug, title, description });
  } catch (err: any) {
    console.error("Database insert error (gallery POST):", err);
    return new Response(
      JSON.stringify({ error: "Failed to create gallery", details: String(err) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
};


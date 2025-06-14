export const config = {
  runtime: "edge", // Required for Cloudflare Pages
};

export default async function handler(req: Request, ctx: any) {
  try {
    const db = ctx.env.JIMI_DB;

    const result = await db
      .prepare("SELECT id, slug, title, style, url, created_at FROM gallery_sketches ORDER BY created_at DESC")
      .all();

    return new Response(JSON.stringify({ success: true, data: result.results }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}


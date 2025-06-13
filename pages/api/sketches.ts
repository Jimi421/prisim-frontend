export const config = {
  runtime: "experimental-edge",
};

export async function GET(_request: Request, context: any) {
  try {
    const db = context.env.JIMI_DB;

    const result = await db
      .prepare("SELECT id, slug, title, style, black_and_white, notes, url, created_at FROM gallery_sketches ORDER BY created_at DESC")
      .all();

    return new Response(
      JSON.stringify({ ok: true, sketches: result.results }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}


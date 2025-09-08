export const config = { runtime: "edge" };

type Env = {
  JIMI_DB: D1Database;
};

function json(body: unknown, init: number | ResponseInit = 200) {
  const initObj = typeof init === "number" ? { status: init } : init;
  return new Response(JSON.stringify(body), {
    ...initObj,
    headers: { "content-type": "application/json; charset=utf-8", ...(initObj as any)?.headers },
  });
}

export default async function handler(req: Request, ctx: any) {
  const env: Env = (ctx as any).env ?? (globalThis as any).env;
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 50), 200);

  try {
    const stmt = env.JIMI_DB.prepare(
      `SELECT id, gallery_id, key, url, caption, created_at
       FROM images
       ORDER BY created_at DESC
       LIMIT ?`
    ).bind(limit);

    const res = await stmt.all();
    const results = (res.results as any[]) ?? [];

    return json({ ok: true, images: results });
  } catch (err: any) {
    console.error("Database query error (images):", err);
    return json({ ok: false, error: "Database error" }, 500);
  }
}


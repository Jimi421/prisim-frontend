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

export default async function handler(_req: Request, ctx: any) {
  const env: Env = (ctx as any).env ?? (globalThis as any).env;

  try {
    const stmt = env.JIMI_DB.prepare(
      `SELECT id, title, prompt, image_url, created_at
       FROM sketches
       ORDER BY created_at DESC`
    );

    const res = await stmt.all(); // no generic
    const results = (res.results as any[]) ?? [];

    return json({ ok: true, sketches: results });
  } catch (err: any) {
    console.error("Database query error (sketches):", err);
    return json({ ok: false, error: "Database error" }, 500);
  }
}


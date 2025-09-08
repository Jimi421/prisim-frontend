import { getEnv } from "../../lib/getEnv";

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
  const env = getEnv<Env>(req, ctx);
  if (!env?.JIMI_DB) {
    return json({ error: "D1 binding JIMI_DB not available" }, 500);
  }

  try {
    const stmt = env.JIMI_DB.prepare(
      `SELECT id, slug, title, style, black_and_white, notes, url, gallery, created_at
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


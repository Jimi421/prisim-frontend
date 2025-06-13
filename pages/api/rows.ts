import { getRequestContext } from "@cloudflare/next-on-pages";
export const runtime = "edge";

export default async function handler() {
  const { env } = getRequestContext();

  try {
    const query = `SELECT * FROM gallery_images LIMIT 5;`;
    const result = await env.JIMI_DB.prepare(query).all();

    return new Response(
      JSON.stringify({ ok: true, rows: result.results }, null, 2),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify(
        { ok: false, error: err.message, stack: err.stack?.split("\n").slice(0, 3) },
        null,
        2
      ),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}


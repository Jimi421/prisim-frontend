import { getRequestContext } from "@cloudflare/next-on-pages";

export const config = { runtime: "edge" };

export async function GET() {
  const { env } = getRequestContext();

  try {
    const result = await env.JIMI_DB
      .prepare(
        `SELECT slug AS id, title, '/api/' || slug AS url
         FROM gallery_sketches
         ORDER BY rowid DESC
         LIMIT 20`
      )
      .all();

    return new Response(JSON.stringify(result.results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("D1 gallery fetch failed:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch gallery" }),
      { status: 500 }
    );
  }
}


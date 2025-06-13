import { getRequestContext } from "@cloudflare/next-on-pages";
export const runtime = "edge";

export default async function handler() {
  const { env } = getRequestContext();
  try {
    // List all tables in the bound D1:
    const { results } = await env.JIMI_DB
      .prepare("SELECT name FROM sqlite_master WHERE type='table';")
      .all();

    return new Response(
      JSON.stringify(
        { ok: true, tables: results.map((r: any) => r.name) },
        null,
        2
      ),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify(
        { ok: false, error: err.message, stack: err.stack?.split("\n").slice(0, 3) },
        null,
        2
      ),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


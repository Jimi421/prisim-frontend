import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextResponse } from "next/server";

export const config = { runtime: "edge" };

export default async function handler(request: Request) {
  if (request.method !== "GET") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }
  const { env } = getRequestContext();
  try {
    const { results } = await env.JIMI_DB.prepare(
      `SELECT slug AS id, title, '/api/' || slug AS url
       FROM gallery_sketches
       ORDER BY rowid DESC
       LIMIT 20`
    ).all();

    return NextResponse.json(results);
  } catch (err: any) {
    console.error("Gallery fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}


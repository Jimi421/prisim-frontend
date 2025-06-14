// pages/api/[key].ts
import { getRequestContext } from "@cloudflare/next-on-pages";

export const config = { runtime: "edge" };

// Default-exported handler is required for Edge API routes
export default async function handler(
  request: Request,
  { params }: { params: { key: string } }
) {
  const { env } = getRequestContext();
  const key = params.key;

  try {
    const object = await env.PRISIM_BUCKET.get(key);
    if (!object) {
      return new Response(
        JSON.stringify({ ok: false, error: "Not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return the raw image bytes with correct content type
    return new Response(object.body, {
      headers: { "Content-Type": object.httpMetadata.contentType },
    });
  } catch (err: any) {
    console.error("Fetch image error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message || "Internal Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


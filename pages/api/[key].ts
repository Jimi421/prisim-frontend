// pages/api/[key].ts
import { getRequestContext } from "@cloudflare/next-on-pages";

export const config = { runtime: "edge" };

export default async function handler(request: Request) {
  const { env } = getRequestContext();

  // 1️⃣ Extract the key from the URL, not from params
  const url = new URL(request.url);
  // URL.pathname === "/api/abcd1234-...", so split off the last segment
  const key = url.pathname.split("/").pop();

  if (!key) {
    return new Response(
      JSON.stringify({ ok: false, error: "No key in URL" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // 2️⃣ Fetch the object from R2
    const object = await env.PRISIM_BUCKET.get(key);
    if (!object) {
      return new Response(
        JSON.stringify({ ok: false, error: "Not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 3️⃣ Stream back the raw bytes with the correct content-type
    return new Response(object.body, {
      headers: {
        "Content-Type": object.httpMetadata.contentType,
      },
    });
  } catch (err: any) {
    console.error("Fetch image error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message || "Internal Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}


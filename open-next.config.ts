import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  wrapper: "cloudflare-pages",              // This targets Cloudflare Pages (not Workers)
  incrementalCache: r2IncrementalCache,     // This enables R2 for incremental caching
});


import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

// Use the workers wrapper which is one of the valid options in
// OpenNext 3.1.3. Other supported wrappers include aws-lambda,
// aws-lambda-edge, cloudflare, cloudflare-pages and netlify.
export default defineCloudflareConfig({
  wrapper: "cloudflare-workers",
});
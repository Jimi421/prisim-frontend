/// <reference types="@cloudflare/workers-types" />

declare namespace CloudflareEnv {
  /** your D1 database binding */
  export const JIMI_DB: D1Database;
  /** your R2 bucket binding */
  export const PRISIM_BUCKET: R2Bucket;
}


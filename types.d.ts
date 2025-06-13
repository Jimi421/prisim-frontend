import { D1Database, R2Bucket } from '@cloudflare/workers-types';

declare global {
  interface CloudflareEnv {
    /** your D1 binding name */
    JIMI_DB: D1Database;
    /** your R2 binding name */
    PRISIM_BUCKET: R2Bucket;
  }
}

// make sure this file is treated as a module
export {};



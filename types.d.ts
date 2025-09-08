/// <reference types="next" />
/// <reference types="next/types/global" />

import { R2Bucket, D1Database } from '@cloudflare/workers-types';

declare global {
  interface CloudflareEnv {
    /** Your DB binding name */
    DB: D1Database;
    /** Your R2 binding name */
    PRISIM_BUCKET: R2Bucket;
  }
}

// Makes sure this file is treated as a module
export {};


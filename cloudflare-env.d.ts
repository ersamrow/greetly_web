declare namespace Cloudflare {
  interface Env {
    SITE_URL?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}

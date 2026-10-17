declare namespace Cloudflare {
  interface Env {
    GOOGLE_SITE_VERIFICATION?: string;
    BING_SITE_VERIFICATION?: string;
    SITE_URL?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}

import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    // Allow HTML crawling so the noindex tags on greetings/admin/privacy are read.
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    ...(base ? { sitemap: new URL('/sitemap.xml', base).href } : {}),
  };
}

import type { MetadataRoute } from 'next';
import { collections } from '@/lib/collections';
import { getSiteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  if (!base) return [];
  return ['/', ...Object.keys(collections).map(slug => `/occasions/${slug}`)]
    .map(path => ({ url: new URL(path, base).href }));
}

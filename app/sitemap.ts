import type { MetadataRoute } from 'next';
import { collections } from '@/lib/collections';
import { getSiteUrl } from '@/lib/seo';
import { templates } from '@/lib/templates';
import { cardPath } from '@/lib/card-catalog';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  if (!base) return [];
  return ['/', ...Object.keys(collections).map(slug => `/occasions/${slug}`), ...templates.map(cardPath)]
    .map(path => ({ url: new URL(path, base).href }));
}

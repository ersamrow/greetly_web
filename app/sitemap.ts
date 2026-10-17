import type { MetadataRoute } from 'next';
import { collections } from '@/lib/collections';
import { getSiteUrl } from '@/lib/seo';
import { cardPath,indexableTemplates } from '@/lib/card-catalog';
import {homeLastModified,collectionLastModified,cardEditorialLastModified} from '@/lib/content-dates';
export default function sitemap():MetadataRoute.Sitemap{
 const base=getSiteUrl();if(!base)return [];
 return [
  {url:base.href,lastModified:homeLastModified},
  ...Object.keys(collections).map(slug=>({url:new URL(`/occasions/${slug}`,base).href,lastModified:collectionLastModified})),
  ...indexableTemplates.map(t=>({url:new URL(cardPath(t),base).href,lastModified:cardEditorialLastModified})),
 ];
}

import {collectionPreview} from '@/lib/card-catalog';
import Studio from '../../studio';
import {notFound} from 'next/navigation';
import {collections} from '@/lib/collections';
import {collectionDescriptions,getSiteUrl,pageMetadata,serializeJsonLd} from '@/lib/seo';

export function generateStaticParams(){return Object.keys(collections).map(slug=>({slug}));}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const collection=Object.hasOwn(collections,slug)?collections[slug]:undefined;
  if(!collection)notFound();
  return pageMetadata(['business','invitations'].includes(slug)?`Create ${collection.category} | Greetly`:`Free ${collection.category} Cards & Wishes | Greetly`,collectionDescriptions[slug]||collection.message,`/occasions/${slug}`,collectionPreview(slug).id);
}
export default async function Page({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,c=Object.hasOwn(collections,slug)?collections[slug]:undefined;
  if(!c)notFound();
  const base=getSiteUrl();
  const url=base?new URL(`/occasions/${slug}`,base).href:undefined;
  const data={
    '@context':'https://schema.org',
    '@graph':[
      {'@type':'CollectionPage',name:`${c.category} greeting cards and wishes`,description:collectionDescriptions[slug]||c.message,inLanguage:'en',...(url?{url}:{})},
      ...(base?[{'@type':'BreadcrumbList',itemListElement:[
        {'@type':'ListItem',position:1,name:'All collections',item:base.href},
        {'@type':'ListItem',position:2,name:`${c.category} greetings`,item:url},
      ]}]:[]),
    ],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(data)}}/><Studio initialCategory={c.category} collectionSlug={slug}/></>;
}

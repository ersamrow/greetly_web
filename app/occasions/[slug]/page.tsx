import {templates,matchesOccasion} from '@/lib/templates';
import {collectionPreview,cardPath} from '@/lib/card-catalog';
import Studio from '../../studio';
import {notFound} from 'next/navigation';
import {collections} from '@/lib/collections';
import {collectionDescriptions,getSiteUrl,pageMetadata,serializeJsonLd} from '@/lib/seo';

export function generateStaticParams(){return Object.keys(collections).map(slug=>({slug}));}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const collection=Object.hasOwn(collections,slug)?collections[slug]:undefined;
  if(!collection)notFound();
  return pageMetadata(['business','invitations'].includes(slug)?`Create ${collection.category} | Greetlo`:`Free ${collection.category} Cards & Wishes | Greetlo`,collectionDescriptions[slug]||collection.message,`/occasions/${slug}`,collectionPreview(slug).id);
}
export default async function Page({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,c=Object.hasOwn(collections,slug)?collections[slug]:undefined;
  if(!c)notFound();
  const base=getSiteUrl();
  const url=base?new URL(`/occasions/${slug}`,base).href:undefined;
  const data={
    '@context':'https://schema.org',
    '@graph':[
      {'@type':'ItemList','@id':url+'#cards',name:`${c.category} card designs`,numberOfItems:templates.filter(t=>matchesOccasion(t,c.category)).length,itemListElement:templates.filter(t=>matchesOccasion(t,c.category)).map((t,i)=>({'@type':'ListItem',position:i+1,name:t.name,url:new URL(cardPath(t),base).href}))},
      {'@type':'CollectionPage',name:`${c.category} greeting cards and wishes`,description:collectionDescriptions[slug]||c.message,mainEntity:{'@id':url+'#cards'},inLanguage:'en',...(url?{url}:{})},
      ...(base?[{'@type':'BreadcrumbList',itemListElement:[
        {'@type':'ListItem',position:1,name:'All collections',item:base.href},
        {'@type':'ListItem',position:2,name:`${c.category} greetings`,item:url},
      ]}]:[]),
    ],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(data)}}/><Studio initialCategory={c.category} collectionSlug={slug}/></>;
}

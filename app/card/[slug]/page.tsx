/* eslint-disable @next/next/no-img-element -- Responsive WebP assets are optimised at generation time. */
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {templates} from '@/lib/templates';
import {cardPath,cardDescription,collectionFor} from '@/lib/card-catalog';
import {pageMetadata,getSiteUrl,serializeJsonLd} from '@/lib/seo';

export function generateStaticParams(){return templates.map(t=>({slug:t.id}));}
async function findTemplate(params:Promise<{slug:string}>){const {slug}=await params;const t=templates.find(t=>t.id===slug);if(!t)notFound();return t;}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
  const t=await findTemplate(params);
  return pageMetadata(`${t.name} — Free ${t.festival||t.category} Card | Greetly`,cardDescription(t),cardPath(t),t.id);
}
export default async function CardPage({params}:{params:Promise<{slug:string}>}){
  const t=await findTemplate(params),[slug,collection]=collectionFor(t),base=getSiteUrl()!;
  const data={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
    {'@type':'ListItem',position:1,name:'Greetly',item:base.href},
    {'@type':'ListItem',position:2,name:collection.category,item:new URL(`/occasions/${slug}`,base).href},
    {'@type':'ListItem',position:3,name:t.name,item:new URL(cardPath(t),base).href},
  ]};
  return <main className="content-page card-detail">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(data)}}/>
    <nav aria-label="Breadcrumb"><Link href="/">Greetly</Link> / <a href={`/occasions/${slug}`}>{collection.category}</a> / {t.name}</nav>
    <h1>{t.name}</h1><p>{cardDescription(t)}</p>
    <img src={`/previews/${t.id}-640.webp`} srcSet={`/previews/${t.id}-320.webp 320w, /previews/${t.id}-640.webp 640w`} sizes="(max-width: 680px) 90vw, 540px" width={640} height={t.kind==='business'?384:t.kind==='invitation'?853:640} alt={`${t.name}: ${t.heading.replaceAll('\n',' ')}`} fetchPriority="high"/>
    <p><a className="primary" href={`/occasions/${slug}?template=${encodeURIComponent(t.id)}`}>Personalise this card</a></p>
    <p>Add your message{t.kind==='business'?', logo and contact details':', name and photo'}, then download or share your card for free.</p>
    <a href={`/occasions/${slug}`}>View all {collection.category.toLowerCase()} designs</a>
  </main>;
}

/* eslint-disable @next/next/no-img-element -- Responsive assets are generated locally. */
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {templates} from '@/lib/templates';
import {cardPath,cardSlug,cardDescription,collectionFor,templateForSlug,canonicalCard,relatedCards} from '@/lib/card-catalog';
import {cardEditorial} from '@/lib/card-editorial';
import {pageMetadata,getSiteUrl,serializeJsonLd} from '@/lib/seo';
import PersonaliseCard from '../personalise-card';
import './card-detail.css';

export function generateStaticParams(){return templates.map(t=>({slug:cardSlug(t)}));}
async function findTemplate(params:Promise<{slug:string}>){const {slug}=await params;const t=templateForSlug(slug);if(!t)notFound();return t;}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
 const t=await findTemplate(params);
 return pageMetadata(`${t.name} — Free ${t.festival||t.category} Card | Greetlo`,cardDescription(t),cardPath(canonicalCard(t)),t.id);
}
export default async function CardPage({params}:{params:Promise<{slug:string}>}){
 const t=await findTemplate(params),[slug,collection]=collectionFor(t),base=getSiteUrl()!,copy=cardEditorial(t),related=relatedCards(t),canonical=canonicalCard(t);
 const data={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
  {'@type':'ListItem',position:1,name:'Greetlo',item:base.href},
  {'@type':'ListItem',position:2,name:collection.category,item:new URL(`/occasions/${slug}`,base).href},
  {'@type':'ListItem',position:3,name:t.name,item:new URL(cardPath(t),base).href},
 ]};
 return <main className="content-page card-detail">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(data)}}/>
  <nav aria-label="Breadcrumb"><Link href="/">Greetlo</Link> / <a href={`/occasions/${slug}`}>{collection.category}</a> / {t.name}</nav>
  <h1>{t.name}</h1><p>{copy.intro}</p>
  <img className="card-detail-preview" src={`/previews/${t.id}-640.webp`} srcSet={`/previews/${t.id}-320.webp 320w, /previews/${t.id}-640.webp 640w`} sizes="(max-width: 680px) 90vw, 540px" width={640} height={t.kind==='business'?384:t.kind==='invitation'?853:640} alt={`${t.name}: ${t.heading.replaceAll('\n',' ')}`} fetchPriority="high"/>
  <div className="card-detail-action"><PersonaliseCard templateId={t.id} collection={slug}/></div>
  <section><h2>Who this card suits</h2><p>{copy.audience}</p><p>{copy.design}</p></section>
  <section><h2>{t.kind==='business'?'Sample service lines':'Message ideas for this card'}</h2><ul className="card-message-ideas">{copy.examples.map(message=><li key={message}>{message}</li>)}</ul></section>
  <section><h2>Make it personal</h2><p>{copy.personalisation}</p><p>{copy.sharing}</p></section>
  {canonical.id!==t.id&&<p>This is an alternate edition of <a href={cardPath(canonical)}>{canonical.name}</a>. Compare the original wording and style before choosing.</p>}
  <section><h2>Related cards</h2><ul className="related-card-links">{related.map(other=><li key={other.id}><a href={cardPath(other)}>{other.name}</a><span>{other.motion?'Animated':'Still'} · {other.festival||other.occasion||other.category}</span></li>)}</ul></section>
  <a href={`/occasions/${slug}`}>View all {collection.category.toLowerCase()} designs</a>
 </main>;
}

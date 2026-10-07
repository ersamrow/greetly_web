import Studio from '../../studio';
import {notFound} from 'next/navigation';
import {collections} from '@/lib/collections';

export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  return {title:`${collections[slug]?.category||'Greeting'} cards and message ideas · Greetly`,description:collections[slug]?.message};
}
export default async function Page({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,c=collections[slug];
  if(!c)notFound();
  return <Studio initialCategory={c.category} collectionSlug={slug}/>;
}

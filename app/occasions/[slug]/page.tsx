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
  return <>
    <section className="content-page">
      <a href="/">Greetly / Collections</a>
      <h1>{c.category} wishes</h1>
      {c.date&&<p className="festival-date">{c.date} · India · <a href="https://www.indiapost.gov.in/holidays-list" target="_blank" rel="noopener noreferrer">2026 holiday calendar</a></p>}
      <p>{c.message}</p>
      {c.suggestions&&<><h2>A few words to get you started</h2><ul className="festival-messages">{c.suggestions.map(message=><li key={message}>{message}</li>)}</ul></>}
      <h2>Make it personal</h2>
      <p>Start with their name. Add a memory or a wish in your own voice. Choose a design below, add a photo if you like, and send a greeting that feels like you.</p>
    </section>
    <Studio initialCategory={c.category}/>
  </>;
}

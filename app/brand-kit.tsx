'use client';
import {useEffect,useState} from 'react';
import {toast} from 'sonner';
import type {Greeting} from '@/lib/templates';
import {greetingSchema} from '@/lib/greeting-schema';
const key='greetly-brand-kit';
export default function BrandKit({g,onChange}:{g:Greeting;onChange:(g:Greeting)=>void}){
  const [kit,setKit]=useState<Greeting|null>(null);
  useEffect(()=>{try{const parsed=greetingSchema.safeParse(JSON.parse(localStorage.getItem(key)||'null'));if(parsed.success)setKit(parsed.data)}catch{}},[]);
  return <details className="editor-options"><summary>My brand kit</summary><div className="option-fields"><small>Reuse this logo, font and colours on any creation. Stored on this device.</small><button className="secondary" onClick={()=>{try{localStorage.setItem(key,JSON.stringify(g));setKit(g);toast.success('Brand kit saved')}catch{toast.error('Could not save brand kit; device storage may be full')}}}>{kit?'Update brand kit':'Save brand kit'}</button>{kit&&<><button className="secondary" onClick={()=>onChange({...g,photo:kit.photo,font:kit.font,bg:kit.bg,headingColor:kit.headingColor,textColor:kit.textColor,logoScale:kit.logoScale})}>Apply brand kit</button><button onClick={()=>{try{localStorage.removeItem(key);setKit(null)}catch{toast.error('Could not remove brand kit')}}}>Remove brand kit</button></>}</div></details>;
}

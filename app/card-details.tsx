'use client';
import type {Greeting,Template} from '@/lib/templates';
import type {HTMLInputTypeAttribute} from 'react';
export default function CardDetails({g,template,onChange}:{g:Greeting;template:Template;onChange:(g:Greeting)=>void}){
  const fields:[keyof NonNullable<Greeting['details']>,string,number,HTMLInputTypeAttribute][]=template.kind==='business'?[
    ['role','Job title / profession',60,'text'],['phone','Phone number',40,'tel'],['email','Email address',80,'email'],['website','Website',100,'text'],['address','Business address',140,'text'],
  ]:[['date','Event date',40,'text'],['time','Time (include time zone if needed)',50,'text'],['venue','Venue / address',140,'text'],['rsvp','RSVP contact / details',120,'text']];
  return <>{fields.map(([key,label,max,type])=><label key={key}>{label}<input type={type} maxLength={Number(max)} value={g.details?.[key as keyof NonNullable<Greeting['details']>]||''} onChange={e=>onChange({...g,details:{...g.details,[key]:e.target.value}})}/></label>)}</>;
}

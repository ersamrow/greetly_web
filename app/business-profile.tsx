'use client';
import {useEffect,useState} from 'react';
import {toast} from 'sonner';
import type {Greeting} from '@/lib/templates';
import {greetingSchema} from '@/lib/greeting-schema';
type Profile=Pick<Greeting,'name'|'heading'|'message'|'photo'|'details'>;
const key='greetly-business-profile';
function pick(g:Greeting):Profile{const d=g.details||{};return {name:g.name,heading:g.heading,message:g.message,photo:g.photo,details:{role:d.role,phone:d.phone,email:d.email,website:d.website,address:d.address}}}
export default function BusinessProfile({g,onChange}:{g:Greeting;onChange:(g:Greeting)=>void}){
  const [profile,setProfile]=useState<Profile|null>(null);
  useEffect(()=>{try{const value=JSON.parse(localStorage.getItem(key)||'null');if(value){const parsed=greetingSchema.safeParse(value);if(parsed.success)setProfile(pick(parsed.data))}}catch{}},[]);
  return <details className="profile-tools"><summary>My business profile</summary><small>Reuse your name, business details, tagline, and logo across visiting cards. Saved only in this browser.</small><div className="profile-actions"><button className="secondary" onClick={()=>{try{localStorage.setItem(key,JSON.stringify(g));setProfile(pick(g));toast.success('Business profile saved')}catch{toast.error('Could not save the profile. Device storage may be full.')}}}>{profile?'Update saved profile':'Save as my profile'}</button>{profile&&<><button className="secondary" onClick={()=>{onChange({...g,...profile});toast.success('Business profile applied')}}>Apply saved profile</button><button className="reset-options" onClick={()=>{try{localStorage.removeItem(key);setProfile(null);toast.success('Saved profile removed')}catch{toast.error('Could not remove profile')}}}>Forget profile</button></>}</div></details>;
}

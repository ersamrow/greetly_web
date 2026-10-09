'use client';
import {useState} from 'react';
export default function RSVPForm({email,event}:{email:string;event:string}){
  const [name,setName]=useState(''),[reply,setReply]=useState('Attending'),[count,setCount]=useState(1),[opened,setOpened]=useState(false);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return null;
  return <form className="rsvp-form" onSubmit={e=>{e.preventDefault();location.href='mailto:'+encodeURIComponent(email)+'?subject='+encodeURIComponent('RSVP: '+event)+'&body='+encodeURIComponent(`Name: ${name}\nResponse: ${reply}\nGuests: ${reply==='Attending'?count:0}\n\nInvitation: ${location.href}`);setOpened(true)}}><h2>RSVP to the host</h2><label>Your name<input required maxLength={80} value={name} onChange={e=>setName(e.target.value)}/></label><label>Your response<select value={reply} onChange={e=>setReply(e.target.value)}><option>Attending</option><option>Not attending</option><option>Maybe</option></select></label>{reply==='Attending'&&<label>Number of guests<input type="number" min={1} max={20} value={count} onChange={e=>setCount(Number(e.target.value))}/></label>}<button className="primary">Compose RSVP email</button><small>{opened?'Send the message in your email app to complete your RSVP.':'Opens your email app. Responses go directly to the host.'}</small><a href={'mailto:'+email}>{email}</a></form>;
}

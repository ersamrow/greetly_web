'use client';
import {useCallback,useRef,useState,type SetStateAction} from 'react';
import type {Greeting} from '@/lib/templates';
export function useEditHistory(initial:Greeting){
  const [state,setState]=useState({past:[] as Greeting[],present:initial,future:[] as Greeting[]});
  const last=useRef(0);
  const set=useCallback((value:SetStateAction<Greeting>)=>{const now=Date.now(),group=now-last.current<450;last.current=now;setState(s=>{
    const next=typeof value==='function'?value(s.present):value;
    if(JSON.stringify(next)===JSON.stringify(s.present))return s;
    return {past:group&&s.past.length?s.past:[...s.past,s.present].slice(-60),present:next,future:[]};
  })},[]);
  const reset=useCallback((g:Greeting)=>{last.current=0;setState({past:[],present:g,future:[]})},[]);
  const undo=useCallback(()=>{last.current=0;setState(s=>s.past.length?{past:s.past.slice(0,-1),present:s.past[s.past.length-1],future:[s.present,...s.future]}:s)},[]);
  const redo=useCallback(()=>{last.current=0;setState(s=>s.future.length?{past:[...s.past,s.present],present:s.future[0],future:s.future.slice(1)}:s)},[]);
  return {g:state.present,set,reset,undo,redo,canUndo:!!state.past.length,canRedo:!!state.future.length};
}

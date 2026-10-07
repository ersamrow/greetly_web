import {env} from '@/lib/runtime-env';
export {greetingSchema} from './greeting-schema';
export function db(){if(!env.DB)throw Error('Storage unavailable');return env.DB}
export function bucket(){if(!env.BUCKET)throw Error('Photo storage unavailable');return env.BUCKET}
export async function hash(token:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(x=>x.toString(16).padStart(2,'0')).join('')}
export function sameOrigin(req:Request){const o=req.headers.get('origin');return !o||o===new URL(req.url).origin}
export const privateHeaders={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};
export function failure(e:unknown){console.error('Greeting storage operation failed',e instanceof Error?e.message:'unknown');return Response.json({error:'Storage unavailable. Please try again.'},{status:503,headers:privateHeaders})}

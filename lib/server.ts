import {isTemplateId} from '@/lib/templates';
import {env} from '@/lib/runtime-env';
import {z} from 'zod';
export const greetingSchema=z.object({templateId:z.string().refine(isTemplateId, "Unknown template"),name:z.string().max(35),message:z.string().max(200),sender:z.string().max(35),bg:z.string().regex(/^#[0-9a-fA-F]{6}$/),font:z.enum(['Georgia','Arial','Verdana','Courier New']),layout:z.enum(['square','vertical']),branding:z.boolean(),photo:z.string().max(1500000).regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/).optional()});
export function db(){if(!env.DB)throw Error('Storage unavailable');return env.DB}
export function bucket(){if(!env.BUCKET)throw Error('Photo storage unavailable');return env.BUCKET}
export async function hash(token:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(x=>x.toString(16).padStart(2,'0')).join('')}
export function sameOrigin(req:Request){const o=req.headers.get('origin');return !o||o===new URL(req.url).origin}
export const privateHeaders={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};
export function failure(e:unknown){console.error('Greeting storage operation failed',e instanceof Error?e.message:'unknown');return Response.json({error:'Storage unavailable. Please try again.'},{status:503,headers:privateHeaders})}

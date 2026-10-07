import {isTemplateId} from '@/lib/templates';
import {db,sameOrigin,failure} from '@/lib/server';
const actions=['select','preview','complete','download','share','referral','create_from_referral'];
export async function POST(req:Request){if(!sameOrigin(req))return new Response(null,{status:403});try{const b=await req.json() as {action:string;templateId:string};if(!actions.includes(b.action)||!isTemplateId(b.templateId))return new Response(null,{status:400});await db().prepare('INSERT INTO events (action,template_id,created_at) VALUES (?,?,?)').bind(b.action,b.templateId,Date.now()).run();return new Response(null,{status:204})}catch(e){return failure(e)}}

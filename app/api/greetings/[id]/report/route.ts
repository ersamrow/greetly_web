import {db,sameOrigin,failure} from '@/lib/server';
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){if(!sameOrigin(req))return new Response(null,{status:403});try{const {id}=await params;await db().prepare('UPDATE greetings SET reports=reports+1 WHERE id=?').bind(id).run();return Response.json({reported:true})}catch(e){return failure(e)}}

import {db,failure} from '@/lib/server';
export async function GET(){try{const rows=await db().prepare('SELECT id FROM published WHERE enabled=0').all();return Response.json({hidden:rows.results.map(r=>r.id)})}catch(e){return failure(e)}}

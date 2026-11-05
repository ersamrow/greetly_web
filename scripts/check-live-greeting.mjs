// Creates one disposable test greeting on the explicitly selected service and
// deletes it with its own scoped token. No administrator credentials are used.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const base=process.env.LIVE_BASE_URL;
if(!base)throw new Error('Set LIVE_BASE_URL to the service you intend to test.');
const origin=new URL(base).origin;
const request=(path,options={})=>fetch(origin+path,{...options,signal:AbortSignal.timeout(20000)});
const photo=readFileSync(new URL('../public/icon-192.png',import.meta.url));
const payload={templateId:'g1',name:'Greetlo test',message:'Temporary service verification. This card is deleted after the check.',sender:'',bg:'#ffeedb',font:'Arial',layout:'square',branding:true,photo:'data:image/png;base64,'+photo.toString('base64')};
const created=await request('/api/greetings',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(payload)});
assert.equal(created.status,201,'Greeting creation must succeed');
const {id,token}=await created.json();
assert(id&&token,'A deletion key must be returned');
try{
 const saved=await request('/api/greetings/'+id);assert.equal(saved.status,200);
 const data=await saved.json();assert.equal(data.message,payload.message);
 assert.equal(data.photo,`/api/greetings/${id}/photo`);
 const image=await request(data.photo);assert.equal(image.status,200);assert.equal(image.headers.get('content-type'),'image/png');
 assert.deepEqual(Buffer.from(await image.arrayBuffer()),photo);
 const page=await request('/g/'+id);assert.equal(page.status,200);assert.match(await page.text(),/noindex/);
 const unauthorized=await request('/api/greetings/'+id,{method:'DELETE',headers:{Origin:origin}});assert.equal(unauthorized.status,403);
}finally{
 const removed=await request('/api/greetings/'+id,{method:'DELETE',headers:{Origin:origin,Authorization:'Bearer '+token}});
 assert.equal(removed.status,204,`Test greeting cleanup failed: ${origin}/g/${id}`);
}
assert.equal((await request('/api/greetings/'+id)).status,404);
assert.equal((await request('/api/greetings/'+id+'/photo')).status,404);
console.log('Live creation, PNG upload/retrieval, shared page, deletion authorization, and cleanup passed.');

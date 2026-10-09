import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const asModule=source=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const faithUrl=asModule(fs.readFileSync('lib/faith-templates.ts','utf8'));
const templateUrl=asModule(fs.readFileSync('lib/templates.ts','utf8').replaceAll("'./faith-templates'",JSON.stringify(faithUrl)));
const {templates,defaultGreeting}=await import(templateUrl);
assert.equal(new Set(templates.map(t=>t.id)).size,templates.length,'Template IDs must be unique');
for(const faith of ['Sikh','Hindu','Muslim','Christian','Buddhist','Jain'])assert(templates.filter(t=>t.faith===faith).length>=2,'Each faith has at least two designs');
const source=fs.readFileSync('lib/greeting-schema.ts','utf8').replace("'./templates'",JSON.stringify(templateUrl)).replace("'zod'",JSON.stringify(import.meta.resolve('zod')));
const {greetingSchema}=await import(asModule(source));
for(const template of templates)assert(greetingSchema.safeParse(defaultGreeting(template)).success,'Template must produce a valid greeting: '+template.id);
for(const id of ['business-rose','invite-wedding']){
  const greeting={...defaultGreeting(templates.find(t=>t.id===id)),qr:{mode:'url',value:'https://example.com'},details:{role:'Designer',phone:'+91 12345 67890',email:'hello@example.com',website:'example.com',address:'123 Main Street',date:'18 October 2026',time:'6 pm IST',venue:'Rose Hall',rsvp:'Call the host'}};
  assert.deepEqual(greetingSchema.parse(JSON.parse(JSON.stringify(greeting))),greeting,'Business and invitation details survive saving');
  assert(!greetingSchema.safeParse({...greeting,details:{venue:'x'.repeat(141)}}).success,'Venue length is bounded');
}
const {drawEditable}=await import(asModule(fs.readFileSync('lib/editor-layout.ts','utf8')));
const base=defaultGreeting(templates[0]);
const extended={...base,socialSize:'story',language:'pa',font:'Noto Sans Gurmukhi',side:'back',back:{heading:'Brand',message:'Services',website:'example.com'},rsvpEmail:'host@example.com'};
assert.deepEqual(greetingSchema.parse(extended),extended,'All new creation settings survive sharing');
assert(!greetingSchema.safeParse({...base,rsvpEmail:'not-an-email'}).success);
const positions={text:{x:20,y:-30},photo:{x:-40,y:50},qr:{x:10,y:20}};
assert.deepEqual(greetingSchema.parse({...base,positions}).positions,positions,'Element positions survive saving');
assert(!greetingSchema.safeParse({...base,positions:{text:{x:Infinity,y:0}}}).success);
const {positionedText}=await import(asModule(fs.readFileSync('lib/element-positions.ts','utf8')));
const textCalls=[],context={fillStyle:'red',fillText(...args){textCalls.push(args)}};
const positioned=positionedText(context,{...base,positions},'Photo credit');
positioned.fillText('Hello',100,200);positioned.fillText('made with greetly',100,200);positioned.fillText('Photo credit',100,200);positioned.fillStyle='blue';
assert.deepEqual(textCalls,[['Hello',120,170],['made with greetly',100,200],['Photo credit',100,200]]);
assert.equal(context.fillStyle,'blue','Canvas properties remain writable');
for(const logoScale of [50,100,120])assert.equal(greetingSchema.parse({...base,logoScale}).logoScale,logoScale,'Logo size survives saving');
for(const logoScale of [0,121])assert(!greetingSchema.safeParse({...base,logoScale}).success,'Reject out-of-range logo sizes');
const {photoContentType,encodePhoto}=await import(asModule(fs.readFileSync('lib/photo-format.ts','utf8')));
for(const mime of ['png','jpeg'])assert(greetingSchema.safeParse({...base,photo:`data:image/${mime};base64,AAAA`}).success,'Supported photo survives saving');
assert(!greetingSchema.safeParse({...base,photo:'data:image/svg+xml;base64,AAAA'}).success);
assert.equal(photoContentType(Uint8Array.from([137,80,78,71,13,10,26,10])), 'image/png');
assert.equal(photoContentType(Uint8Array.from([255,216,255,224])), 'image/jpeg');
assert.equal(photoContentType(Uint8Array.from([137,80,78,71])), null);
const encodings=[];
let oversized=false;
globalThis.document={createElement(){return {width:0,height:0,getContext(){return {drawImage(){}}},toDataURL(type){encodings.push(type);if(oversized){oversized=false;return `data:${type};base64,`+'A'.repeat(1500000)}return `data:${type};base64,AAAA`}}}};
for(const mime of ['image/png','image/webp','image/jpeg']){
  encodings.length=0;oversized=true;
  const result=encodePhoto({width:1200,height:800},mime);
  const expected=mime==='image/jpeg'?'image/jpeg':'image/png';
  assert(result.startsWith(`data:${expected};base64,`));
  assert.deepEqual(encodings,[expected,expected],'Oversized transparent photos shrink without switching to JPEG');
}
delete globalThis.document;
assert(greetingSchema.safeParse(base).success,'Old greetings must remain valid');
const edited={...base,heading:'Warm wishes\nfor your family',headingColor:'#123456',textColor:'#abcdef',headingSize:130,messageSize:46,textAlign:'left',photoPlacement:'right',photoSize:360,photoShape:'rounded',photoZoom:2.5,photoX:100,photoY:0};
assert.deepEqual(greetingSchema.parse(JSON.parse(JSON.stringify(edited))),edited,'All edit options must survive saved payload validation');
for(const bad of [{headingSize:999},{messageSize:0},{photoSize:-1},{photoZoom:0},{photoX:101},{textColor:'red'},{photoPlacement:'elsewhere'},{heading:'x'.repeat(91)}])assert(!greetingSchema.safeParse({...base,...bad}).success,'Reject invalid option '+JSON.stringify(bad));
globalThis.Image=class{width=1200;height=800;set src(value){queueMicrotask(()=>this.onload())}};
for(const h of [1080,1440])for(const placement of ['top','bottom','left','right','middle','in-message','after-message']){
  assert.equal(greetingSchema.parse({...base,photoPlacement:placement}).photoPlacement,placement,'Every placement must survive saving');
  const draws=[],photos=[];
  const c={font:'',fillStyle:'',textAlign:'',save(){},restore(){},beginPath(){},arc(){},roundRect(){},rect(){},clip(){},measureText(text){return {width:[...text].length*parseFloat(this.font)*.55}},fillText(text,x,y){draws.push({text,x,y,size:parseFloat(this.font)})},drawImage(...args){photos.push(args)}};
  await drawEditable(c,templates[0],{...edited,photo:'test',photoPlacement:placement,message:'A'.repeat(200),name:'B'.repeat(35),sender:'C'.repeat(35)},h,'#123456');
  assert(draws.every(d=>Number.isFinite(d.x)&&Number.isFinite(d.y)&&d.y<h-85),'Text must fit inside card');
  const [,sx,sy,sw,sh,px,py,pw,ph]=photos[0];
  assert(sx>=0&&sy>=0&&sx+sw<=1200&&sy+sh<=800,'Crop must stay in source photo');
  assert(px>=0&&py>=0&&px+pw<=1080&&py+ph<=h,'Photo must stay inside card');
  if(['middle','in-message','after-message'].includes(placement))assert(draws.every(d=>d.y+d.size<=py||d.y>=py+ph),'Inline photo must not overlap any text');
}
console.log('Editor checks passed: legacy payloads, style persistence, validation, and photo/text bounds in both sizes.');

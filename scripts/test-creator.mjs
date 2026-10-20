// node scripts/test-creator.mjs (Chrome/Chromium; override CHROME_PATH as needed).
// Optional PORTRAIT_TEST_IMAGE exercises the actual model with a local photo.
import {build} from 'esbuild';
import {createServer} from 'node:http';
import {readFile, mkdir, writeFile, mkdtemp} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
const bundle=await build({stdin:{contents:`import {createElement,useState} from 'react';import {createRoot} from 'react-dom/client';import CreatorPhoto from './app/creator-photo';import MovableCard from './app/movable-card';import {getGeometry,hitElement,snapElement} from './lib/editor-geometry';window.getGeometry=getGeometry;window.hitElement=hitElement;window.snapElement=snapElement;import {draw} from './lib/draw';window.mountUpload=()=>createRoot(document.getElementById('root')).render(createElement(function Test(){const [g,setG]=useState({...defaultGreeting(templates[0]),name:'Alex',sender:'Sam'});window.currentGreeting=g;return createElement('div',{className:'editor-modal compact-editor',style:{position:'static',transform:'none',width:'100%',maxWidth:1000,margin:'auto'}},createElement('h2',null,'Make it a little more you.'),createElement('div',{className:'editor-grid'},createElement('div',{className:'preview-panel'},createElement(MovableCard,{template:templates[0],greeting:g,paused:true,onChange:setG})),createElement('div',{className:'editor-controls'},createElement('div',{className:'editor-fields'},createElement('div',{className:'edit-section'},createElement(CreatorPhoto,{g,onChange:setG,onTheme:()=>{}}))))))}));import {greetingSchema} from './lib/greeting-schema';import {removePortraitBackground} from './lib/portrait';window.draw=draw;window.schema=greetingSchema;window.removeBackground=removePortraitBackground;window.defaults=defaultGreeting;import {templates,defaultGreeting} from './lib/templates';window.catalog=templates;window.renderCard=async(id)=>{const t=templates.find(t=>t.id===id),c=document.createElement('canvas');await draw(c,t,defaultGreeting(t));return c.toDataURL('image/png')};`,resolveDir:process.cwd()},bundle:true,write:false,platform:'browser',loader:{'.css':'empty'}});
const root=resolve('public');
const styles=(await Promise.all(['globals','compact-editor','studio-refresh','brand-theme','mobile-editor','movable-card'].map(name=>readFile(`app/${name}.css`,'utf8')))).join('\n').replace(/@import[^;]+;/g,'');
const server=createServer(async(req,res)=>{try{
  if(req.url==='/styles.css'){res.setHeader('Content-Type','text/css');res.end(styles);return;}
  if(req.url==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/styles.css"></head><body><div id="root"></div><script src="/render.js"></script></body></html>');return;}
  if(req.url==='/fixture'&&process.env.PORTRAIT_TEST_IMAGE){res.setHeader('Content-Type','image/jpeg');res.end(await readFile(process.env.PORTRAIT_TEST_IMAGE));return;}
  if(req.url==='/render.js'){res.setHeader('Content-Type','text/javascript');res.end(bundle.outputFiles[0].text);return;}
  const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!path.startsWith(root+'/')&&!path.startsWith(root+'\\')){res.writeHead(403).end();return;}
  res.setHeader('Content-Type',({'.webp':'image/webp','.png':'image/png'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));
}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser, socket;
try{
  const profile=await mkdtemp(resolve(tmpdir(),'greetly-previews-'));
  browser=spawn(process.env.CHROME_PATH||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'chromium'),['--headless=new','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
  let launchError;browser.on('error',error=>{launchError=error;});
  let port;
  for(let i=0;i<100;i++){if(launchError)throw launchError;try{port=(await readFile(resolve(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break;}catch{await new Promise(r=>setTimeout(r,100));}}
  if(!port)throw new Error('Chrome did not start. Set CHROME_PATH to a Chrome/Chromium executable.');
  const targets=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
  let sequence=0;const pending=new Map();
  socket.onmessage=event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(new Error(m.error.message));else p.resolve(m.result);}};
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  const page={evaluate:async(fn,arg)=>{const r=await send('Runtime.evaluate',{expression:`(${fn.toString()})(${JSON.stringify(arg)??''})`,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;}};
  await send('Page.navigate',{url:`http://127.0.0.1:${server.address().port}`});
  let templates;
  for(let i=0;i<100;i++){templates=await page.evaluate(()=>window.catalog);if(templates)break;await new Promise(r=>setTimeout(r,100));}
  if(!templates)throw new Error('Preview renderer did not load.');
  const result=await page.evaluate(async()=>{
    const assert=(value,message)=>{if(!value)throw new Error(message)};
    const t=window.catalog.find(t=>t.festival==='Dussehra');
    const photo=document.createElement('canvas');photo.width=240;photo.height=500;
    const p=photo.getContext('2d');p.fillStyle='#ff00ff';p.fillRect(40,20,160,480);
    const g={...window.defaults(t),creatorPost:true,portraitScale:100,photo:photo.toDataURL(),sender:'Asha Mehta',layout:'vertical'};
    const roundtrip=window.schema.parse(JSON.parse(JSON.stringify(g)));
    assert(roundtrip.creatorPost&&roundtrip.portraitScale===100,'Saved greeting loses creator options');
    assert(!window.schema.safeParse({...g,portraitScale:500}).success,'Invalid portrait scale accepted');
    const canvas=document.createElement('canvas');
    const calls=[];const ctx=canvas.getContext('2d'),fill=ctx.fillText.bind(ctx);
    ctx.fillText=(...args)=>{calls.push(args[0]);fill(...args)};
    await window.draw(canvas,t,roundtrip);
    assert(canvas.width===1080&&canvas.height===1440,'Incorrect output size');
    assert(calls.includes('From Asha Mehta'),'Creator attribution missing');
    const rgba=ctx.getImageData(900,1100,1,1).data;
    assert(rgba[0]===255&&rgba[1]===0&&rgba[2]===255,'Portrait not drawn in foreground');
    const png=canvas.toDataURL('image/png');
    for(const [socialSize,height] of [['square',1080],['portrait',1350],['story',1920]]){
      await window.draw(canvas,t,{...g,socialSize});assert(canvas.height===height,'Social export dimensions incorrect');
    }
    await window.draw(canvas,t,{...g,photo:undefined});
    return {png,message:'Creator PNG, attribution, schema round-trip, absent photo, and all social sizes passed'};
  });
  await mkdir('.local-tests',{recursive:true});
  await writeFile('.local-tests/creator-post.png',Buffer.from(result.png.split(',')[1],'base64'));
  console.log(result.message);
  console.log(await page.evaluate(async()=>{
    const t={...window.catalog.find(t=>t.festival==='Dussehra'),heading:'Title'};
    const photo=document.createElement('canvas');photo.width=100;photo.height=200;
    const base={...window.defaults(t),name:'Alex',sender:'Sam',message:'Message',photo:photo.toDataURL()};
    for(const mode of ['creator','editable','legacy']){
      const g={...base,...(mode==='creator'?{creatorPost:true}:mode==='editable'?{photoPlacement:'right'}:{})};
      const capture=async(g)=>{const c=document.createElement('canvas'),ctx=c.getContext('2d'),rows=[];ctx.fillText=(text,x,y)=>rows.push({text,x,y});await window.draw(c,t,g);return rows};
      const original=await capture(g);
      const labels={heading:'Title',message:'Message',name:'Alex',sender:mode==='creator'?'From Sam':'With love, Sam'};
      for(const part of Object.keys(labels)){
        const changed=window.schema.parse({...g,positions:{[part]:{x:31,y:-27}}});
        if(changed.positions[part].x!==31)throw new Error('Position lost in saved greeting');
        const moved=await capture(changed);
        if(moved.length!==original.length)throw new Error('Moving changes text layout');
        original.forEach((row,i)=>{const target=row.text===labels[part];if(moved[i].text!==row.text||moved[i].x!==row.x+(target?31:0)||moved[i].y!==row.y-(target?27:0))throw new Error(`${mode}: ${part} moved the wrong text (${row.text})`)});
      }
    }
    return 'Independent heading, message, recipient and sender movement passed in creator, editable and legacy renderers';
  }));
  console.log(await page.evaluate(async()=>{
    const t={...window.catalog.find(t=>t.festival==='Dussehra'),heading:'Title'};
    const image=document.createElement('canvas');image.width=200;image.height=400;
    const base={...window.defaults(t),name:'Alex',sender:'Sam',message:'Message',photo:image.toDataURL(),layout:'vertical'};
    const render=async(g)=>{const canvas=document.createElement('canvas');await window.draw(canvas,t,g);return window.getGeometry(canvas)};
    for(const mode of ['creator','editable','legacy']){
      const g={...base,...(mode==='creator'?{creatorPost:true}:mode==='editable'?{photoPlacement:'right'}:{})};
      const original=await render(g);
      for(const part of ['heading','message','name','sender','photo']){
        const scaled=await render(window.schema.parse({...g,elementScales:{[part]:1.5}}));
        for(const before of original.boxes){const after=scaled.boxes.find(b=>b.part===before.part);const factor=before.part===part?1.5:1;if(Math.abs(after.width-before.width*factor)>1||Math.abs(after.height-before.height*factor)>2)throw new Error(`${mode}: resizing ${part} changed ${before.part} incorrectly: ${JSON.stringify(before)} -> ${JSON.stringify(after)}`)}
      }
      const square=await render({...g,socialSize:'square'});
      for(const before of original.boxes){const after=square.boxes.find(b=>b.part===before.part);if(Math.abs(after.x-(135+before.x*.75))>.1||Math.abs(after.y-before.y*.75)>.1)throw new Error('Social format selection is misaligned')}
    }
    if(window.schema.safeParse({...base,elementScales:{heading:5}}).success)throw new Error('Invalid resize accepted');
    const geometry={width:1000,height:1000,boxes:[{part:'heading',x:442,y:300,width:100,height:60}]};
    const snap=window.snapElement(geometry.boxes[0],0,0,geometry,10);
    if(snap.dx!==8||snap.x!==500)throw new Error('Centre snapping failed');
    if(window.hitElement(geometry,470,320)!=='heading'||window.hitElement(geometry,100,100)!==null)throw new Error('Selection hit testing failed');
    return 'Independent resizing, persisted scale limits, social selection bounds, hit testing, and centre snapping passed';
  }));
  console.log(await page.evaluate(async()=>{
    const t=window.catalog.find(t=>t.festival==='Dussehra'),photo=document.createElement('canvas');photo.width=100;photo.height=200;
    const base={...window.defaults(t),creatorPost:true,photo:photo.toDataURL(),sender:'Govind Samrow',layout:'square'};
    const render=async(g)=>{const c=document.createElement('canvas'),ctx=c.getContext('2d'),calls=[],fill=ctx.fillText.bind(ctx);ctx.fillText=(...args)=>{calls.push(args[0]);fill(...args)};await window.draw(c,t,g);return {box:window.getGeometry(c).boxes.find(b=>b.part==='sender'),calls}};
    const normal=await render(base);if(normal.box.width>=900)throw new Error('Default name still uses full-width strip');
    for(const treatment of ['badge','plain','signature','outline','banner']){
      const g=window.schema.parse({...base,senderStyle:{treatment,prefix:'Best wishes,',font:'Arial',size:64,color:'#ffcc55',background:'#102040',opacity:60}});
      if(g.senderStyle.treatment!==treatment||g.senderStyle.size!==64)throw new Error('Name styling lost in schema');
      const result=await render(g);if(!result.calls.includes('Best wishes, Govind Samrow'))throw new Error('Name prefix missing');
      if(!result.box||result.box.y+result.box.height>1020)throw new Error('Name style overflows the footer');
    }
    const nameOnly=await render({...base,senderStyle:{prefix:'',size:80}});if(!nameOnly.calls.includes('Govind Samrow'))throw new Error('Name-only prefix failed');
    if(nameOnly.box.height<=normal.box.height)throw new Error('Font size does not enlarge name');
    for(const senderStyle of [{size:200},{opacity:-1},{color:'red'},{treatment:'unknown'}])if(window.schema.safeParse({...base,senderStyle}).success)throw new Error('Invalid name style accepted');
    return 'All five name treatments, prefixes, independent font size, footer fit and persistence passed';
  }));
  console.log(await page.evaluate(async()=>{
    window.mountUpload();
    const until=async(check)=>{for(let i=0;i<100;i++){if(check())return;await new Promise(r=>setTimeout(r,50))}throw new Error('Upload UI timed out')};
    await until(()=>document.querySelector('input[type=file]'));
    const select=document.querySelector('[aria-label="Move element"]');
    select.value='heading';select.dispatchEvent(new Event('change',{bubbles:true}));
    await until(()=>document.querySelector('[aria-label="Move selected right"]'));
    document.querySelector('[aria-label="Move selected right"]').click();
    await until(()=>window.currentGreeting.positions?.heading?.x===10);
    if(window.currentGreeting.positions.message)throw new Error('Heading control moved message');
    [...document.querySelectorAll('button')].find(b=>b.textContent==='Reset selected').click();
    await until(()=>window.currentGreeting.positions?.heading?.x===0);
    const checkbox=document.querySelector('.creator-photo-fields input[type=checkbox]').getBoundingClientRect();
    if(checkbox.width!==18||checkbox.height!==18)throw new Error('Checkbox sizing regressed');
    const upload=file=>{const input=document.querySelector('input[type=file]'),files=new DataTransfer();files.items.add(file);input.files=files.files;input.dispatchEvent(new Event('change',{bubbles:true}))};
    upload(new File(['invalid'],'bad.pdf',{type:'application/pdf'}));
    await until(()=>document.querySelector('[role=alert]'));
    if(window.currentGreeting.photo)throw new Error('Invalid upload changed greeting');
    document.querySelector('.creator-photo-fields input[type=checkbox]').click();
    const c=document.createElement('canvas');c.width=50;c.height=100;c.getContext('2d').fillRect(10,10,30,90);
    const blob=await new Promise(resolve=>c.toBlob(resolve));
    upload(new File([blob],'portrait.png',{type:'image/png'}));
    await until(()=>window.currentGreeting.photo);
    document.querySelectorAll('.creator-photo-fields input[type=checkbox]')[1].click();
    await until(()=>window.currentGreeting.creatorPost);
    if(document.querySelector('[role=alert]'))throw new Error('Old upload error was not cleared');
    [...document.querySelectorAll('button')].find(b=>b.textContent==='Remove photo').click();
    await until(()=>!window.currentGreeting.photo);
    upload(new File([blob],'portrait.png',{type:'image/png'}));
    await until(()=>window.currentGreeting.photo);
    document.querySelectorAll('.creator-photo-fields input[type=checkbox]')[1].click();
    document.querySelector('.creator-photo-fields input[type=checkbox]').click();
    await until(()=>window.currentGreeting.creatorPost);
    const treatment=document.querySelector('[aria-label="Name treatment"]');treatment.value='outline';treatment.dispatchEvent(new Event('change',{bubbles:true}));
    await until(()=>window.currentGreeting.senderStyle?.treatment==='outline');
    const prefix=document.querySelector('[aria-label="Name prefix"]');prefix.value='';prefix.dispatchEvent(new Event('change',{bubbles:true}));
    await until(()=>window.currentGreeting.senderStyle?.prefix==='');
    [...document.querySelectorAll('button')].find(b=>b.textContent==='Reset name style').click();
    await until(()=>!window.currentGreeting.senderStyle);
    return 'Upload validation, original PNG upload, creator toggle, and remove-photo UI passed';
  }));
  await send('Emulation.setDeviceMetricsOverride',{width:1000,height:850,deviceScaleFactor:1,mobile:false});
  const selectElement=async(part)=>page.evaluate(async part=>{const select=document.querySelector('[aria-label="Move element"]');select.value=part;select.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,100));},part);
  await selectElement('');
  const point=await page.evaluate(async()=>{
    const canvas=document.createElement('canvas');await window.draw(canvas,window.catalog[0],window.currentGreeting);
    const geometry=window.getGeometry(canvas),box=geometry.boxes.find(b=>b.part==='photo');
    const surface=document.querySelector('.move-surface'),rect=surface.getBoundingClientRect();
    return {x:rect.left+(box.x+box.width*.75)*rect.width/geometry.width,y:rect.top+(box.y+box.height*.4)*rect.height/geometry.height};
  });
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1});
  await page.evaluate(async()=>{await new Promise(r=>setTimeout(r,100));if(document.querySelector('[aria-label="Move element"]').value!=='photo')throw new Error('Clicking portrait did not select it')});
  const handle=await page.evaluate(()=>{const r=document.querySelector('.resize-handle').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}});
  await send('Input.dispatchMouseEvent',{type:'mousePressed',...handle,button:'left',clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:handle.x+18,y:handle.y+25,button:'left',buttons:1});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:handle.x+18,y:handle.y+25,button:'left'});
  await page.evaluate(async()=>{await new Promise(r=>setTimeout(r,100));if(!(window.currentGreeting.elementScales?.photo>1))throw new Error('Resize handle did not resize portrait');if(window.currentGreeting.elementScales.heading)throw new Error('Resizing photo changed heading')});
  // A centre alignment must be reflected both in saved coordinates and the guide overlay.
  await selectElement('heading');
  const drag=await page.evaluate(async()=>{
    const canvas=document.createElement('canvas');await window.draw(canvas,window.catalog[0],window.currentGreeting);const geometry=window.getGeometry(canvas),b=geometry.boxes.find(b=>b.part==='heading');
    const r=document.querySelector('.move-surface').getBoundingClientRect();return {x:r.left+(b.x+b.width/2)*r.width/geometry.width,y:r.top+(b.y+b.height/2)*r.height/geometry.height,dx:(geometry.width/2-b.x-b.width/2)*r.width/geometry.width};
  });
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x:drag.x,y:drag.y,button:'left',clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:drag.x+drag.dx,y:drag.y,button:'left',buttons:1});
  await page.evaluate(async()=>{await new Promise(r=>setTimeout(r,100));if(!document.querySelector('.snap-guide.vertical'))throw new Error('Alignment guide missing during drag')});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:drag.x+drag.dx,y:drag.y,button:'left'});
  await page.evaluate(async()=>{await new Promise(r=>setTimeout(r,100));if(document.querySelector('.snap-guide'))throw new Error('Guides were not cleared after drag')});
  console.log('Real pointer click selection, corner resizing, and drag alignment guides passed');
  await send('Emulation.setDeviceMetricsOverride',{width:1000,height:850,deviceScaleFactor:1,mobile:false});
  await writeFile('.local-tests/editor-desktop.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await page.evaluate(async()=>{await new Promise(r=>setTimeout(r,100));const box=document.querySelector('.creator-photo-fields input[type=checkbox]').getBoundingClientRect();if(box.width!==18||box.height!==18)throw new Error('Mobile checkbox sizing regressed');if(document.querySelector('[aria-label="Move element"]').getBoundingClientRect().width===0)throw new Error('Mobile movement selector is hidden');if(document.documentElement.scrollWidth>390)throw new Error('Mobile editor overflows');});
  const touch=await page.evaluate(()=>{window.touchLog=[];for(const type of ['pointerdown','pointermove','pointerup','pointercancel'])document.addEventListener(type,e=>window.touchLog.push({type,button:e.button,target:e.target.className}));const b=document.querySelector('.element-selection').getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2,old:window.currentGreeting.positions.heading.x}});
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:touch.x,y:touch.y}]});
  await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touch.x+12,y:touch.y+6}]});
  await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.evaluate(async old=>{await new Promise(r=>setTimeout(r,100));if(window.currentGreeting.positions.heading.x===old)throw new Error('Touch drag failed '+JSON.stringify({events:window.touchLog,selected:document.querySelector('[aria-label="Move element"]').value,positions:window.currentGreeting.positions,scales:window.currentGreeting.elementScales}))},touch.old);
  console.log('Mobile touch dragging passed');
  await writeFile('.local-tests/editor-mobile.png',Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  if(process.env.PORTRAIT_TEST_IMAGE){
    const removal=await page.evaluate(async()=>{
      const blob=await (await fetch('/fixture')).blob();
      const automatic=document.querySelector('.creator-photo-fields input[type=checkbox]');if(!automatic.checked)automatic.click();
      const previousPhoto=window.currentGreeting.photo;
      const input=document.querySelector('input[type=file]'),files=new DataTransfer();files.items.add(new File([blob],'portrait.jpg',{type:'image/jpeg'}));input.files=files.files;input.dispatchEvent(new Event('change',{bubbles:true}));
      for(let i=0;i<1200&&window.currentGreeting.photo===previousPhoto;i++){
        const error=document.querySelector('[role=alert]');if(error)throw new Error(error.textContent);
        await new Promise(resolve=>setTimeout(resolve,50));
      }
      if(window.currentGreeting.photo===previousPhoto)throw new Error('Automatic background removal timed out');
      const output=window.currentGreeting.photo;
      const image=await createImageBitmap(await (await fetch(output)).blob());
      const c=document.createElement('canvas');c.width=image.width;c.height=image.height;c.getContext('2d').drawImage(image,0,0);
      const rgba=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
      let transparent=0,opaque=0;for(let i=3;i<rgba.length;i+=4){if(rgba[i]===0)transparent++;if(rgba[i]>200)opaque++}
      if(!transparent||!opaque)throw new Error('Background removal did not produce a cutout');
      return {output,transparent,opaque};
    });
    await writeFile('.local-tests/cutout.png',Buffer.from(removal.output.split(',')[1],'base64'));
    console.log(`Real portrait segmentation passed: ${removal.transparent} transparent and ${removal.opaque} opaque pixels`);
  }
}finally{socket?.close();browser?.kill();server.closeAllConnections();await new Promise(r=>server.close(r));}

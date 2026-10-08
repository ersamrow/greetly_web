// node scripts/generate-previews.mjs (Chrome/Chromium; override CHROME_PATH as needed).
// Committed previews keep production builds independent of a browser runtime.
import {build} from 'esbuild';
import {createServer} from 'node:http';
import {readFile, mkdir, writeFile, mkdtemp} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
const bundle=await build({stdin:{contents:`import {draw} from './lib/draw';import {templates,defaultGreeting} from './lib/templates';window.catalog=templates;window.renderCard=async(id)=>{const t=templates.find(t=>t.id===id),c=document.createElement('canvas');await draw(c,t,defaultGreeting(t));return c.toDataURL('image/png')};`,resolveDir:process.cwd()},bundle:true,write:false,platform:'browser'});
const root=resolve('public');
const server=createServer(async(req,res)=>{try{
  if(req.url==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><body><script src="/render.js"></script></body></html>');return;}
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
  await mkdir('public/previews',{recursive:true});
  for(const t of templates){
    const images=await page.evaluate(async(id)=>{
      const src=await window.renderCard(id),img=new Image();img.src=src;await img.decode();
      const output={};
      for(const width of [320,640]){const c=document.createElement('canvas');c.width=width;c.height=Math.round(width*img.height/img.width);c.getContext('2d').drawImage(img,0,0,c.width,c.height);output[`${id}-${width}.webp`]=c.toDataURL('image/webp',.86);}
      const c=document.createElement('canvas');c.width=1200;c.height=630;const ctx=c.getContext('2d'),t=window.catalog.find(t=>t.id===id);
      ctx.fillStyle='#fffaf3';ctx.fillRect(0,0,1200,630);const scale=Math.min(530/img.width,550/img.height),h=img.height*scale,w=img.width*scale;ctx.drawImage(img,36+(530-w)/2,(630-h)/2,w,h);
      const x=620;ctx.fillStyle='#a63848';ctx.font='bold 38px Georgia';ctx.fillText('greetly.',x,135);ctx.fillStyle='#292424';ctx.font='bold 30px Georgia';
      let line='',y=225;for(const word of t.name.split(' ')){const next=line?line+' '+word:word;if(ctx.measureText(next).width>1160-x&&line){ctx.fillText(line,x,y);y+=40;line=word}else line=next}ctx.fillText(line,x,y);
      ctx.font='22px Arial';ctx.fillText(t.festival||t.category,x,y+65);ctx.fillText('Free to personalise and share',x,510);
      output[`${id}-social.jpg`]=c.toDataURL('image/jpeg',.9);return output;
    },t.id);
    for(const [name,url] of Object.entries(images))await writeFile(`public/previews/${name}`,Buffer.from(url.split(',')[1],'base64'));
  }
  console.log(`Generated responsive WebP thumbnails and 1200 × 630 social previews for ${templates.length} cards.`);
}finally{socket?.close();browser?.kill();server.closeAllConnections();await new Promise(r=>server.close(r));}

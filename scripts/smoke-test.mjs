const base='http://127.0.0.1:5173';
const body={templateId:'g1',name:'Test',message:'A little joy.',sender:'Tester',bg:'#ffeedb',font:'Georgia',layout:'square',branding:true};
function assert(x,m){if(!x)throw Error(m)}
const bad=await fetch(base+'/api/greetings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,templateId:'bad'})});assert(bad.status===400,'invalid payload rejected');
const create=await fetch(base+'/api/greetings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});assert(create.status===201,'create: '+create.status+' '+await create.clone().text());const saved=await create.json();
const read=await fetch(base+'/api/greetings/'+saved.id);assert(read.ok,'read');assert((await read.json()).name==='Test','payload');assert(read.headers.get('x-robots-tag').includes('noindex'),'noindex');
const denied=await fetch(base+'/api/greetings/'+saved.id,{method:'DELETE',headers:{Authorization:'Bearer wrong'}});assert(denied.status===403,'wrong key denied');
const report=await fetch(base+'/api/greetings/'+saved.id+'/report',{method:'POST'});assert(report.ok,'report');
const del=await fetch(base+'/api/greetings/'+saved.id,{method:'DELETE',headers:{Authorization:'Bearer '+saved.token}});assert(del.status===204,'delete');assert((await fetch(base+'/api/greetings/'+saved.id)).status===404,'deleted unavailable');
const admin=await fetch(base+'/api/admin');assert(admin.status===401,'admin protected');console.log('PASS: validation, create, retrieve, noindex, wrong-key rejection, report, deletion, admin access control');

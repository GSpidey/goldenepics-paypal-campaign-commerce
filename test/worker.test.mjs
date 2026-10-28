import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Miniflare} from 'miniflare';

const origin='https://commerce.example';
const fixture={token:'fixture-setup-token-only',clientId:'fixture-client-id-123456789',clientSecret:'fixture-client-secret-123456789'};
test('Workers runtime: sealed setup, sandbox checkout, delivery, isolation and durable restart',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'commerce-worker-'));
 let mf,created,captures=0,generations=0,redirect=false;
 t.after(async()=>{await mf?.dispose();await rm(dir,{recursive:true,force:true});});
 const files=['worker/index.mjs','worker/store.mjs','worker/assets.generated.mjs','lib/commerce.mjs','lib/paypal.mjs','lib/ai.mjs'];
 const modules=await Promise.all(files.map(async path=>({type:'ESModule',path,contents:await readFile(new URL('../'+path,import.meta.url),'utf8')})));
 const completed=()=>({id:'SANDBOX123',status:'COMPLETED',purchase_units:[{custom_id:created.purchase_units[0].custom_id,payments:{captures:[{id:'CAPTURE123',status:'COMPLETED',amount:{currency_code:'USD',value:'9.00'}}]}}]});
 const options={durableObjectsPersist:dir,workers:[{name:'commerce',compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],modules,bindings:{APP_ORIGIN:origin,AI_DAILY_MAX_CALLS:'4',SETUP_TOKEN:fixture.token,SETUP_EXPIRES:String(Date.now()+3600000),CREDENTIAL_KEY:Buffer.alloc(32,7).toString('base64')},durableObjects:{COMMERCE:{className:'CampaignCommerce',useSQLite:true}},serviceBindings:{AI:{name:'model',entrypoint:'Model'}},outboundService:async req=>{
  assert.equal(new URL(req.url).origin,'https://api-m.sandbox.paypal.com');
  if(redirect)return new Response(null,{status:302,headers:{location:'https://untrusted.example'}});
  if(req.url.endsWith('/token'))return Response.json({access_token:'fixture-token-only',expires_in:3600});
  if(req.url.endsWith('/capture')){captures++;return Response.json(completed());}
  if(req.method==='POST'){created=await req.json();return Response.json({id:'SANDBOX123',links:[{rel:'payer-action',href:'https://www.sandbox.paypal.com/checkoutnow?token=SANDBOX123'}]});}
  return Response.json(captures?completed():{id:'SANDBOX123',status:'APPROVED',purchase_units:created.purchase_units});
 }},{name:'model',compatibilityDate:'2026-05-15',modules:[{type:'ESModule',path:'model.mjs',contents:"import {WorkerEntrypoint} from 'cloudflare:workers';export class Model extends WorkerEntrypoint{async run(){return {response:'# Campaign direction\\n\\n'+ 'Useful campaign copy. '.repeat(20)};}} export default {fetch(){return new Response('fixture');}};"}]}]};
 mf=new Miniflare(options);
 const call=(path,body,cookie)=>mf.dispatchFetch(origin+path,{...(body?{method:'POST',body:JSON.stringify(body)}:{}),headers:{origin,'content-type':'application/json',...(cookie?{cookie}:{})}});
 assert.equal((await call('/api/setup',{...fixture,token:'wrong'})).status,403);
 redirect=true; assert.equal((await call('/api/setup',fixture)).status,503);redirect=false;
 assert.equal((await call('/api/setup',fixture)).status,200);
 assert.equal((await call('/api/setup',fixture)).status,410);
 assert.equal((await call('/setup')).status,410);
 const workspace=await call('/api/workspace');const cookie=workspace.headers.get('set-cookie').split(';')[0];
 const workspaceBody=await workspace.json();assert.equal(workspaceBody.connections.paypal,true);
 assert.ok(!JSON.stringify(workspaceBody).includes(fixture.clientSecret));
 const body={packageId:'starter',brief:{product:'Example notebook',description:'A paper notebook',audience:'Writers',goal:'Explore the notebook'}};
 const order=await(await call('/api/orders',body,cookie)).json();
 assert.equal((await call('/api/orders/'+order.id+'/fulfill',{},cookie)).status,503);
 assert.equal((await call('/api/orders/'+order.id+'/proposal',{},cookie)).status,200);
 assert.equal((await call('/api/orders/'+order.id+'/checkout',{},cookie)).status,200);
 assert.equal((await call('/api/orders/'+order.id+'/capture',{},cookie)).status,200);
 assert.equal((await call('/api/orders/'+order.id+'/capture',{},cookie)).status,200);assert.equal(captures,1);
 const delivery=await(await call('/api/orders/'+order.id+'/fulfill',{},cookie)).json();assert.equal(delivery.state,'delivered');
 assert.equal((await call('/api/orders/'+order.id+'/download',undefined,cookie)).status,200);
 assert.equal((await(await call('/api/workspace')).json()).orders.length,0);
 assert.equal((await call('/api/orders/'+order.id+'/download')).status,404);
 await mf.dispose();mf=new Miniflare(options);
 const restored=await(await call('/api/workspace',undefined,cookie)).json();assert.equal(restored.orders[0].state,'delivered');assert.equal(restored.orders[0].receipt.captureId,'CAPTURE123');assert.equal(restored.connections.paypal,true);
 assert.equal((await call('/api/setup',fixture)).status,410);
 assert.equal((await mf.dispatchFetch(origin+'/api/orders',{method:'POST',headers:{origin:'https://untrusted.example','content-type':'application/json'},body:JSON.stringify(body)})).status,403);
});

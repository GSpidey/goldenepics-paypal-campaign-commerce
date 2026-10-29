import { DurableObject, WorkerEntrypoint } from 'cloudflare:workers';
import { randomBytes, createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { PayPal, ProviderError } from '../lib/paypal.mjs';
import { CreativeAI } from '../lib/ai.mjs';
import { Commerce, PACKAGES } from '../lib/commerce.mjs';
import { DurableStore } from './store.mjs';
import {index,app,style,setup} from './assets.generated.mjs';

const safeFetch = async (url, options) => {
  const response = await fetch(url, {...options, redirect:'manual'});
  if(response.status>=300 && response.status<400) throw new ProviderError('The provider connection needs another check.','provider');
  return response;
};
const json = (data,status=200,headers={}) => Response.json(data,{status,headers});
const model='@cf/meta/llama-3.3-70b-instruct-fp8-fast';

export class CampaignCommerce extends DurableObject {
  constructor(ctx,env) { super(ctx,env); this.env=env; this.store=new DurableStore(ctx.storage.sql); }
  async encryptionKey() {
    return crypto.subtle.importKey('raw',Buffer.from(this.env.CREDENTIAL_KEY,'base64'),'AES-GCM',false,['encrypt','decrypt']);
  }
  async config() {
    if(this.cachedConfig)return this.cachedConfig;
    const saved=this.store.config(); if(!saved)return {};
    const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:Buffer.from(saved.iv,'base64')},await this.encryptionKey(),Buffer.from(saved.ciphertext,'base64'));
    return this.cachedConfig=JSON.parse(new TextDecoder().decode(raw));
  }
  async configure(body) {
    if(!this.env.SETUP_TOKEN || Date.now()>Number(this.env.SETUP_EXPIRES) || this.store.config())return json({message:'Setup is complete or closed.'},410);
    const supplied=Buffer.from(String(body.token||''));const expected=Buffer.from(this.env.SETUP_TOKEN);
    if(supplied.length!==expected.length || !timingSafeEqual(supplied,expected))return json({message:'Use the authorized setup session.'},403);
    if(!this.store.lock('setup',30000))return json({message:'Setup is already in progress.'},409);
    try {
      if(this.store.config())return json({message:'Setup is complete.'},410);
      const values={PAYPAL_CLIENT_ID:body.clientId,PAYPAL_CLIENT_SECRET:body.clientSecret};
      if(Object.values(values).some(v=>typeof v!=='string'||v.length<20||v.length>300))return json({message:'Check both sandbox credentials.'},400);
      await new PayPal(values,safeFetch).auth();
      const iv=crypto.getRandomValues(new Uint8Array(12));
      const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},await this.encryptionKey(),new TextEncoder().encode(JSON.stringify(values)));
      this.store.saveConfig({iv:Buffer.from(iv).toString('base64'),ciphertext:Buffer.from(cipher).toString('base64')});
      this.cachedConfig=values;
      return json({message:'PayPal Sandbox connected. Setup is complete.'});
    } catch { return json({message:'Check the sandbox credentials and try again.'},503); }
    finally { this.store.unlock('setup'); }
  }
  async studioRequest(input) {
    const {actor,method,path,body}=input||{};
    const allowed=method==='GET' && (path==='/api/workspace'||/^\/api\/orders\/[a-f0-9-]{36}\/download$/.test(path)) || method==='POST' && (path==='/api/orders'||/^\/api\/orders\/[a-f0-9-]{36}\/(proposal|checkout|capture|fulfill|reconcileCreate)$/.test(path));
    if(typeof actor!=='string'||!actor.length||actor.length>200||!allowed)return json({message:'This action is unavailable.'},400);
    const origin=this.env.STUDIO_ORIGIN;
    if(!origin||!this.env.CREDENTIAL_KEY)return json({message:'Studio checkout is awaiting connection.'},503);
    // Only the named service entrypoint can supply this identity. HTTP headers never select it.
    const session=createHmac('sha256',this.env.CREDENTIAL_KEY).update('studio:'+actor).digest('hex');
    return this.handle(new Request(origin+path,{method,headers:{origin,'content-type':'application/json',cookie:'ge_session='+session},...(method==='POST'?{body:JSON.stringify(body??{})}:{})}),true);
  }
  async fetch(request) { return this.handle(request,false); }
  async handle(request,studio=false) {
    const url=new URL(request.url),origin=studio?this.env.STUDIO_ORIGIN:this.env.APP_ORIGIN;
    const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"};
    const send=(data,status=200)=>json(data,status,headers);
    const publicOrder=({owner,...order})=>order;
    try {
      if(url.origin!==origin)return send({message:'Open the campaign workspace to continue.'},403);
      if(url.pathname==='/setup' && request.method==='GET'){
        if(!this.env.SETUP_TOKEN || Date.now()>Number(this.env.SETUP_EXPIRES)||this.store.config())return send({message:'Setup is complete or closed.'},410);
        return new Response(setup,{headers:{...headers,'Content-Type':'text/html; charset=utf-8'}});
      }
      if(url.pathname==='/setup.js' && request.method==='GET')return new Response("document.querySelector('form').addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.target);const r=await fetch('/api/setup',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.fromEntries(f))});const d=await r.json();document.querySelector('output').textContent=d.message;if(r.ok)e.target.reset();});",{headers:{...headers,'Content-Type':'text/javascript'}});
      if(request.method==='GET'&&['/','/app.js','/style.css'].includes(url.pathname)){
        const [body,type]=url.pathname==='/'?[index,'text/html']:url.pathname==='/app.js'?[app,'text/javascript']:[style,'text/css'];
        return new Response(body,{headers:{...headers,'Content-Type':type+'; charset=utf-8'}});
      }
      let session=request.headers.get('cookie')?.match(/(?:^|; )ge_session=([a-f0-9]{64})(?:;|$)/)?.[1];
      if(!session){session=randomBytes(32).toString('hex');headers['Set-Cookie']='ge_session='+session+'; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800; Secure';}
      const owner=createHash('sha256').update(session).digest('hex');
      const config=await this.config();
      const ai=new CreativeAI({AI_API_KEY:'internal-binding',AI_BASE_URL:'https://binding.invalid',AI_MODEL:model},async(_url,opts)=>{
        const input=JSON.parse(opts.body);
        const result=await this.env.AI.run(model,{messages:input.messages,max_tokens:input.max_tokens,temperature:input.temperature});
        return Response.json({choices:[{message:{content:result.response}}],usage:result.usage});
      });
      const commerce=new Commerce({store:this.store,paypal:new PayPal(config,safeFetch),ai,origin,returnPath:studio?'/commerce':'/',aiLimit:Math.min(20,Math.max(0,Number(this.env.AI_DAILY_MAX_CALLS)||0))});
      if(request.method==='GET'&&url.pathname==='/api/workspace')return send({packages:PACKAGES,orders:this.store.list(owner).map(publicOrder),connections:{paypal:!!config.PAYPAL_CLIENT_ID,ai:!!this.env.AI},environment:'sandbox'});
      const download=url.pathname.match(/^\/api\/orders\/([a-f0-9-]{36})\/download$/);
      if(request.method==='GET'&&download){const o=commerce.owned(download[1],owner);if(!o.receipt||!o.delivery)return send({message:'Your package will be available after payment confirmation and production.'},409);return new Response('# '+o.brief.product+'\n\nSandbox order: '+o.id+'\n\n'+o.delivery.text+'\n\nModel: '+o.delivery.model+'\nReview all claims and destinations before publication.',{headers:{...headers,'Content-Type':'text/markdown; charset=utf-8','Content-Disposition':'attachment; filename="GoldenEpics-Campaign-'+o.id+'.md"'}});}
      if(request.method!=='POST'||request.headers.get('origin')!==origin||!request.headers.get('content-type')?.startsWith('application/json'))return send({message:'Open the campaign workspace to continue.'},403);
      const reader=request.body?.getReader();let raw='',size=0;const decoder=new TextDecoder();if(reader)while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>8000){await reader.cancel();return send({message:'Use a shorter campaign brief.'},413);}raw+=decoder.decode(value,{stream:true});}raw+=decoder.decode();
      let body;try{body=JSON.parse(raw);}catch{return send({message:'Check the request and try again.'},400);}
      if(url.pathname==='/api/setup')return this.configure(body);
      if(url.pathname==='/api/orders')return send(publicOrder(commerce.create(owner,body)),201);
      const action=url.pathname.match(/^\/api\/orders\/([a-f0-9-]{36})\/(proposal|checkout|capture|fulfill|reconcileCreate)$/);
      if(action)return send(publicOrder(await commerce[action[2]](action[1],owner)));
      return send({message:'This action is unavailable.'},404);
    } catch(e){return send({message:e instanceof ProviderError?e.message:'This step could not finish. Your saved orders remain available.'},e.kind==='not-found'?404:e.kind==='input'?400:e.kind==='busy'?409:503);}
  }
}
export class StudioCommerceBridge extends WorkerEntrypoint {
  async run(input) { return this.env.COMMERCE.get(this.env.COMMERCE.idFromName('campaign-commerce-v1')).studioRequest(input); }
}
export default {fetch(request,env){return env.COMMERCE.get(env.COMMERCE.idFromName('campaign-commerce-v1')).fetch(request);}};


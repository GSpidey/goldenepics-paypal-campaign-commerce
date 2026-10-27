import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomBytes,createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { Store } from './lib/store.mjs';
import { PayPal,ProviderError } from './lib/paypal.mjs';
import { CreativeAI } from './lib/ai.mjs';
import { Commerce,PACKAGES } from './lib/commerce.mjs';
export function makeServer(config=process.env,overrides={}){
 const origin=config.APP_ORIGIN||'http://localhost:8789';const store=overrides.store||new Store(config.DATABASE_PATH||'./data/commerce.sqlite');
 const commerce=new Commerce({store,paypal:overrides.paypal||new PayPal(config),ai:overrides.ai||new CreativeAI(config),origin,aiLimit:Math.min(100,Math.max(0,Number.isFinite(Number(config.AI_DAILY_MAX_CALLS))?Number(config.AI_DAILY_MAX_CALLS):20))});
 return createServer(async(req,res)=>{
  const url=new URL(req.url,origin);let session=req.headers.cookie?.match(/(?:^|; )ge_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  if(!session){session=randomBytes(32).toString('hex');res.setHeader('Set-Cookie','ge_session='+session+'; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800'+(origin.startsWith('https:')?'; Secure':''));}
  const owner=createHash('sha256').update(session).digest('hex');
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  const send=(status,value)=>{res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify(value));};
  const publicOrder=o=>{const {owner,...safe}=o;return safe;};
  try{
   if(req.method==='GET'&&['/','/app.js','/style.css'].includes(url.pathname)){const name=url.pathname==='/'?'index.html':url.pathname.slice(1);res.setHeader('content-type',name.endsWith('.html')?'text/html; charset=utf-8':name.endsWith('.js')?'text/javascript; charset=utf-8':'text/css; charset=utf-8');return res.end(await readFile(new URL('./public/'+name,import.meta.url)));}
   if(req.method==='GET'&&url.pathname==='/api/workspace')return send(200,{packages:PACKAGES,orders:store.list(owner).map(publicOrder),connections:{paypal:!!(config.PAYPAL_CLIENT_ID&&config.PAYPAL_CLIENT_SECRET),ai:!!(config.AI_API_KEY&&config.AI_BASE_URL&&config.AI_MODEL)},environment:'sandbox'});
   const download=url.pathname.match(/^\/api\/orders\/([a-f0-9-]{36})\/download$/);
   if(req.method==='GET'&&download){const o=commerce.owned(download[1],owner);if(!o.receipt||!o.delivery)return send(409,{message:'Your package will be available after payment confirmation and production.'});res.writeHead(200,{'content-type':'text/markdown; charset=utf-8','content-disposition':'attachment; filename="GoldenEpics-Campaign-'+o.id+'.md"'});return res.end('# '+o.brief.product+'\n\nSandbox order: '+o.id+'\n\n'+o.delivery.text+'\n\nModel: '+o.delivery.model+'\nReview all claims and destinations before publication.');}
   if(req.method!=='POST'||req.headers.origin!==origin||!req.headers['content-type']?.startsWith('application/json'))return send(403,{message:'Open the campaign workspace to continue.'});
   let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>8000)return send(413,{message:'Use a shorter campaign brief.'});}let body;try{body=JSON.parse(raw);}catch{return send(400,{message:'Check the request and try again.'});}
   if(url.pathname==='/api/orders')return send(201,publicOrder(commerce.create(owner,body)));
   const action=url.pathname.match(/^\/api\/orders\/([a-f0-9-]{36})\/(proposal|checkout|capture|fulfill|reconcileCreate)$/);
   if(action)return send(200,publicOrder(await commerce[action[2]](action[1],owner)));
   return send(404,{message:'This action is unavailable.'});
  }catch(e){const status=e.kind==='not-found'?404:e.kind==='input'?400:e.kind==='busy'?409:503;return send(status,{message:e instanceof ProviderError?e.message:'This step could not finish. Your saved orders remain available.'});}
 });
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){const server=makeServer();server.requestTimeout=75000;server.headersTimeout=10000;server.listen(Number(process.env.PORT)||8789,'127.0.0.1',()=>console.log('Campaign Commerce listening on configured local port.'));}

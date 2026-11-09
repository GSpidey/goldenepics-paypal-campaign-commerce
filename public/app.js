import {resumeCheckoutReturn} from './checkout-return.js';
const $=s=>document.querySelector(s);let busy=false;
const el=(tag,text,cls)=>{const x=document.createElement(tag);if(text)x.textContent=text;if(cls)x.className=cls;return x;};
function notice(message){$('#notice').textContent=message;}
function setBusy(value){busy=value;$('#orders').setAttribute('aria-busy',String(value));document.querySelectorAll('button').forEach(b=>{b.disabled=value;});}
async function api(path,body){const r=await fetch(path,body?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}:{});const d=await r.json();if(!r.ok)throw new Error(d.message||'This step could not finish. Please try again.');return d;}
async function action(id,name){if(busy)return;setBusy(true);notice('Working on your campaign…');try{const order=await api('/api/orders/'+id+'/'+name,{});notice(name==='capture'?'Sandbox payment verified. Your order is ready for production.':'Your campaign is saved.');if(name==='checkout'&&order.approvalUrl)location.assign(order.approvalUrl);}catch(e){notice(e.message);}finally{await load();setBusy(false);}}
function button(order,label,name){const b=el('button',label);b.disabled=busy;b.onclick=()=>action(order.id,name);return b;}
function render(order){const box=el('article',null,'order');box.append(el('h3',order.brief.product),el('div',order.state.replaceAll('_',' '),'state'),el('p',order.currency+' '+order.amount+' · Sandbox order '+order.id.slice(0,8),'subtle'));if(order.message)box.append(el('p',order.message,'subtle'));if(order.proposal){const d=el('details');d.append(el('summary','Review creative proposal'),el('pre',order.proposal.text));box.append(d);}const actions=el('div',null,'actions');if(!order.proposal)actions.append(button(order,'Prepare AI proposal','proposal'));else if(!order.paypalId)actions.append(button(order,order.createUncertain?'Reconcile saved checkout':'PayPal sandbox checkout',order.createUncertain?'reconcileCreate':'checkout'));if(order.approvalUrl&&!order.receipt){const a=el('a','Open PayPal Sandbox','button quiet');a.href=order.approvalUrl;actions.append(a,button(order,'Check payment','capture'));}if(order.receipt&&!order.delivery)actions.append(button(order,'Create campaign package','fulfill'));if(order.delivery){const a=el('a','Download campaign package','button');a.href='/api/orders/'+order.id+'/download';actions.append(a);const d=el('details');d.append(el('summary','Read delivered package'),el('pre',order.delivery.text));box.append(d);}box.append(actions);return box;}
async function load(){try{const d=await api('/api/workspace');$('#connections').textContent=(d.connections.ai?'Creative service configured':'Creative service setup pending')+' · '+(d.connections.paypal?'PayPal Sandbox configured':'PayPal Sandbox setup pending');$('#orders').replaceChildren(...(d.orders.length?d.orders.map(order=>{const card=render(order);card.id='campaign-'+order.id;card.tabIndex=-1;return card;}):[el('p','Your saved campaigns will appear here. Start with a brief on the left.','subtle')]));return d;}catch(e){notice(e.message);return null;}}
$('#brief').onsubmit=async e=>{e.preventDefault();if(busy)return;setBusy(true);try{const brief=Object.fromEntries(new FormData(e.target));await api('/api/orders',{packageId:'starter',brief});notice('Brief saved. Prepare your proposal when ready.');await load();}catch(e){notice(e.message);}finally{setBusy(false);}};
$('#sample').onclick=()=>{const sample={product:'RiseQuest',description:'A companion app that helps people turn everyday plans into manageable quests.',audience:'Busy creators who want a gentler way to plan their day.',goal:'Try one small quest today.'};for(const [key,value]of Object.entries(sample))$('#brief').elements[key].value=value;};
async function initialize(){
 setBusy(true);
 try{
  const workspace=await load();if(!workspace)return;
  if(new URL(location.href).searchParams.has('order'))notice('Checking your saved checkout…');
  const result=await resumeCheckoutReturn(location.href,workspace.orders,id=>api('/api/orders/'+id+'/capture',{}));
  if(!result)return;
  await load();notice(result.message);
  if(result.orderId)document.getElementById('campaign-'+result.orderId)?.focus();
  const url=new URL(location.href);for(const key of ['order','token','PayerID','cancelled'])url.searchParams.delete(key);
  history.replaceState(null,'',url.pathname+url.search+url.hash);
 }finally{setBusy(false);}
}
initialize();

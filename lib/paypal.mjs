const BASE='https://api-m.sandbox.paypal.com';
export class ProviderError extends Error {constructor(message,kind='provider'){super(message);this.kind=kind;}}
export class PayPal {
 constructor(config,fetcher=fetch){this.config=config;this.fetcher=fetcher;this.token=null;}
 async auth(){
  if(!this.config.PAYPAL_CLIENT_ID||!this.config.PAYPAL_CLIENT_SECRET)throw new ProviderError('Sandbox checkout is awaiting account setup. Your brief is saved.','setup');
  if(this.token?.until>Date.now())return this.token.value;
  const response=await this.fetcher(BASE+'/v1/oauth2/token',{method:'POST',headers:{authorization:'Basic '+Buffer.from(this.config.PAYPAL_CLIENT_ID+':'+this.config.PAYPAL_CLIENT_SECRET).toString('base64'),'content-type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials',signal:AbortSignal.timeout(15000),redirect:'error'});
  if(!response.ok)throw new ProviderError('Sandbox checkout needs an account access check.','authentication');
  const data=await response.json();if(!data.access_token)throw new ProviderError('Sandbox checkout is temporarily unavailable.');
  this.token={value:data.access_token,until:Date.now()+Math.max(0,(Number(data.expires_in)-60))*1000};return this.token.value;
 }
 async request(path,{method='GET',body,key}={}){
  const token=await this.auth();let response;
  try{response=await this.fetcher(BASE+path,{method,headers:{authorization:'Bearer '+token,'content-type':'application/json',Prefer:'return=representation',...(key?{'PayPal-Request-Id':key}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000),redirect:'error'});}catch{throw new ProviderError('Checkout confirmation is taking longer. Check this same order again.','uncertain');}
  if(!response.ok)throw new ProviderError(response.status===429?'Sandbox checkout is busy. Try this order again shortly.':'Sandbox checkout could not complete this step. Check this order again.',response.status>=500?'uncertain':'provider');
  return response.json();
 }
 async create(order,origin){return this.request('/v2/checkout/orders',{method:'POST',key:order.id+'-create',body:{intent:'CAPTURE',purchase_units:[{reference_id:order.id,custom_id:order.id,description:'GoldenEpics '+order.packageId,amount:{currency_code:order.currency,value:order.amount}}],payment_source:{paypal:{experience_context:{shipping_preference:'NO_SHIPPING',user_action:'PAY_NOW',return_url:origin+'/?order='+order.id,cancel_url:origin+'/?order='+order.id+'&cancelled=1'}}}}});}
 get(id){if(!/^[A-Z0-9]{1,36}$/.test(id))throw new ProviderError('Check the saved checkout reference.','validation');return this.request('/v2/checkout/orders/'+id);}
 capture(order){return this.request('/v2/checkout/orders/'+order.paypalId+'/capture',{method:'POST',body:{},key:order.id+'-capture'});}
}
export function verifyCapture(order,result){
 if(result.id!==order.paypalId||result.status!=='COMPLETED'||result.purchase_units?.length!==1)throw new ProviderError('Payment confirmation needs another check. Your order remains saved.','verification');
 const unit=result.purchase_units[0];const captures=unit.payments?.captures;
 if(unit.custom_id!==order.id||!Array.isArray(captures)||captures.length!==1)throw new ProviderError('Payment reference could not be verified.','verification');
 const capture=captures[0];
 if(capture.status!=='COMPLETED'||capture.amount?.currency_code!==order.currency||capture.amount?.value!==order.amount||!capture.id)throw new ProviderError('Payment amount or status could not be verified.','verification');
 return {captureId:capture.id,amount:order.amount,currency:order.currency,verifiedAt:new Date().toISOString(),environment:'sandbox'};
}
export function approvalLink(data){const link=data.links?.find(l=>['payer-action','approve'].includes(l.rel));if(!link)return null;try{const u=new URL(link.href);return u.protocol==='https:'&&u.hostname==='www.sandbox.paypal.com'?u.href:null;}catch{return null;}}

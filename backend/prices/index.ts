import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.118.0';
import {readOffer} from './core.ts';
import {searchOfficial,firstMatchingPrice,matchingTitle,officialUrl} from './tavily.ts';
const origins=['https://mealday-kitchen-app.jauntycomet1.chatgpt.site','https://mealday-kitchen-app.ujjawal-0x.chatgpt.site','http://terminal.local:4173'];
const hosts:Record<string,string>={Carrefour:'www.carrefouruae.com',LuLu:'gcc.luluhypermarket.com',Spinneys:'www.spinneys.com',Waitrose:'www.waitrose.ae','Union Coop':'www.unioncoop.ae',Nesto:'nestogroup.com',Choithrams:'www.choithrams.com'};
const recent=new Map<string,number>();
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':origins.includes(origin)?origin:origins[0],'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Vary':'Origin'};
 const respond=(body:any,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(req.method==='OPTIONS')return new Response(null,{headers});if(req.method!=='POST')return respond({error:'Method not allowed'},405);
 try{
 const key=Deno.env.get('TAVILY_API_KEY');const enabled=(Deno.env.get('MEALDAY_PRICE_HOSTS')||'').split(',').map(s=>s.trim());
 const {shop,city,items}=await req.json();const host=hosts[shop];
 if(!host||typeof city!=='string'||city.length>100||!Array.isArray(items)||items.length>40)return respond({error:'Invalid price request'},400);
 if(!key)return respond({records:[],status:'missing_key'});

 // Paid search requires a verified user; publishable keys are never treated as a user identity.
 const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!);
 const token=(req.headers.get('Authorization')||'').replace(/^Bearer /,'');const {data:{user},error}=await client.auth.getUser(token);
 if(error||!user)return respond({records:[],status:'sign_in_required'});
 const at=Date.now();if(at-(recent.get(user.id)||0)<60000)return respond({records:[],status:'cooldown'});if(recent.size>10000)recent.clear();recent.set(user.id,at);
 const records=[];
 // Bounded pilot. No arbitrary caller URLs, redirects, login cookies or challenge bypasses.
 for(const item of items.slice(0,10)){
 if(Date.now()-at>20000)break;
 if(typeof item.key!=='string'||typeof item.name!=='string'||item.name.length>150||!Number.isFinite(item.pack)||item.pack<=0||typeof item.unit!=='string'||!/^[a-z ]{1,12}$/.test(item.unit))continue;
 try{
 const search=await searchOfficial(key,host,item,city);
 if(search.status!=='checked')return respond({records,status:search.status});
 const candidates=search.results.filter((r:any)=>matchingTitle(String(r.title||''),item));
 if(!candidates.length)continue;
 let offer=firstMatchingPrice(candidates,item,host);
 // Only explicitly enabled retailer hosts may receive direct page fetches.
 if(enabled.includes(host))for(const candidate of candidates.slice(0,1)){
 try{
 const url=officialUrl(candidate.url,host)!;
 const page=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(5000)});
 if(!page.ok||!page.headers.get('content-type')?.includes('text/html'))continue;
 const html=await page.text();if(html.length>3000000)continue;
 const parsed=readOffer(html,item);if(parsed&&matchingTitle(parsed.product,item))offer={...parsed,url,sourceKind:'page'};
 }catch{/* Retain the matching indexed offer if the product page is unreachable. */}
 }
 if(!offer)continue;
 records.push({key:item.key,shop,city,pack:item.pack,unit:item.unit,...offer,checkedAt:new Date().toISOString()});
 }catch{/* unavailable or ambiguous: caller retains its saved price */}
 }
 return respond({records,status:'checked',scope:'Public website price; delivery area and checkout not verified'});
 }catch{return respond({records:[],status:'unavailable'})}
});

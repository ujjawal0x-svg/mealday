import React,{useEffect,useRef,useState} from 'react';
import {cloud} from './cloud';
import {PriceRecord,resolvePrices,validRecord,summarizePriceSources,storeHosts} from './priceLogic';
export function useStorePrices(items:any[],shop:string,city:string,active:boolean,userId:string|undefined,autoRefresh=true){
 const [records,setRecords]=useState<PriceRecord[]>([]),[verified,setVerified]=useState<PriceRecord[]>([]),[busy,setBusy]=useState(false),[status,setStatus]=useState('');const generation=useRef(0);
 const signature=JSON.stringify(items.filter(i=>i.packs>0).map(i=>[i.key,i.pack,i.unit,i.packs]));const storage='mealday.store-prices.v1';
 const refresh=async()=>{const id=++generation.current;setBusy(true);setStatus('Searching official store listings…');try{const {data:{session}}=await cloud.auth.getSession();if(id!==generation.current)return;if(!session){setStatus('Sign in to check website prices. Saved prices or catalogue estimates shown.');return;}const {data,error}=await cloud.functions.invoke('mealday-prices',{body:{shop,city,items:items.filter(i=>i.packs>0).map(({key,name,pack,unit})=>({key,name,pack,unit}))},timeout:30000});if(id!==generation.current)return;if(error)throw error;const fresh=(Array.isArray(data?.records)?data.records:[]).filter((r:any)=>items.some(i=>validRecord(r,i,shop,city)));setVerified(fresh);setRecords(prev=>{let saved=prev;try{const cached=JSON.parse(localStorage.getItem(storage)||'[]');if(Array.isArray(cached))saved=cached}catch{}const next=[...fresh,...saved.filter(r=>!fresh.some((n:PriceRecord)=>n.key===r.key&&n.shop===r.shop&&n.city===r.city&&n.pack===r.pack&&n.unit===r.unit))].slice(0,500);try{localStorage.setItem(storage,JSON.stringify(next))}catch{}return next});setStatus(['not_configured','missing_key'].includes(data?.status)?'Website price lookup is not connected. Saved prices or catalogue estimates shown.':data?.status==='store_not_enabled'?'Website price checks are not enabled for this store. Saved prices or estimates shown.':data?.status==='quota_exceeded'?'Free search quota reached. Saved prices or estimates shown.':data?.status==='model_unavailable'?'Search model unavailable. Saved prices or estimates shown.':['provider_configuration','provider_unavailable'].includes(data?.status)?'Search connection unavailable. Saved prices or estimates shown.':data?.status==='sign_in_required'?'Sign in to check website prices. Saved prices or estimates shown.':data?.status==='cooldown'?'Please wait a minute before checking again.':fresh.length?`${fresh.length} store prices found. Other items use saved prices or estimates.`:'No matching website prices found. Saved prices or estimates shown.');}catch{if(id===generation.current)setStatus('Website prices unavailable. Saved prices or catalogue estimates shown.')}finally{if(id===generation.current)setBusy(false)}};
 useEffect(()=>{if(!active||!items.some(i=>i.packs>0)){setBusy(false);return;}try{const saved=JSON.parse(localStorage.getItem(storage)||'[]');setRecords(Array.isArray(saved)?saved:[])}catch{setRecords([])}setVerified([]);setBusy(false);setStatus('');if(autoRefresh)refresh();return()=>{generation.current++}},[shop,city,signature,active,userId,autoRefresh]);
 const rows=resolvePrices(items,records,shop,city,verified);const total=rows.reduce((n,r)=>n+Math.round(r.cost*100),0)/100;
 return {rows,total,busy,status,refresh,shop};
}
export function StorePrices({quote,city}:{quote:ReturnType<typeof useStorePrices>;city:string}){
 const {rows,busy,status,refresh,shop}=quote;
 if(!rows.length)return null;
 const groups=summarizePriceSources(rows);
 const retailer=shop==='Carrefour'||shop==='LuLu';
 return <section className="store-prices" aria-label="Grocery price sources">
  <div className="section-heading"><h2>{shop} prices</h2><button className="link" disabled={busy} onClick={refresh}>{busy?'Checking…':'Refresh prices'}</button></div>
  <p role="status">{status}</p>
  <dl className="grocery-price-breakdown">{groups.map(group=><div key={group.label}><dt>{group.label} · {group.count} items</dt><dd>AED {group.subtotal.toFixed(2)}</dd></div>)}</dl>
  <p><strong>{city} delivery · Not verified</strong></p>
  <small>Product listings can show a pack price. The retailer confirms stock, delivery fees and the final price after you set your address.</small>
  {retailer&&<p><a className="link" href={'https://'+storeHosts[shop]+(shop==='LuLu'?'/en-ae/':'/')} target="_blank" rel="noopener noreferrer">Check your address at {shop} ↗</a></p>}
 </section>;
}


type StoreQuote=ReturnType<typeof useStorePrices>;

export function CompareStorePrices({items,city,userId,current}:{items:any[];city:string;userId:string|undefined;current:StoreQuote}){
 const carrefour=useStorePrices(items,'Carrefour',city,current.shop!=='Carrefour',userId,false);
 const lulu=useStorePrices(items,'LuLu',city,current.shop!=='LuLu',userId,false);
 const quotes=[current.shop==='Carrefour'?current:carrefour,current.shop==='LuLu'?current:lulu];
 const busy=quotes.some(quote=>quote.busy)||current.busy;
 if(!quotes[0].rows.length)return null;
 return <section className="store-prices compare-prices" aria-labelledby="compare-prices-title">
  <h2 id="compare-prices-title">Compare grocery prices</h2>
  <p>Same basket and pack quantities · {city}</p>
  <div className="compare-prices-grid">{quotes.map(quote=>{
   const estimates=quote.rows.filter(row=>row.priceStatus==='Catalogue estimate').length;
   const priced=quote.rows.filter(row=>Number.isFinite(row.cost));
   const missing=quote.rows.length-priced.length;
   const subtotal=priced.reduce((sum,row)=>sum+Math.round(row.cost*100),0)/100;
   return <article key={quote.shop}>
    <div className="compare-store-brand"><img src={quote.shop==='Carrefour'?'/assets/carrefour.png':'/assets/lulu.png'} alt="" width="32" height="32"/><h3>{quote.shop}</h3></div>
    <strong>{priced.length?`AED ${subtotal.toFixed(2)}`:'Price unavailable'}</strong>
    {missing>0&&<small>{missing} items unpriced</small>}
    <small>{quote.rows.length-estimates} of {quote.rows.length} items with store prices</small>
    {estimates>0&&<small>{estimates} catalogue estimates</small>}
    <button className="link" disabled={busy||!userId} onClick={quote.refresh}>{quote.busy?'Checking…':'Check store prices'}</button>
    {quote.status&&userId&&<small role="status">{quote.status}</small>}
   </article>;
  })}</div>
  {!userId&&<p>Sign in to check store prices.</p>}
  <small>Totals may include saved prices and catalogue estimates. Delivery fees and address-specific stock are confirmed at checkout.</small>
 </section>;
}

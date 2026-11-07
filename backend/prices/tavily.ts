export function officialUrl(value:unknown,host:string){try{const u=new URL(String(value));return u.protocol==='https:'&&u.hostname===host&&!u.username&&!u.password&&!u.port?u.href:null}catch{return null}}
export function matchingTitle(title:string,item:{name:string;pack:number;unit:string}){
 const words=item.name.toLowerCase().match(/[a-z]+/g)||[];if(!words.length||!words.every(w=>new RegExp('\\b'+w+'\\b','i').test(title)))return false;
 const sizes=[...title.matchAll(/(\d+(?:\.\d+)?)\s*(kg|g|ml|litres?|liters?|l|eggs?)\b/gi)];
 if(sizes.length!==1||/\b(pack of|\d+\s*[x×])\b/i.test(title))return false;
 const [,n,unit]=sizes[0];const u=unit.toLowerCase(),base=u==='kg'?'g':/^(l|litre|liter)/.test(u)?'ml':u.startsWith('egg')?'egg':u;
 return base===item.unit&&Number(n)*(u==='kg'||/^(l|litre|liter)/.test(u)?1000:1)===item.pack;
}
export function searchPrice(result:any,item:any,host:string){
 const url=officialUrl(result.url,host);if(!url||!matchingTitle(String(result.title||''),item))return null;
 // Category pages, unit prices, crossed-out offers and ambiguous multi-price snippets never supply a quote.
 if(/\/(c|category|search)(\/|\?|$)/i.test(new URL(url).pathname)||/out of stock|unavailable/i.test(result.content||''))return null;
 const content=String(result.content||'');if(/per\s+(kg|g|litre|liter|l)\b/i.test(content))return null;
 const amounts=[...content.matchAll(/\bAED\s*(\d{1,4})(?:\s*\.\s*(\d{2}))?(?![\d.])/gi)].map(m=>Number(m[1])+Number(m[2]||0)/100);
 if(!amounts.length||amounts.some(p=>!Number.isFinite(p)||p<=0||p!==amounts[0]))return null;
 return {price:amounts[0],product:result.title,url,sourceKind:'search'};
}
export async function searchOfficial(key:string,host:string,item:any,city:string){
 const r=await fetch('https://api.tavily.com/search',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({query:`site:${host} "${item.name}" "${item.unit==='g'&&item.pack>=1000?item.pack/1000+'kg':item.unit==='ml'&&item.pack>=1000?item.pack/1000+'L':item.pack+item.unit}" price AED`,include_domains:[host],search_depth:'basic',auto_parameters:false,include_answer:false,include_raw_content:false,max_results:5}),signal:AbortSignal.timeout(9000)});
 if(!r.ok)return {status:[429,432,433].includes(r.status)?'quota_exceeded':'provider_unavailable',results:[]};
 const d=await r.json();return {status:'checked',results:(d.results||[]).filter((x:any)=>officialUrl(x.url,host))};
}

export function firstMatchingPrice(results:any[],item:any,host:string){
 const offers=results.map(result=>searchPrice(result,item,host)).filter(offer=>offer!==null);
 return offers.find(offer=>offers.every(other=>other.url!==offer.url||other.price===offer.price))??null;
}

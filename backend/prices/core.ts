// A model may discover URLs; only structured data fetched from the official page supplies prices.
export function readOffer(html:string,expected:{pack:number;unit:string},now=Date.now()){
 const size=new RegExp('(?:^|[^0-9])'+String(expected.pack).replace('.','\\.')+'\\s*'+(expected.unit==='g'?'g(?:ram)?s?':expected.unit==='ml'?'ml':expected.unit==='egg'?'eggs?':expected.unit)+'(?:\\b|$)','i');
 const found:any[]=[];
 function walk(x:any){if(!x||typeof x!=='object')return;if(Array.isArray(x)){x.forEach(walk);return}if([].concat(x['@type']||[]).includes('Product')){const title=String(x.name||'');if(size.test(title))for(const o of [].concat(x.offers||[])){const price=Number(o.price);if(o.priceCurrency==='AED'&&Number.isFinite(price)&&price>0&&price<10000&&/\/InStock$/.test(o.availability||'')&&(!o.priceValidUntil||Date.parse(o.priceValidUntil)>=now))found.push({price,product:title});}}if(x['@graph'])walk(x['@graph']);}
 for(const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi))try{walk(JSON.parse(match[1]))}catch{}
 // Multiple conflicting offers are ambiguous: retain the previous price instead.
 return found.length&&found.every(o=>o.price===found[0].price&&o.product===found[0].product)?found[0]:null;
}

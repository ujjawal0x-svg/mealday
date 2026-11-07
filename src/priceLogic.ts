export type PriceRecord={key:string;shop:string;city:string;pack:number;unit:string;price:number;url:string;product:string;checkedAt:string;sourceKind?:'page'|'search'};
export const storeHosts:Record<string,string>={Carrefour:'www.carrefouruae.com',LuLu:'gcc.luluhypermarket.com',Spinneys:'www.spinneys.com',Waitrose:'www.waitrose.ae','Union Coop':'www.unioncoop.ae',Nesto:'nestogroup.com',Choithrams:'www.choithrams.com'};
export function validRecord(r:any,item:any,shop:string,city:string,now=Date.now()):r is PriceRecord{
 try{return r.key===item.key&&r.shop===shop&&r.city===city&&r.pack===item.pack&&r.unit===item.unit&&Number.isFinite(r.price)&&r.price>0&&r.price<10000&&typeof r.product==='string'&&r.product.length>0&&new URL(r.url).protocol==='https:'&&new URL(r.url).hostname===storeHosts[shop]&&!new URL(r.url).port&&!new URL(r.url).username&&!new URL(r.url).password&&Number.isFinite(Date.parse(r.checkedAt))&&Date.parse(r.checkedAt)<=now&&now-Date.parse(r.checkedAt)<30*86400000}catch{return false}
}
export function resolvePrices(items:any[],records:any[],shop:string,city:string,verified:PriceRecord[]=[],now=Date.now()){
 return items.filter(i=>i.packs>0).map(item=>{const candidates=records.filter(r=>validRecord(r,item,shop,city,now)).sort((a,b)=>Date.parse(b.checkedAt)-Date.parse(a.checkedAt));const price=candidates[0];const current=price&&verified.some(r=>r.key===price.key&&r.shop===price.shop&&r.city===price.city&&r.pack===price.pack&&r.unit===price.unit&&r.url===price.url&&r.price===price.price&&r.sourceKind===price.sourceKind&&r.checkedAt===price.checkedAt)&&now-Date.parse(price.checkedAt)<5*60000;return {...item,price:price?.price??item.price,cost:price?Math.round(item.packs*Math.round(price.price*100))/100:item.cost,priceStatus:price?(current?(price.sourceKind==='search'?'Indexed store price':'Retailer page price'):'Saved store price'):'Catalogue estimate',record:price};});
}

export function summarizePriceSources(rows: ReturnType<typeof resolvePrices>) {
 const sources = ['Retailer page price','Indexed store price','Saved store price','Catalogue estimate'];
 return sources.map(label => {
  const items = rows.filter(row => row.priceStatus === label);
  return {label, count:items.length, subtotal:items.reduce((sum,row)=>sum+Math.round(row.cost*100),0)/100};
 }).filter(group => group.count > 0);
}

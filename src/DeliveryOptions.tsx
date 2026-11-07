import {formatGroceryHandoff} from './groceryHandoff';
import {ingredientName,ingredientUnit} from './ingredientLabels';
import React,{useState} from 'react';
import {ShareGroceries} from './ShareGroceries';
import {Icon} from './icons';
import {DeliveryLocation} from './DeliveryLocation';
export const deliveryPlatforms=[
 {id:'careem',name:'Careem Quik',description:'Fresh food & everyday essentials',color:'#e8f4e3',url:'https://www.careem.com/en-AE/groceries/'},
 {id:'carrefour',name:'Carrefour',description:'Shop Carrefour UAE',color:'#fff',url:'https://www.carrefouruae.com/',logo:'carrefour.png'},
 {id:'lulu',name:'LuLu',description:'Shop LuLu UAE',color:'#fff',url:'https://gcc.luluhypermarket.com/en-ae/grocery/',logo:'lulu.png'},
 {id:'noon',name:'noon Minutes',description:'Groceries, household & more',color:'#fff6ce',url:'https://minutes.noon.com/uae-en/'},
 {id:'talabat',name:'talabat mart',description:'Your everyday grocery shop',color:'#fff0e5',url:'https://www.talabat.com/uae/talabat-mart'},
 {id:'instashop',name:'InstaShop',description:'Supermarkets & local stores',color:'#fce9ef',url:'https://instashop.com/en-ae'},
 {id:'deliveroo',name:'Deliveroo Groceries',description:'Groceries from nearby shops',color:'#e3f4f3',url:'https://deliveroo.ae/en/takeaway/grocery'}
];
export function DeliveryOptions({items,city,onBack,listUnavailable=false,onRetry}:{items:any[];city:string;onBack:()=>void;listUnavailable?:boolean;onRetry:()=>void}){
 const [selected,setSelected]=useState(()=>{try{const saved=localStorage.getItem('mealday.delivery-choice');return deliveryPlatforms.some(p=>p.id===saved)?saved!:'careem'}catch{return 'careem'}}),[copied,setCopied]=useState<string|null>(null),[manual,setManual]=useState<string|null>(null),[showList,setShowList]=useState(false);
 const chosen=deliveryPlatforms.find(p=>p.id===selected)!;const buy=items.filter(i=>i.packs>0);const list=formatGroceryHandoff(buy);
 const choose=(id:string)=>{setSelected(id);setCopied(null);setManual(null);try{localStorage.setItem('mealday.delivery-choice',id)}catch{}};
 const copy=async(text:string,label:string)=>{
  if(!text)return;
  try{await navigator.clipboard.writeText(text);setCopied(label);setManual(null)}
  catch{setManual(text);setCopied(null)}
 };
 return <div className="delivery-options simple-delivery"><button className="delivery-back" onClick={onBack}><Icon name="arrow-left"/> Shopping list</button><header className="delivery-heading"><span>YOUR GROCERIES</span><h1>Shop or share</h1></header>
 <div className="grocery-share-strip"><img src="/assets/c07c372a3818.webp" alt="Mealday chef"/><div><h2>Shopping together?</h2><p>Share only what’s left to buy.</p><ShareGroceries items={buy}/>{!listUnavailable&&!buy.length&&<p>All done! Nothing left to buy or share.</p>}</div></div>
 {listUnavailable&&<div className="warning" role="status"><b>Your grocery list is unavailable.</b><button onClick={onRetry}>Retry grocery list</button></div>}
 <div className="delivery-list-preview"><button aria-expanded={showList} onClick={()=>setShowList(!showList)}><span><b>Still to buy</b><small>{listUnavailable?'Unavailable':`${buy.length} items`}</small></span><strong>{showList?'−':'+'}</strong></button>{showList&&<ul>{buy.map(i=><li key={i.key}><span>{ingredientName(i.name,i.key)}</span><b>{i.packs} × {i.pack} {ingredientUnit(i.unit)}</b><button type="button" className="link delivery-copy-item" aria-label={'Copy '+ingredientName(i.name,i.key)} onClick={()=>copy(i.name,ingredientName(i.name,i.key))}>{copied===ingredientName(i.name,i.key)?'Copied':'Copy'}</button></li>)}</ul>}</div>
 <section className="delivery-shop-section"><h2>Choose a store</h2><p>Take your remaining groceries and pack quantities to any store below.</p><DeliveryLocation city={city}/><div className="delivery-provider-list" role="radiogroup" aria-label="Grocery delivery service">{deliveryPlatforms.map(p=><button role="radio" aria-label={p.name} title={p.name} aria-checked={selected===p.id} className={'delivery-provider '+(selected===p.id?'selected':'')} onClick={()=>choose(p.id)} key={p.id}><span className="delivery-brand" style={{background:p.color}}><img src={'/assets/'+(p.logo||'delivery-'+p.id+'.png')} alt="" onError={e=>{e.currentTarget.hidden=true}}/></span><span className="delivery-radio" aria-hidden="true">{selected===p.id&&<i/>}</span></button>)}</div><div className="delivery-actions"><button type="button" className="secondary" disabled={!buy.length} onClick={()=>copy(list,'List')}>{copied==='List'?'✓ List copied':'Copy list'}</button><a className="primary" href={chosen.url} target="_blank" rel="noopener noreferrer" onClick={()=>{if(buy.length)void copy(list,'List')}}>{buy.length?'Copy list & open':'Open'} {chosen.name}<Icon name="arrow-up-right"/></a></div>{manual&&<label className="delivery-manual"><span>Select and copy:</span><textarea readOnly value={manual} onFocus={e=>e.target.select()}/></label>}{copied&&<p role="status">{copied} copied.</p>}<p className="delivery-note">Add items manually in the store. Use <strong>Still to buy</strong> to copy individual item names.</p></section></div>;
}

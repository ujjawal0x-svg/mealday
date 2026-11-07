import {ingredientName,ingredientUnit} from './ingredientLabels';
import React,{useState,useEffect} from 'react';
const mealdayUrl='https://mealday-kitchen-app.jauntycomet1.chatgpt.site/';
export function ShareGroceries({items}:{items:any[]}){
 const [preview,setPreview]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
 useEffect(()=>{if(!preview)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setPreview('')};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[preview]);
 const prepare=async()=>{setBusy(true);setMessage('');try{
  await document.fonts.ready;
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=520+items.length*94;
  const c=canvas.getContext('2d')!;c.fillStyle='#fafbf7';c.fillRect(0,0,canvas.width,canvas.height);
  const logo=new Image();logo.src='/assets/mealday-mark.svg';await logo.decode();c.drawImage(logo,64,40,82,82);c.fillStyle='#171717';c.font='bold 48px Manrope, sans-serif';c.fillText('Still to buy',64,205);c.font='26px Manrope, sans-serif';c.fillText(`${items.length} items still needed`,64,253);
  const chef=new Image();chef.src='/assets/c07c372a3818.webp';await chef.decode();const scale=Math.min(220/chef.width,220/chef.height);c.drawImage(chef,810,55,chef.width*scale,chef.height*scale);
  items.forEach((i,index)=>{const y=320+index*94;c.strokeStyle='#d8ddd0';c.lineWidth=2;c.strokeRect(66,y+3,26,26);c.fillStyle='#171717';c.font='bold 28px Manrope, sans-serif';let name=ingredientName(i.name,i.key);while(c.measureText(name).width>825)name=name.slice(0,-2)+'…';const rtl=document.documentElement.lang==='ar';c.direction=rtl?'rtl':'ltr';c.textAlign=rtl?'right':'left';c.fillText(name,rtl?964:116,y+24);c.font='24px Manrope, sans-serif';c.fillText(`${i.packs} × ${i.pack} ${ingredientUnit(i.unit)}`,rtl?964:116,y+58);});
  c.direction='ltr';c.textAlign='left';const y=canvas.height-125;c.fillStyle='#a5ce32';c.fillRect(64,y-20,952,4);c.fillStyle='#171717';c.font='bold 25px Manrope, sans-serif';c.fillText('Plan your week with Mealday',64,y+25);c.font='21px Manrope, sans-serif';c.fillText(mealdayUrl,64,y+68);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Image unavailable')),'image/png'));setPreview(URL.createObjectURL(blob));
 }catch{setMessage('Could not create your card. Please try again.')}finally{setBusy(false)}};
 const share=async()=>{try{const blob=await fetch(preview).then(r=>r.blob());const file=new File([blob],'mealday-grocery-list.png',{type:'image/png'});if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'Mealday grocery list',text:`Still to buy, made with Mealday 👨‍🍳\n${mealdayUrl}`});}else{setMessage('Sharing images is unavailable here. Save the card and attach it in your messaging app.')}}catch(e:any){if(e.name!=='AbortError')setMessage('Could not share. Save the card to send it instead.')}};
 return <><button className="share-grocery-button" disabled={!items.length||busy} onClick={prepare}>{busy?'Creating card…':'Share grocery list ↗'}</button>{message&&!preview&&<p role="status">{message}</p>}{preview&&<div className="modal grocery-share-modal"><button className="modal-backdrop" aria-label="Close share preview" onClick={()=>setPreview('')}/><section role="dialog" aria-modal="true" aria-label="Share grocery list"><header><h2>Your Mealday list</h2><button aria-label="Close share preview" onClick={()=>setPreview('')}>×</button></header><img src={preview} alt="Grocery list card with Mealday chef, quantities and Mealday link"/><button className="primary" onClick={share}>Share card</button><a className="secondary" href={preview} download="mealday-grocery-list.png">Save image</a>{message&&<p role="status">{message}</p>}<a href={mealdayUrl} target="_blank" rel="noopener noreferrer">Made with Mealday ↗</a></section></div>}</>;
}

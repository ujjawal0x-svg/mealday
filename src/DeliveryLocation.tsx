import React,{useEffect,useRef,useState} from 'react';
import {circleMarker,map,tileLayer} from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Pin={lat:number;lng:number};
const storageKey='mealday.delivery-pin';
const uaeCenter:Pin={lat:24.5,lng:54.5};
const validPin=(value:any):value is Pin=>!!value&&Number.isFinite(value.lat)&&Number.isFinite(value.lng)&&Math.abs(value.lat)<=85&&Math.abs(value.lng)<=180;
const readPin=()=>{try{const pin=JSON.parse(localStorage.getItem(storageKey)||'null');return validPin(pin)?pin:null}catch{return null}};

function DeliveryMap({pin,onPick}:{pin:Pin|null;onPick:(pin:Pin)=>void}){
 const element=useRef<HTMLDivElement>(null);
 const instance=useRef<ReturnType<typeof map>|null>(null);
 const marker=useRef<ReturnType<typeof circleMarker>|null>(null);
 useEffect(()=>{
  const view=map(element.current!,{scrollWheelZoom:false}).setView(uaeCenter,7);
  instance.current=view;
  tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
   maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(view);
  view.on('click',event=>onPick({lat:event.latlng.lat,lng:((event.latlng.lng+180)%360+360)%360-180}));
  return()=>{view.remove();instance.current=null;marker.current=null};
 },[onPick]);
 useEffect(()=>{
  const view=instance.current;
  if(!view)return;
  if(!pin){marker.current?.remove();marker.current=null;return}
  if(marker.current)marker.current.setLatLng(pin);
  else marker.current=circleMarker(pin,{radius:9,color:'#fff',weight:3,fillColor:'#4e7924',fillOpacity:1,interactive:false}).addTo(view);
  if(view.getZoom()<12||!view.getBounds().contains(pin))view.setView(pin,14);
 },[pin]);
 return <div ref={element} className="delivery-map" aria-label="Delivery map. Tap to place a pin." />;
}

export function DeliveryLocation({city}:{city:string}){
 const [saved,setSaved]=useState(readPin);
 const [draft,setDraft]=useState(saved);
 const [open,setOpen]=useState(false);
 const [locating,setLocating]=useState(false);
 const [error,setError]=useState('');
 const [status,setStatus]=useState('');
 const useCurrentLocation=()=>{
  setError('');
  if(!navigator.geolocation){setError('Location is unavailable. Tap the map to place your pin.');return}
  setLocating(true);
  navigator.geolocation.getCurrentPosition(({coords})=>{
   const next={lat:coords.latitude,lng:coords.longitude};
   if(validPin(next))setDraft(next);
   else setError('Could not use this location. Tap the map to place your pin.');
   setLocating(false);
  },()=>{
   setError('Could not get your location. Tap the map to place your pin.');
   setLocating(false);
  },{timeout:10000,maximumAge:0});
 };
 const save=()=>{
  if(!draft)return;
  try{localStorage.setItem(storageKey,JSON.stringify(draft))}
  catch{setError('This browser could not save the pin.');return}
  setSaved(draft);setOpen(false);setStatus('Delivery pin saved on this device.');
 };
 const remove=()=>{
  try{localStorage.removeItem(storageKey)}
  catch{setError('This browser could not remove the saved pin.');return}
  setSaved(null);setDraft(null);setStatus('Delivery pin removed.');
 };
 return <section className="delivery-pin-panel" aria-label="Delivery location">
  <div className="delivery-pin-heading"><div><strong>Delivery location</strong><small>{city}, UAE · {saved?'Pin saved':'No pin selected'}</small></div><button type="button" className="link" aria-expanded={open} onClick={()=>{setOpen(!open);setDraft(saved);setError('');setStatus('')}}>{open?'Close':saved?'Change pin':'Set delivery location'}</button></div>
  {open&&<div className="delivery-pin-editor"><p>Tap the map or use your current location. The pin stays on this device.</p><DeliveryMap pin={draft} onPick={setDraft}/><div className="delivery-pin-actions"><button type="button" className="secondary" disabled={locating} onClick={useCurrentLocation}>{locating?'Finding location…':'Use current location'}</button><button type="button" className="primary" disabled={!draft||locating} onClick={save}>Save pin</button>{saved&&<button type="button" className="link" onClick={remove}>Remove pin</button>}</div>{draft&&<small>Selected pin · {draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}</small>}</div>}
  {error&&<p role="alert">{error}</p>}{status&&<p role="status">{status}</p>}
  <small>Delivery coverage and stock are checked by the store. Confirm your address there.</small>
 </section>;
}

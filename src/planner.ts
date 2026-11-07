import {useEffect,useState} from 'react';
import {cloud} from './cloud';
import {installCatalogue,mergeRecipes,Profile,Slot,basket,total,recipes,assertPlanPreferences} from './engine';
export type Quote={plan:Slot[];items:ReturnType<typeof basket>;total:number;overBudget:boolean;version:string;incompatibleRecipeIds:string[]};
export async function plannerRequest(body:Record<string,unknown>){const {data,error}=await cloud.functions.invoke('mealday-planner',{body});if(error||data?.error){let message=data?.error;if(!message&&error&&'context' in error){try{message=(await error.context.json()).error}catch{}}throw new Error(message||'Meal planner is unavailable. Check your connection and retry.');}if(data?.externalRecipes?.length)mergeRecipes(data.externalRecipes);return data;}
export function usePlanner(profile:Profile,plan:Slot[],pantry:Record<string,number>){
 const [ready,setReady]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0),[quote,setQuote]=useState<Quote|null>(null),[quoteKey,setQuoteKey]=useState(''),[quoting,setQuoting]=useState(false);
 const key=JSON.stringify({profile,plan,pantry});
 useEffect(()=>{
  let active=true;
  const remote=plannerRequest({action:'catalogue'}).then(data=>{
   if(!Array.isArray(data?.recipes)||!data.ingredients)throw Error('Invalid planner catalogue');
   return {recipes:data.recipes as Recipe[],ingredients:data.ingredients};
  });
  const published=Promise.resolve(cloud.from('mealday_cuisine_catalogue').select('data,ingredients').eq('published',true).limit(500)).then(({data,error})=>{
   if(error)throw error;
   const rows=data||[];
   return {recipes:rows.map(row=>row.data as Recipe),ingredients:Object.assign({},...rows.map(row=>row.ingredients))};
  });
  Promise.allSettled([remote,published]).then(results=>{
   if(!active)return;
   const sources=results.flatMap(result=>result.status==='fulfilled'?[result.value]:[]);
   const byId=new Map(sources.flatMap(source=>source.recipes).map(recipe=>[recipe.id,recipe]));
   if(!byId.size){setError('Could not refresh the recipe catalogue.');return;}
   installCatalogue(Object.assign({},...sources.map(source=>source.ingredients)),[...byId.values()]);
   setReady(true);
   setError('');
  }).catch(()=>{if(active)setError('Could not refresh the recipe catalogue.');});
  return()=>{active=false;};
 },[retry]);
 useEffect(()=>{if(!ready||profile.fullDay)return;let live=true;setQuoting(true);const id=setTimeout(()=>{plannerRequest({action:'quote',profile,plan,pantry}).then(data=>{if(live){setQuote(data);setQuoteKey(key);setError('');}}).catch(e=>{if(live)setError(e.message)}).finally(()=>{if(live)setQuoting(false)})},300);return()=>{live=false;clearTimeout(id)}},[key,ready,retry]);
 const run=async(body:Record<string,unknown>)=>{setBusy(true);setError('');try{return await plannerRequest({...body,profile,pantry})}catch(e:any){setError(e.message);throw e}finally{setBusy(false)}};
 let localQuote:Quote|null=null,localError='';
 if(profile.fullDay)try{if(plan.length)assertPlanPreferences(plan,profile);const items=basket(plan,profile,pantry),cost=items.reduce((n,item)=>n+Math.round(item.cost*100),0)/100;localQuote={plan,items,total:cost,version:'canonical-packs-v1',overBudget:cost>profile.budget,incompatibleRecipeIds:[]}}catch(e:any){localError=e.message||'Could not calculate grocery packs. Rebuild your plan.'}
 return {validationError:localError,catalogueReady:ready,ready:profile.fullDay||ready,error:localError||error,busy,quoting:profile.fullDay?false:quoting,current:profile.fullDay?localQuote:quoteKey===key?quote:null,run,retry:()=>setRetry(v=>v+1)};
}

// Guest history stays on-device. Signed-in history is isolated by auth.uid() RLS.
export async function readPlanHistory(){
 const {data:{session}}=await cloud.auth.getSession();if(!session)return [];
 const {data,error}=await cloud.from('mealday_plan_history').select('recipe_id,suggested_at').eq('user_id',session.user.id).gte('suggested_at',new Date(Date.now()-21*86400000).toISOString()).order('suggested_at',{ascending:false}).limit(1000);
 if(error)throw error;return (data||[]).map(r=>({recipeId:r.recipe_id,at:Date.parse(r.suggested_at)}));
}
export async function savePlanHistory(plan:Slot[]){
 const {data:{session}}=await cloud.auth.getSession();if(!session)return;
 const suggested_at=new Date().toISOString();const rows=[...new Set(plan.filter(s=>s.recipeId&&(!s.mode||s.mode==='cook')).map(s=>s.recipeId))].map(recipe_id=>({user_id:session.user.id,recipe_id,suggested_at}));
 if(rows.length){const {error}=await cloud.from('mealday_plan_history').upsert(rows,{onConflict:'user_id,recipe_id'});if(error)throw error;}
}

export async function clearPlanHistory(){const {data:{session}}=await cloud.auth.getSession();if(!session)return;const {error}=await cloud.from('mealday_plan_history').delete().eq('user_id',session.user.id);if(error)throw error;}

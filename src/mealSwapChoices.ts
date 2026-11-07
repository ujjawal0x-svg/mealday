import {Profile,Slot,mealChoices,total,hasAvoidableRepeats,historyChoices,MealHistory} from './engine';
export function mealSwapChoices(plan:Slot[],index:number,profile:Profile,pantry:Record<string,number>,history:MealHistory[]=[]){
 const slot=plan[index];if(!slot)return [];
 const current=total(plan,profile,pantry);
 return historyChoices(profile,slot.meal||'dinner',{history}).filter(r=>r.id!==slot.recipeId).map(recipe=>{
 const next=plan.map((s,i)=>i===index?{...s,recipeId:recipe.id,mode:'cook',cooked:false}:s);
 const cost=total(next,profile,pantry);
 return {recipe,plan:next,cost,change:Math.round((cost-current)*100)/100,allowed:cost<=profile.budget&&!hasAvoidableRepeats(next,profile)};
 }).sort((a,b)=>Number(b.allowed)-Number(a.allowed)||a.cost-b.cost);
}

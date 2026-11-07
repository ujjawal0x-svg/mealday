import recorded from '../data/recipe-timings.json';
export type RecipeTiming={prepMinutes:number;cookMinutes:number;waitMinutes:number;waitKind?:string;estimated:boolean};
type TimedRecipe={id?:string;time:number;timing?:RecipeTiming};
export const MAX_RECIPE_MINUTES=1440;
export const timeLimits=[10,15,20,30,45,60,90,120,240,1440];
export const timeGroups=[{id:'quick',max:15,label:'Up to 15 min'},{id:'everyday',max:30,label:'16–30 min'},{id:'relaxed',max:45,label:'31–45 min'},{id:'hour',max:60,label:'46–60 min'},{id:'long',max:120,label:'1–2 hours'},{id:'slow',max:240,label:'2–4 hours'},{id:'ahead',max:1440,label:'Plan ahead'}];
export function timingBreakdown(r:TimedRecipe):RecipeTiming|undefined{return r.timing===undefined?(recorded as Record<string,RecipeTiming>)[r.id||'']:r.timing}
function validParts(d:RecipeTiming){return !!d&&typeof d==='object'&&[d.prepMinutes,d.cookMinutes,d.waitMinutes].every(n=>typeof n==='number'&&Number.isFinite(n)&&Number.isInteger(n)&&n>=0)&&d.prepMinutes+d.cookMinutes+d.waitMinutes>0}
// Total elapsed time includes preparation, cooking and required waiting. Never
// infer active time from total time, and never shrink a total to match a filter.
export function recipeTotalMinutes(r:TimedRecipe){if(typeof r.time!=='number'||!Number.isInteger(r.time)||r.time<=0)return Infinity;const d=timingBreakdown(r);if(d!==undefined&&!validParts(d))return Infinity;return Math.max(r.time,d?d.prepMinutes+d.cookMinutes+d.waitMinutes:0)}
export function withinTime(r:TimedRecipe,limit:number){return typeof limit==='number'&&Number.isFinite(limit)&&limit>0&&limit<=MAX_RECIPE_MINUTES&&recipeTotalMinutes(r)<=limit}
export function timeCategory(r:TimedRecipe){const n=recipeTotalMinutes(r);return timeGroups.find(g=>n<=g.max)?.id||'unknown'}
export function formatDuration(minutes:number,units=['hr','min']){if(!Number.isFinite(minutes)||minutes<0)return 'Time unavailable';const h=Math.floor(minutes/60),m=minutes%60;return h?(h+' '+units[0]+(m?' '+m+' '+units[1]:'')):m+' '+units[1]}
export function timeLimitLabel(n:number){return n===1440?'Plan ahead · up to 24 hours':n>=60?'Up to '+formatDuration(n):n+' minutes or less'}
export function withRecipeTiming<T extends TimedRecipe>(r:T){const timing=timingBreakdown(r);return {...r,...(timing?{timing}:{}),timeCategory:timeCategory(r)}}

// Start with the first explicit duration. For a range, prompt a check at its lower bound.
export function cookingStepTimer(instruction:string|undefined){
 const duration=instruction?.match(/\b(\d+(?:\.\d+)?)(?:\s*(?:[-–—]|to)\s*\d+(?:\.\d+)?)?\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)\b/i);
 if(!duration)return null;
 const unit=duration[2].toLowerCase();
 const seconds=Math.round(Number(duration[1])*(unit.startsWith('h')?3600:unit.startsWith('m')?60:1));
 return seconds>0&&seconds<=MAX_RECIPE_MINUTES*60?{seconds,label:duration[0]}:null;
}

import {MAX_RECIPE_MINUTES,recipeTotalMinutes} from './recipeTiming';
import {Profile,Recipe,recipes,stock,compatible,canonicalIngredientId,cuisineMatches} from './engine';
export const aiNotice='AI adaptation · not chef-tested. Check ingredients, product labels and method before cooking.';
const cuisines=['UAE mix','Emirati','Arab','South Asian'];
const recipeCuisines=[...cuisines,'Turkish'];
const meals=['breakfast','lunch','dinner'];
export function aiProfile(raw:any):Profile{
 if(!raw||!cuisines.includes(raw.cuisine||'UAE mix')||!['Any','Non-vegetarian','Eggless vegetarian','Vegetarian','Vegan','Pescatarian'].includes(raw.diet)||!Number.isInteger(raw.people)||raw.people<1||raw.people>12||!Number.isInteger(raw.minutes)||raw.minutes<1||raw.minutes>MAX_RECIPE_MINUTES||!Number.isFinite(raw.budget)||raw.budget<0||raw.budget>10000)throw Error('Invalid meal preferences.');
 for(const [key,allowed]of [['allergies',['Gluten','Milk','Egg','Peanuts','Tree nuts','Fish','Shellfish','Sesame','Soy']],['appliances',['Hob','Oven','Air fryer','Microwave']]]as const)if(!Array.isArray(raw[key])||raw[key].some((s:any)=>!allowed.includes(s)))throw Error('Invalid kitchen preferences.');
 if(!Array.isArray(raw.days)||raw.days.length>7||!raw.days.length||raw.days.some((d:any)=>!Number.isInteger(d)||d<0||d>6)||new Set(raw.days).size!==raw.days.length)throw Error('Invalid planning days.');
 for(const k of ['dislikedIngredients','availableIngredients']as const)if(raw[k]!==undefined&&(!Array.isArray(raw[k])||raw[k].length>200||raw[k].some((id:any)=>typeof id!=='string'||!Object.hasOwn(stock,id))))throw Error('Invalid ingredient preferences.');
 const mealTypes=raw.mealTypes||['dinner'];if(!Array.isArray(mealTypes)||!mealTypes.length||mealTypes.some((s:any)=>!meals.includes(s)))throw Error('Invalid meal selection.');
 const defaults=raw.mealDefaults||{};if(Object.entries(defaults).some(([k,v])=>!meals.includes(k)||!['cook','out','leftovers'].includes(String(v))))throw Error('Invalid meal routine.');
 return {name:'',city:'UAE',source:'',shop:'Any supermarket',mood:'Everyday',people:raw.people,budget:raw.budget,diet:raw.diet,allergies:raw.allergies,minutes:raw.minutes,appliances:raw.appliances,days:raw.days,cuisine:raw.cuisine||'UAE mix',mealTypes,mealDefaults:defaults,fullDay:true,packedLunch:!!raw.packedLunch,lowCook:!!raw.lowCook,dislikedIngredients:raw.dislikedIngredients||[],availableIngredients:raw.availableIngredients||[],enabledDraftIds:Array.isArray(raw.enabledDraftIds)?raw.enabledDraftIds.filter((id:any)=>typeof id==='string').slice(0,200):[]};
}
export function adaptationBases(p:Profile,meal:string){
 if(!meals.includes(meal))throw Error('Choose breakfast, lunch or dinner.');
 // Only Mealday-authored originals; do not send licensed third-party recipe text to a model.
 return recipes.filter(r=>cuisineMatches(r.cuisine,p)&&r.mealTypes?.includes(meal)&&(p.diet!=='Non-vegetarian'||r.diet==='meat'||r.diet==='fish')&&compatible(r,p)&&!r.id.startsWith('ai-')&&!r.id.startsWith('kaggle-')&&!r.id.startsWith('spoon-')&&(r.reviewStatus!=='draft'||p.enabledDraftIds?.includes(r.id)));
}
export function adaptationIngredients(p:Profile,base:Recipe,meal:string){
 const supplements=['tomato','cucumber','onion','carrot','spinach','lemon','oil','cumin','turmeric','loomi','bzar','emiratiSalt','emiratiCinnamon','emiratiGarlic'];
 const ids=[...new Set([...base.items.map(([k])=>k),...supplements])];
 return ids.filter(id=>Object.hasOwn(stock,id)&&compatible({id:'check',name:'check',time:1,appliances:[],diet:'meat',items:[[id,1]],tags:[],image:0,steps:[]},p.diet==='Non-vegetarian'?{...p,diet:'Any'}:p)).map(id=>({id,name:stock[id].name,unit:stock[id].unit,originalAmount:base.items.find(([k])=>k===id)?.[1]||null}));
}
export function validateAdaptation(raw:any,p:Profile,base:Recipe,meal:string,id='ai-preview'):Recipe{
 const fail=()=>{throw Error('AI recipe did not pass ingredient, diet or kitchen checks. Your plan is unchanged.');};
 if(!raw||typeof raw.name!=='string'||raw.name.length<4||raw.name.length>120||!Number.isInteger(raw.time)||raw.time<1||raw.time>p.minutes||!['vegan','vegetarian','fish','meat'].includes(raw.diet)||!Array.isArray(raw.appliances)||raw.appliances.some((a:any)=>!p.appliances.includes(a))||!Array.isArray(raw.items)||raw.items.length<2||raw.items.length>20||!Array.isArray(raw.steps)||raw.steps.length<2||raw.steps.length>12)fail();
 if((recipeTotalMinutes(base)>60||base.timing?.waitMinutes)&&raw.time<recipeTotalMinutes(base))fail();
 const allowed=new Set(adaptationIngredients(p,base,meal).map(x=>x.id)),used=new Set<string>();
 for(const row of raw.items){if(!Array.isArray(row)||row.length!==2||typeof row[0]!=='string'||!allowed.has(row[0])||used.has(canonicalIngredientId(row[0]))||typeof row[1]!=='number'||!Number.isFinite(row[1])||row[1]<=0||row[1]>(['g','ml'].includes(stock[row[0]].unit)?1000:12))fail();used.add(canonicalIngredientId(row[0]));}
 const fingerprint=(items:[string,number][])=>JSON.stringify(items.map(([k,n])=>[canonicalIngredientId(k),Number(n.toFixed(3))]).sort(([a],[b])=>String(a).localeCompare(String(b))));
 if(fingerprint(raw.items)===fingerprint(base.items)&&JSON.stringify([...raw.appliances].sort())===JSON.stringify([...base.appliances].sort()))throw Error('AI recipe only renamed an existing dish. Try another variation.');
 // Preserve the dish's core instead of relabelling unrelated ingredients as an authentic dish.
 if(!raw.items.some(([k]:[string,number])=>base.items.some(([b])=>canonicalIngredientId(b)===canonicalIngredientId(k))))fail();
 const steps=raw.steps.map((s:any)=>{if(!s||typeof s.text!=='string'||s.text.length<8||s.text.length>700||!Array.isArray(s.ingredients)||s.ingredients.some((k:any)=>!raw.items.some(([id]:[string,number])=>id===k)))fail();return s.text.trim()});
 if(raw.items.some(([k]:[string,number])=>!raw.steps.some((s:any)=>s.ingredients.includes(k))))fail();
 const text=[raw.name,...steps].join(' ');
 const allergyTerms:Record<string,string[]>={Gluten:['wheat','barley','rye','semolina','bulgur','couscous','freekeh','jareesh','bread','pasta','flour'],Milk:['milk','yogurt','yoghurt','cheese','butter','ghee','cream','labneh','qishta','jameed'],Egg:['egg','eggs','mayonnaise'],Peanuts:['peanut','peanuts','groundnut'], 'Tree nuts':['almond','almonds','walnut','walnuts','cashew','cashews','pistachio','pistachios','hazelnut','pine nut','pine nuts'],Fish:['fish','tuna','salmon','sardine','anchovy','mackerel','sole','sea bream'],Shellfish:['shrimp','shrimps','prawn','prawns','crab','lobster','shellfish','mussel','mussels','clam','clams','oyster','oysters','scallop','scallops'],Sesame:['sesame','tahini','zaatar','za’atar'],Soy:['soy','soya','tofu','tempeh']};
 const forbidden=[...p.allergies.flatMap(a=>allergyTerms[a]||[]),...(p.dislikedIngredients||[]).map(id=>stock[id]?.name).filter(Boolean)];
 if(forbidden.some(term=>new RegExp('\\b'+term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i').test(text)))fail();
if(/\b(pork|bacon|ham|lard|wine|beer|vodka|rum|brandy|whisk[ey]+|mirin|sake|bourbon|prosciutto|gelatin|gelatine|raw chicken|raw egg)\b|https?:|<[^>]*>/i.test(text))fail();
 const result:Recipe={id,name:raw.name.trim(),time:raw.time,appliances:[...new Set(raw.appliances)]as string[],diet:raw.diet,items:raw.items,steps,tags:['AI adaptation'],image:0,cuisine:base.cuisine,mealTypes:[meal],reviewStatus:'preview',authorship:'AI adaptation of Mealday recipe '+base.id,sourceName:'Mealday AI · based on '+base.name,photoStatus:'missing',quantityNotes:[aiNotice],aiBaseId:base.id,aiStepIngredients:raw.steps.map((s:any)=>s.ingredients)};
 if(!compatible(result,p)||p.packedLunch&&meal==='lunch'&&result.time>15||p.lowCook&&meal!=='dinner'&&result.appliances.some(a=>a==='Hob'||a==='Oven'))fail();
 return result;
}
export function restorePersonalRecipes(rows:unknown):Recipe[]{
 if(!Array.isArray(rows))return [];return rows.slice(-60).filter((r:any)=>r&&typeof r.id==='string'&&/^ai-[a-f0-9]{24}$/.test(r.id)&&typeof r.name==='string'&&r.name.length<=120&&Number.isInteger(r.time)&&r.time>0&&r.time<=MAX_RECIPE_MINUTES&&recipeCuisines.includes(r.cuisine)&&Array.isArray(r.items)&&r.items.length>1&&r.items.length<=20&&r.items.every((row:any)=>Array.isArray(row)&&row.length===2&&Object.hasOwn(stock,row[0])&&typeof row[1]==='number'&&Number.isFinite(row[1])&&row[1]>0&&row[1]<=1000)&&Array.isArray(r.steps)&&r.steps.length>=2&&r.steps.length<=12&&r.steps.every((s:any)=>typeof s==='string'&&s.length<701)&&Array.isArray(r.appliances)&&r.appliances.every((a:any)=>['Hob','Oven','Air fryer','Microwave'].includes(a))&&Array.isArray(r.mealTypes)&&r.mealTypes.length===1&&meals.includes(r.mealTypes[0])&&['vegan','vegetarian','fish','meat'].includes(r.diet)).map((r:any)=>({...r,imageUrl:undefined,sourceUrl:undefined,tags:['AI adaptation'],reviewStatus:'preview',photoStatus:'missing',quantityNotes:[aiNotice]}));
}

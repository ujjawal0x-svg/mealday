import {assembleMeals} from './completeMeals';
import {RecipeTiming,withinTime,recipeTotalMinutes,withRecipeTiming} from './recipeTiming';
import reviewedCatalogue from '../data/mealday-full-shortlist.json';
import coverageExpansion from '../data/coverage-expansion.json';
import qualityExpansion from '../data/quality-expansion.json';
import targetExpansion from '../data/target-expansion.json';
import targetFamilies from '../data/target-family-overrides.json';
import qualityOverrides from '../data/quality-overrides.json';
import recipeFamilies from '../data/recipe-families.json';
import desiExpansion from '../data/desi-nonveg-expansion.json';
import recipePhotos from '../data/recipe-photo-map.json';
import {createIngredientIndex} from './ingredientIdentity';
import {emiratiStock,emiratiCollection} from './emiratiCollection';
import kaggleCatalogue from '../data/kaggle-catalogue.json';
import {draftStock,recipeDrafts} from './recipeDrafts';
import {uaeStock,uaeRecipes} from './uaeCatalogue';
export type Ingredient={name:string;unit:string;pack:number;price:number;category:string;allergen?:string;allergens?:string[];kind?:'plant'|'dairy'|'egg'|'meat'|'fish'};
export let stock:Record<string,Ingredient>={rice:{name:'Basmati rice',unit:'g',pack:1000,price:14,category:'Pantry'},pasta:{name:'Pasta',unit:'g',pack:500,price:7,category:'Pantry',allergen:'Gluten'},chickpeas:{name:'Chickpeas (drained weight)',unit:'g',pack:240,price:4,category:'Pantry'},lentils:{name:'Red lentils',unit:'g',pack:500,price:8,category:'Pantry'},bread:{name:'Bread',unit:'slices',pack:20,price:7,category:'Bakery',allergen:'Gluten'},wraps:{name:'Tortilla wraps',unit:'wraps',pack:6,price:8,category:'Bakery',allergen:'Gluten'},tomato:{name:'Tomatoes',unit:'g',pack:500,price:5,category:'Vegetables'},cucumber:{name:'Cucumber',unit:'g',pack:500,price:4,category:'Vegetables'},onion:{name:'Onion',unit:'g',pack:1000,price:5,category:'Vegetables'},pepper:{name:'Bell pepper',unit:'g',pack:500,price:7,category:'Vegetables'},spinach:{name:'Spinach',unit:'g',pack:200,price:5,category:'Vegetables'},potato:{name:'Potatoes',unit:'g',pack:1000,price:6,category:'Vegetables'},carrot:{name:'Carrots',unit:'g',pack:500,price:3,category:'Vegetables'},yogurt:{name:'Plain yogurt',unit:'g',pack:500,price:7,category:'Chilled',allergen:'Milk'},cheese:{name:'Cheddar cheese',unit:'g',pack:200,price:10,category:'Chilled',allergen:'Milk'},egg:{name:'Eggs',unit:'eggs',pack:6,price:8,category:'Chilled',allergen:'Egg'},chicken:{name:'Chicken breast',unit:'g',pack:500,price:18,category:'Chilled'},tuna:{name:'Tuna (drained weight)',unit:'g',pack:120,price:6,category:'Pantry',allergen:'Fish'},oil:{name:'Olive oil',unit:'ml',pack:250,price:14,category:'Pantry'},lemon:{name:'Lemon',unit:'lemons',pack:3,price:4,category:'Vegetables'},oats:{name:'Oats',unit:'g',pack:500,price:7,category:'Pantry',allergen:'Gluten'}};
export type Recipe={familyId?:string;methodStyle?:string;qualityReview?:{status:string;date:string;version:number;kitchenTested:boolean;scope:string[]};baseRecipeId?:string;mealAssemblyVersion?:number;componentNames?:string[];timing?:RecipeTiming;timeCategory?:string;aiBaseId?:string;aiStepIngredients?:string[][];id:string;name:string;time:number;appliances:string[];diet:'vegan'|'vegetarian'|'fish'|'meat';tags:string[];image:number;imageUrl?:string;sourceName?:string;sourceUrl?:string;reviewStatus?:'draft'|'preview'|'imported';authorship?:string;photoStatus?:'missing'|'generated';originalIngredients?:string;sourceServings?:number;quantityNotes?:string[];datasetRef?:string;licence?:string;cuisine?:string;mealTypes?:string[];items:[string,number][];steps:string[]};
const r=(id:string,name:string,time:number,appliances:string[],diet:Recipe['diet'],items:Recipe['items'],steps:string[],tags=['Everyday'],image=0):Recipe=>({id,name,time,appliances,diet,items,steps,tags,image});
export let recipes:Recipe[]=[
r('chickpea-salad','Chickpea crunch salad',10,[],'vegan',[['chickpeas',120],['tomato',80],['cucumber',80],['lemon',.25],['oil',5]],['Drain and rinse the chickpeas. Wash the vegetables.','Dice the tomatoes and cucumber into bite-sized pieces.','Mix the lemon juice and olive oil in a bowl.','Toss the vegetables and chickpeas with the dressing. Season to taste and serve.'],['Quick','Fresh'],2),
r('lentil-rice','One-pot lentil rice',30,['Hob'],'vegan',[['rice',60],['lentils',60],['onion',40],['carrot',60],['oil',5]],['Rinse the rice and lentils. Dice the onion and carrot.','Warm the oil in a saucepan. Cook the onion and carrot for 5 minutes.','Add rice, lentils and water according to the rice and lentil packet instructions. Simmer covered, adding water as needed.','Cook until the rice and lentils are tender. Rest off the heat for 5 minutes, fluff and serve.'],['Comfort','Family'],0),
r('tomato-pasta','Easy tomato pasta',20,['Hob'],'vegan',[['pasta',90],['tomato',150],['onion',35],['oil',5]],['Dice the tomatoes and onion. Bring a large pan of water to the boil.','Cook the pasta following the packet instructions. Reserve a mug of cooking water.','Soften the onion in oil. Add the tomatoes and simmer until they break down into a sauce.','Drain the pasta. Toss with the sauce and a splash of reserved water. Season to taste.'],['Quick','Family'],1),
r('cheesy-pasta','Creamy spinach pasta',25,['Hob'],'vegetarian',[['pasta',90],['spinach',60],['yogurt',45],['cheese',20]],['Bring a large pan of water to the boil. Wash the spinach.','Cook the pasta according to the packet. Stir in the spinach for the last minute.','Reserve some cooking water, then drain. Let the pan cool slightly off the heat.','Stir in yogurt and cheese with a splash of pasta water. Mix gently and serve.'],['Comfort'],1),
r('roast-bowl','Roasted vegetable bowl',35,['Oven','Hob'],'vegan',[['rice',60],['chickpeas',100],['carrot',80],['pepper',80],['oil',7]],['Heat the oven to 200°C. Rinse and chop the vegetables.','Toss the vegetables with oil on a tray. Roast for 25–30 minutes until tender, turning halfway.','Cook the rice following the packet instructions. Rinse and drain the chickpeas.','Warm chickpeas with the rice. Divide into bowls and top with roasted vegetables.'],['Family','Comfort'],0),
r('egg-toast','Tomato eggs on toast',15,['Hob'],'vegetarian',[['egg',2],['bread',2],['tomato',100],['oil',5]],['Wash and dice the tomato. Crack the eggs into a bowl and beat.','Warm the oil in a frying pan. Cook the tomatoes for a few minutes.','Add the eggs and stir gently until the egg is set.','Toast or warm the bread in a separate dry pan. Spoon the eggs over it and serve.'],['Quick'],0),
r('chicken-rice','Lemon chicken rice bowl',30,['Hob'],'meat',[['chicken',150],['rice',60],['cucumber',70],['lemon',.25],['oil',5]],['Cook the rice following the packet instructions. Wash and slice the cucumber.','Cut the chicken into evenly sized pieces. Keep raw chicken separate from ready-to-eat ingredients.','Heat the oil in a pan. Cook chicken thoroughly, turning regularly, until the thickest part reaches 75°C.','Add lemon juice. Serve chicken with the rice and cucumber.'],['Protein','Family'],0),
r('tuna-wrap','Tuna & cucumber wraps',10,[],'fish',[['tuna',100],['wraps',2],['cucumber',70],['yogurt',30]],['Drain the tuna. Rinse and dice the cucumber.','Mix the tuna, cucumber and yogurt in a bowl.','Divide the mixture between the wraps.','Fold in the sides, roll up and serve immediately.'],['Quick','Protein'],2),
r('air-potato','Air-fryer potato & chickpeas',25,['Air fryer'],'vegan',[['potato',220],['chickpeas',120],['oil',7],['tomato',60]],['Wash the potatoes and cut them into small, even cubes. Rinse and dry chickpeas.','Toss potato cubes with oil. Air-fry at 190°C for about 15 minutes, shaking halfway.','Add the chickpeas and cook for another 5–10 minutes until potatoes are tender.','Wash and dice the tomatoes. Serve the hot potatoes and chickpeas with tomatoes.'],['Comfort','Family'],0),
r('microwave-potato','Loaded microwave potato',15,['Microwave'],'vegetarian',[['potato',250],['yogurt',50],['cheese',20],['tomato',60]],['Wash the potato and prick it several times with a fork.','Place on a microwave-safe plate. Microwave on high for 5 minutes, then turn and cook until tender. Timing depends on your microwave.','Let it stand for 2 minutes. Carefully split it open, allowing hot steam to escape.','Top with yogurt, grated cheese and diced tomato.'],['Quick','Comfort'],0),
r('lentil-soup','Carrot & lentil soup',30,['Hob'],'vegan',[['lentils',75],['carrot',100],['onion',40],['oil',5]],['Rinse the lentils. Peel and dice the carrots and onion.','Soften the onion in oil in a saucepan. Add carrots and lentils.','Add water following the lentil packet guidance. Simmer, adding water as needed, until tender.','Mash a little with a spoon for a thicker soup. Season and serve.'],['Comfort'],0),
r('fresh-wrap','Garden chickpea wraps',10,[],'vegan',[['chickpeas',120],['wraps',2],['tomato',70],['cucumber',70],['lemon',.25]],['Rinse and drain chickpeas. Wash and dice the tomato and cucumber.','Mash chickpeas roughly with a fork and stir in lemon juice.','Add the vegetables and season to taste.','Fill the wraps, roll tightly and serve.'],['Quick','Family'],2),
r('rice-egg','Vegetable egg rice',20,['Hob'],'vegetarian',[['rice',60],['egg',2],['carrot',70],['pepper',60],['oil',5]],['Cook the rice following its packet instructions. Dice the vegetables and beat the eggs.','Warm the oil in a frying pan. Cook the diced vegetables until tender.','Push vegetables aside, add the beaten eggs and cook until set.','Add the freshly cooked rice. Toss everything together until steaming hot and serve immediately.'],['Quick','Family'],0),
r('potato-salad','Lemon potato & chickpea salad',25,['Hob'],'vegan',[['potato',180],['chickpeas',120],['cucumber',60],['oil',5],['lemon',.25]],['Wash and dice potatoes. Simmer in a pan of water until tender.','Drain and let steam dry. Rinse the chickpeas and dice the cucumber.','Mix lemon juice and oil to make a dressing.','Combine potatoes, chickpeas and cucumber with the dressing. Serve warm or cool.'],['Fresh','Family'],2),
r('cheese-wrap','Crispy cheese & spinach wraps',15,['Hob'],'vegetarian',[['wraps',2],['cheese',40],['spinach',70],['tomato',60]],['Wash the spinach and tomato. Dice the tomato and grate the cheese.','Wilt the spinach in a pan with a splash of water. Drain excess water.','Place spinach, tomato and cheese inside each wrap and fold over.','Warm each folded wrap in a dry frying pan, turning once, until crisp and the cheese has melted.'],['Quick','Comfort'],1),
r('simple-rice','Chickpea & spinach rice',25,['Hob'],'vegan',[['rice',60],['chickpeas',120],['spinach',60],['onion',30],['oil',5]],['Rinse rice, spinach and drained chickpeas. Dice the onion.','Soften onion in the oil. Add rice and cook with water according to the rice packet.','When rice is almost ready, fold in the chickpeas and spinach. Cover and heat through.','Check that the rice is tender. Rest for a few minutes, fluff and serve.'],['Family','Comfort'],0)
];
export type Profile={name:string;people:number;days:number[];budget:number;diet:string;allergies:string[];minutes:number;appliances:string[];city:string;mood:string;source:string;shop:string;availableIngredients?:string[];dislikedIngredients?:string[];preferredStyles?:string[];fullDay?:boolean;mealTypes?:string[];mealDefaults?:Record<string,string>;packedLunch?:boolean;lowCook?:boolean;cuisine?:string;cuisines?:string[];enabledDraftIds?:string[];repeatDays?:number;allowRepeats?:boolean;ingredientSchemaVersion?:number};
export type Slot={day:number;recipeId:string;cooked?:boolean;meal?:string;mode?:string};
export const initialProfile:Profile={name:'',people:2,days:[0,1,2,3,4],budget:150,diet:'Any',allergies:[],minutes:30,appliances:['Hob'],city:'Dubai',mood:'Everyday',source:'',shop:'',cuisine:'UAE mix',fullDay:true,mealTypes:['dinner'],ingredientSchemaVersion:1};
const ingredientKinds:Record<string,'plant'|'dairy'|'egg'|'meat'|'fish'>={salt:'plant',blackpepper:'plant',garlic:'plant',butter:'dairy',water:'plant',rice:'plant',pasta:'plant',chickpeas:'plant',lentils:'plant',bread:'plant',wraps:'plant',tomato:'plant',cucumber:'plant',onion:'plant',pepper:'plant',spinach:'plant',potato:'plant',carrot:'plant',yogurt:'dairy',cheese:'dairy',egg:'egg',chicken:'meat',tuna:'fish',oil:'plant',lemon:'plant',oats:'plant'};
export function compatible(r:Recipe,p:Profile){
 const excluded=new Set((p.dislikedIngredients||[]).map(canonicalIngredientId));if(r.items.some(([key])=>excluded.has(canonicalIngredientId(key))))return false;
 if(!withinTime(r,p.minutes)||!r.appliances.every(a=>p.appliances.includes(a))||!r.items.length)return false;
 const kinds=[];for(const [key,amount] of r.items){const ingredient=stock[key],kind=ingredient?.kind||ingredientKinds[key];if(!ingredient||!kind||!Number.isFinite(amount)||amount<=0||[ingredient.allergen,...(ingredient.allergens||[])].some(a=>a&&p.allergies.includes(a)))return false;kinds.push(kind);const labels=[ingredient.allergen,...(ingredient.allergens||[])];if(labels.includes('Egg'))kinds.push('egg');if(labels.includes('Milk'))kinds.push('dairy');}
 // Validate ingredient contents as well as the advertised recipe diet. Unknown ingredients fail closed.
 const meat=kinds.includes('meat'),fish=kinds.includes('fish'),animal=kinds.some(k=>k!=='plant');
 if(r.diet==='vegan'&&animal||r.diet==='vegetarian'&&(meat||fish)||r.diet==='fish'&&meat)return false;
 return p.diet==='Any'||p.diet==='Non-vegetarian'&&(meat||fish)||p.diet==='Eggless vegetarian'&&!meat&&!fish&&!kinds.includes('egg')||p.diet==='Vegetarian'&&!meat&&!fish||p.diet==='Vegan'&&!animal||p.diet==='Pescatarian'&&!meat;
}
export type MealHistory={recipeId:string;at:number};
export function recentMeals(history:MealHistory[],now=Date.now()){return history.filter(h=>h&&typeof h.recipeId==='string'&&Number.isFinite(h.at)&&h.at<=now&&h.at>=now-21*86400000).slice(-1000)}
export function recordMeals(history:MealHistory[],plan:Slot[],now=Date.now()):MealHistory[]{return [...recentMeals(history,now),...plan.map(s=>({recipeId:s.recipeId,at:now}))].slice(-1000)}
let ingredientIndex:ReturnType<typeof createIngredientIndex>;
function identities(){return ingredientIndex||(ingredientIndex=createIngredientIndex(stock))}
export const canonicalIngredientId=(key:string)=>identities().byId[key]?.key||key;
export const canonicalIngredients=()=>identities().canonical;
export function normalizePantry(pantry:Record<string,number>){const result:Record<string,number>={};for(const [id,amount]of Object.entries(pantry)){const n=Number(amount);if(!Number.isFinite(n)||n<=0)continue;if(!stock[id]){result[id]=n;continue;}const item=identities().byId[id];if(item)result[item.key]=Math.round(((result[item.key]||0)+n*item.factor)*1e9)/1e9;}return result;}
export function setPantryAmount(pantry:Record<string,number>,key:string,amount:number){const result=normalizePantry(pantry);const id=canonicalIngredientId(key);result[id]=Number.isFinite(amount)?Math.max(0,amount):0;return result;}
export function basket(plan:Slot[],p:Profile,pantry:Record<string,number>={}){
 if(!Number.isFinite(p.people)||p.people<=0)throw Error('Choose a valid household size.');
 const quantities:Record<string,number>={},sourceKeys:Record<string,Set<string>>={},haveById=normalizePantry(pantry);
 for(const slot of plan){if(slot.mode&&slot.mode!=='cook')continue;const recipe=recipes.find(r=>r.id===slot.recipeId);if(!recipe)throw Error('A saved recipe is unavailable. Rebuild your plan before shopping.');
  for(const [id,amount]of recipe.items){if(id==='water')continue;const identity=identities().byId[id];if(!identity||!Number.isFinite(amount)||amount<=0)throw Error('Ingredient quantities are unavailable for '+recipe.name+'.');const key=identity.key;quantities[key]=(quantities[key]||0)+amount*identity.factor*p.people;(sourceKeys[key]||=new Set()).add(id);}}
 return Object.entries(quantities).map(([key,amount])=>{
  const item=identities().canonical[key];if(!Number.isFinite(item.pack)||item.pack<=0||!Number.isFinite(item.price)||item.price<0)throw Error('A pack size or price is missing for '+item.name+'.');
  // Integer micro-units avoid floating-point boundary overbuying without rounding
  // tiny positive requirements down to zero. All recipe source units are retained.
  const requiredMicro=Math.max(1,Math.round(amount*1e6)),haveMicro=Math.floor((haveById[key]||0)*1e6+1e-7),packMicro=Math.floor(item.pack*1e6+1e-7);
  if(packMicro<1)throw Error('Invalid pack size for '+item.name+'.');
  const needMicro=Math.max(0,requiredMicro-haveMicro),packs=Math.ceil(needMicro/packMicro),priceCents=Math.round(item.price*100);
  return {...item,key,sourceKeys:[...sourceKeys[key]],required:requiredMicro/1e6,have:haveMicro/1e6,need:needMicro/1e6,packs,cost:packs*priceCents/100,leftover:(packs*packMicro-needMicro)/1e6};
 });
}
export function total(plan:Slot[],p:Profile,pantry:Record<string,number>={}){return basket(plan,p,pantry).reduce((n,item)=>n+Math.round(item.cost*100),0)/100;}
export function pantryMatch(r:Recipe,p:Profile,pantry:Record<string,number>={}){const have=normalizePantry(pantry),keys=new Set([...(p.availableIngredients||[]).map(canonicalIngredientId),...Object.keys(have).filter(k=>have[k]>0)]);return [...new Set(r.items.filter(([k])=>k!=='water'&&keys.has(canonicalIngredientId(k))).map(([k])=>canonicalIngredientId(k)))];}
export function generate(p:Profile,pantry:Record<string,number>={},seed=0,recentIds:string[]=[]):Slot[]{
 const choices=mealChoices(p,'dinner');if(!choices.length)return [];
 const recent=new Set(recentIds),result:Slot[]=[],used=new Set<string>();
 for(const day of [...p.days].sort()){
  const fresh=choices.filter(r=>!used.has(r.id)),pool=fresh.length?fresh:choices;
  const scored=pool.map(r=>{const next=[...result,{day,recipeId:r.id}],cost=total(next,p,pantry);let hash=2166136261;for(const c of r.id+':'+seed+':'+day)hash=Math.imul(hash^c.charCodeAt(0),16777619);return {r,cost,repeated:recent.has(r.id),score:cost-pantryMatch(r,p,pantry).length*12-(p.preferredStyles||[]).filter(t=>r.tags.includes(t)).length*8+(r.tags.includes(p.mood)?-5:0)+(hash>>>0)%100/20}});
  // Prefer variety within budget; don't quietly break the budget solely to avoid a repeat.
  const affordable=scored.filter(x=>x.cost<=p.budget),budgetPool=affordable.length?affordable:scored;
  const unseen=budgetPool.filter(x=>!x.repeated),ranked=unseen.length?unseen:budgetPool;
  ranked.sort((a,b)=>a.score-b.score);const choice=ranked[0].r;result.push({day,recipeId:choice.id});used.add(choice.id);
 }assertWithinBudget(result,p,pantry);return result;
}
export const fmt=(n:number)=>Number.isInteger(n)?String(n):n.toFixed(1);

const breakfastRecipes:Recipe[]=[r('breakfast-oats','Overnight yogurt oats',5,[],'vegetarian',[['oats',50],['yogurt',100]],['Mix oats and yogurt in a covered container.','Refrigerate overnight. Keep chilled until serving.'],['Breakfast','Quick'],0),r('breakfast-toast','Tomato & cucumber toast',10,[],'vegan',[['bread',2],['tomato',70],['cucumber',60],['oil',3]],['Wash and slice the vegetables.','Top the bread with vegetables and a drizzle of oil. Serve immediately.'],['Breakfast','Quick'],2)];
Object.assign(stock,uaeStock,draftStock);for(const key of Object.keys({...uaeStock,...draftStock}))ingredientKinds[key]=['milk','labneh','paneer'].includes(key)?'dairy':key==='fishfillet'?'fish':key==='beef'?'meat':'plant';
for(const r of uaeRecipes){r.reviewStatus='preview';r.authorship='Existing Mealday preview adaptation; not chef-tested';r.photoStatus='missing'}
Object.assign(stock,kaggleCatalogue.ingredients,emiratiStock,reviewedCatalogue.ingredients,coverageExpansion.ingredients,qualityExpansion.ingredients,targetExpansion.ingredients);
for(const [id,kind]of Object.entries(ingredientKinds))if(stock[id]&&!stock[id].kind)stock[id].kind=kind;
ingredientIndex=undefined as any;
recipes=[...recipes,...breakfastRecipes,...uaeRecipes,...recipeDrafts,...emiratiCollection,...kaggleCatalogue.recipes as Recipe[]];
recipes=[...recipes.filter(r=>!reviewedCatalogue.recipes.some(n=>n.id===r.id)),...reviewedCatalogue.recipes as Recipe[]];
recipes=[...recipes,...desiExpansion.recipes as Recipe[],...coverageExpansion.recipes as Recipe[],...qualityExpansion.recipes as Recipe[],...targetExpansion.recipes as Recipe[]];
const withCataloguePhoto=(row:Recipe):Recipe=>{const r={...row,...(qualityOverrides as Record<string,Partial<Recipe>>)[row.id]};if(r.id.startsWith('kaggle-'))r.name=r.name.replace(/\s*\(Recipe in (?:Hindi|English)\)/gi,'').replace(/\s+Recipe(?=\s*(?:\||$))/gi,'').trim();r.familyId=(targetFamilies as Record<string,string>)[r.id]||r.familyId;const imageUrl=(recipePhotos as Record<string,string>)[r.id];return imageUrl?{...r,imageUrl,photoStatus:'generated'}:r};
recipes=assembleMeals(recipes.map(withCataloguePhoto).map(withRecipeTiming),stock);
const bundledRecipes=[...recipes];
export function installCatalogue(nextStock:Record<string,Ingredient>,nextRecipes:Recipe[]){stock={...stock,...Object.fromEntries(Object.entries(nextStock).map(([id,item])=>[id,{...stock[id],...item}]))};for(const [id,kind]of Object.entries(ingredientKinds))if(stock[id]&&!stock[id].kind)stock[id].kind=kind;ingredientIndex=undefined as any;const personal=recipes.filter(r=>r.id.startsWith('ai-'));recipes=[...assembleMeals([...new Map(nextRecipes.map(r=>[r.id,r])).values()].map(withCataloguePhoto).map(withRecipeTiming),stock),...personal.filter(r=>!nextRecipes.some(n=>n.id===r.id)),...bundledRecipes.filter(r=>!nextRecipes.some(n=>n.id===r.id)&&!personal.some(n=>n.id===r.id))];const unique=new Map<string,Recipe>();for(const r of recipes)if(!unique.has(r.id))unique.set(r.id,r);recipes=[...unique.values()];}

export function mergeRecipes(extra:Recipe[]){recipes=[...recipes.filter(r=>!extra.some(e=>e.id===r.id)),...extra]}

export const mealNames:Record<string,string>={breakfast:'Breakfast',lunch:'Lunch',dinner:'Dinner'};
export const preferredCuisines=(p:Profile)=>p.cuisines?.length?p.cuisines:[p.cuisine||'UAE mix'];
export function cuisineMatches(cuisine:Recipe['cuisine'],p:Profile){
 const selected=preferredCuisines(p);
 return !!cuisine&&(selected.includes('UAE mix')||selected.includes(cuisine));
}
export function mealChoices(p:Profile,meal:string){let pool=recipes.filter(r=>compatible(r,p)&&(r.reviewStatus!=='draft'||p.enabledDraftIds?.includes(r.id))&&!r.id.startsWith('spoon-')&&cuisineMatches(r.cuisine,p));pool=pool.filter(r=>r.mealTypes?.includes(meal));if(p.packedLunch&&meal==='lunch')pool=pool.filter(r=>withinTime(r,15));if(p.lowCook&&meal!=='dinner')pool=pool.filter(r=>!r.appliances.includes('Hob')&&!r.appliances.includes('Oven'));return pool;}
export const dishKey=(r:Recipe)=>(r.familyId||(recipeFamilies as Record<string,string>)[r.baseRecipeId||r.aiBaseId||r.id]||(r.baseRecipeId?recipes.find(x=>x.id===r.baseRecipeId)?.name||r.baseRecipeId:r.name)).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export type PlanMemory={history?:MealHistory[];ratings?:Record<string,number>;favorites?:string[]};
export function historyChoices(p:Profile,meal:string,memory:PlanMemory){const days=p.repeatDays??14;const cutoff=Date.now()-days*86400000;const ids=new Set((memory.history||[]).filter(h=>h.at>=cutoff&&h.at<=Date.now()).map(h=>h.recipeId));const old=new Set(recipes.filter(r=>ids.has(r.id)||ids.has(r.baseRecipeId||'')).map(dishKey));return mealChoices(p,meal).filter(r=>p.allowRepeats||!old.has(dishKey(r)));}
function canFillUnique(pools: readonly string[][], used: ReadonlySet<string>){
 const assigned=new Map<string,number>();
 function assign(slot:number,visited:Set<string>):boolean{
  for(const family of pools[slot]){
   if(used.has(family)||visited.has(family))continue;
   visited.add(family);
   const previous=assigned.get(family);
   if(previous===undefined||assign(previous,visited)){assigned.set(family,slot);return true;}
  }
  return false;
 }
 return pools.every((_,slot)=>assign(slot,new Set()));
}
function mealPreferenceBonus(r:Recipe,p:Profile,pantry:Record<string,number>){
 const styles=p.preferredStyles??[p.mood];
 return styles.filter(style=>r.tags.includes(style)).length*2+Math.min(3,pantryMatch(r,p,pantry).length);
}
function varietyPlan(slots:Slot[],pools:Recipe[][],families:string[][],p:Profile,pantry:Record<string,number>,seed:number,memory:PlanMemory):Slot[]{
 const result:Slot[]=[],used=new Set<string>(),recent=new Map<string,number>();
 for(const h of recentMeals(memory.history||[]))recent.set(h.recipeId,Math.max(h.at,recent.get(h.recipeId)||0));
 for(const [index,slot] of slots.entries()){
  if(slot.mode!=='cook'){result.push(slot);continue;}
  const {day,meal}=slot;
  const scored=pools[index].filter(r=>!used.has(dishKey(r))).map(r=>{
   let hash=2166136261;
   for(const c of r.id+':'+seed+':'+day+':'+meal)hash=Math.imul(hash^c.charCodeAt(0),16777619);
   const rating=memory.ratings?.[r.id]??3;
   const score=total([...result,{...slot,recipeId:r.id}],p,pantry)-mealPreferenceBonus(r,p,pantry)+(meal==='dinner'&&!r.appliances.length?20:0)-(memory.favorites?.includes(r.id)?4:0)-Math.max(0,rating-3)*2+(hash>>>0)%100/10;
   return {r,score,rating,recent:recent.get(r.id)||0};
  }).sort((a,b)=>Number(a.rating<=2)-Number(b.rating<=2)||a.recent-b.recent||a.score-b.score);
  const remaining=families.slice(index+1).filter(pool=>pool.length);
  const choice=scored.find(({r})=>canFillUnique(remaining,new Set([...used,dishKey(r)])))!;
  used.add(dishKey(choice.r));
  result.push({...slot,recipeId:choice.r.id});
 }
 return result;
}
export function planVariety(plan:Slot[],history:MealHistory[]=[]){const ids=plan.filter(s=>!s.mode||s.mode==='cook').map(s=>s.recipeId).filter(Boolean),old=new Set(recentMeals(history).map(h=>h.recipeId));return {repeats:ids.length-new Set(ids).size,recent:ids.filter(id=>old.has(id)).length};}

export const recipePhoto=(r:Recipe,size:'card'|'full'='card')=>{const url=r.imageUrl||'/assets/recipe-photo-pending.svg';return size==='card'&&url.startsWith('/assets/recipe-quality/')?url.replace('.webp','-thumb.webp'):url;};
export const uaeDayKey=(now=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);

export type BudgetAlternative={days:number[];plan:Slot[];cost:number};
export class BudgetPlanError extends Error {
 code='BUDGET_PLAN_NOT_FOUND';
 constructor(budget:number,exampleCost:number,public alternative:BudgetAlternative|null=null){
  super('Could not find a varied full plan within AED '+budget.toFixed(2)+'. One complete plan would cost an estimated AED '+exampleCost.toFixed(2)+' for grocery packs. Your saved plan has not been changed.');
  this.name='BudgetPlanError';
 }
}
function shorterBudgetPlan(plan:Slot[],p:Profile,pantry:Record<string,number>):BudgetAlternative|null{
 // At most seven days. Reprice whole baskets because grocery packs are shared.
 let best:BudgetAlternative|null=null;
 for(let mask=1;mask<(1<<p.days.length)-1;mask++){
  const days=p.days.filter((_,i)=>mask&(1<<i));
  if(best&&days.length<best.days.length)continue;
  const subset=plan.filter(slot=>days.includes(slot.day));
  if(!subset.some(slot=>slot.mode==='cook'))continue;
  const cost=total(subset,p,pantry);
  if(Math.round(cost*100)>Math.floor(p.budget*100+1e-7))continue;
  if(!best||days.length>best.days.length||cost<best.cost)best={days,plan:subset,cost};
 }
 return best;
}
export function assertWithinBudget(plan:Slot[],p:Profile,pantry:Record<string,number>={}){
 if(!Number.isFinite(p.budget)||p.budget<0)throw Error('Enter a valid grocery budget.');
 if(plan.some(s=>(!s.mode||s.mode==='cook')&&!recipes.some(r=>r.id===s.recipeId)))throw Error('A recipe is unavailable. Rebuild before updating your shopping list.');
 const cost=total(plan,p,pantry);if(!Number.isFinite(cost))throw Error('The grocery estimate is unavailable.');if(Math.round(cost*100)>Math.floor(p.budget*100+1e-7))throw Error('That change would cost AED '+cost.toFixed(2)+', above your AED '+p.budget.toFixed(2)+' budget. Your saved plan is unchanged.');return cost;
}
// Bounded beam search compares complete pack baskets, not per-serving prices.
// Budget, dish-family uniqueness, and compatibility are hard constraints.
export function generateDayPlan(p:Profile,pantry:Record<string,number>={},seed=0,memory:PlanMemory={}):Slot[]{
 if(!Number.isFinite(p.budget)||p.budget<0||!Number.isInteger(p.people)||p.people<1||p.people>12)throw Error('Enter a valid budget and household size (1–12).');
 if(!p.days.length||p.days.some(d=>!Number.isInteger(d)||d<0||d>6)||new Set(p.days).size!==p.days.length)throw Error('Choose valid planning days.');
 if(!(p.mealTypes||['dinner']).filter(m=>m!=='snack').length)throw Error('Select at least one meal.');
 const meals=[...new Set(p.mealTypes||['dinner'])].filter(meal=>meal!=='snack');
 const byMeal=new Map<string,Recipe[]>();
 for(const meal of meals){
  if((p.mealDefaults?.[meal]||'cook')!=='cook')continue;
  const pool=historyChoices(p,meal,memory);
  const count=new Set(pool.map(dishKey)).size;
  if(!count&&!mealChoices(p,meal).length)throw Error('No '+meal+' recipes match '+preferredCuisines(p).join(', ')+' · '+p.diet+'. Check your cooking time, appliances and exclusions.');
  if(count<p.days.length)throw Error((count?'Only '+count:'No')+' different '+meal+' recipes match your preferences for '+p.days.length+' days after recent-history exclusions. Choose fewer days, increase cooking time, or allow recently suggested meals in Plan settings. Your saved plan is unchanged.');
  byMeal.set(meal,pool);
 }
 const slots:Slot[]=[...p.days].sort((a,b)=>a-b).flatMap(day=>meals.map(meal=>({day,meal,mode:p.mealDefaults?.[meal]||'cook',recipeId:''})));
 const pools=slots.map(slot=>byMeal.get(slot.meal!)||[]);
 const families=pools.map(pool=>[...new Set(pool.map(dishKey))]);
 if(!canFillUnique(families.filter(pool=>pool.length),new Set()))throw Error('There are not enough distinct dishes across your selected meals. Try more cooking time or fewer meals. Your saved plan is unchanged.');
 const greedy=varietyPlan(slots,pools,families,p,pantry,seed,memory),limit=Math.floor(p.budget*100+1e-7);
 const exampleCost=total(greedy,p,pantry);
 if(Math.round(exampleCost*100)<=limit)return greedy;
 const bonuses=new Map(pools.flat().map(r=>[r.id,mealPreferenceBonus(r,p,pantry)]));
 const have=normalizePantry(pantry),seen=new Set(recentMeals(memory.history||[]).map(h=>h.recipeId));
 const vectorCache=new Map<string,Record<string,number>>();
 const vector=(r:Recipe)=>{let v=vectorCache.get(r.id);if(!v){v=Object.fromEntries(basket([{day:0,recipeId:r.id}],p).map(i=>[i.key,Math.round(i.required*1e6)]));vectorCache.set(r.id,v)}return v};
 const packCost=(key:string,micro:number)=>{const item=canonicalIngredients()[key],pack=Math.round(item.pack*1e6),need=Math.max(0,micro-Math.round((have[key]||0)*1e6));return Math.ceil(need/pack)*Math.round(item.price*100)};
 type State={plan:Slot[];q:Record<string,number>;cost:number;used:Set<string>;penalty:number;score:number};
 let beam:State[]=[{plan:[],q:{},cost:0,used:new Set(),penalty:0,score:0}];
 const order=slots.map((_,i)=>i).sort((a,b)=>families[a].length-families[b].length);
 for(const [step,position] of order.entries()){
  const slot=slots[position];if(slot.mode!=='cook'){beam=beam.map(s=>({...s,plan:[...s.plan,slot]}));continue;}
  const pool=pools[position],next:State[]=[];
  const remaining=order.slice(step+1).map(i=>families[i]).filter(pool=>pool.length);
  for(const state of beam)for(const r of pool){
   const family=dishKey(r);
   if(state.used.has(family))continue;
   const q={...state.q};let cost=state.cost;
   for(const [key,n]of Object.entries(vector(r))){const before=q[key]||0;q[key]=before+n;cost+=packCost(key,q[key])-packCost(key,before)}
   if(cost>limit)continue;
   const used=new Set([...state.used,family]);
   let hash=2166136261;for(const c of r.id+':'+seed+':'+position)hash=Math.imul(hash^c.charCodeAt(0),16777619);
   const penalty=state.penalty-(bonuses.get(r.id)??0)+(seen.has(r.id)?50:0)+((memory.ratings?.[r.id]??3)<=2?20:0)-(memory.favorites?.includes(r.id)?0.1:0)+(hash>>>0)%100/10000;
   next.push({plan:[...state.plan,{...slot,recipeId:r.id}],q,cost,used,penalty,score:penalty+cost/100});
  }
  if(!next.length)throw new BudgetPlanError(p.budget,exampleCost,shorterBudgetPlan(greedy,p,pantry));
  // Preserve both diverse choices and cheaper paths so a costly early meal does
  // not consume the budget needed by later slots. Deduplicate meal permutations.
  const unique=new Map<string,State>();for(const s of next){const key=s.plan.filter(x=>x.recipeId).map(x=>x.recipeId).sort().join('|');const prior=unique.get(key);if(!prior||s.score<prior.score)unique.set(key,s)}
  const feasible=(values:State[],max:number)=>{const kept:State[]=[];for(const state of values){if(canFillUnique(remaining,state.used))kept.push(state);if(kept.length===max)break;}return kept;};
  const values=[...unique.values()],quality=feasible(values.sort((a,b)=>a.score-b.score),48),cheap=feasible([...values].sort((a,b)=>a.cost-b.cost||a.score-b.score),16);
  if(!quality.length)throw new BudgetPlanError(p.budget,exampleCost,shorterBudgetPlan(greedy,p,pantry));
  beam=[...new Set([...quality,...cheap])];
 }
 beam.sort((a,b)=>a.score-b.score);const result=slots.map((_,i)=>beam[0].plan[order.indexOf(i)]);assertWithinBudget(result,p,pantry);return result;
}
// Temporary private recipe evaluation is synchronous and never changes the shared catalogue.
export function withRecipes<T>(extra:Recipe[],run:()=>T):T{const before=recipes;try{mergeRecipes(extra);return run()}finally{recipes=before}}
export function clearPersonalRecipes(){recipes=recipes.filter(r=>!r.id.startsWith('ai-'))}

// One eligibility rule for saved plans, generated plans, manual swaps and quotes.
export function slotMatchesPreferences(slot:Slot,p:Profile){
 const meal=slot.meal||'dinner';
 if(!p.days.includes(slot.day)||!(p.mealTypes||['dinner']).includes(meal)||!['cook','out','leftovers'].includes(slot.mode||'cook'))return false;
 if(slot.mode&&slot.mode!=='cook')return true;
 return mealChoices(p,meal).some(r=>r.id===slot.recipeId);
}
export function planPreferenceIssues(plan:Slot[],p:Profile){
 const issues:string[]=[],keys=new Set<string>(),meals=p.mealTypes||['dinner'];
 for(const slot of plan){const key=slot.day+':'+(slot.meal||'dinner');if(keys.has(key)||!slotMatchesPreferences(slot,p))issues.push(key);keys.add(key)}
 for(const day of p.days)for(const meal of meals)if(!keys.has(day+':'+meal))issues.push(day+':'+meal);
 return issues;
}
export function assertPlanPreferences(plan:Slot[],p:Profile){if(planPreferenceIssues(plan,p).length)throw Error('These meals no longer match your cuisine, diet or meal routine. Rebuild your plan to apply your current preferences.');}
export function hasAvoidableRepeats(plan:Slot[],p:Profile){const seen=new Set<string>();for(const s of plan){if(s.mode&&s.mode!=='cook')continue;const r=recipes.find(r=>r.id===s.recipeId);if(!r)continue;const key=dishKey(r);if(seen.has(key))return true;seen.add(key)}return false;}
export function reconcilePlan(plan:Slot[],p:Profile,pantry:Record<string,number>={},seed=0,memory:PlanMemory={}){
 if(!planPreferenceIssues(plan,p).length&&!hasAvoidableRepeats(plan,p))return plan;
 const generated=generateDayPlan(p,pantry,seed,memory);
 const repaired=generated.map(slot=>plan.find(old=>old.day===slot.day&&(old.meal||'dinner')===slot.meal&&slotMatchesPreferences(old,p))||slot);
 try{assertPlanPreferences(repaired,p);assertWithinBudget(repaired,p,pantry);if(hasAvoidableRepeats(repaired,p))return generated;return repaired}catch{assertPlanPreferences(generated,p);return generated}
}

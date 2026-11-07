import type {Ingredient,Recipe} from './engine';
import {recipeTotalMinutes} from './recipeTiming';
// Meal roles are a planning check, not a claim of nutritional adequacy.
const starch=/rice|bread|pita|regag|rigag|khameer|wheat|bulgur|couscous|freekeh|roti|chapati|pasta|wrap|vermicelli|oat|poha|semolina|flour|millet|sorghum|ragi/i;
const pulse=/black.eyed bean|cowpea|white bean|soy|soya|tofu|lentil|chickpea|fava|moong|mung|dal|gram flour|besan|kidney bean|rajma|black gram|pigeon pea|toor/i;
export function mealRoles(r:Recipe,stock:Record<string,Ingredient>){
 const names=r.items.map(([k,n])=>({s:stock[k],n})).filter(x=>x.s);
 return {starch:names.some(({s,n})=>starch.test(s.name)&&n>=(/slice|wrap|bread|piece|regag|pita/i.test(s.unit)?1:25)),protein:names.some(({s,n})=>((['meat','fish','egg','dairy'].includes(s.kind||'')||s.allergen==='Egg'||s.allergen==='Milk')&&n>=(s.kind==='egg'||s.allergen==='Egg'?1:30))||(pulse.test(s.name)&&n>=35))};
}
export function assembleMeals(rows:Recipe[],stock:Record<string,Ingredient>):Recipe[]{
 return rows.flatMap(r=>{
  if(r.mealAssemblyVersion||!r.mealTypes?.some(m=>m==='lunch'||m==='dinner'))return [r];
  const roles=mealRoles(r,stock);if(roles.starch&&roles.protein)return [r];
  // Do not improvise with unrecognised ingredients or incomplete timing.
  if(!Number.isFinite(recipeTotalMinutes(r))||r.items.some(([k])=>!stock[k]))return [r];
  const items:[string,number][]=[...r.items],steps=[...r.steps],sides:string[]=[];let extra=0;
  if(!roles.protein){items.push(['lentils',60],['cumin',1],['oil',5],['tomato',60]);sides.push('Red Lentil Dal');extra+=30;steps.push('For the dal, rinse the red lentils. Warm the measured oil, add cumin and diced tomato, then lentils and water following the lentil packet. Simmer until fully tender, adding water as needed; allow up to 30 minutes.');}
  if(!roles.starch){
   const withRoti=r.cuisine==='South Asian'&&/sabzi|subzi|bhujia|bhindi|aloo gobi/i.test(r.name)&&stock['quality-roti']?.kind==='plant';
   if(withRoti){
    items.push(['quality-roti',2]);sides.push('Roti');extra+=5;
    steps.push('Warm the measured ready-to-eat roti in a dry pan according to the packet. Serve two roti per person alongside the main dish.');
   }else{
    items.push(['rice',60]);sides.push('Rice');extra+=20;
    steps.push('Rinse the measured dry rice and cook it with water according to the packet. Allow about 20 minutes and serve alongside the main dish.');
   }
  }
  items.push(['cucumber',80]);steps.push('Wash and slice the measured cucumber. Serve it alongside the other components. Ingredient amounts are per person; scale every component to the number of servings.');
  const total=recipeTotalMinutes(r)+extra+5;
  const complete:Recipe={...r,id:r.id+'-complete',baseRecipeId:r.id,mealAssemblyVersion:1,name:r.name+' + '+sides.join(' + ')+' + Cucumber',items,steps,time:total,timing:undefined,appliances:[...new Set([...r.appliances,'Hob'])],mealTypes:r.mealTypes.filter(m=>m==='lunch'||m==='dinner'),reviewStatus:'preview',authorship:'Mealday meal combination; elapsed time is a conservative estimate, not kitchen-tested',componentNames:[r.name,...sides,'Cucumber']};
  return [{...r,mealTypes:r.mealTypes.filter(m=>m==='breakfast')},complete];
 });
}

import type {Ingredient} from './engine';
const nameKey=(name:string)=>name.toLowerCase().replace(/[^a-z0-9]/g,'');
// Reviewed exact aliases only. Never infer equivalence from a partial name.
const families:Record<string,string[]>={
 onion:['Onion','Onions'],tomato:['Tomato','Tomatoes'],potato:['Potato','Potatoes','Potato (Aloo)','Potatoes (Aloo)'],
 carrot:['Carrot','Carrots','Carrot (Gajjar)','Carrots (Gajjar)'],spinach:['Spinach','Spinach Leaves (Palak)'],
 cucumber:['Cucumber'],ginger:['Ginger','Fresh ginger'],emiratiGarlic:['Garlic','Fresh garlic'],
 emiratiSalt:['Salt','Fine salt'],emiratiPepper:['Ground black pepper','Black pepper powder'],
 emiratiGhee:['Ghee','Ghee (clarified butter)'],emiratiChilli:['Green chilli','Green chili','Green chillies','Green chilies'],
 rice:['Basmati rice'],flour:['Whole Wheat Flour','Wheat flour'],besan:['Gram flour (besan)','Chickpea flour (besan)'],
 yogurt:['Plain yogurt','Curd (Dahi / Yogurt)'],paneer:['Paneer','Paneer (Homemade Cottage Cheese)'],
 cumin:['Ground cumin','Cumin powder','Cumin powder (Jeera)'],turmeric:['Ground turmeric','Turmeric powder','Turmeric powder (Haldi)'],
 garam:['Garam masala','Garam masala powder'],coriander:['Coriander leaves','Coriander (Dhania) Leaves'],
 semolinaRice:['Rice flour'],semolina:['Wheat semolina','Sooji (Semolina/ Rava)'],poha:['Flattened rice (poha)','Poha (Flattened rice)'],
 eggplant:['Aubergine','Brinjal','Eggplant'],moong:['Split moong dal','Yellow Moong Dal (Split)'],
 vermicelli:['Wheat vermicelli','Semiya (Vermicelli)'],sugar:['Sugar'],
 // These remain separate from their ground/fresh/whole counterparts.
 'cumin-seeds':['Cumin seeds','Cumin seeds (Jeera)'],
 'dry-red-chilli':['Dry Red Chilli','Dry Red Chillies'],
 'chilli-powder':['Red Chilli powder','Red chili powder'],
 'radish':['Mooli/ Mullangi (Radish)','Radishes'],
 'radish-greens':['Mooli Ke Patte (Radish Greens)','Radish leaves'],
 'green-beans':['Green beans','Green beans (French Beans)'],
 'peppercorns':['Black pepper corns','Whole Black Peppercorns'],
 'hing':['Asafoetida','Asafoetida (hing)'],
 'bay-leaf':['Bay leaf (tej patta)','Bay leaves (tej patta)'],
 'cinnamon-stick':['Cinnamon stick','Cinnamon Stick (Dalchini)']
};
const familyNames=new Map(Object.entries(families).flatMap(([id,names])=>names.map(n=>[nameKey(n),id] as [string,string])));
export type Identity={key:string;factor:number};
const units:Record<string,{base:string;factor:number}>={g:{base:'g',factor:1},kg:{base:'g',factor:1000},ml:{base:'ml',factor:1},l:{base:'ml',factor:1000},litre:{base:'ml',factor:1000},litres:{base:'ml',factor:1000},eggs:{base:'eggs',factor:1}};
export function createIngredientIndex(stock:Record<string,Ingredient>){
 const byId:Record<string,Identity>={},canonical:Record<string,Ingredient>={},aliases:Record<string,string[]>={};
 type Row={id:string;v:Ingredient;base:string;factor:number;family:string};
 const describe=(id:string,v:Ingredient):Row=>{
  if(v.unit==='g'&&nameKey(v.name)==='wholeeggs'&&stock.egg)return {id,v,family:'egg',base:'eggs',factor:1/50};
  const u=units[v.unit.toLowerCase()]||{base:v.unit,factor:1};
  return {id,v,family:id==='egg'?'egg':familyNames.get(nameKey(v.name))||'name:'+nameKey(v.name),...u};
 };
 const groups=new Map<string,Row[]>();
 for(const [id,v]of Object.entries(stock).sort(([a],[b])=>a.localeCompare(b))){const row=describe(id,v),key=row.family+':'+row.base;const rows=groups.get(key)||[];rows.push(row);groups.set(key,rows)}
 for(const rows of groups.values()){
  const {family,base}=rows[0],master=stock[family]&&describe(family,stock[family]);
  const anchor=master&&master.base===base?master:rows.find(r=>!r.id.startsWith('kg-'))||rows[0];
  canonical[anchor.id]={...anchor.v};aliases[anchor.id]=rows.map(r=>r.id);
  for(const row of rows)byId[row.id]={key:anchor.id,factor:row.factor/anchor.factor};
 }
 return {byId,canonical,aliases};
}

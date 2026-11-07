const assert=require('node:assert/strict'),esbuild=require('esbuild'),fs=require('fs'),os=require('os'),path=require('path');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mealday-preferences-'));esbuild.buildSync({entryPoints:['functions/mealday-personalize/core-entry.ts'],outfile:path.join(dir,'core.cjs'),bundle:true,platform:'node',format:'cjs'});const x=require(path.join(dir,'core.cjs'));
const p={...x.initialProfile,people:2,days:[0,1],budget:10000,minutes:240,appliances:['Hob','Oven','Air fryer','Microwave'],mealTypes:['dinner']};
const kind=k=>x.stock[k]?.kind||({chicken:'meat',tuna:'fish',egg:'egg',cheese:'dairy',yogurt:'dairy'})[k]||'plant';
let checks=0;
for(const cuisine of ['Emirati','Arab','South Asian'])for(const diet of ['Any','Non-vegetarian','Eggless vegetarian','Vegetarian','Vegan','Pescatarian']){
 const profile={...p,cuisine,diet};for(const meal of ['breakfast','lunch','dinner']){
 const q={...profile,mealTypes:[meal]},pool=x.mealChoices(q,meal);
 for(const recipe of pool){assert.equal(recipe.cuisine,cuisine);assert(x.compatible(recipe,q));const kinds=recipe.items.map(([k])=>kind(k));if(diet==='Non-vegetarian')assert(kinds.some(k=>k==='meat'||k==='fish'),recipe.id);if(diet==='Eggless vegetarian')assert(!kinds.some(k=>['egg','meat','fish'].includes(k)));if(diet==='Vegan')assert(kinds.every(k=>k==='plant'));checks++;}
 if(!pool.length){assert.throws(()=>x.generateDayPlan(q),/No .* recipes match/);continue;}if(new Set(pool.map(r=>r.name.toLowerCase())).size<q.days.length){assert.throws(()=>x.generateDayPlan(q),/different .* recipes/);continue;}
 for(let seed=0;seed<3;seed++){const plan=x.generateDayPlan(q,{},seed);assert.equal(plan.length,2);assert.equal(x.planPreferenceIssues(plan,q).length,0);assert(x.total(plan,q)<=q.budget);for(const slot of plan)assert(pool.some(r=>r.id===slot.recipeId));checks++;}
 }}
const desi={...p,cuisine:'South Asian',diet:'Any'},emirati={...p,cuisine:'Emirati',diet:'Any'},arab={...p,cuisine:'Arab',diet:'Any'};
let plan=x.generateDayPlan(desi);assert(x.planPreferenceIssues(plan,emirati).length>0);plan=x.reconcilePlan(plan,emirati);assert(plan.every(s=>x.recipes.find(r=>r.id===s.recipeId).cuisine==='Emirati'));plan=x.reconcilePlan(plan,arab);assert(plan.every(s=>x.recipes.find(r=>r.id===s.recipeId).cuisine==='Arab'));
const nonveg={...desi,diet:'Non-vegetarian'};const veg=x.mealChoices(desi,'dinner').find(r=>r.diet==='vegan');const old=[{day:0,meal:'dinner',recipeId:veg.id,mode:'cook'},{day:1,meal:'dinner',recipeId:veg.id,mode:'cook'}];assert.throws(()=>x.assertPlanPreferences(old,nonveg));const fixed=x.reconcilePlan(old,nonveg);assert(fixed.every(s=>x.recipes.find(r=>r.id===s.recipeId).items.some(([k])=>['meat','fish'].includes(kind(k)))));
const retained=x.generateDayPlan(emirati);assert.equal(x.reconcilePlan(retained,emirati),retained);const changed={...arab,days:[1],mealTypes:['lunch','dinner']};const repaired=x.reconcilePlan(retained,changed);assert.equal(repaired.length,2);assert(repaired.every(s=>s.day===1));assert.equal(x.planPreferenceIssues(repaired,changed).length,0);
assert(x.planPreferenceIssues([...retained,retained[0]],emirati).length>0);
assert.equal(x.planPreferenceIssues([{day:0,meal:'dinner',mode:'out',recipeId:''},{day:1,meal:'dinner',mode:'leftovers',recipeId:''}],nonveg).length,0);
assert(x.planPreferenceIssues([{day:0,meal:'dinner',recipeId:'unknown'}],nonveg).length>0);
assert(x.planPreferenceIssues(retained,{...emirati,minutes:1}).length>0);
// An unavailable non-veg breakfast must never quietly become vegetarian or Desi.
const noBreakfast={...p,minutes:1,cuisine:'Arab',diet:'Non-vegetarian',mealTypes:['breakfast'],enabledDraftIds:[]};assert.equal(x.mealChoices(noBreakfast,'breakfast').length,0);assert.throws(()=>x.reconcilePlan(retained,noBreakfast),/Arab.*Non-vegetarian/);
// Strict cuisine also applies to the legacy single-dinner generator.
for(const cuisine of ['Emirati','Arab','South Asian']){const q={...p,cuisine,diet:'Non-vegetarian'};for(const s of x.generate(q))assert.equal(x.recipes.find(r=>r.id===s.recipeId).cuisine,cuisine)}
// AI can retain vegetables alongside meat, but cannot create a veg-only non-veg meal.
const base=x.adaptationBases(nonveg,'dinner').find(r=>r.id==='desi-chicken');assert(base);assert(x.adaptationIngredients(nonveg,base,'dinner').some(i=>i.id==='onion'));assert(x.adaptationIngredients(nonveg,base,'dinner').some(i=>i.id==='chicken'));assert(x.adaptationBases(nonveg,'dinner').every(r=>['meat','fish'].includes(r.diet)));
const raw={name:'Ginger chicken curry variation',time:30,diet:'meat',appliances:['Hob'],items:[['chicken',160],['rice',60],['tomato',100],['onion',50],['oil',5]],steps:[{text:'Cook rice following the packet. Chop onion and tomato.',ingredients:['rice','onion','tomato']},{text:'Warm oil, soften onion and tomato, then simmer halal-labelled chicken with water until the chicken reaches 75 C.',ingredients:['oil','onion','tomato','chicken']}]};assert(x.validateAdaptation(raw,nonveg,base,'dinner'));assert.throws(()=>x.validateAdaptation({...raw,diet:'vegan',items:raw.items.filter(([k])=>k!=='chicken'),steps:[{text:'Prepare rice, onion and tomato.',ingredients:['rice','onion','tomato']},{text:'Simmer the vegetables in oil with water until tender.',ingredients:['oil','onion','tomato']}]},nonveg,base,'dinner'));
fs.rmSync(dir,{recursive:true});console.log(`PASS preference integrity: ${checks} cuisine/diet/meal checks; switching Desi → Emirati → Arab, veg → non-veg, stale plans, unavailable meals, all modes, strict legacy generation and AI meat/vegetable validation.`);

const mixed={...p,cuisine:'UAE mix',cuisines:['Arab','South Asian'],diet:'Eggless vegetarian'};
const mixedPool=x.mealChoices(mixed,'dinner');
assert.deepEqual([...new Set(mixedPool.map(r=>r.cuisine))].sort(),['Arab','South Asian']);
assert(mixedPool.every(r=>x.compatible(r,mixed)));
assert.equal(x.planPreferenceIssues(x.generateDayPlan(mixed),mixed).length,0);
assert(x.planPreferenceIssues(x.generateDayPlan(emirati),mixed).length>0);

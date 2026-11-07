const assert=require('node:assert/strict'),vm=require('node:vm'),esbuild=require('esbuild');
const m={exports:{}};vm.runInNewContext(esbuild.buildSync({entryPoints:['src/engine.ts'],bundle:true,format:'cjs',platform:'node',write:false}).outputFiles[0].text,{module:m,exports:m.exports});
const x=m.exports,all=x.recipes.filter(r=>r.cuisine&&!r.id.startsWith('kaggle-')&&!r.id.startsWith('emirati-')&&!r.id.startsWith('mealday-')),base={...x.initialProfile,budget:10000,days:[0,1,2,3,4],minutes:60,appliances:['Hob'],mealTypes:['breakfast','lunch','dinner']};
assert.equal(all.length,60);assert.equal(new Set(all.map(r=>r.id)).size,60);
for(const cuisine of ['Emirati','Arab','South Asian'])assert.equal(all.filter(r=>r.cuisine===cuisine).length,20);
assert.equal(all.filter(r=>r.reviewStatus==='draft').length,36);
for(const r of all){assert(r.steps.length>=2);assert(r.mealTypes.length);assert(r.time>0);for(const [k,n]of r.items){assert(x.stock[k],r.id+': missing '+k);assert(Number.isFinite(n)&&n>0);assert(x.stock[k].pack>0);}}
for(const meal of base.mealTypes)assert(x.mealChoices(base,meal).every(r=>r.reviewStatus!=='draft'));
const draft=all.find(r=>r.id==='draft-besan');const enabled={...base,enabledDraftIds:all.filter(r=>r.reviewStatus==='draft').map(r=>r.id)};
assert(x.mealChoices(enabled,'breakfast').some(r=>r.reviewStatus==='draft'));
const plan=x.generateDayPlan(enabled,{},7);assert.equal(plan.length,15);assert.equal(new Set(plan.map(s=>s.recipeId)).size,15,'Should not repeat with enough candidates');
const recent=plan.map(s=>({recipeId:s.recipeId,at:Date.now()}));const next=x.generateDayPlan({...enabled,days:[0]}, {},8,{history:recent});for(const s of next){const pool=x.mealChoices(enabled,s.meal);if(pool.some(r=>!recent.some(h=>h.recipeId===r.id)))assert(!recent.some(h=>h.recipeId===s.recipeId),'Prefer a fresh recipe');}
for(const diet of ['Vegan','Eggless vegetarian']){const p={...enabled,diet};for(const meal of p.mealTypes)for(const r of x.mealChoices(p,meal)){assert(!['meat','fish'].includes(r.diet));assert(!r.items.some(([k])=>k==='egg'));if(diet==='Vegan')assert(r.diet==='vegan');}}
assert(!x.mealChoices({...enabled,diet:'Eggless vegetarian'},'breakfast').some(r=>r.id==='draft-khameer-labneh'),'Compound egg allergen must exclude eggless');
assert(!x.mealChoices({...enabled,allergies:['Sesame']},'lunch').some(r=>r.items.some(([k])=>['tahini','zaatar'].includes(k))));
for(const r of x.mealChoices({...enabled,packedLunch:true,lowCook:true},'lunch'))assert(r.time<=15&&!r.appliances.includes('Hob'));
assert.equal(x.basket(plan.map(s=>({...s,mode:'out'})),enabled).length,0);assert.equal(x.basket(plan.map(s=>({...s,mode:'leftovers'})),enabled).length,0);
assert.throws(()=>x.generateDayPlan({...enabled,dislikedIngredients:Object.keys(x.stock)}));
const h=[{recipeId:'recent',at:Date.now()-20*86400000},{recipeId:'old',at:Date.now()-22*86400000}];assert.equal(x.recentMeals(h).length,1);
x.installCatalogue({},[]);assert.equal(x.recipes.filter(r=>r.cuisine).length,138+require('../data/kaggle-catalogue.json').recipes.length+require('../data/desi-nonveg-expansion.json').recipes.length);assert(x.stock.paneer);
console.log('PASS: 60 recipes / 20 per cuisine; draft gating; weekly and 21-day variety; compound allergens; diet; equipment; groceries; catalogue refresh.');

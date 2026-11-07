const assert=require('node:assert/strict'),fs=require('node:fs'),esbuild=require('esbuild');
esbuild.buildSync({entryPoints:['functions/mealday-personalize/core-entry.ts'],outfile:'/tmp/mealday-full-shortlist.cjs',bundle:true,platform:'node'});
const x=require('/tmp/mealday-full-shortlist.cjs'),data=require('../data/mealday-full-shortlist.json');
const ids=new Set(data.recipes.map(r=>r.id));assert.equal(ids.size,83);assert.equal(data.recipes.length,83);assert.equal(x.recipes.filter(r=>ids.has(r.id)).length,83);assert.equal(new Set(x.recipes.map(r=>r.id)).size,x.recipes.length);
const p={...x.initialProfile,budget:10000,minutes:1440,appliances:['Hob','Oven','Air fryer','Microwave'],mealTypes:['breakfast','lunch','dinner'],days:[0],diet:'Any',cuisine:'UAE mix'};
for(const r of data.recipes){
 assert.equal(r.reviewStatus,'preview');assert.equal(r.photoStatus,'generated');assert(r.authorship.includes('not chef-tested'));assert(r.steps.length>=5,r.name);assert(Number.isInteger(r.time)&&r.time>0);assert(r.mealTypes.length&&r.mealTypes.every(m=>p.mealTypes.includes(m)));assert(r.appliances.every(a=>p.appliances.includes(a)));
 const keys=r.items.map(([k])=>x.canonicalIngredientId(k));assert.equal(new Set(keys).size,keys.length,r.id+' duplicate ingredient alias');
 for(const [key,n]of r.items){assert(x.stock[key],r.id+': '+key);assert(n>0&&Number.isFinite(n));assert(x.stock[key].kind);assert(x.stock[key].pack>0&&x.stock[key].price>=0);}
 assert(x.compatible(r,p),r.name+' is incompatible with its own metadata');
 const basket=x.basket([{day:0,meal:r.mealTypes[0],recipeId:r.id}],{...p,people:2},{});for(const item of basket){assert(item.packs>=0&&Number.isInteger(item.packs));assert(item.packs*item.pack+1e-6>=item.need);assert.equal(item.cost,Math.round(item.packs*item.price*100)/100);}
 for(const diet of ['Vegan','Eggless vegetarian','Vegetarian','Non-vegetarian','Pescatarian']){const q={...p,diet};const allowed=x.compatible(r,q),kinds=r.items.map(([k])=>x.stock[k].kind);if(diet==='Non-vegetarian')assert.equal(allowed,kinds.some(k=>k==='meat'||k==='fish'));if(diet==='Vegetarian'||diet==='Eggless vegetarian')if(kinds.some(k=>k==='meat'||k==='fish'))assert(!allowed);if(diet==='Eggless vegetarian'&&kinds.includes('egg'))assert(!allowed);if(diet==='Vegan'&&kinds.some(k=>k!=='plant'))assert(!allowed);}
 for(const allergy of ['Gluten','Milk','Egg','Peanuts','Tree nuts','Fish','Shellfish','Sesame','Soy'])if(r.items.some(([k])=>[x.stock[k].allergen,...(x.stock[k].allergens||[])].includes(allergy)))assert(!x.compatible(r,{...p,allergies:[allergy]}),r.name+' allergen '+allergy);
 for(const cuisine of ['Emirati','Arab','South Asian'])if(r.cuisine!==cuisine)for(const meal of r.mealTypes)assert(!x.mealChoices({...p,cuisine},meal).some(n=>n.id===r.id));
 if(r.time>30)for(const meal of r.mealTypes)assert(!x.mealChoices({...p,minutes:30},meal).some(n=>n.id===r.id),r.id+' long recipe leaked');
 for(const appliance of r.appliances)assert(!x.compatible(r,{...p,appliances:p.appliances.filter(a=>a!==appliance)}));
 const path='dist'+r.imageUrl;if(process.env.ALLOW_PENDING_IMAGES!=='1'){assert(fs.existsSync(path),'Missing image '+path);assert(fs.statSync(path).size<160000,'Oversized image '+path);}
}
const menemen=data.recipes.find(r=>r.id==='mealday-menemen');assert.equal(menemen.cuisine,'Turkish');assert(x.mealChoices(p,'breakfast').some(r=>r.id===menemen.id));assert(!x.mealChoices({...p,cuisine:'Arab'},'breakfast').some(r=>r.id===menemen.id));assert.equal(data.recipes.find(r=>r.id==='mealday-chicken-jareesh').cuisine,'Arab');
assert.equal(x.stock['full-mussels'].allergen,'Shellfish');assert(!x.mealChoices({...p,allergies:['Shellfish']},'lunch').some(r=>r.id==='mealday-mussels-garlic'));
assert(data.recipes.find(r=>r.id==='emirati-chicken-harees').time>=720);assert(data.recipes.find(r=>r.id==='mealday-fish-madrooba').time>=720);assert(data.recipes.find(r=>r.id==='mealday-haleem').time>=600);
for(const r of x.adaptationBases({...p,minutes:30,appliances:['Hob']},'dinner')){assert(r.time<=30);assert(r.appliances.every(a=>a==='Hob'));}
for(const cuisine of ['Arab','Emirati','South Asian']){const q={...p,cuisine,minutes:75,days:[0,1,2,3,4],mealTypes:['dinner'],diet:'Non-vegetarian'};const plan=x.generateDayPlan(q,{},19);assert.equal(plan.length,5);assert.equal(new Set(plan.map(s=>s.recipeId)).size,5,'Enough eligible non-veg variety for '+cuisine);assert(x.total(plan,q)<=q.budget);}
x.installCatalogue({},[]);assert.equal(x.recipes.filter(r=>ids.has(r.id)).length,83,'Offline/refresh retains entire shortlist without duplicates');
console.log('PASS: all 83 unique shortlist recipes; complete methods; per-person/whole-pack quantities; cuisine/diet/allergen/time/equipment filters; five varied non-veg days; AI base filters; refresh persistence'+(process.env.ALLOW_PENDING_IMAGES==='1'?' (images pending)':' and all photo assets')+'.');

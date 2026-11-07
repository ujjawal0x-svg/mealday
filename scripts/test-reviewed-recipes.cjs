const assert=require('node:assert/strict'),fs=require('node:fs'),esbuild=require('esbuild');
esbuild.buildSync({entryPoints:['src/engine.ts'],outfile:'/tmp/mealday-reviewed.cjs',bundle:true,platform:'node'});
const x=require('/tmp/mealday-reviewed.cjs'),data=require('../data/reviewed-mealday-recipes.json');
assert.equal(data.recipes.length,3);
const ids=new Set(data.recipes.map(r=>r.id));assert.equal(ids.size,3);
assert.equal(x.recipes.filter(r=>ids.has(r.id)).length,3,'No duplicate existing kofta');
for(const r of data.recipes){assert.equal(r.cuisine,'Arab');assert.equal(r.reviewStatus,'preview');assert.equal(r.photoStatus,'generated');assert(r.steps.length>=5);assert(r.items.length>=8);assert(r.steps.join(' ').includes(r.diet==='fish'?'63°C':'71°C'));assert(r.authorship.includes('not chef-tested')); for(const [id,n]of r.items){assert(x.stock[id],id);assert(n>0);assert(x.stock[id].kind);}const path='dist'+r.imageUrl;assert(fs.existsSync(path));assert(fs.statSync(path).size<100000,'Keep photos compact');assert.equal(r.items.find(([id])=>id==='fishfillet'||id==='reviewedBeefMince')[1],150,'Raw protein per person');}
const p={...x.initialProfile,cuisine:'Arab',diet:'Non-vegetarian',budget:10000,minutes:30,appliances:['Hob'],mealTypes:['lunch','dinner']};
const pool=q=>x.mealChoices(q,'dinner').filter(r=>ids.has(r.id)).map(r=>r.id);
assert.equal(pool(p).length,2);assert.equal(pool({...p,minutes:35}).length,2,'Oven is required for couscous');assert.equal(pool({...p,minutes:35,appliances:['Hob','Oven']}).length,3);
for(const diet of ['Vegan','Vegetarian','Eggless vegetarian'])assert.equal(pool({...p,diet}).length,0);
for(const cuisine of ['Emirati','South Asian'])assert.equal(pool({...p,cuisine}).length,0);
assert.equal(pool({...p,allergies:['Fish']}).length,1);assert(!pool({...p,allergies:['Milk']}).includes('draft-kofta-beef'));assert(!pool({...p,allergies:['Gluten']}).includes('draft-kofta-beef'));
assert.equal(x.mealChoices({...p,packedLunch:true},'lunch').filter(r=>ids.has(r.id)).length,0);
assert.equal(x.mealChoices(p,'breakfast').filter(r=>ids.has(r.id)).length,0);
x.installCatalogue({},[]);assert.equal(x.recipes.filter(r=>ids.has(r.id)).length,3,'Refresh keeps reviewed fallbacks without duplicate kofta');
const incoming=data.recipes.map(r=>({...r}));x.installCatalogue(data.ingredients,incoming);assert.equal(x.recipes.filter(r=>ids.has(r.id)).length,3);
console.log('PASS: 3 complete original previews; protein weights; safety steps; compressed images; strict cuisine/diet/allergen/time/equipment/meal filters; refresh deduplication.');

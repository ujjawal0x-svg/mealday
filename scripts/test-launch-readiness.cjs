const assert=require('node:assert/strict'),esbuild=require('esbuild');
esbuild.buildSync({entryPoints:['src/engine.ts'],bundle:true,platform:'node',format:'cjs',outfile:'/tmp/mealday-launch-engine.cjs'});
const x=require('/tmp/mealday-launch-engine.cjs');
const p={...x.initialProfile,name:'Test kitchen',city:'Dubai',shop:'LuLu',people:2,budget:150,cuisine:'South Asian',diet:'Eggless vegetarian',minutes:30,mealTypes:['dinner'],days:[0,1,2,3,4]};
const plan=x.generateDayPlan(p,{},42);assert.equal(plan.length,5);assert.equal(new Set(plan.map(s=>x.dishKey(x.recipes.find(r=>r.id===s.recipeId)))).size,5);assert(x.total(plan,p)<=150);assert.equal(x.planPreferenceIssues(plan,p).length,0);
for(const s of plan){const r=x.recipes.find(r=>r.id===s.recipeId);assert(x.compatible(r,p));assert(r.time<=30);for(const [k]of r.items)assert(!['meat','fish','egg'].includes(x.stock[k].kind));}
const jeera=x.recipes.find(r=>r.id==='kaggle-1474-complete');assert(jeera);assert(jeera.name.includes('Red Lentil Dal'));assert(jeera.items.some(([k])=>k==='lentils'));assert(jeera.items.some(([k])=>k==='cucumber'));assert(jeera.time>30);assert(!x.mealChoices(p,'dinner').some(r=>r.id==='kaggle-1474'));
const list=x.basket(plan,p),restored=JSON.parse(JSON.stringify(plan));assert.deepEqual(x.basket(restored,p),list);for(const i of list){assert(i.packs*i.pack>=i.need);assert(i.required>0)}
const history=x.recordMeals([],plan);const second=x.generateDayPlan({...p,budget:1000},{},43,{history});assert.equal(second.length,5);const previous=new Set(plan.map(s=>x.dishKey(x.recipes.find(r=>r.id===s.recipeId))));assert(second.every(s=>!previous.has(x.dishKey(x.recipes.find(r=>r.id===s.recipeId)))));
const first=x.recipes.find(r=>r.id===plan[0].recipeId);const block=x.mealChoices({...p,allowRepeats:true},'dinner').map(r=>({recipeId:r.id,at:Date.now()}));assert.throws(()=>x.generateDayPlan(p,{},0,{history:block}));assert.equal(x.generateDayPlan({...p,allowRepeats:true},{},0,{history:block}).length,5);
const changed=[...plan.slice(1),{...plan[0],day:6}];assert(x.hasAvoidableRepeats([...plan,{...plan[0],meal:'lunch'}],p));
console.log(JSON.stringify({scenario:'Dubai / LuLu / 2 people / AED150 / Desi / eggless / 5 dinners / <=30min',estimatedPackTotal:x.total(plan,p),meals:plan.map(s=>x.recipes.find(r=>r.id===s.recipeId).name)},null,2));
console.log('PASS: complete Jeera meal, all-component time and groceries, strict preferences, five distinct dinners, 14-day history, explicit reuse option, cross-meal duplicate detection, reload calculation.');

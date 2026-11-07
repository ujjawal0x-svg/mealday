const assert=require('node:assert/strict'),esbuild=require('esbuild'),vm=require('vm'),m={exports:{}};vm.runInNewContext(esbuild.buildSync({entryPoints:['src/engine.ts'],bundle:true,format:'cjs',platform:'node',write:false}).outputFiles[0].text,{module:m,exports:m.exports,Intl});const x=m.exports;
const p={...x.initialProfile,cuisine:'Emirati',diet:'Vegan',minutes:1,people:1,days:[0,1,2,3,4,5,6],mealTypes:['dinner'],budget:10000};
const make=(i)=>({id:'variety-'+i,name:'Fixture dish '+i,time:1,cuisine:'Emirati',diet:'vegan',mealTypes:['dinner'],appliances:['Hob'],reviewStatus:'preview',items:[['onion',10]],tags:[],steps:['Cook'],image:0});
const fixtures=Array.from({length:7},(_,i)=>make(i));x.mergeRecipes(fixtures);
let plan=x.generateDayPlan(p);assert.equal(new Set(plan.map(s=>s.recipeId)).size,7);
const stale=p.days.map(day=>({day,meal:'dinner',mode:'cook',recipeId:fixtures[0].id}));assert(x.hasAvoidableRepeats(stale,p));assert.equal(new Set(x.reconcilePlan(stale,p).map(s=>s.recipeId)).size,7);
const limited={...p,dislikedIngredients:[],enabledDraftIds:[]};
// Three eligible fixtures (different appliances isolate the pool).
x.mergeRecipes(fixtures.map((r,i)=>({...r,appliances:i<3?['Microwave']:['Hob']})));limited.appliances=['Microwave'];
assert.throws(()=>x.generateDayPlan(limited),/Only 3 different dinner recipes/);assert(x.hasAvoidableRepeats(stale,limited));
assert.throws(()=>x.generateDayPlan({...p,budget:0}));console.log('PASS: seven unique days, stale repair, scarce pool refuses repeats, hard budget.');

// A dish that fits both meals must be reserved for the slot with no alternative.
const shared={...make(10),appliances:['Oven'],mealTypes:['dinner','breakfast']};
const dinner={...make(11),appliances:['Oven']};
x.mergeRecipes([shared,dinner]);
const overlap={...p,days:[0],appliances:['Oven'],mealTypes:['dinner','breakfast']};
assert.deepEqual(Array.from(x.generateDayPlan(overlap,{},0,{ratings:{[shared.id]:5,[dinner.id]:1}}),s=>s.recipeId),[dinner.id,shared.id]);
assert.throws(()=>x.generateDayPlan(overlap,{},0,{history:[{recipeId:shared.id,at:Date.now()}]}),/recent-history exclusions/);

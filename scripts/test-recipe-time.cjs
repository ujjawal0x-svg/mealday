const assert=require('node:assert/strict'),fs=require('node:fs'),esbuild=require('esbuild');
const entry='/tmp/mealday-time-entry.ts';fs.writeFileSync(entry,`export * from '${process.cwd()}/src/engine';export * from '${process.cwd()}/src/recipeTiming';export * from '${process.cwd()}/src/aiRecipePolicy';`);esbuild.buildSync({entryPoints:[entry],outfile:'/tmp/mealday-time.cjs',bundle:true,platform:'node'});const x=require('/tmp/mealday-time.cjs');
for(const [time,category]of [[1,'quick'],[15,'quick'],[16,'everyday'],[30,'everyday'],[31,'relaxed'],[45,'relaxed'],[46,'hour'],[60,'hour'],[61,'long'],[120,'long'],[121,'slow'],[240,'slow'],[241,'ahead'],[1440,'ahead']])assert.equal(x.timeCategory({time}),category);
for(const time of [0,-1,NaN,Infinity,undefined,'30'])assert(!x.withinTime({time},30));assert(!x.withinTime({time:10},NaN));assert(!x.withinTime({time:10},1441));
const underestimated={time:20,timing:{prepMinutes:10,cookMinutes:20,waitMinutes:60,estimated:true}};assert.equal(x.recipeTotalMinutes(underestimated),90);assert(!x.withinTime(underestimated,30));assert(x.withinTime(underestimated,90));assert.equal(x.recipeTotalMinutes({...underestimated,timing:{...underestimated.timing,waitMinutes:-1}}),Infinity);
assert.equal(x.formatDuration(95),'1 hr 35 min');assert.equal(x.formatDuration(750),'12 hr 30 min');assert.equal(x.formatDuration(0),'0 min');
const p={...x.initialProfile,budget:10000,minutes:1440,appliances:['Hob','Oven','Air fryer','Microwave'],cuisine:'UAE mix',days:[0],mealTypes:['dinner']};
for(const r of x.recipes){assert.notEqual(x.timeCategory(r),'unknown',r.id);assert(x.recipeTotalMinutes(r)>=r.time);const d=x.timingBreakdown(r);if(d)assert.equal(d.prepMinutes+d.cookMinutes+d.waitMinutes,r.time,r.id+' inconsistent phase total');}
for(const limit of x.timeLimits)for(const meal of ['breakfast','lunch','dinner'])for(const r of x.mealChoices({...p,minutes:limit},meal))assert(x.recipeTotalMinutes(r)<=limit);
for(const id of ['emirati-chicken-harees','mealday-fish-madrooba','mealday-haleem']){assert(!x.mealChoices({...p,minutes:240},'dinner').some(r=>r.id===id));assert(x.mealChoices(p,'dinner').some(r=>r.id===id));}
assert.equal(x.aiProfile(p).minutes,1440);assert.throws(()=>x.aiProfile({...p,minutes:1441}));
const base=x.recipes.find(r=>r.id==='draft-shawarma-chicken');const raw={name:'New chicken shawarma variation',time:30,diet:'meat',appliances:['Hob'],items:[['full-chicken-thigh',160],['onion',40]],steps:[{text:'Cook the chicken and onion thoroughly.',ingredients:['full-chicken-thigh','onion']},{text:'Serve the cooked chicken and onion hot.',ingredients:['full-chicken-thigh','onion']}]};assert.throws(()=>x.validateAdaptation(raw,p,base,'dinner'));
const legacy={...x.recipes.find(r=>r.id==='arab-adas'),id:'ai-'+'e'.repeat(24),time:750,mealTypes:['dinner']};assert.equal(x.restorePersonalRecipes([legacy]).length,1,'Plan-ahead personal recipe survives restore');
x.installCatalogue({},[]);assert(x.recipes.find(r=>r.id==='emirati-chicken-harees').timing.waitMinutes===480);
console.log('PASS: every catalogue recipe classified; exact time boundaries; invalid/understated times fail closed; soaking/marinating included; 24h preferences and personal restore; no AI shortcut; refresh metadata.');

assert.deepEqual(x.cookingStepTimer('Simmer 15–20 minutes.'),{seconds:900,label:'15–20 minutes'});
assert.equal(x.cookingStepTimer('Rest for 1.5 hours.').seconds,5400);
assert.equal(x.cookingStepTimer('Toast for 30 seconds.').seconds,30);
assert.equal(x.cookingStepTimer('Mix 3 cups of water.'),null);

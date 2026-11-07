const assert=require('node:assert/strict'),esbuild=require('esbuild');
esbuild.buildSync({entryPoints:['src/mealSwapChoices.ts'],outfile:'/tmp/mealday-swap.cjs',bundle:true,platform:'node',format:'cjs'});
esbuild.buildSync({entryPoints:['src/engine.ts'],outfile:'/tmp/mealday-swap-engine.cjs',bundle:true,platform:'node',format:'cjs'});
// Bundle both into one module so the catalogue is shared.
const fs=require('fs');fs.writeFileSync('/tmp/mealday-swap-test-entry.ts',`export * from '${process.cwd()}/src/mealSwapChoices'; export * from '${process.cwd()}/src/engine'; export * from '${process.cwd()}/src/groceryChanges'; export * from '${process.cwd()}/src/recipeIngredients';`);
esbuild.buildSync({entryPoints:['/tmp/mealday-swap-test-entry.ts'],outfile:'/tmp/mealday-swap-test.cjs',bundle:true,platform:'node',format:'cjs'});
const {mealSwapChoices,initialProfile,mealChoices,total,hasAvoidableRepeats,groceryChanges,recipeIngredients}=require('/tmp/mealday-swap-test.cjs');
const p={...initialProfile,budget:10000,mealTypes:['breakfast','lunch','dinner'],minutes:120,appliances:['Hob','Oven','Microwave','Air fryer'],cuisine:'South Asian'};
const plan=['breakfast','lunch','dinner'].map(meal=>({day:0,meal,mode:'cook',recipeId:mealChoices(p,meal)[0].id,cooked:true}));
for(let i=0;i<3;i++){
 const options=mealSwapChoices(plan,i,p,{});assert(options.length);
 for(const o of options){assert(mealChoices(p,plan[i].meal).some(r=>r.id===o.recipe.id));assert.notEqual(o.recipe.id,plan[i].recipeId);assert.equal(o.recipe.cuisine,'South Asian');assert.equal(o.plan[i].cooked,false);assert.equal(o.plan[i].mode,'cook');assert.equal(o.cost,total(o.plan,p,{}));assert.equal(o.change,Math.round((o.cost-total(plan,p,{}))*100)/100);assert.equal(o.allowed,!hasAvoidableRepeats(o.plan,p));for(let j=0;j<3;j++)if(j!==i)assert.deepEqual(o.plan[j],plan[j]);}
}
assert.equal(plan[0].cooked,true);assert.deepEqual(mealSwapChoices(plan,9,p,{}),[]);
const low={...p,budget:1};for(const o of mealSwapChoices(plan,2,low,{}))assert.equal(o.allowed,o.cost<=1&&!hasAvoidableRepeats(o.plan,low));
console.log('PASS: breakfast/lunch/dinner swaps retain other slots, strict cuisine, matching eligibility, grocery totals and budget guard.');

const pack=(key,packs,pack=500)=>({key,packs,pack,unit:'g'});
const diff=groceryChanges([pack('rice',1),pack('tomato',1),pack('lentils',1),pack('onion',2)],
 [pack('rice',1),pack('lentils',2),pack('onion',1),pack('cucumber',1)]);
assert.deepEqual(diff.added.map(i=>i.key),['cucumber']);
assert.deepEqual(diff.removed.map(i=>i.key),['tomato']);
assert.deepEqual(diff.changed.map(i=>i.key),['lentils','onion']);
assert.deepEqual(diff.keepChecked,['rice','onion']);
assert.deepEqual(recipeIngredients({items:[['tomato',60],['rice',50],['tomato',40]]}),[['tomato',100],['rice',50]]);
console.log('PASS: swap grocery changes and purchase ticks, consolidated cook quantities.');

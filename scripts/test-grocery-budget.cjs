const assert=require('node:assert/strict'),esbuild=require('esbuild'),vm=require('vm');const m={exports:{}};vm.runInNewContext(esbuild.buildSync({entryPoints:['src/engine.ts'],bundle:true,format:'cjs',platform:'node',write:false}).outputFiles[0].text,{module:m,exports:m.exports,Intl});const x=m.exports;
const p={...x.initialProfile,people:1,budget:1000,cuisine:'South Asian',minutes:60,days:[0,1,2,3,4],mealTypes:['breakfast','dinner']};
const recipe=(id,items)=>({id,name:id,mealAssemblyVersion:1,time:1,diet:'vegan',cuisine:'Emirati',mealTypes:['dinner'],appliances:['Hob'],reviewStatus:'preview',tags:[],image:0,items,steps:['Prepare','Cook']});
x.mergeRecipes([recipe('test-alias-a',[['onion',100]]),recipe('test-alias-b',[['kg-ec835cb0f4dd',150]])]);
let list=x.basket([{day:0,recipeId:'test-alias-a'},{day:1,recipeId:'test-alias-b'}],p,{onion:50});assert.equal(list.length,1);assert.equal(list[0].key,'onion');assert.equal(list[0].required,250);assert.equal(list[0].have,50);assert.equal(list[0].need,200);assert.equal(list[0].packs,1);assert.equal(list[0].cost,5);assert.equal(list[0].leftover,800);
list=x.basket([{day:0,recipeId:'test-alias-a'}],p,{'kg-ec835cb0f4dd':100});assert.equal(list[0].packs,0);assert.equal(list[0].cost,0);
const edited=x.setPantryAmount({onion:50,'kg-ec835cb0f4dd':20},'onion',60);assert.equal(edited.onion,60);assert(!Object.hasOwn(edited,'kg-ec835cb0f4dd'));assert.equal(x.normalizePantry(edited).onion,60);
assert(!x.compatible(x.recipes.find(r=>r.id==='test-alias-b'),{...p,dislikedIngredients:['onion']}));assert(x.pantryMatch(x.recipes.find(r=>r.id==='test-alias-b'),p,{onion:50}).includes('onion'));
assert.notEqual(x.canonicalIngredientId('rice'),x.canonicalIngredientId('kg-33687560eec7'),'Raw and cooked rice stay separate');assert.notEqual(x.canonicalIngredientId('emiratiGhee'),x.canonicalIngredientId('kg-a3c6797bbc38'),'Butter is not ghee');assert.notEqual(x.canonicalIngredientId('cumin'),x.canonicalIngredientId('kg-9820bd2fb262'),'Ground cumin is not cumin seeds');assert.notEqual(x.canonicalIngredientId('flour'),x.canonicalIngredientId('kg-0f406aa71475'),'Whole wheat is not all-purpose flour');
x.mergeRecipes([recipe('test-eggs',[['egg',1],['kg-da74d3783995',50]])]);list=x.basket([{day:0,recipeId:'test-eggs'}],p,{'kg-da74d3783995':50});assert.equal(list.length,1);assert.equal(list[0].required,2);assert.equal(list[0].have,1);assert.equal(list[0].packs,1);assert.equal(list[0].unit,'eggs');
for(const [amount,packs]of [[1000,1],[1000.0001,2],[999.9999,1],[.0000001,1]]){x.mergeRecipes([recipe('test-boundary',[['onion',amount]])]);list=x.basket([{day:0,recipeId:'test-boundary'}],p);assert.equal(list[0].packs,packs,'Pack boundary '+amount);assert(list[0].packs*list[0].pack>=list[0].need)}
x.mergeRecipes([recipe('test-decimal',[['onion',.1],['onion',.2]])]);assert.equal(x.basket([{day:0,recipeId:'test-decimal'}],p,{onion:.3})[0].packs,0);assert.equal(x.basket([{day:0,recipeId:'test-decimal',mode:'out'}],p).length,0);assert.equal(x.basket([{day:0,recipeId:'test-decimal',mode:'leftovers'}],p).length,0);
let history=[];for(let seed=0;seed<3;seed++){const plan=x.generateDayPlan(p,{},seed,{history});assert.equal(plan.length,10);assert(x.total(plan,p)<=p.budget);assert(plan.every(s=>x.recipes.find(r=>r.id===s.recipeId).cuisine==='South Asian'));history=x.recordMeals(history,plan)}
assert.throws(()=>x.generateDayPlan({...p,budget:1}),e=>e.code==='BUDGET_PLAN_NOT_FOUND');assert.throws(()=>x.generateDayPlan({...p,budget:NaN}));assert.throws(()=>x.generateDayPlan({...p,people:0}));
x.installCatalogue({testOnionKg:{name:'Onions',unit:'kg',pack:1,price:5,category:'Vegetables',kind:'plant'},testMilkL:{name:'Fresh milk',unit:'l',pack:1,price:7,category:'Chilled',kind:'dairy',allergen:'Milk'}},x.recipes);
x.mergeRecipes([recipe('test-units',[['testOnionKg',.25],['onion',50],['testMilkL',.5],['milk',100]])]);list=x.basket([{day:0,recipeId:'test-units'}],p,{onion:100,milk:200});assert.equal(list.length,2);assert.equal(list.find(i=>i.key==='onion').required,300);assert.equal(list.find(i=>i.key==='onion').need,200);assert.equal(list.find(i=>i.key==='milk').required,600);assert.equal(list.find(i=>i.key==='milk').need,400);
// Exhaustively compare a tiny catalogue against the bounded search: shared pack
// leftovers make whole-week costs non-additive, so per-serving scoring fails.
const custom={a:{name:'Fixture A',unit:'g',pack:100,price:7,category:'Pantry',kind:'plant'},b:{name:'Fixture B',unit:'g',pack:100,price:5,category:'Pantry',kind:'plant'},c:{name:'Fixture C',unit:'g',pack:100,price:3,category:'Pantry',kind:'plant'}};
const fixtures=[recipe('budget-A',[['a',30]]),recipe('budget-B',[['b',60]]),recipe('budget-C',[['c',40]])];x.installCatalogue(custom,fixtures);const q={...p,minutes:1,cuisine:'Emirati',days:[0,1,2],mealTypes:['dinner']};let cheapest=Infinity;for(const a of fixtures)for(const b of fixtures)for(const c of fixtures)if(new Set([a.id,b.id,c.id]).size===3)cheapest=Math.min(cheapest,x.total([{day:0,recipeId:a.id},{day:1,recipeId:b.id},{day:2,recipeId:c.id}],q));
for(const budget of [0,2,3,5,6,7,10,20]){if(budget<cheapest)assert.throws(()=>x.generateDayPlan({...q,budget}));else assert(x.total(x.generateDayPlan({...q,budget}),q)<=budget)}
assert.throws(()=>x.generateDayPlan({...q,budget:10}),e=>{
 assert.equal(e.code,'BUDGET_PLAN_NOT_FOUND');
 const shorter=e.alternative;
 assert.equal(shorter.days.length,2);
 assert.equal(shorter.plan.length,2);
 assert.equal(x.assertWithinBudget(shorter.plan,{...q,budget:10,days:shorter.days}),shorter.cost);
 return true;
});
const pantryPlan=x.generateDayPlan({...q,budget:0},{a:100,b:100,c:100});assert.equal(x.total(pantryPlan,q,{a:100,b:100,c:100}),0);
assert.throws(()=>x.assertWithinBudget([{day:0,recipeId:'budget-A'}],{...q,budget:1}));assert.throws(()=>x.assertWithinBudget([{day:0,recipeId:'missing'}],q));
console.log('PASS: canonical ingredients, alias dislikes, pantry migration/editing, egg units, pack boundaries, whole-pack budget, 3 weekly rebuilds, infeasible budgets, exhaustive tiny-catalogue comparison.');

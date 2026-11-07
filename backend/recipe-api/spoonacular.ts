/** Server-only evaluation adapter. Not exposed to public clients or enabled in the live planner. */
export type DiscoveryOptions={diet:'Any'|'Vegetarian'|'Vegan'|'Non-vegetarian'|'Pescatarian';minutes:number;exclude:string[];recentIds:number[]};
export async function discoverRecipes(options:DiscoveryOptions,key:string,fetcher:typeof fetch=fetch){
 if(!key)throw new Error('SPOONACULAR_API_KEY is not configured');
 if(!Number.isInteger(options.minutes)||options.minutes<1||options.minutes>240||options.exclude.length>30)throw new Error('Invalid discovery options');
 const url=new URL('https://api.spoonacular.com/recipes/complexSearch');
 const diet={'Any':'','Vegetarian':'vegetarian','Vegan':'vegan','Non-vegetarian':'','Pescatarian':'pescetarian'}[options.diet];
 if(diet===undefined)throw new Error('Unknown diet');
 url.searchParams.set('number','30');url.searchParams.set('type','main course');url.searchParams.set('maxReadyTime',String(options.minutes));url.searchParams.set('addRecipeInformation','true');url.searchParams.set('fillIngredients','true');url.searchParams.set('instructionsRequired','true');url.searchParams.set('sort','random');
 if(diet)url.searchParams.set('diet',diet);if(options.exclude.length)url.searchParams.set('excludeIngredients',options.exclude.join(','));
 const response=await fetcher(url,{headers:{'x-api-key':key},signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error(response.status===402||response.status===429?'Recipe provider quota reached':'Recipe provider unavailable');
 const data=await response.json();if(!Array.isArray(data.results))throw new Error('Invalid recipe provider response');
 const recent=new Set(options.recentIds);
 return data.results.filter((r:any)=>Number.isInteger(r.id)&&!recent.has(r.id)&&typeof r.title==='string'&&r.extendedIngredients?.length&&r.analyzedInstructions?.some((x:any)=>x.steps?.length)&&!(options.diet==='Non-vegetarian'&&r.vegetarian)).map((r:any)=>({provider:'spoonacular',id:r.id,title:r.title,image:r.image,sourceName:r.sourceName,sourceUrl:r.sourceUrl,license:r.license,servings:r.servings,minutes:r.readyInMinutes,ingredients:r.extendedIngredients,instructions:r.analyzedInstructions,vegetarian:r.vegetarian,vegan:r.vegan}));
}

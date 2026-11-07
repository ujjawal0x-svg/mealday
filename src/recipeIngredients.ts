import type {Recipe} from './engine';

export function recipeIngredients(recipe: Recipe) {
 const amounts = new Map<string, number>();
 for (const [key, amount] of recipe.items) {
  amounts.set(key, (amounts.get(key) ?? 0) + amount);
 }
 return [...amounts];
}

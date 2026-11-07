import type {basket} from './engine';

type Basket = ReturnType<typeof basket>;

export function groceryChanges(before: Basket, after: Basket) {
 const oldPacks = new Map(before.filter(item => item.packs > 0).map(item => [item.key, item]));
 const newPacks = new Map(after.filter(item => item.packs > 0).map(item => [item.key, item]));
 const added = [...newPacks.values()].filter(item => !oldPacks.has(item.key));
 const removed = [...oldPacks.values()].filter(item => !newPacks.has(item.key));
 const changed = [...newPacks.values()].filter(item => {
  const old = oldPacks.get(item.key);
  return old && (item.packs !== old.packs || item.pack !== old.pack || item.unit !== old.unit);
 });
 const keepChecked = [...newPacks.values()].filter(item => {
  const old = oldPacks.get(item.key);
  return old && item.unit === old.unit && item.pack === old.pack && item.packs <= old.packs;
 }).map(item => item.key);
 return {added, removed, changed, keepChecked};
}

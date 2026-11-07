import {ingredientName,ingredientUnit} from './ingredientLabels';

type GroceryPack={key:string;name:string;packs:number;pack:number;unit:string};

export function remainingGroceryPacks<T extends GroceryPack>(items:T[],checked:string[]){
 const bought=new Set(checked);
 return items.filter(item=>item.packs>0&&!bought.has(item.key));
}

export function formatGroceryHandoff(items:GroceryPack[]){
 return items.map(item=>`${ingredientName(item.name,item.key)}: ${item.packs} × ${item.pack} ${ingredientUnit(item.unit)}`).join('\n');
}

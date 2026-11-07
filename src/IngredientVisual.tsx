import React from 'react';
import atlas from './ingredientImages.json';
import photos from './ingredientPhotos.json';
const names:Record<string,number>=atlas.names;
export function ingredientImageIndex(name:string){return names[name.toLowerCase().trim()]}
export function IngredientVisual({name}:{name:string}){const photo=(photos as Record<string,string>)[name.toLowerCase().trim()];if(photo)return <img className="ingredient-visual" width="64" height="64" src={photo} alt="" decoding="async"/>;const n=ingredientImageIndex(name);if(n===undefined)return <span className="ingredient-visual ingredient-neutral" aria-hidden="true">▧</span>;const {size,columns,rows}=atlas;return <svg className="ingredient-visual" aria-hidden="true" focusable="false" width="64" height="64" viewBox={`${n%columns*size} ${Math.floor(n/columns)*size} ${size} ${size}`} style={{overflow:'hidden'}}><image href="/assets/ingredients-v2.webp" x="0" y="0" width={columns*size} height={rows*size}/></svg>}

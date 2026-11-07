const assert=require('node:assert/strict'),fs=require('node:fs'),esbuild=require('esbuild');
esbuild.buildSync({entryPoints:['src/engine.ts'],outfile:'/tmp/mealday-images-engine.cjs',bundle:true,platform:'node'});
const {stock,canonicalIngredients}=require('/tmp/mealday-images-engine.cjs');const atlas=require('../src/ingredientImages.json'),photos=require('../src/ingredientPhotos.json');
for(const i of [...Object.values(stock),...Object.values(canonicalIngredients())]){const n=atlas.names[i.name.toLowerCase().trim()];assert(Number.isInteger(n)&&n>=0&&n<atlas.columns*atlas.rows||photos[i.name.toLowerCase().trim()]&&fs.existsSync('dist'+photos[i.name.toLowerCase().trim()]),'Missing image: '+i.name)}
assert.notEqual(atlas.names['cabbage (patta gobi/ muttaikose)'],atlas.names['wheat flour']);
assert(fs.existsSync('dist/assets/ingredients-v2.webp'));
assert(fs.readFileSync('dist/index.html','utf8').includes('as="image" href="/assets/ingredients-v2.webp"'));
assert(!fs.readFileSync('src/IngredientVisual.tsx','utf8').includes('loading="lazy"'));
console.log('PASS: all source/canonical ingredients mapped, cabbage distinct, shared atlas preloaded without per-row lazy requests.');

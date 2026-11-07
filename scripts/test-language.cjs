const assert=require('node:assert/strict'),esbuild=require('esbuild');
const saved=new Map();global.localStorage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)};global.document={documentElement:{lang:'en',dir:'ltr'}};
esbuild.buildSync({entryPoints:['src/i18n.ts'],outfile:'/tmp/mealday-i18n.cjs',bundle:true,platform:'node',format:'cjs'});
let i18n=require('/tmp/mealday-i18n.cjs');assert.equal(i18n.t('Shopping'),'Shopping');
i18n.setLanguage('hi');assert.equal(i18n.t('Shopping'),'खरीदारी');assert.equal(document.documentElement.dir,'ltr');assert.equal(saved.get('mealday.language'),'hi');
i18n.setLanguage('ar');assert.equal(i18n.t('Shopping'),'التسوق');assert.equal(document.documentElement.dir,'rtl');assert.equal(document.documentElement.lang,'ar');assert.equal(i18n.t('Carrefour'),'Carrefour');assert.equal(i18n.t('Ujjawal'),'Ujjawal');assert.equal(i18n.t('20 minutes or less'),'20 دقيقة أو أقل');
for(const label of ['My week','Saved','Shopping','Settings','Breakfast','Lunch','Dinner','Choose this meal','Language']){assert.notEqual(i18n.t(label,'hi'),label);assert.notEqual(i18n.t(label,'ar'),label)}
delete require.cache[require.resolve('/tmp/mealday-i18n.cjs')];i18n=require('/tmp/mealday-i18n.cjs');assert.equal(i18n.t('Settings'),'الإعدادات');i18n.setLanguage('en');assert.equal(document.documentElement.dir,'ltr');assert.equal(i18n.t('Settings'),'Settings');
console.log('PASS: English/Hindi/Arabic labels, persisted selection, RTL reversal, unknown names preserved and reload.');

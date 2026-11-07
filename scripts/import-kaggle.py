"""Reproducible, fail-closed import of pinned Kaggle v1 files. No scraping.
Usage: python scripts/import-kaggle.py /tmp/indian.csv /tmp/kaggle-recipes.csv /tmp/recipes.zip
Dataset licence is uploader-declared CC0; original publisher provenance retained.
"""
import csv,json,re,sys,hashlib,zipfile,collections,os,unicodedata
from fractions import Fraction
from PIL import Image
from io import BytesIO
norm=lambda s: re.sub('[^a-z0-9]','',s.lower())
base=list(csv.DictReader(open(sys.argv[1],encoding='utf-8-sig')))
photos={norm(r['name']):r for r in csv.DictReader(open(sys.argv[2],encoding='utf-8-sig'))}
z=zipfile.ZipFile(sys.argv[3]); names=z.namelist()
# Ingredient aliases are explicit. Unknown ingredients fail closed, never dropped.
aliases={
'rice':r'^(basmati rice|rice|brown rice|raw rice|cooked rice|sona masuri rice)',
'poha':r'^(poha|flattened rice|rice flakes|aval)', 'besan':r'^(gram flour|besan|chickpea flour)',
'flour':r'^(whole wheat flour|wheat flour|atta|all purpose flour|all-purpose flour|maida)',
'semolina':r'^(sooji|rava|semolina)', 'semolinaRice':r'^(rice flour)',
'moong':r'^(yellow moong dal|green moong dal|whole green moong|moong dal|split moong|green gram)',
'lentils':r'^(masoor dal|red lentils)', 'chickpeas':r'^(kabuli chana|chickpeas|chana|garbanzo)',
'oats':r'^(rolled oats|instant oats|oats)', 'vermicelli':r'^(semiya|vermicelli)',
'potato':r'^(potato|aloo|baby potato)', 'tomato':r'^(tomato)', 'onion':r'^(onion|spring onion|shallot)',
'carrot':r'^(carrot|gajar)', 'cucumber':r'^(cucumber)', 'pepper':r'^(capsicum|green bell pepper|red bell pepper|yellow bell pepper|bell pepper)',
'spinach':r'^(spinach|palak)', 'peas':r'^(green peas|peas|matar)', 'eggplant':r'^(brinjal|eggplant|aubergine)',
'zucchini':r'^(zucchini)', 'coriander':r'^(coriander \(dhania\) leaves|coriander leaves|cilantro)',
'ginger':r'^(ginger)', 'garlic':r'^(garlic)', 'lemon':r'^(lemon juice|lemon|lime juice)',
'milk':r'^(milk|low fat milk)', 'yogurt':r'^(curd|yogurt|hung curd|greek yogurt)', 'paneer':r'^(paneer)',
'butter':r'^(butter|ghee)', 'oil':r'^(oil|sunflower oil|extra virgin olive oil|olive oil|coconut oil|sesame.*oil|mustard oil)',
'egg':r'^(whole eggs|eggs|egg whites|egg)',
'cumin':r'^(cumin|jeera)', 'turmeric':r'^(turmeric|haldi)', 'garam':r'^(garam masala)',
'cardamom':r'^(cardamom|elaichi)', 'sugar':r'^(sugar|jaggery|brown sugar)', 'salt':r'^(salt|rock salt|black salt)',
'blackpepper':r'^(black pepper|whole black pepper|pepper powder)',
}
# Preserve ingredient identity (e.g. mustard vs olive oil, flour types). Existing
# stock supplies only packaging and estimate anchors, not identity replacement.
extras={
'chilli':r'^(red chilli powder|kashmiri.*chilli powder|green chillies|green chilli|dry red chillies|red chillies)',
'mustardseed':r'^(mustard seeds)', 'curryleaves':r'^(curry leaves)', 'hing':r'^(asafoetida)',
'urad':r'^(white urad dal|urad dal|black urad dal)', 'chanaDal':r'^(chana dal|bengal gram dal)',
'corianderpowder':r'^(coriander powder)', 'coconut':r'^(fresh coconut|coconut|dessicated coconut|desiccated coconut)',
'peanut':r'^(raw peanuts|peanuts|roasted peanuts)', 'cashew':r'^(cashew nuts|cashews)',
'cinnamon':r'^(cinnamon)', 'cloves':r'^(cloves|clove)', 'bayleaf':r'^(bay leaf|bay leaves)',
'fennel':r'^(fennel seeds)', 'fenugreek':r'^(methi|fenugreek)', 'tamarind':r'^(tamarind)',
'bakingpowder':r'^(baking powder)', 'bakingSoda':r'^(baking soda)', 'cuminseed':r'^(ajwain|carom seeds)',
'water':r'^(water|hot water|warm water)', 'amchur':r'^(amchur|dry mango powder)',
}
# Order: chana dal before chana; green chilli oil not mapped to plain oil, etc.
extras.update({
'mushroom':r'^(button mushrooms|mushrooms)', 'cauliflower':r'^(cauliflower|gobi)',
'okra':r'^(bhindi|okra|ladies finger)', 'cabbage':r'^(cabbage)', 'jowar':r'^(jowar flour|sorghum flour)',
'ragi':r'^(ragi flour|finger millet flour)', 'mint':r'^(mint leaves|pudina)',
'kasurimethi':r'^(kasuri methi)', 'bottlegourd':r'^(bottle gourd|lauki)', 'ridgegourd':r'^(ridge gourd)',
'radish':r'^(mooli|radish)', 'tomatopuree':r'^(homemade tomato puree|tomato puree)',
'sesame':r'^(sesame seeds|til seeds)', 'tofu':r'^(tofu)', 'dill':r'^(dill leaves|dill)',
'toordal':r'^(arhar dal|toor dal|toor dal|pigeon pea)', 'saffron':r'^(saffron strands)',
'bread':r'^(whole wheat brown bread|bread slices|whole wheat bread|brown bread)',
'soya':r'^(soy chunks|soya chunks)', 'greenbeans':r'^(green beans|french beans|green string beans)',
'sprouts':r'^(green moong sprouts|bean sprouts)', 'parwal':r'^(parwal)', 'quinoa':r'^(quinoa)',
'drycoriander':r'^(coriander \(dhania\) seeds|coriander seeds)',
'mustardseed':r'^(mustard seeds|mustard$)', 'chilli':r'^(red chilli powder|red chili powder|green chili|kashmiri.*chilli powder|green chillies|green chilli|dry red chillies|dry red chilli|red chillies)',
'eggplant':r'^(small brinjal|brinjal|eggplant|aubergine)',
})
patterns=list(extras.items())+list(aliases.items())
rejected=collections.Counter(); accepted=[]; stock={}; fingerprints=set()
allowed={r['Cuisine'] for r in base if any(k in r['Cuisine'].lower() for k in ['indian','bengal','maharash','kerala','tamil','karnataka','rajasthan','andhra','gujarat','goan','punjab','chettinad','kashmir','mangalor','parsi','awadh','oriya','sindhi','konkan','mughlai','bihar','hyderabad','assam','himachal','udupi','coorg','uttar','lucknow','malabar','malvani','pakistan','sri lanka','nepal','haryana','kongunadu','jharkhand','nagaland'])}
for row in base:
 title=row['TranslatedRecipeName'].strip(); key=norm(title); photo=photos.get(key)
 reason=None
 if row['Cuisine'] not in allowed: reason='not_strict_south_asian'
 elif re.search(r'persian|khoresht|italian|mexican|greek|thai|chinese|mediterranean|hummus|falafel|pizza|shawarma|spaghetti',title,re.I): reason='conflicting_cuisine_name'
 elif re.search(r'chutney|pachadi|raita|rasam',title,re.I): reason='condiment_not_a_full_meal'
 elif row['Course'] not in ['Lunch','Dinner','Main Course','One Pot Dish','South Indian Breakfast','North Indian Breakfast','Indian Breakfast']: reason='not_a_planned_main_meal'
 elif not photo: reason='no_exact_recipe_photo_join'
 elif key in fingerprints: reason='duplicate'
 if reason: rejected[reason]+=1;continue
 try: servings=float(row['Servings']); minutes=int(row['TotalTimeInMins'])
 except: rejected['invalid_time_servings']+=1;continue
 if not(1<=servings<=20 and 1<=minutes<=120): rejected['invalid_time_servings']+=1;continue
 raw=row['TranslatedIngredients']; method=row['TranslatedInstructions'].replace('\\xa0',' ')
 if re.search(r'pressure cook|blender|mixer|oven|bake |deep.fry|deep fry|food processor|steamer|steam|ferment|overnight',method,re.I): rejected['unsupported_equipment']+=1;continue
 if re.search(r'pork|bacon|ham\b|wine|alcohol|beer|rum\b|gelatin|chicken|mutton|fish|prawn|beef|lamb|sausage',raw,re.I): rejected['meat_halal_or_alcohol_review']+=1;continue
 items=[]; recipeStock={}; notes=[]; failed=False
 for line in raw.split(','):
  line=line.strip()
  if not line: continue
  # Source hyphen notes do not introduce ingredients.
  text=re.sub(r'^([\d]+)[ -]+(\d+/\d+)',lambda m:str(float(m[1])+float(Fraction(m[2]))),line)
  m=re.match(r'^(\d+(?:\.\d+)?(?:/\d+)?)\s*',text)
  amount=float(Fraction(m[1])) if m else None
  rest=text[m.end():].strip() if m else text
  if amount is not None:
   u=re.match(r'^(tablespoons?|teaspoons?|cups?|grams?|kgs?|kilograms?|ml|litres?|liters?|inches?|inch|sprigs?|cloves?|pinch|pinches|handfuls?)\b\s*',rest,re.I)
   unit=u[1].lower() if u else 'pieces'; ingredient=rest[u.end():].strip() if u else rest
   if unit in ['clove','cloves'] and ingredient.startswith('(Laung)'): ingredient='Cloves';unit='pieces'
  else: unit='g';ingredient=rest
  ingredient=ingredient.split(' - ')[0].strip()
  if ingredient.lower() in ['for tempering','for garnishing']: continue
  match=next((k for k,p in patterns if re.search(p,ingredient,re.I)),None)
  if not match: failed=True;break
  if amount is None:
   if match not in ['salt','oil','water','hing']: failed=True;break
   amount={'salt':2,'oil':10,'water':250,'hing':.25}[match]; notes.append('Source “to taste/as needed” '+ingredient+' standardized to '+str(amount)+' g/ml for the source batch.')
  isliquid=match in ['oil','milk','water']; finalunit='ml' if isliquid else 'g'
  if unit.startswith('tea'): amount*=5 if isliquid else 3
  elif unit.startswith('table'): amount*=15 if isliquid else 9
  elif unit.startswith('cup'): amount*=240 if isliquid or match=='yogurt' else 180 if match in ['rice','poha','moong','lentils','chickpeas','urad','chanaDal'] else 120
  elif unit in ['kg','kgs','kilogram','kilograms']:amount*=1000
  elif unit.startswith(('litre','liter')):amount*=1000
  elif unit in ['pieces','clove','cloves','inch','inches','sprig','sprigs','handful','handfuls','pinch','pinches']:
   weights={'potato':150,'tomato':100,'onion':100,'carrot':80,'cucumber':200,'pepper':120,'egg':50,'ginger':5,'garlic':3,'lemon':30,'chilli':5,'coriander':2,'curryleaves':.3,'bayleaf':.2,'cloves':.2,'cardamom':.3,'cinnamon':2,'hing':.2,'fenugreek':1,'cauliflower':500,'cabbage':500,'bottlegourd':500,'ridgegourd':200,'radish':120,'okra':15,'eggplant':150,'mushroom':20,'parwal':30,'greenbeans':5,'mint':2,'dill':2,'kasurimethi':.2,'saffron':.01,'bread':30}
   if match not in weights:failed=True;break
   amount*=weights[match]
  elif unit not in ['g','gram','grams','ml']: failed=True;break
  if match=='water':continue # potable cooking water is not a grocery purchase
  if not 0<amount/servings<1500:failed=True;break
  iid='kg-'+hashlib.sha256((ingredient.lower()+finalunit).encode()).hexdigest()[:12]
  allergens=[]
  if match in ['flour','semolina','vermicelli','hing']:allergens+=['Gluten']
  if match in ['milk','yogurt','paneer','butter']:allergens+=['Milk']
  if match=='egg':allergens+=['Egg']
  if match=='peanut':allergens+=['Peanuts']
  if match=='cashew':allergens+=['Tree nuts']
  if match in ['tofu','soya']:allergens+=['Soy']
  if match=='sesame':allergens+=['Sesame']
  if match=='bread':allergens+=['Gluten','Milk','Egg']
  if match=='oats':allergens+=['Gluten']
  if 'sesame' in ingredient.lower():allergens+=['Sesame']
  if 'mustard' in ingredient.lower():allergens+=['Mustard']
  category='Chilled' if match in ['milk','yogurt','paneer','butter','egg'] else 'Vegetables' if match in ['potato','tomato','onion','carrot','cucumber','pepper','spinach','zucchini','eggplant','ginger','garlic','coriander','curryleaves','chilli','mushroom','cauliflower','okra','cabbage','mint','bottlegourd','ridgegourd','radish','dill','greenbeans','sprouts','parwal'] else 'Pantry'
  pack=1000 if match in ['rice','flour','sugar','salt','milk'] else 50 if match in ['hing','cloves','cardamom','bayleaf','cinnamon'] else 100 if category=='Pantry' and match not in ['poha','moong','lentils','chickpeas','oats','vermicelli','semolina','urad','chanaDal'] else 500
  price=7 if pack>=500 else 5 # Illustrative pack-price anchor only, never retailer quote.
  recipeStock[iid]={'name':ingredient,'unit':finalunit,'pack':pack,'price':price,'category':category,'allergens':allergens,'kind':'egg' if match=='egg' else 'dairy' if match in ['milk','yogurt','paneer','butter'] else 'plant'}
  items.append([iid,round(amount/servings,4)])
 if failed or len(items)<2: rejected['unmapped_or_ambiguous_ingredient']+=1;continue
 # Merge repeated ingredients without silently dropping quantities.
 merged={}
 for k,n in items:merged[k]=merged.get(k,0)+n
 items=list(merged.items()); allergens={a for v in recipeStock.values() for a in v['allergens']}
 rid='kaggle-'+row['Srno']; path=photo['image_url'].rsplit('/',1)[-1]
 imagefile=next((n for n in names if n.rsplit('/',1)[-1].split('.',1)[-1]==path),None)
 if not imagefile:rejected['missing_image_file']+=1;continue
 recipe={'id':rid,'name':title,'time':minutes,'appliances':['Hob'],'diet':'vegetarian' if allergens&{'Egg','Milk'} else 'vegan','tags':['South Asian','Kaggle'],'cuisine':'South Asian','mealTypes':['breakfast'] if 'Breakfast' in row['Course'] else ['lunch','dinner'],'image':0,'imageUrl':'/assets/recipes/'+rid+'.webp','sourceName':"Archana’s Kitchen · Kaggle dataset",'sourceUrl':row['URL'].replace('http://www.archanaskitchen.com/','https://www.archanaskitchen.com/'),'reviewStatus':'imported','authorship':'Imported recipe; household-measure conversions are estimates, not cooking-tested.','items':items,'steps':[s.strip() for s in re.split(r'(?<=[.!?])\s+(?=[A-Z])',method) if s.strip()],'sourceServings':servings,'originalIngredients':raw,'quantityNotes':notes+['Household measures converted to estimated g/ml; grocery pack prices are illustrative.'],'datasetRef':'sukhmandeepsinghbrar/indian-food-dataset','imageDatasetRef':'kishanpahadiya/indian-food-and-its-recipes-dataset-with-images','imageOriginalUrl':photo['image_url'],'sourceCuisine':row['Cuisine'],'licence':'CC0 (Kaggle uploader declaration; original publisher attribution retained)'}
 stock.update(recipeStock); accepted.append((recipe,imagefile));fingerprints.add(key)
# Keep catalogue balanced across breakfast and mains; deterministic cap and order.
selected=[]
for breakfast in [True,False]:selected += [v for v in accepted if ('breakfast' in v[0]['mealTypes'])==breakfast][:150]
os.makedirs('dist/assets/recipes',exist_ok=True)
for r,n in selected:
 im=Image.open(BytesIO(z.read(n))).convert('RGB');im.thumbnail((640,480));im.save('dist'+r['imageUrl'],'WEBP',quality=76)
used={k for r,_ in selected for k,n in r['items']};stock={k:v for k,v in stock.items() if k in used}
output={'ingredients':stock,'recipes':[r for r,_ in selected]}
open('data/kaggle-catalogue.json','w').write(json.dumps(output,ensure_ascii=False,separators=(',',':')))
report={'sourceRows':len(base),'photoRows':len(photos),'eligibleBeforeCap':len(accepted),'imported':len(selected),'breakfast':sum('breakfast' in r['mealTypes'] for r,n in selected),'mains':sum('dinner' in r['mealTypes'] for r,n in selected),'rejected':dict(rejected),'files':{p:hashlib.sha256(open(p,'rb').read()).hexdigest() for p in sys.argv[1:3]},'sources':['https://www.kaggle.com/datasets/sukhmandeepsinghbrar/indian-food-dataset','https://www.kaggle.com/datasets/kishanpahadiya/indian-food-and-its-recipes-dataset-with-images'],'versions':[1,1],'licence':'Kaggle uploader-declared CC0; scraped original publisher Archana’s Kitchen; no independent photo ownership verification','emiratiRows':0}
open('data/kaggle-import-report.json','w').write(json.dumps(report,indent=2));print(json.dumps(report,indent=2))

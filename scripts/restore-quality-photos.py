import json,hashlib
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
source=Path('/workspace/scratch/d6ed72cad3f6/restored-food-images')
text='''coverage-em-dango-pepper|Warm chickpea pepper pan with regag.png
coverage-ar-chickpea-pepper|Home-style pepper chickpea couscous.png
coverage-ar-chickpea-potato|Cumin Potato Chickpea Supper.png
coverage-ar-chickpea-spinach|Spinach Chickpea Breakfast with Pita.png
coverage-ar-cold-0|Cucumber tomato chickpea pita salad.png
coverage-ar-cold-1|Carrot pepper ful with pita.png
coverage-ar-cold-2|Pepper Chickpea Lemon Pita Salad.png
coverage-ar-cold-3|Tomato Cucumber Ful Salad with Pita.png
coverage-ar-cold-4|Carrot tomato chickpea pita salad.png
coverage-ar-cold-5|Pepper Tomato Ful With Arabic Pita.png
coverage-ar-cold-6|Crunchy chickpea carrot pita salad.png
coverage-ar-fava-spinach|Spinach Fava Rice Skillet.png
coverage-ar-ful-carrot|Warm Carrot Ful Toast.png
coverage-ar-ful-pepper|Cumin pepper ful breakfast with pita.png
coverage-ar-lentil-carrot|Carrot lentil pita plate.png
coverage-ar-lentil-courgette|Courgette lentil bulgur bowl.png
coverage-ar-lentil-oat|Savoury lentil bowl with pita.png
coverage-ar-protein-0|Chicken tomato breakfast pita.png
coverage-ar-protein-1|Spinach Chicken Pita Plate.png
coverage-ar-protein-2|Cumin beef pepper toast with pita.png
coverage-ar-protein-3|Potato mince pita hash with Arabic bread.png
coverage-ar-protein-4|Home-Style Fish Courgette Pita Plate.png
coverage-ar-protein-5|Tuna chickpea breakfast toast with pita.png
coverage-ar-protein-6|Home-Style Carrot Chicken Cumin Pita.png
coverage-ar-tomato-fava|Home-Style Tomato Fava Bulgur Pot.png
coverage-desi-chana-pepper|Pepper Chana Breakfast Toast.png
coverage-desi-cold-0|Chickpea kachumber salad with bread.png
coverage-desi-cold-1|Cumin fava kachumber toast.png
coverage-desi-cold-2|Pepper chana chaat with bread.png
coverage-desi-cold-3|Tomato fava chaat with bread.png
coverage-desi-cold-4|Vegan carrot chana chaat toast.png
coverage-desi-cold-5|Pepper Tomato Fava Masala Toast.png
coverage-desi-cold-6|Cucumber carrot chickpea salad with bread.png
coverage-desi-lentil-tomato|Tomato Dal Breakfast Bowl with Bread.png
coverage-desi-protein-0|Chicken tomato masala toast.png
coverage-desi-protein-1|Palak chicken breakfast toast.png
coverage-desi-protein-2|Beef Pepper Masala Toast.png
coverage-desi-protein-3|Keema aloo breakfast toast.png
coverage-desi-protein-4|Fish courgette masala toast.png
coverage-desi-protein-5|Tuna Chana Breakfast Toast.png
coverage-desi-protein-6|Carrot Chicken Bhuna Toast.png
coverage-desi-spinach-oats|Home-style palak masala oats.png
coverage-em-bajella-pepper|Vegan Pepper Bajella Rice Plate.png
coverage-em-bajella-potato|Potato Bajella Breakfast Pan with Regag Bread.png
coverage-em-bajella-spinach|Bajella spinach with regag bread.png
coverage-em-carrot-lentil|Carrot Lentil Regag Supper.png
coverage-em-cold-0|Cucumber Tomato Chickpea Regag Plate.png
coverage-em-cold-1|Carrot Pepper Bajella Regag Salad.png
coverage-em-cold-2|Cold Chickpea Pepper Regag Plate.png
coverage-em-cold-3|Bajella, Tomato and Cucumber Plate.png
coverage-em-cold-4|Carrot Tomato Chickpea Salad Plate.png
coverage-em-cold-5|Pepper tomato bajella regag plate.png
coverage-em-cold-6|Crunchy Chickpea Cucumber-Carrot Regag Salad.png
coverage-em-courgette-dango|Loomi Courgette Dango Rice.png
coverage-em-dango-carrot|Carrot dango with regag bread.png
coverage-em-lentil-spinach|Loomi spinach lentils with basmati rice.png
coverage-em-potato-dango|Potato Dango Regag Bowl.png
coverage-em-protein-0|Loomi chicken tomato regag.png
coverage-em-protein-1|Homestyle Spinach Chicken Regag Skillet.png
coverage-em-protein-2|Home-style beef pepper regag plate.png
coverage-em-protein-3|Beef potato breakfast hash with regag bread.png
coverage-em-protein-4|Loomi fish with courgette and regag.png
coverage-em-protein-5|Home-Style Tuna Dango Breakfast Plate.png
coverage-em-protein-6|Home-Style Carrot Chicken Regag Bowl.png
coverage-em-savoury-oats|Savoury loomi oats with tomato.png
coverage-em-tomato-fava|Tomato fava loomi stew with regag bread.png
quality-masoor-rice|Masoor Dal with Rice and Cucumber.png
quality-moong-roti|Moong Dal Tadka with Roti.png
quality-rajma-rice|Rajma Curry Rice Bowl with Cucumber.png
quality-aloo-matar-chana|Home-style aloo matar chana with roti.png
quality-palak-paneer|Palak paneer with roti and cucumber.png
quality-pithla|Besan Pithla with Roti and Cucumber.png
quality-soya-keema|Soya keema, roti, and cucumber.png
quality-mushroom-chana|Mushroom chana masala with cucumber.png
quality-sambar-rice|Red Lentil Sambar Soup with Basmati Rice.png
quality-paneer-bhurji|Paneer bhurji roti plate with cucumber.png
quality-dalia-moong|Golden bulgur and moong dal bowl.png
quality-curd-rice-sundal|Curd Rice with Chana Sundal.png
quality-aubergine-besan|Aubergine Besan Skillet with Roti.png
quality-poha-chana|Lemony chickpea poha bowl.png
quality-mujadara|Mujadara-Style Lentil Rice with Cucumber.png
quality-musabbaha|Warm Musabbaha with Pita and Cucumber.png
quality-lentil-tabbouleh|Lentil tabbouleh with pita bread.png
quality-fasolia|White Bean Tomato Rice Bowl with Cucumber.png
quality-bamya|Okra chickpea stew with basmati rice.png
quality-batata-hummus|Batata Harra with Rustic Hummus.png
quality-whitebean-couscous|Vegan couscous with beans and peppers.png
quality-chickpea-fatteh|Layered Chickpea Yogurt Fatteh.png
quality-vegetable-thareed|Vegan Emirati thareed bowl.png
quality-vegetable-machboos|Golden Vegan Machboos on Ivory Plate.png
quality-eggless-chebab|Eggless saffron pancakes with dates.png
quality-khabeesa-yogurt|Cardamom Khabeesa with Yogurt and Dates.png'''
associations=dict(line.split('|',1) for line in text.splitlines())
assert len(associations)==92
out=root/'dist/assets/recipe-quality';out.mkdir(parents=True,exist_ok=True)
photoMap=json.loads((root/'data/recipe-photo-map.json').read_text());manifest=[]
for id,name in associations.items():
 p=source/name
 assert p.is_file(),name
 im=Image.open(p).convert('RGB');im.thumbnail((960,960));im.save(out/(id+'.webp'),'WEBP',quality=82,method=6);thumb=im.copy();thumb.thumbnail((320,320));thumb.save(out/(id+'-thumb.webp'),'WEBP',quality=78,method=6)
 photoMap[id]='/assets/recipe-quality/'+id+'.webp'
 manifest.append(dict(id=id,url=photoMap[id],thumbnail=photoMap[id].replace('.webp','-thumb.webp'),generated=True,illustrative=True,sourceName=name,bytes=(out/(id+'.webp')).stat().st_size,thumbnailBytes=(out/(id+'-thumb.webp')).stat().st_size))
(root/'data/recipe-photo-map.json').write_text(json.dumps(photoMap,indent=2));(root/'data/quality-photo-manifest.json').write_text(json.dumps(manifest,indent=2))
print('Restored, compressed and mapped',len(manifest),'distinct recipe photos')

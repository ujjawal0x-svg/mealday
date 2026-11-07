import type {Ingredient,Recipe} from './engine';
// Original Mealday methods and quantities. Linked references establish cultural
// context, not endorsement, permission to copy, or kitchen testing.
export const emiratiStock:Record<string,Ingredient>={
 emiratiWheat:{name:'Hulled whole wheat for harees',unit:'g',pack:1000,price:12,category:'Pantry',allergen:'Gluten',kind:'plant'},
 emiratiLamb:{name:'Halal-labelled boneless lamb shoulder',unit:'g',pack:500,price:32,category:'Chilled',kind:'meat'},
 emiratiGhee:{name:'Ghee (clarified butter)',unit:'g',pack:400,price:22,category:'Chilled',allergen:'Milk',kind:'dairy'},
 emiratiSaffron:{name:'Saffron threads',unit:'g',pack:1,price:18,category:'Pantry',kind:'plant'},
 emiratiCinnamon:{name:'Ground cinnamon',unit:'g',pack:50,price:6,category:'Pantry',kind:'plant'},
 emiratiDibs:{name:'Pure date syrup (dibs)',unit:'g',pack:400,price:14,category:'Pantry',kind:'plant'},
 emiratiGarlic:{name:'Fresh garlic',unit:'g',pack:200,price:4,category:'Vegetables',kind:'plant'},
 emiratiSalt:{name:'Fine salt',unit:'g',pack:500,price:3,category:'Pantry',kind:'plant'},
 emiratiPepper:{name:'Ground black pepper',unit:'g',pack:50,price:6,category:'Pantry',kind:'plant'},
 emiratiChilli:{name:'Green chilli',unit:'g',pack:100,price:3,category:'Vegetables',kind:'plant'}
};
const refs={
 breakfast:'https://www.visitdubai.com/en/restaurants/al-khayma-heritage-restaurant',
 beans:'https://www.alfanarrestaurant.com/blog/emirati-breakfast-in-dubai-what-to-order',
 rigag:'https://abudhabiculture.ae/en/cultural-heritage/intangible/heritage-register/social-practices/rigag',
 fish:'https://u.ae/en/about-the-uae/culture/food',
 machboos:'https://visitabudhabi.ae/en/plan-your-trip/culture-and-traditions/emirati-cuisine/',
 thareed:'https://www.zu.ac.ae/main/files/contents/ccms/docs/emirates101_handbook.pdf'
};
type Dish={slug:string;name:string;time:number;diet:Recipe['diet'];mealTypes:string[];items:Recipe['items'];steps:string[];reference:keyof typeof refs;notes?:string[]};
function dish(d:Dish):Recipe{return {id:'emirati-'+d.slug,name:d.name,time:d.time,diet:d.diet,cuisine:'Emirati',mealTypes:d.mealTypes,appliances:['Hob'],tags:['Emirati',d.time>60?'Plan ahead':d.mealTypes.includes('breakfast')?'Breakfast':'Home-style'],image:2,photoStatus:'missing',reviewStatus:'preview',authorship:'Original Mealday home-style adaptation; estimated quantities and timing; not chef-tested. Cultural reference is not the source of this method.',sourceName:'Cultural reference · method by Mealday',sourceUrl:refs[d.reference],quantityNotes:['All listed quantities are per person. Water is specified in the method and is not a grocery purchase. Grocery pack sizes and AED prices are illustrative estimates.',...(d.notes||[])],items:d.items,steps:d.steps}}
export const emiratiCollection:Recipe[]=[
 dish({slug:'dango',name:'Dango with regag',time:15,diet:'vegan',mealTypes:['breakfast','lunch'],reference:'breakfast',items:[['chickpeas',180],['regag',1],['loomi',.25],['cumin',.5],['emiratiChilli',2],['emiratiSalt',.5]],steps:[
 'Use canned, fully cooked chickpeas. Drain and rinse. Wash the chilli and pierce the dried lime.',
 'Put chickpeas, dried lime, chilli and cumin in a saucepan with 150 ml drinking water per person. Simmer gently for 8–10 minutes.',
 'Remove the dried lime and chilli. Stir in the measured salt; retain a little broth rather than drying the beans out.',
 'Warm ready-made regag following its packet. Serve beside the hot chickpeas. This canned-chickpea method is a weekday shortcut.'
 ]}),
 dish({slug:'bajella',name:'Bajella with regag',time:15,diet:'vegan',mealTypes:['breakfast','lunch'],reference:'beans',items:[['fava',180],['regag',1],['cumin',.5],['emiratiSalt',.5],['lemon',.25]],steps:[
 'Use canned, fully cooked broad beans. Drain and rinse them; this recipe does not use uncooked dried beans.',
 'Add beans to a small saucepan with 120 ml drinking water per person and cumin. Simmer for 8–10 minutes until hot throughout.',
 'Add the measured salt and a squeeze of lemon, leaving some warm broth in the bowl.',
 'Warm ready-made regag as directed on its packet and serve with the beans. This is a quick home adaptation of the breakfast dish.'
 ]}),
 dish({slug:'beid-tomat',name:'Beid wa tomat with regag',time:20,diet:'vegetarian',mealTypes:['breakfast'],reference:'breakfast',items:[['egg',2],['tomato',150],['onion',30],['oil',5],['emiratiSalt',.5],['emiratiPepper',.2],['regag',1]],steps:[
 'Wash the tomato and dice it finely. Peel and finely chop the onion. Beat the eggs in a separate bowl.',
 'Warm oil in a frying pan over medium heat. Cook onion for 4–5 minutes, then add tomato and cook for another 6–8 minutes until soft.',
 'Add eggs, measured salt and pepper. Stir gently over the heat until the eggs are fully set with no liquid egg remaining.',
 'Warm ready-made regag following its packet and serve immediately with the eggs.'
 ]}),
 dish({slug:'fresh-rigag',name:'Fresh rigag with labneh',time:30,diet:'vegetarian',mealTypes:['breakfast'],reference:'rigag',items:[['flour',65],['emiratiSalt',.5],['labneh',60],['cucumber',80]],notes:['Uses a wide non-stick pan and a heat-safe spatula. A home-pan version, not a claim to reproduce specialist bakery technique.'],steps:[
 'Whisk whole-wheat flour and measured salt with about 110 ml drinking water per person. Add water a spoonful at a time to make a very thin, spreadable batter; rest for 10 minutes.',
 'Heat a wide, dry non-stick pan over medium-high heat. Spread a small amount of batter very thinly with a heat-safe spatula. Keep hands clear of the hot pan.',
 'Cook until the surface is dry, the edges lift and no wet flour remains; turn briefly if needed to cook through. Repeat with the remaining batter, adjusting heat if the bread scorches.',
 'Wash and slice cucumber. Serve warm rigag with cold labneh and cucumber. Keep labneh chilled until serving.'
 ]}),
 dish({slug:'fish-machboos',name:'Fish machboos — home-style',time:40,diet:'fish',mealTypes:['lunch','dinner'],reference:'machboos',items:[['fishfillet',170],['rice',70],['tomato',100],['onion',45],['emiratiGarlic',4],['bzar',2],['loomi',.5],['turmeric',.4],['oil',7],['emiratiSalt',.6]],steps:[
 'Rinse rice. Check boneless white fish carefully for bones and cut into thick portions. Keep raw fish and its utensils separate from vegetables. Dice tomato and onion; crush garlic and pierce dried lime.',
 'Heat half the oil in a wide saucepan. Cook onion for 5 minutes, add garlic, tomato, bzar and turmeric, then soften for another 5 minutes.',
 'Stir in rice, dried lime and measured salt. Add the rice packet’s measured amount of water, allowing for the tomato liquid. Cover and simmer as directed until rice is tender; rest covered for 5 minutes.',
 'Meanwhile, pan-cook fish in the remaining oil, turning carefully, until the thickest part reaches 63°C and the flesh flakes. Timing depends on thickness.',
 'Remove the dried lime. Serve the fish over the spiced rice. The separate fish pan is a practical home adaptation.'
 ]}),
 dish({slug:'chicken-margouga',name:'Chicken margouga — home-style',time:55,diet:'meat',mealTypes:['lunch','dinner'],reference:'machboos',items:[['chicken',160],['flour',50],['potato',80],['zucchini',80],['tomato',120],['onion',40],['emiratiGarlic',4],['bzar',2],['loomi',.25],['oil',6],['emiratiSalt',.6]],steps:[
 'Mix flour with about 30 ml drinking water per person to make a soft dough. Knead briefly, cover and rest while preparing the stew.',
 'Cut halal-labelled chicken into small pieces on separate equipment. Dice washed vegetables, chop onion and garlic, and pierce the dried lime.',
 'Soften onion in oil for 5 minutes. Add garlic, bzar and tomato; cook for another 4 minutes. Add chicken, potato, courgette, lime, measured salt and 300 ml water per person.',
 'Cover and simmer for about 20 minutes, adding a little hot water if needed to keep a loose stew.',
 'Roll the dough very thinly and tear into small pieces. Add pieces one at a time to the bubbling stew so they do not clump. Simmer for 10–15 minutes, stirring gently, until dough is cooked through and chicken reaches 75°C.',
 'Remove the dried lime. Check that potatoes and dough are tender before serving. This version uses small chicken pieces rather than a long-cooked joint.'
 ]}),
 dish({slug:'lamb-thareed',name:'Lamb thareed — plan ahead',time:120,diet:'meat',mealTypes:['lunch','dinner'],reference:'thareed',items:[['emiratiLamb',170],['regag',1],['potato',100],['carrot',70],['zucchini',80],['tomato',120],['onion',50],['emiratiGarlic',4],['bzar',2],['loomi',.5],['oil',6],['emiratiSalt',.6]],steps:[
 'Use halal-labelled lamb shoulder cut into roughly 2 cm cubes. Prepare raw meat on separate equipment. Dice washed vegetables, chop onion and garlic, and pierce the dried lime.',
 'Brown lamb in oil in a heavy saucepan. Add onion and garlic; cook for 5 minutes. Stir in bzar and tomato.',
 'Add dried lime, measured salt and 400 ml water per person. Cover and simmer gently for 60–80 minutes, adding hot water as needed, until lamb is nearly tender.',
 'Add potato and carrot; simmer for about 15 minutes. Add courgette and cook for another 10–15 minutes. Continue until lamb is thoroughly cooked and tender and all vegetables are soft.',
 'Remove dried lime. Tear ready-made regag into a serving bowl and ladle over the hot stew just before eating. Keep enough broth to soak the bread.',
 'Allow more time if the lamb is still firm. This slow dish is intentionally excluded from short cooking-time plans.'
 ]}),
 dish({slug:'chicken-harees',name:'Chicken harees — overnight preparation',time:660,diet:'meat',mealTypes:['lunch','dinner'],reference:'machboos',items:[['emiratiWheat',75],['chicken',170],['emiratiGhee',6],['emiratiSalt',.6]],notes:['Estimated elapsed time includes 8 hours of refrigerated soaking plus roughly 3 hours cooking. Active preparation is about 20 minutes. Not suitable for 30–60 minute plans.'],steps:[
 'The night before, rinse hulled harees wheat and cover generously with drinking water. Soak in the refrigerator for 8 hours, then drain. Do not use bulgur or couscous as if they were the same grain.',
 'Place soaked wheat and halal-labelled chicken in a heavy saucepan with 600 ml fresh water per person. Bring to the boil, then lower the heat and skim any foam.',
 'Cover loosely and simmer gently for about 2½–3 hours, stirring and adding hot water as necessary to prevent sticking. Wheat must be very soft and chicken thoroughly cooked to 75°C.',
 'Shred chicken with two forks in the pan. Beat the wheat and chicken firmly with a sturdy spoon until they form a thick, mostly smooth mixture. Continue cooking if grains are still firm.',
 'Stir in the measured salt. Spoon ghee over each serving. Serve hot; refrigerate leftovers promptly in shallow containers.'
 ]}),
 dish({slug:'muhammar-fish',name:'Muhammar rice with pan-cooked fish',time:40,diet:'fish',mealTypes:['lunch','dinner'],reference:'fish',items:[['rice',70],['fishfillet',170],['emiratiDibs',15],['emiratiGhee',5],['emiratiSaffron',.03],['cardamom',.3],['turmeric',.4],['oil',4],['emiratiSalt',.6]],steps:[
 'Rinse the rice. Stir date syrup, saffron and cardamom into the packet-measured rice water. This home version uses fresh fish rather than preserved salted fish.',
 'Warm ghee in a saucepan, add rice and the prepared liquid with half the measured salt. Cover and cook according to the rice packet; check that the rice is tender, then rest covered for 5 minutes.',
 'Check white fish carefully for bones. Season with turmeric and the remaining measured salt, keeping raw fish and utensils separate from ready-to-eat food.',
 'Pan-cook fish in oil until the thickest part reaches 63°C and the flesh flakes easily. Turn carefully to avoid breaking it.',
 'Serve the fish beside the lightly sweet rice. Dairy-free users need a separately reviewed oil substitution; the listed recipe contains ghee.'
 ]}),
 dish({slug:'fish-salona',name:'Fish salona with rice',time:30,diet:'fish',mealTypes:['lunch','dinner'],reference:'fish',items:[['fishfillet',170],['rice',60],['tomato',150],['onion',40],['zucchini',90],['emiratiGarlic',4],['bzar',1.5],['loomi',.25],['oil',5],['emiratiSalt',.6]],steps:[
 'Start cooking rinsed rice in a separate saucepan using its packet instructions. Check boneless white fish for bones and cut it into small, thick portions on separate equipment.',
 'Dice washed tomato and courgette. Chop onion and garlic, and pierce the dried lime. Soften onion in oil for 4 minutes, then add garlic, bzar and tomato for another 4 minutes.',
 'Add courgette, dried lime, measured salt and 150 ml water per person. Simmer for 5–7 minutes until the courgette is nearly tender.',
 'Lower fish into the bubbling sauce. Cover and simmer gently until its thickest part reaches 63°C and it flakes easily, about 6–10 minutes depending on thickness. Add time if needed.',
 'Remove the dried lime. Serve the fish stew with the cooked rice. The 30-minute estimate assumes small fish portions and two hob burners.'
 ]})
];

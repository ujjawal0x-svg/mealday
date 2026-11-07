# Mealday readiness — 4 November 2026

This is an implementation record, not a claim that the 23-item backlog is finished.

| # | Area | Current status and remaining work |
|---|---|---|
|1|Complete meals|Added starch/protein-role assembly for existing lunch/dinner recipes. Missing components receive measured dal/rice/cucumber, combined shopping quantities, instructions and conservative sequential elapsed time. This heuristic is not nutrition verification or kitchen testing.|
|2|Repetition|Cross-meal duplicate guard, strict default 14-day exclusion, selectable 7-day window and explicit recent-reuse option. Exhausted pools report a shortage. Similar but differently named dishes still need editorial dish-family grouping.|
|3|Cuisine/diet|Existing simultaneous ingredient-level diet, cuisine, appliance, time and exclusion checks retained and regression-tested.|
|4|Coverage|Reproducible 288-cell baseline plus equipment/allergen audit available. Baseline counts alone are insufficient: narrow Desi eggless <=30-min dinner pool has only four unused dishes after a five-day week. Do not claim two weeks of variety.|
|5|Budget|Whole-pack/pantry arithmetic tested. Launch fixture estimated AED81 within AED150. Planning uses catalogue estimates, not guaranteed retailer checkout costs.|
|6|Store prices|Official-domain/pack/location/freshness validation and fallbacks retained. Shopping rows now show clickable product source and full date/time. No independent current retailer-price verification in this change.|
|7|Swaps|Recompute complete basket, reject overbudget and within-week duplicates; respect recent-history filter, update swap history. Existing unchecked/bought state resets on changes.|
|8|Allergens|Existing ingredient allergen metadata enforced across components. Packaged-label and cross-contact warning retained; no allergy-safe guarantee. Independent ingredient/recipe review still required.|
|9|Onboarding|Original individual-question screens restored at the user’s request. Name, location, goal, household, days, budget, diet, cuisine, meal types, allergies, time, appliances, store and referral are separate. Multi-select meals, required source/store, green-border-only selection and hidden numeric counter retained. Browser QA checked the full sequence and Back preserves selections. Shared decorative Dubai skyline applied to all onboarding questions.|
|10|Cuisine taxonomy|Existing UAE mix vs Emirati vs Arab vs South Asian separation retained. Cultural audit of original adaptations is pending; Emirati-inspired recipes must not be marketed as verified traditional recipes.|
|11|Quality/images|No new generated photos or chef verification in this change. Some original coverage recipes still use fallback illustrations.|
|12|Pantry|Existing quantity-based canonical deduction and pack-boundary tests pass.|
|13|Shopping/sharing|Existing remaining-item image sharing retained; Manrope and Arabic quantity alignment fixed. Share is a snapshot, not a live shared-list URL. Ticking bought items no longer retriggers retailer searches.|
|14|Guided cooking|Existing step view, adjustable timer and servings retained. Methods not universally translated or independently tested.|
|15|Billing|Pending real payment provider, product IDs and webhook/entitlement integration. No fake AED21 checkout, trial or restore purchase has been added.|
|16|Performance/persistence|Removed artificial 4.4-second build delay; deduplicated incoming catalogue IDs; handled localStorage write failure visibly. Existing explicit cloud backup remains. Production analytics/funnel not implemented.|
|17|Nutrition|Pending a licensed/reference nutrient dataset, ingredient matching and validated calculations. Do not invent verified macros.|
|18|Family profiles|Pending household-member schema and intersection of member restrictions. Current household serving count is not multi-profile support.|
|19|Leftovers|Existing mode excludes extra groceries but does not track batches/portions/storage. Full leftover planner pending.|
|20|Import|Pending rights-aware personal import and validation. No competitor content copied.|
|21|Retailer comparison/cart|Pending permitted retailer integration. Existing external delivery links do not auto-add a basket.|
|22|Localization|English/Hindi/Arabic UI and ingredient dictionary exist; cooking-method coverage remains partial.|
|23|Feedback|Existing favourites, ratings, notes, cooked flags and history retained; selection history improved. Advanced recommendations pending.|

## Validation

`node scripts/test-launch-readiness.cjs`: Dubai, LuLu, two people, AED150, South Asian, eggless, five dinners <=30 minutes; distinct dishes, measured packs, JSON reload consistency, Jeera Rice combination, history exhaustion, explicit reuse option.

Other checks: week variety, preference integrity, grocery budget, swap, coverage expansion, cloud snapshot, price matching and recipe timing.

Changed the broad three-rebuild budget fixture to AED1000 because strict history + complete-meal additions change feasible costs. The dedicated launch test keeps AED150. Tiny exhaustive budget-search and infeasible-budget tests remain unchanged. New timing and swap failures found during regression were corrected before packaging.

## External launch dependencies

Payment-provider configuration; verified nutrient data; editorial/kitchen review; missing food imagery; adequate distinct recipes in narrow 14-day pools; authorized retailer cart access. These are not completed by changing button labels.

## Recipe quality release — 4 November 2026

Database verification: 325 published source records, including 26 new original home-style recipes (14 South Asian, 8 Arab, 4 Emirati-inspired). These are 262 dish families, not 325 independent meal ideas. Derived complete-meal records are additional client representations and must not be counted as new source recipes.

- 92 original generated photo assets: 66 previously missing photos plus 26 new recipes. Five visually mismatched drafts were replaced before publication. Images are illustrative, not physical cooking evidence. Cards use ~16 KB thumbnails; recipe covers use ~128 KB WebP on average.
- 325 records passed automated checks for known ingredients, positive quantities, valid diet metadata, method structure, plausible elapsed-time metadata and photo references/files.
- 134 desk-reviewed records: 66 repaired coverage methods, 6 repaired imports, 36 existing drafts read through and enabled as previews, and 26 originals. No recipe is claimed kitchen-tested by this release. The other 191 records passed structural checks only.
- Corrected whole-moong soaking (420 minutes including 360-minute soak), missing coconut in thoran, yogurt method naming, aubergine equipment, fish/beef finish temperatures, oat/batter resting, and canned-versus-dry pulse directions.
- Similar coverage plates share a dish family across cuisines. Renaming, AI variations and complete-meal assemblies retain their underlying family. History excludes the whole family. Fresh candidates are selected before rating preferences. Database catalogue records take precedence over stale bundled derived records.

Validation: launch scenario (Dubai, LuLu, 2 people, AED150, Desi eggless dinners, 5 days, 30 minutes) produced five distinct families at AED111 estimated whole-pack cost. Next week excluded previous families. Browser UI scenario produced five distinct photographed dinners, and swapping to Vegetable Dalia recalculated groceries to AED112; recipe cover and method loaded. Price figures are catalogue estimates, not verified live retailer quotes.

Coverage audit: 288 cuisine/diet/meal/time combinations, zero empty cells, 18 cells below seven distinct families. Gaps are predominantly strict non-vegetarian breakfasts; Emirati non-vegetarian lunch/dinner at <=30 minutes has six families. A seven-day plan in an insufficient pool fails clearly instead of repeating dishes or changing the cuisine. Arbitrary allergy, equipment, pantry, budget and history combinations can reduce coverage further. See data/coverage-audit-quality.json.

This does not complete all 23 backlog items. Remaining launch work includes physical recipe testing, verified nutrition, real billing/trial/restore/cancellation, robust notification delivery and analytics, authorized store basket transfer, and further coverage of the reported scarce cells. Existing multi-profile, leftovers and recipe-import aspirations require separate implementation; do not advertise them as complete.


## Coverage minimum release — 5 November 2026

76 original Mealday previews: 41 Emirati-inspired, 22 Arab/Middle Eastern, 13 South Asian. Expected published source catalogue: 401 records.

Baseline eligibility: all appliances, no allergy/dislike, budget or recent-history exclusions. The four supported cuisine choices × six diets all meet 40 distinct family options, 10 options in every breakfast/lunch/dinner pool, and 15 options at <=30 minutes. Extra restrictions can reduce these counts; not every possible filter intersection has 40 choices.

| Cuisine | Diet | Distinct | Quick | Breakfast | Lunch | Dinner |
|---|---|---:|---:|---:|---:|---:|
| Emirati | Any | 91 | 47 | 44 | 70 | 65 |
| Emirati | Non-vegetarian | 40 | 15 | 14 | 39 | 40 |
| Emirati | Eggless vegetarian | 45 | 24 | 23 | 28 | 26 |
| Emirati | Vegetarian | 53 | 32 | 30 | 33 | 27 |
| Emirati | Vegan | 40 | 19 | 18 | 28 | 26 |
| Emirati | Pescatarian | 68 | 40 | 36 | 48 | 42 |
| Arab | Any | 89 | 45 | 37 | 79 | 71 |
| Arab | Non-vegetarian | 41 | 15 | 14 | 41 | 41 |
| Arab | Eggless vegetarian | 43 | 25 | 18 | 37 | 32 |
| Arab | Vegetarian | 51 | 31 | 24 | 41 | 33 |
| Arab | Vegan | 40 | 21 | 14 | 37 | 32 |
| Arab | Pescatarian | 62 | 37 | 29 | 52 | 44 |
| South Asian | Any | 169 | 52 | 50 | 136 | 131 |
| South Asian | Non-vegetarian | 41 | 15 | 10 | 40 | 41 |
| South Asian | Eggless vegetarian | 109 | 30 | 31 | 83 | 80 |
| South Asian | Vegetarian | 128 | 37 | 40 | 96 | 90 |
| South Asian | Vegan | 81 | 25 | 24 | 61 | 59 |
| South Asian | Pescatarian | 138 | 45 | 44 | 106 | 100 |
| UAE mix | Any | 326 | 128 | 113 | 265 | 248 |
| UAE mix | Non-vegetarian | 112 | 37 | 29 | 110 | 112 |
| UAE mix | Eggless vegetarian | 185 | 71 | 63 | 140 | 130 |
| UAE mix | Vegetarian | 220 | 92 | 85 | 161 | 142 |
| UAE mix | Vegan | 149 | 57 | 47 | 118 | 109 |
| UAE mix | Pescatarian | 252 | 110 | 96 | 193 | 174 |

Timing includes required soaking, proofing, cooking and resting. Short recipes explicitly list purchased ready-to-eat components where required. Similar fatteh, kofta, harees, jareesh, stuffed courgette, khameer and tomato-chicken variants share family IDs. New images are original AI illustrations with matching component briefs and compressed covers/thumbnails. Recipe validation is desk review plus automated structural/eligibility/pack tests, not physical cooking, verified nutrition or cross-contact assurance.

Regression suite: coverage targets; recipe qualities; preference integrity; week variety; grocery budget; meal swap; recipe timing; launch readiness. Existing UI and audience preserved. This release does not complete unrelated billing/nutrition/other backlog work.

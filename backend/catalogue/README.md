# Cuisine catalogue and rotation

The 2026-10-29 import contains 87 South Asian recipes (23 breakfast, 64 lunch/dinner). The database additionally holds 60 existing Mealday adaptations: 20 per cuisine. Only 17 of these are preview recipes; the other 43 remain personally enabled drafts. No Kaggle Emirati recipes were found or relabelled from general Middle Eastern data.

## Rebuild the import

Download Kaggle dataset v1 archives from the two URLs recorded in `data/kaggle-import-report.json`. Extract `IndianFoodDatasetCSV.csv` from `sukhmandeepsinghbrar/indian-food-dataset`. Keep the image archive intact from `kishanpahadiya/indian-food-and-its-recipes-dataset-with-images` and extract `cuisines.csv` separately. Run:

```
python scripts/import-kaggle.py /path/IndianFoodDatasetCSV.csv /path/cuisines.csv /path/image-archive.zip
node scripts/catalogue-sql.cjs > /tmp/mealday-catalogue.sql
```

Apply `schema.sql` once with the authorised database migration tool, then apply the generated operator-only SQL to the Mealday project. The import report records source checksums and rejection counts. The script imports exact name joins only, rejects ambiguous/unmapped ingredients, unsupported equipment, meat needing halal verification, contradictory cuisine names and condiment-only plans. No raw archive is required at runtime. Photos are exact source-linked thumbnails (640×480 maximum WebP), not semantic search results. Missing photos show a neutral meal icon.

## Provenance and limits

Both Kaggle uploaders declare CC0. These datasets describe scraping Archana’s Kitchen; uploader labels are not independent proof of original image ownership. Publisher attribution, original URL and source ingredient quantities are retained on every record. Confirm original publisher rights before expanding commercial reuse. Nutrition, recipe testing, retailer pack availability and prices are not verified. Household units and unspecified seasoning quantities are explicitly estimated. Source servings are retained and quantities converted per person. The source dishes are not certified nutritionally complete meal combinations.

## Planner

Cuisine, meal type, ingredients, allergens, diet, equipment and time are hard filters. Draft enablement is checked before selection. Rotation first prefers unused eligible dishes within the current plan, then avoids the recent 21-day history. If all eligible options have been seen, the least recently suggested eligible dish is used, with a repeat notice. It never borrows a different cuisine to manufacture variety. A UAE calendar day plus rebuild sequence changes the deterministic tie-breaker. A saved week is preserved until the user rebuilds; there is no midnight overwrite of purchased groceries.

Signed-in suggestions automatically upsert into `mealday_plan_history`, with auth.uid()-based ownership policies. Guests use local history. Account deletion cascades history. Clearing recent history clears the live cloud history too; the user must save their separate kitchen backup to remove old backup history. The read-only catalogue uses RLS and grants only SELECT to clients. Import audit data has no client grant. Bundled catalogue is the offline fallback, with connection failures displayed.

Checks: `node scripts/test-catalogue.cjs`, `node scripts/test-kaggle.cjs`, `node scripts/build.cjs`.

## Emirati expansion — 2026-10-29

Ten original Mealday home adaptations were added in `src/emiratiCollection.ts`: Dango, Bajella, Beid wa tomat, fresh rigag with labneh, fish machboos, chicken margouga, lamb thareed, chicken harees, muhammar with fish and fish salona. These are not Kaggle imports or reproduced publisher recipes. Cultural references are linked per dish to Visit Dubai, Experience Abu Dhabi, Abu Dhabi Culture, the UAE government food guide, Al Fanar’s documented breakfast menu, and Zayed University’s Emirates 101. They establish dish identity; they do not certify the original Mealday methods, quantities, nutrition or cooking times.

There are now 157 published catalogue entries: 30 Emirati (15 previews, 15 gated drafts), 20 Arab, 107 South Asian. The original 87 Kaggle imports are unchanged. The new recipes show neutral meal icons rather than unlicensed or mismatched photographs. Harees includes overnight soaking in its 660-minute elapsed estimate, while lamb thareed is 120 minutes. These remain browsable but cannot enter short-time plans. Ghee is labelled Milk, wheat/rigag/flour are Gluten, lamb is meat and fish is Fish. New ingredient metadata is included in each database recipe payload.

Run `node scripts/test-emirati.cjs` in addition to the existing checks. The source exporter `scripts/catalogue-sql.cjs` includes the new recipes.

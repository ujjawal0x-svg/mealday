# Recipe API evaluation — not live

`spoonacular.ts` is a server-only discovery adapter. It requires `SPOONACULAR_API_KEY`, uses a fixed HTTPS provider endpoint and request timeout, and carries source attribution and licensing metadata. No provider secret belongs in src/, dist/, localStorage or browser forms.

Next activation steps:
1. Create a Spoonacular account and choose a plan that permits the intended commercial display of ingredients, instructions and photos. Confirm caching/storage terms directly with the provider. Do not bulk-download their library.
2. Set SPOONACULAR_API_KEY in Supabase Edge Function Secrets. Never paste it into chat or commit it.
3. Run a limited live evaluation with vegetarian, vegan, non-vegetarian and pescatarian queries. Check completeness, ingredient exclusions, apparatus requirements, attribution and UAE ingredient availability. Provider vegetarian=false alone does not establish halal suitability or a safe dietary classification.
4. Normalize and review candidate ingredients against the Mealday catalogue; derive diet/exclusion tags and map quantities to AED whole-pack estimates. Unknown ingredients must not enter production plans. Do not use foreign provider prices as UAE retailer prices.
5. Only then add authenticated, quota-limited access. Keep the existing catalogue fallback and visibly identify estimates. This adapter is deliberately NOT deployed as a paid public proxy.

Current live work uses the existing recipe catalogue, ingredient-level checks, 14-day history passed with each generation, and budget-aware rotation. History is device-local for guests and included in explicit Save to account; history/reset follows existing account controls.

# Mealday

A responsive meal-planning web app with one active route at a time. Approved white-green visual design.

## Working flows

- Twelve-step profile setup, validation, editing and a sequential building animation
- Sixteen structured recipes with ingredient quantities per person and individual cooking steps
- Recipe matching by diet, excluded ingredients, appliance availability and cooking time
- Weekly dinner slots determined by chosen days, recipe swaps and cooking completion
- Shopping quantities aggregated from the actual meal plan, rounded to full packs
- Quantity-based pantry deductions, shopping checklist, progress and copied lists
- Saved recipes, star ratings, start/pause/reset timer
- Browser-local persistence for profile, plan, pantry, favourites, ticks and ratings

## Development

Run `npm install` and `npm run build`. Serve `dist/` as a static site.

## Limits

Prices are local catalogue estimates, not live retailer prices. Recipe images are representative. The planner selects from a curated catalogue, not an AI service. It reports budget overruns rather than guaranteeing every target is feasible. No grocery ordering, payments or cloud account synchronisation is connected. Dietary exclusions check listed ingredients, not cross-contact.

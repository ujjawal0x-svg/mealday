# Recipe timing

`time` is estimated total elapsed minutes, including required soaking, marinating and resting. It is never reduced to satisfy a user's preference. Optional `timing` contains independently recorded prep/cook/wait estimates; missing breakdowns remain missing. The 16 authored breakdowns are in `data/recipe-timings.json`.

`src/recipeTiming.ts` supplies consistent calculation and limits for catalogue planning, swaps, recipe cards, library search and AI eligibility. The effective total is the greater of the legacy total and the sum of valid recorded parts. Malformed times fail closed. Per-meal limits range from 10 minutes to 24 hours, including 90 minutes, 2 hours, 4 hours and plan-ahead. Categories are exclusive, while library "up to" filters are cumulative. Sorting does not modify recipe times.

The database trigger in `20261030_recipe_time_categories.sql` classifies future catalogue writes automatically. Existing published rows are backfilled without republishing disabled recipes. The function uses invoker privileges and does not change table access or RLS.

AI adaptations of slow or waiting-based dishes cannot understate the base's elapsed time. Client restore and backend profile validation support the same 24-hour maximum. Existing user preferences keep their selected value.

Validation: `node scripts/test-recipe-time.cjs`, preference integrity, meal swap, AI recipe, full shortlist, catalogue, budget, language and cloud snapshot checks. Timing remains an estimate, not kitchen testing. Parallel cooking is included in the original total; missing active-work timing is not inferred.

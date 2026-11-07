# Mealday backend — phase 1

Supabase project: kipxvfvqbzfzezngsuyt, ap-south-1. Frontend contains the publishable key only.

`mealday_accounts` stores one versioned private snapshot per auth user: profile preferences and kitchen state. Phase 1 keeps the existing recipe catalogue/planner local. Recipe/product tables and server-side planning are later phases.

- Email/password sign-in and signup; confirmation required according to Supabase email settings.
- Guest use remains local. First cloud save is explicit, including dietary preferences and exclusions.
- Use **Save to account** after edits; this version does not auto-sync edits in the background.
- Sign-in loads an existing cloud snapshot. A new account can explicitly upload the guest kitchen.
- Save uses atomic revision checking; concurrent device saves cannot silently overwrite each other. Load saved data before resolving a conflict.
- Sign-out clears local Mealday state with a visible warning for unsaved changes.
- Device reset and permanent account deletion are separate. Delete-account Edge Function validates the bearer token with Auth, revokes sessions, deletes the authenticated user only; FK cascade deletes the snapshot. Gateway JWT validation is disabled because the function validates the token itself using getUser.

Schema is captured in backend/schema.sql and applied to remote migration history as mealday_private_accounts. Function source: backend/delete-account/index.ts.

## Checks performed
Build passed. Transactional SQL tests passed for own CRUD, cross-user isolation, ownership reassignment denial and optimistic-save conflicts; synthetic data rolled back. Security advisors returned no findings. Unauthenticated deletion must return 401.

## Before public launch
Set Supabase Auth Site URL to https://mealday-kitchen-app.ujjawal-0x.chatgpt.site/ and add https://mealday-kitchen-app.ujjawal-0x.chatgpt.site/?auth=confirmed to the redirect allowlist. Configure production SMTP: Supabase's default email service has recipient/rate restrictions. Confirm a real signup email and cross-device round trip. Google OAuth is not configured. Authenticated permanent deletion has not been tested with a real account. No AI or retailer ordering integration is connected.

## Phase 2 — server planner
Database catalogue: mealday_recipes (16), mealday_ingredients (21), mealday_recipe_ingredients (72 relations). Public SELECT for active catalogue records only; client INSERT/UPDATE/DELETE revoked. Prices are illustrative AED pack estimates, not retailer feeds. Recipes are the existing starter set, not a newly licensed or externally reviewed collection.

`mealday-planner` Edge Function loads the database catalogue and supports catalogue, generate, quote, alternatives and swap. Profile, quantities, days and IDs are validated on the server. Planner does not accept client prices. Generated plans meet supported diet, listed-ingredient exclusion, time and appliance rules; this does not certify allergen safety. Budget is a target and overruns are reported. This public, bounded computation supports guests; it has no privileged access to private account data. Gateway JWT checking is off intentionally; account saving remains authenticated and RLS-protected.

Frontend fetches the catalogue, calls the server for new plans and swaps, and refreshes basket quotes when plan/household/pantry changes. Cached local catalogue calculations remain a labelled display fallback while offline or awaiting the server. New plans/swaps require the server. Account cloud save remains explicit.

Live API verification: catalogue counts, vegan/gluten/time/day constraints, aggregation, pack rounding, pantry deduction, over-budget reporting, no-match 422, invalid input 400, incompatible swap rejection and alternative price equality all passed. Security advisor has no findings. Existing monetary records are starter estimates; retailer pricing and AI generation are not connected.

Diet semantics: Any permits all recipes. Non-vegetarian permits only meat/fish recipes (including alternatives and swaps); Vegetarian permits vegetarian/vegan; Vegan permits vegan; Pescatarian excludes meat. Existing plans are not regenerated automatically when preferences change; rebuild to apply the new diet. The starter catalogue currently has only two non-vegetarian recipes, so meals can repeat.

## Live recipe discovery (October 2026)
- `mealday-planner` actions `discover` and `external-detail` use the server-only `SPOONACULAR_API_KEY`, require a verified Supabase user, and enforce atomic daily lookup limits (20/user, 60/project).
- Provider contents are request-only: no ingredient/method response caches or database imports. Persisted plan references use `spoon-<id>` only. Quote/swap refetch live details and return mapped recipe contents only for current display.
- Discovery makes a fixed general-recipe request. Dietary, cooking-time and exclusion filters are applied within Mealday only; no profile fields, free-text queries, allergies or dietary labels are sent to Spoonacular. With ingredient exclusions set, only fully mapped compatible recipes are returned. Only exact ingredient-ID/unit mappings, recognized equipment, complete methods, original source attribution and local ingredient-level compatibility make a recipe eligible for the priced weekly plan. Other results remain readable recipe inspiration.
- Provider ingredient labels are not halal/allergy certification. Prices use Mealday's own illustrative AED pack catalogue, never foreign provider prices. Missing mapping is not silently dropped.
- `mealday_recipe_usage` contains only rate buckets/date/counters, has RLS with no client grants, and is accessible via the service-only invoker quota RPC. No user contact details or recipe contents are logged there.
- Additions for salt, pepper, garlic, butter and household water are independent Mealday estimates, not retailer feeds.

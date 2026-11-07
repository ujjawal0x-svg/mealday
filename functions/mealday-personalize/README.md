# Mealday recipe personalization

Status: user explicitly approved provider data processing on 2026-10-30. Backend deployed with JWT verification enabled. Groq key and openai/gpt-oss-120b were tested with a synthetic request: HTTP 200 and valid JSON response. Local validation and mocked-provider tests pass. An authenticated live recipe generation has not yet been verified. Frontend publication follows the Sites deployment record.

## Behaviour

Existing catalogue recipes remain the first choice. My week → day → Swap → Personalize with AI creates a variation of an original Mealday base recipe. The private recipe library offers the same creation flow without replacing a slot. A preview must be reviewed before the user accepts it. Accepted recipes persist locally, are included in explicit account backups, and join the normal cuisine/diet/meal/rotation filters on later rebuilds. No shared public catalogue rows are added.

The request requires sign-in, explicit consent, and the same provider shown in the consent disclosure. Only the base recipe, diet, allergens, cooking limits, allowed ingredient IDs/names/units, available pantry ingredient IDs, and recent dish names are sent to the provider. Names, address/city, email, auth tokens, household identifiers, full pantry amounts, weekly budget, and the complete weekly plan are not sent to the AI provider. The function receives the plan and quantities on Mealday's own Supabase backend to calculate whole-pack budget totals locally.

The model response cannot supply new ingredient IDs, pack prices, photos, calories, cuisine tags or claimed certification. Ingredient IDs, quantities, referenced step ingredients, exclusion terms, diet, appliances, time, low-cook/packed-lunch rules, and the resulting grocery budget are checked. These checks do not constitute chef testing, complete semantic validation of all prose, medical advice, or allergy/cross-contact guarantees. The UI identifies AI adaptations and asks the user to check product labels and the method.

## Configuration after deployment authorization

Deploy `index.ts` and the generated `core.js` as `mealday-personalize`, with `verify_jwt: true`. It also validates the caller with `auth.getUser`. It uses the existing service-only `mealday_recipe_quota` RPC: 5 requests/user/day, 50 globally/day.

Server secrets: `GROQ_API_KEY` preferred or `GEMINI_API_KEY` (`GOOGLE_API_KEY` accepted). Optional model overrides: `MEALDAY_GROQ_MODEL` and `MEALDAY_GEMINI_MODEL`. Default Groq model: `openai/gpt-oss-120b`; Gemini: `gemini-2.5-flash`. No provider keys are placed in frontend code. When no provider is configured, status reports unavailable and existing planning stays usable. Failed generations are not retried automatically.

## Verification

- `node scripts/build-ai-function.cjs`
- `node scripts/test-preference-integrity.cjs` (strict cuisine/diet matrix and stale-plan repair)
- `node scripts/test-ai-recipes.cjs` (mocked auth/provider boundaries; no external AI calls)
- `node scripts/test-catalogue.cjs`
- `node scripts/test-grocery-budget.cjs`
- `node scripts/test-meal-swap.cjs`
- `node scripts/test-cloud-snapshot.cjs`
- `node scripts/build.cjs`

Local browser QA with a clearly marked, simulated response verified consent gate, preview/scaled ingredient quantities, review gate, and acceptance. Temporary QA pages are excluded from production.

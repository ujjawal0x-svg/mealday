# Official website price pilot

Deployed function: `mealday-prices`. Shopping's store price check attempts a refresh on entry; failed lookups preserve previous prices per ingredient, exact pack, supermarket and kitchen city. Saved prices expire after 30 days. Fresh results are never implied for a saved value. Catalogue fallback remains available. Saved quotes are browser-local, not account-synced. Planner budget enforcement still uses catalogue estimates; the separate store quote can differ and excludes delivery.

## Activation blocker
A Gemini secret was added by the owner and its presence verified on 2026-10-29. Live grounded search is blocked by the account/provider quota; the free Gemini 2.5 Flash-Lite model returned 404 (unavailable to new users), and replacement Gemini 3.5 Flash-Lite grounded search returned 429 RESOURCE_EXHAUSTED. Do not enable billing automatically. Set `GEMINI_API_KEY` in Supabase Edge Function secrets (never frontend), and `MEALDAY_PRICE_HOSTS` to reviewed/authorized official hostname(s), comma separated. Uses the documented GenerateContent API with `gemini-3.5-flash-lite` and Google Search grounding. Current pricing lists search grounding outside that model’s free API tier; do not assume a free key includes web search. No domains are enabled by default. Retailer terms/data-use permission remain separate from technical access. Do not paste secrets in chat or commit them.

JWT validation remains enabled; live search requires sign-in. Guests retain catalogue/saved prices. Current pilot checks up to 10 items within a 20-second start window; slow calls time out and ambiguous/missing offers fall back. Google Search finds candidate URLs; only a single directly cited official URL, no redirects, and official Product JSON-LD with AED/InStock/exact pack/exact ingredient words supplies a price. Model-written prices are ignored. Dynamic pages without usable structured data currently fall back. No challenge bypass. Search suggestions/model prose are not shown; review Google grounding display/licensing requirements before activation.

Public page retrieval does NOT set the retailer's delivery area; kitchen city is search context and cache partition only. UI explicitly says area/stock/checkout unverified. Do not label it guaranteed live local pricing. Search indexing can lag; page check time is not a price-effective guarantee.

Before paid activation: test known official product pages, exact unit/pack coverage, source attribution, credentials with current model, and add a durable per-user/global quota (current in-memory 60-second throttle is per warm isolate only). Run cost-capped staging tests. Equivalent kg/l packs currently fail conservatively rather than guessing. Connection diagnostics used a fixed public-domain query, never private user data; no successful live grocery-price quote was verified. A 429 or model error must preserve saved/catalogue prices.

Tests: `node scripts/test-prices.cjs`, `node scripts/test-grocery-budget.cjs`, `node scripts/build.cjs`.

## Tavily connection (2026-10-29)

Active provider is now Tavily Search using server-only `TAVILY_API_KEY`; Gemini is not called by grocery price lookup. Live connection test succeeded HTTP 200 and consumed 1 basic-search credit. It found official Carrefour product links, but the exact milk product result contained no price, so no milk price was accepted. Category-page prices were rejected.

Basic search, auto_parameters=false, max_results=3, no generated answer/raw content, official domain filter. No direct retailer requests unless separately opted in through MEALDAY_PRICE_HOSTS. Indexed results with exact product/pack and one unambiguous AED amount may supply a clearly labelled 'Search result price'; not live local checkout pricing. Missing/ambiguous snippets retain last saved price or catalogue estimate. Search queries contain ingredient, pack and kitchen city only. No precise address or account details sent.

The prior Gemini activation notes above are historical; GEMINI_API_KEY is not needed for this adapter. Default search works without MEALDAY_PRICE_HOSTS. That variable gates direct retailer fetches only. Do not enable Carrefour direct fetching without resolving its automated-access terms. Search quota/auth failures fail closed. Pilot remains signed-in only, max 10 requested items and a bounded time window; the warm-isolate throttle is not a global durable quota. Configure Tavily's account spending cap/free tier before production scale. Guest fallback and catalogue-based planner budgets are unchanged.

## Shopping display correction

The website quote hook now supplies the main grocery rows and shopping summary, rather than a separate quote panel below a catalogue-only list. The panel is above the list and exposes lookup status/source links. Planner budget constraints still use catalogue prices; store quote changes do not silently change meal plans. Matching/search fallback tests and grocery-budget regressions pass.

Regression live search: original `Basmati rice 1000 g AED UAE Dubai` returned unrelated/category results. Canonical `"Basmati rice" "1kg" price AED`, official domain, five results, returned an exact Tilda Pure Basmati Rice 1kg product URL with AED 17.79; shared production parser accepted it. Indexed search price, not a newly verified local checkout quote. Category pages remained rejected. No guarantee of coverage for every grocery item.

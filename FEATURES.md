# Mealday planned feature groups

## Pantry & food preferences → meal planning

Added: 27 October 2026. Status: first implementation complete; validation in progress.

User authorized implementation on 27 October 2026.

### User experience
- “What’s in your kitchen?”: tick available ingredients; quantities optional.
- “What do you feel like eating?”: choose preferred dishes, cuisines and meal styles.
- Keep available ingredients, dislikes and allergy exclusions separate.
- Suggest meals using pantry ingredients and food preferences, while respecting diet, exclusions, cooking time and appliances.
- Show ingredients already at home, missing ingredients and estimated additional shopping cost.
- Prioritize pantry use and variety; explain when no suitable matches exist without silently relaxing exclusions.

### Starting point and dependencies
- Existing pantry feature deducts quantities from shopping needs; pantry-based recipe ranking now prefers matching ingredients within existing safety, variety and budget rules.
- Use reviewed recipes or a licensed recipe API for matching; preferences alone do not provide complete recipes.
- Expand ingredient/unit mappings as needed. Do not promise to eliminate the recipe catalogue.
- Evaluate AI recipe variations separately, including instruction/quantity validation, cost and privacy.
- Preserve provider attribution/storage rules and avoid transmitting dietary/allergy data to external providers without an approved data flow.

### Example acceptance scenario
With rice, eggs and carrot available and a quick-meal preference, offer a compatible egg fried rice recipe if available; separate pantry ingredients from missing items and calculate only the additional whole-pack shopping estimate. Exclude the suggestion for an egg exclusion or incompatible diet.

### Work gate
Implemented ingredient selection, optional quantities, ingredient dislikes, meal style preferences, persisted profile fields and server ranking. Cuisine-specific selection and automatic API recipe expansion remain future work.

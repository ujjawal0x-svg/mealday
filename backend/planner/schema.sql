create table public.mealday_ingredients (
 id text primary key, name text not null, unit text not null, pack numeric not null check(pack>0),
 price numeric not null check(price>=0), category text not null, allergen text,
 currency text not null default 'AED' check(currency='AED'),
 price_source text not null default 'Illustrative catalogue estimate; not a retailer feed',
 price_updated_at timestamptz not null default now(), active boolean not null default true
);
create table public.mealday_recipes(
 id text primary key, name text not null, minutes integer not null check(minutes between 1 and 240),
 appliances text[] not null, diet text not null check(diet in ('vegan','vegetarian','fish','meat')),
 tags text[] not null, image integer not null check(image between 0 and 2),
 steps jsonb not null check(jsonb_typeof(steps)='array'),
 active boolean not null default true, updated_at timestamptz not null default now()
);
create table public.mealday_recipe_ingredients(
 recipe_id text not null references public.mealday_recipes(id) on delete cascade,
 ingredient_id text not null references public.mealday_ingredients(id),
 amount_per_serving numeric not null check(amount_per_serving>0),
 position integer not null default 0, primary key(recipe_id,ingredient_id)
);
create index mealday_recipe_ingredient_lookup on public.mealday_recipe_ingredients(ingredient_id);
alter table public.mealday_ingredients enable row level security;
alter table public.mealday_recipes enable row level security;
alter table public.mealday_recipe_ingredients enable row level security;
revoke all on public.mealday_ingredients,public.mealday_recipes,public.mealday_recipe_ingredients from anon,authenticated;
grant select on public.mealday_ingredients,public.mealday_recipes,public.mealday_recipe_ingredients to anon,authenticated;
create policy catalogue_ingredients_read on public.mealday_ingredients for select to anon,authenticated using(active);
create policy catalogue_recipes_read on public.mealday_recipes for select to anon,authenticated using(active);
create policy catalogue_recipe_items_read on public.mealday_recipe_ingredients for select to anon,authenticated using(exists(select 1 from public.mealday_recipes r where r.id=recipe_id and r.active));


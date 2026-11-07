-- Public read-only recipe catalogue; writes are restricted to the import operator.
create table if not exists public.mealday_cuisine_catalogue(
 id text primary key,
 cuisine text not null check(cuisine in ('Emirati','Arab','South Asian','Turkish')),
 data jsonb not null check(jsonb_typeof(data)='object'),
 ingredients jsonb not null check(jsonb_typeof(ingredients)='object'),
 published boolean not null default true,
 updated_at timestamptz not null default now(),
 check(data->>'id'=id),check(data->>'cuisine'=cuisine)
);
alter table public.mealday_cuisine_catalogue enable row level security;
revoke all on public.mealday_cuisine_catalogue from anon,authenticated;
grant select on public.mealday_cuisine_catalogue to anon,authenticated;
create policy cuisine_catalogue_read on public.mealday_cuisine_catalogue for select to anon,authenticated using(published);
create index cuisine_catalogue_filter on public.mealday_cuisine_catalogue(cuisine) where published;
create table public.mealday_plan_history(
 user_id uuid not null references auth.users(id) on delete cascade,
 recipe_id text not null check(length(recipe_id) between 1 and 100),
 suggested_at timestamptz not null default now() check(suggested_at<=now()+interval '5 minutes'),
 primary key(user_id,recipe_id)
);
alter table public.mealday_plan_history enable row level security;
revoke all on public.mealday_plan_history from anon,authenticated;
grant select,insert,update,delete on public.mealday_plan_history to authenticated;
create policy history_read_own on public.mealday_plan_history for select to authenticated using((select auth.uid())=user_id);
create policy history_insert_own on public.mealday_plan_history for insert to authenticated with check((select auth.uid())=user_id);
create policy history_update_own on public.mealday_plan_history for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy history_delete_own on public.mealday_plan_history for delete to authenticated using((select auth.uid())=user_id);
create index mealday_history_recent on public.mealday_plan_history(user_id,suggested_at desc);
create table public.mealday_catalogue_imports(id text primary key,report jsonb not null,imported_at timestamptz not null default now());
alter table public.mealday_catalogue_imports enable row level security;
revoke all on public.mealday_catalogue_imports from anon,authenticated;

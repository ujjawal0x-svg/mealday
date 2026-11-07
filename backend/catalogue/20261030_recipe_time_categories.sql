-- Total elapsed time only: no guessed prep/cook split. This also classifies
-- future catalogue inserts and edits without changing their recipe time.
create or replace function public.mealday_classify_recipe_time()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare
  total_minutes numeric;
  prep_minutes numeric;
  cook_minutes numeric;
  wait_minutes numeric;
  category text;
begin
  if jsonb_typeof(new.data->'time') = 'number' then
    total_minutes := (new.data->>'time')::numeric;
    if total_minutes <= 0 or total_minutes <> trunc(total_minutes) then
      total_minutes := null;
    end if;
  end if;
  if new.data ? 'timing' then
    if jsonb_typeof(new.data#>'{timing,prepMinutes}') = 'number'
      and jsonb_typeof(new.data#>'{timing,cookMinutes}') = 'number'
      and jsonb_typeof(new.data#>'{timing,waitMinutes}') = 'number' then
      prep_minutes := (new.data#>>'{timing,prepMinutes}')::numeric;
      cook_minutes := (new.data#>>'{timing,cookMinutes}')::numeric;
      wait_minutes := (new.data#>>'{timing,waitMinutes}')::numeric;
      if total_minutes is null or prep_minutes < 0 or cook_minutes < 0 or wait_minutes < 0
        or prep_minutes <> trunc(prep_minutes) or cook_minutes <> trunc(cook_minutes)
        or wait_minutes <> trunc(wait_minutes) or prep_minutes+ cook_minutes + wait_minutes <= 0 then
        total_minutes := null;
      else
        total_minutes := greatest(total_minutes, prep_minutes + cook_minutes + wait_minutes);
      end if;
    else
      total_minutes := null;
    end if;
  end if;
  category := case
    when total_minutes <= 15 then 'quick'
    when total_minutes <= 30 then 'everyday'
    when total_minutes <= 45 then 'relaxed'
    when total_minutes <= 60 then 'hour'
    when total_minutes <= 120 then 'long'
    when total_minutes <= 240 then 'slow'
    when total_minutes <= 1440 then 'ahead'
    else 'unknown' end;
  new.data := new.data || jsonb_build_object('timeCategory',category);
  return new;
end;
$$;
drop trigger if exists mealday_recipe_time_category on public.mealday_cuisine_catalogue;
create trigger mealday_recipe_time_category before insert or update of data
on public.mealday_cuisine_catalogue for each row
execute function public.mealday_classify_recipe_time();

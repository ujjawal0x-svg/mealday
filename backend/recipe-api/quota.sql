create table if not exists public.mealday_recipe_usage (bucket text not null,day date not null default current_date,calls integer not null default 0 check(calls>=0),primary key(bucket,day));
alter table public.mealday_recipe_usage enable row level security;
revoke all on public.mealday_recipe_usage from public,anon,authenticated;
grant all on public.mealday_recipe_usage to service_role;
create or replace function public.mealday_recipe_quota(p_bucket text,p_limit integer) returns boolean language plpgsql security invoker set search_path=public as $$
declare accepted integer;
begin
 if p_limit<1 or p_limit>100 or length(p_bucket)>100 then return false;end if;
 insert into public.mealday_recipe_usage(bucket,day,calls) values(p_bucket,current_date,1)
 on conflict(bucket,day) do update set calls=mealday_recipe_usage.calls+1 where mealday_recipe_usage.calls<p_limit returning calls into accepted;
 return accepted is not null;
end;$$;
revoke all on function public.mealday_recipe_quota(text,integer) from public,anon,authenticated;
grant execute on function public.mealday_recipe_quota(text,integer) to service_role;

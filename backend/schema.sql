create table public.mealday_accounts (
 user_id uuid primary key references auth.users(id) on delete cascade,
 profile jsonb not null default '{}'::jsonb check(jsonb_typeof(profile)='object'),
 kitchen jsonb not null default '{}'::jsonb check(jsonb_typeof(kitchen)='object'),
 revision bigint not null default 1,
 updated_at timestamptz not null default now(),
 constraint payload_size check (octet_length(profile::text)+octet_length(kitchen::text)<524288)
);
alter table public.mealday_accounts enable row level security;
revoke all on public.mealday_accounts from anon, authenticated;
grant select,insert,update,delete on public.mealday_accounts to authenticated;
create policy own_select on public.mealday_accounts for select to authenticated using ((select auth.uid())=user_id);
create policy own_insert on public.mealday_accounts for insert to authenticated with check ((select auth.uid())=user_id);
create policy own_update on public.mealday_accounts for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy own_delete on public.mealday_accounts for delete to authenticated using ((select auth.uid())=user_id);
create function public.mealday_save(p_profile jsonb,p_kitchen jsonb,p_revision bigint)
returns public.mealday_accounts language plpgsql security invoker set search_path='' as $$
declare result public.mealday_accounts;
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 if p_revision=0 then
 insert into public.mealday_accounts(user_id,profile,kitchen) values(auth.uid(),p_profile,p_kitchen)
 on conflict do nothing returning * into result;
 else
 update public.mealday_accounts set profile=p_profile,kitchen=p_kitchen,revision=revision+1,updated_at=now()
 where user_id=auth.uid() and revision=p_revision returning * into result;
 end if;
 if result.user_id is null then raise exception 'SYNC_CONFLICT: Reload your account before saving'; end if;
 return result;
end $$;
revoke all on function public.mealday_save(jsonb,jsonb,bigint) from public,anon;
grant execute on function public.mealday_save(jsonb,jsonb,bigint) to authenticated;

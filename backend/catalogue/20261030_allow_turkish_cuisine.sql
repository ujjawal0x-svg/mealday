-- Preserve strict cuisine tags rather than misclassifying Menemen as Arab.
alter table public.mealday_cuisine_catalogue
  drop constraint mealday_cuisine_catalogue_cuisine_check,
  add constraint mealday_cuisine_catalogue_cuisine_check
    check (cuisine in ('Emirati','Arab','South Asian','Turkish'));

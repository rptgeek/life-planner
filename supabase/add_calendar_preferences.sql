-- Add calendar preference columns to profiles
alter table public.profiles
  add column if not exists selected_calendar_ids text[] default null,
  add column if not exists default_push_calendar_id text default null;

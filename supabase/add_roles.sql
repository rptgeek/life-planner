-- Add roles table
create table public.roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories on delete set null,
  name text not null,
  color text not null default '#6366f1',
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.roles enable row level security;
create policy "Users can manage own roles" on public.roles for all using (auth.uid() = user_id);

create index idx_roles_user on public.roles(user_id);
create index idx_roles_category on public.roles(category_id);

-- Add role_id to goals
alter table public.goals add column role_id uuid references public.roles on delete set null;
create index idx_goals_role on public.goals(role_id);

-- Add role_id to tasks
alter table public.tasks add column role_id uuid references public.roles on delete set null;
create index idx_tasks_role on public.tasks(role_id);

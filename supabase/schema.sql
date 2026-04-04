-- Life Planner - Franklin Planner Inspired System
-- Supabase PostgreSQL Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  mission_statement text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- ============================================
-- CATEGORIES (configurable life areas)
-- ============================================
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  color text not null default '#6366f1',
  icon text default 'folder',
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;
create policy "Users can manage own categories" on public.categories for all using (auth.uid() = user_id);

-- ============================================
-- VALUES (personal core values)
-- ============================================
create table public.values (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.values enable row level security;
create policy "Users can manage own values" on public.values for all using (auth.uid() = user_id);

-- ============================================
-- GOALS (long-term and short-term)
-- ============================================
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories on delete set null,
  parent_goal_id uuid references public.goals on delete set null,
  title text not null,
  description text,
  goal_type text not null check (goal_type in ('long_term', 'short_term')),
  target_date date,
  status text default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.goals enable row level security;
create policy "Users can manage own goals" on public.goals for all using (auth.uid() = user_id);

create index idx_goals_user on public.goals(user_id);
create index idx_goals_category on public.goals(category_id);
create index idx_goals_parent on public.goals(parent_goal_id);

-- ============================================
-- TASKS (daily actionable items)
-- ============================================
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories on delete set null,
  goal_id uuid references public.goals on delete set null,
  title text not null,
  description text,
  priority text default 'B' check (priority in ('A', 'B', 'C')),
  due_date date,
  scheduled_date date,
  in_progress boolean default false,
  completed boolean default false,
  completed_at timestamptz,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tasks enable row level security;
create policy "Users can manage own tasks" on public.tasks for all using (auth.uid() = user_id);

create index idx_tasks_user on public.tasks(user_id);
create index idx_tasks_scheduled on public.tasks(scheduled_date);
create index idx_tasks_due on public.tasks(due_date);
create index idx_tasks_category on public.tasks(category_id);

-- ============================================
-- DAILY REFLECTIONS
-- ============================================
create table public.daily_reflections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  reflection_date date not null,
  notes text,
  wins text,
  improvements text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, reflection_date)
);

alter table public.daily_reflections enable row level security;
create policy "Users can manage own reflections" on public.daily_reflections for all using (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Auto-create profile + default categories on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create profile
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'user_name', 'Planner'));

  -- Create default categories
  insert into public.categories (user_id, name, color, icon, sort_order) values
    (new.id, 'Personal', '#8b5cf6', 'user', 0),
    (new.id, 'Family', '#ec4899', 'heart', 1),
    (new.id, 'Career', '#3b82f6', 'briefcase', 2),
    (new.id, 'Church', '#f59e0b', 'church', 3);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger on new user signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at();
create trigger update_goals_updated_at before update on public.goals for each row execute function public.update_updated_at();
create trigger update_tasks_updated_at before update on public.tasks for each row execute function public.update_updated_at();
create trigger update_reflections_updated_at before update on public.daily_reflections for each row execute function public.update_updated_at();

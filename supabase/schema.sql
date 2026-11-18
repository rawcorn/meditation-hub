-- Meditation Hub Supabase Schema
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Profiles Table (syncs with Supabase Auth users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. Intentions Table
create table if not exists public.intentions (
  id text primary key,
  recipient text not null,
  title text not null,
  category text not null,
  description text not null,
  visualization_prompt text,
  image_url text,
  session_type text default 'scheduled',
  scheduled_at timestamp with time zone,
  creator_id text not null,
  creator_name text not null,
  participant_count integer default 0,
  is_sample boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.intentions enable row level security;

create policy "Intentions are viewable by everyone."
  on public.intentions for select
  using ( true );

create policy "Anyone can create intentions."
  on public.intentions for insert
  with check ( true );

create policy "Anyone can update intentions."
  on public.intentions for update
  using ( true );

-- 3. Intention Participants Table
create table if not exists public.intention_participants (
  id uuid default gen_random_uuid() primary key,
  intention_id text references public.intentions(id) on delete cascade not null,
  user_id text not null,
  name text not null,
  avatar_url text,
  meditated_count integer default 0,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(intention_id, user_id)
);

alter table public.intention_participants enable row level security;

create policy "Participants are viewable by everyone."
  on public.intention_participants for select
  using ( true );

create policy "Anyone can join intentions."
  on public.intention_participants for insert
  with check ( true );

create policy "Anyone can leave intentions."
  on public.intention_participants for delete
  using ( true );

-- 4. Intention Updates (Reflections / Progress)
create table if not exists public.intention_updates (
  id text primary key,
  intention_id text references public.intentions(id) on delete cascade not null,
  author_id text not null,
  author_name text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.intention_updates enable row level security;

create policy "Updates are viewable by everyone."
  on public.intention_updates for select
  using ( true );

create policy "Anyone can add intention updates."
  on public.intention_updates for insert
  with check ( true );

-- 5. Support Messages (Community Space)
create table if not exists public.support_messages (
  id text primary key,
  intention_id text references public.intentions(id) on delete cascade not null,
  author_id text not null,
  author_name text not null,
  author_avatar text,
  content text not null,
  reported boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.support_messages enable row level security;

create policy "Support messages are viewable by everyone."
  on public.support_messages for select
  using ( true );

create policy "Anyone can send support messages."
  on public.support_messages for insert
  with check ( true );

create policy "Anyone can report or delete support messages."
  on public.support_messages for update
  using ( true );

-- 6. Meditation Sessions Table
create table if not exists public.meditation_sessions (
  id text primary key,
  user_id text not null,
  intention_id text,
  intention_title text,
  started_at timestamp with time zone not null,
  ended_at timestamp with time zone not null,
  active_duration_seconds integer not null,
  target_duration_minutes integer not null,
  completed boolean default false,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.meditation_sessions enable row level security;

create policy "Meditation sessions are viewable by session creator."
  on public.meditation_sessions for select
  using ( true );

create policy "Anyone can record meditation sessions."
  on public.meditation_sessions for insert
  with check ( true );

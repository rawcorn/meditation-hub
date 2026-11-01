-- Coherence Hub Database Schema for Supabase (PostgreSQL)
-- Designed for 80,000+ members with appropriate indexing, RLS, and constraints.

-- 1. Profiles Table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 2. Intentions Table
create table public.intentions (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  recipient text not null,
  title text not null,
  category text not null check (category in ('Physical Wellbeing', 'Mental & Emotional Wellbeing', 'Love & Relationships', 'Financial Wellbeing', 'Global Peace', 'Other')),
  description text not null,
  visualization_prompt text,
  image_url text,
  session_type text not null default 'open' check (session_type in ('open', 'scheduled')),
  scheduled_at timestamp with time zone,
  participant_count integer default 1 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index intentions_category_idx on public.intentions(category);
create index intentions_created_at_idx on public.intentions(created_at desc);
create index intentions_scheduled_at_idx on public.intentions(scheduled_at asc) where session_type = 'scheduled';

alter table public.intentions enable row level security;
create policy "Intentions are viewable by everyone" on public.intentions for select using (true);
create policy "Authenticated users can create intentions" on public.intentions for insert with check (auth.uid() = creator_id);
create policy "Creators can update their intentions" on public.intentions for update using (auth.uid() = creator_id);
create policy "Creators can delete their intentions" on public.intentions for delete using (auth.uid() = creator_id);

-- 3. Intention Participants (Prevents duplicate joining)
create table public.intention_participants (
  id uuid default gen_random_uuid() primary key,
  intention_id uuid references public.intentions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (intention_id, user_id)
);

create index idx_participants_user on public.intention_participants(user_id);
create index idx_participants_intention on public.intention_participants(intention_id);

alter table public.intention_participants enable row level security;
create policy "Participants viewable by everyone" on public.intention_participants for select using (true);
create policy "Users can join intentions" on public.intention_participants for insert with check (auth.uid() = user_id);
create policy "Users can leave intentions" on public.intention_participants for delete using (auth.uid() = user_id);

-- 4. Intention Updates (Creator journal)
create table public.intention_updates (
  id uuid default gen_random_uuid() primary key,
  intention_id uuid references public.intentions(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_updates_intention on public.intention_updates(intention_id, created_at desc);

alter table public.intention_updates enable row level security;
create policy "Updates viewable by everyone" on public.intention_updates for select using (true);
create policy "Creators can post updates" on public.intention_updates for insert with check (auth.uid() = author_id);

-- 5. Support Messages
create table public.support_messages (
  id uuid default gen_random_uuid() primary key,
  intention_id uuid references public.intentions(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  reported boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_messages_intention on public.support_messages(intention_id, created_at desc);

alter table public.support_messages enable row level security;
create policy "Messages viewable by everyone" on public.support_messages for select using (not reported);
create policy "Authenticated users can post messages" on public.support_messages for insert with check (auth.uid() = author_id);
create policy "Users can delete own messages" on public.support_messages for delete using (auth.uid() = author_id);
create policy "Users can report messages" on public.support_messages for update using (true);

-- 6. Meditation Sessions
create table public.meditation_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  intention_id uuid references public.intentions(id) on delete set null,
  started_at timestamp with time zone not null,
  ended_at timestamp with time zone not null,
  active_duration_seconds integer not null,
  target_duration_minutes integer not null,
  completed boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_meditation_user on public.meditation_sessions(user_id, started_at desc);

alter table public.meditation_sessions enable row level security;
create policy "Users can view own meditation sessions" on public.meditation_sessions for select using (auth.uid() = user_id);
create policy "Users can record own meditation sessions" on public.meditation_sessions for insert with check (auth.uid() = user_id);

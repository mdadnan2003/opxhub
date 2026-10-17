create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  headline text not null default '',
  college text not null default '',
  course text not null default '',
  grad_year int,
  location text,
  about text not null default '',
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable by members" on public.profiles for select to authenticated using (true);
create policy "insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, college, course, grad_year, interests)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'college',''),
    coalesce(new.raw_user_meta_data->>'course',''),
    nullif(new.raw_user_meta_data->>'grad_year','')::int,
    coalesce(array(select jsonb_array_elements_text(new.raw_user_meta_data->'interests')), '{}')
  );
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 3000),
  kind text check (kind in ('achievement','project','team','opportunity','question')),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
create policy "posts readable" on public.posts for select to authenticated using (true);
create policy "create own posts" on public.posts for insert to authenticated with check (auth.uid() = author_id);
create policy "edit own posts" on public.posts for update to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "delete own posts" on public.posts for delete to authenticated using (auth.uid() = author_id);

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
grant select, insert, delete on public.post_likes to authenticated;
grant all on public.post_likes to service_role;
alter table public.post_likes enable row level security;
create policy "likes readable" on public.post_likes for select to authenticated using (true);
create policy "like as self" on public.post_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "unlike own" on public.post_likes for delete to authenticated using (auth.uid() = user_id);

create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.post_comments to authenticated;
grant all on public.post_comments to service_role;
alter table public.post_comments enable row level security;
create policy "comments readable" on public.post_comments for select to authenticated using (true);
create policy "comment as self" on public.post_comments for insert to authenticated with check (auth.uid() = user_id);
create policy "delete own comment" on public.post_comments for delete to authenticated using (auth.uid() = user_id);

create table public.post_saves (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
grant select, insert, delete on public.post_saves to authenticated;
grant all on public.post_saves to service_role;
alter table public.post_saves enable row level security;
create policy "own saves readable" on public.post_saves for select to authenticated using (auth.uid() = user_id);
create policy "save as self" on public.post_saves for insert to authenticated with check (auth.uid() = user_id);
create policy "unsave own" on public.post_saves for delete to authenticated using (auth.uid() = user_id);

create table public.connections (
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  primary key (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);
grant select, insert, update, delete on public.connections to authenticated;
grant all on public.connections to service_role;
alter table public.connections enable row level security;
create policy "see own connections" on public.connections for select to authenticated using (auth.uid() in (requester_id, addressee_id));
create policy "send request" on public.connections for insert to authenticated with check (auth.uid() = requester_id and status = 'pending');
create policy "accept request" on public.connections for update to authenticated using (auth.uid() = addressee_id) with check (auth.uid() = addressee_id);
create policy "remove connection" on public.connections for delete to authenticated using (auth.uid() in (requester_id, addressee_id));
-- SummonSpeakers initial schema.
-- Apply with the Supabase SQL editor or `supabase db push`. Idempotent: safe to
-- re-run, every statement is IF NOT EXISTS / OR REPLACE / DO-guarded.

-- ---------------------------------------------------------------------------
-- Tables (README §3)
-- ---------------------------------------------------------------------------

create table if not exists public.speakers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  role text,
  tagline text,
  bio_short text,
  bio_long text[],
  fee_min int,
  fee_max int,
  fee_on_application boolean not null default false,
  available boolean not null default true,
  location text,
  topics text[] not null default '{}',
  showreel_url text,
  headshot_path text,
  -- The auth user who owns this listing. Null while a listing submitted by
  -- email (no account) waits to be claimed.
  owner_id uuid references auth.users (id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'published')),
  created_at timestamptz not null default now()
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  blurb text,
  kind text not null default 'topic' check (kind in ('topic', 'audience', 'event', 'industry', 'location'))
);

create table if not exists public.speaker_topics (
  speaker_id uuid not null references public.speakers (id) on delete cascade,
  topic_id uuid not null references public.topics (id) on delete cascade,
  primary key (speaker_id, topic_id)
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  speaker_id uuid references public.speakers (id) on delete cascade,
  quote text not null,
  author_name text,
  author_role text,
  company text,
  result text
);

create table if not exists public.past_clients (
  id uuid primary key default gen_random_uuid(),
  speaker_id uuid not null references public.speakers (id) on delete cascade,
  name text not null
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  event_date date,
  audience_size text,
  topic_or_speaker text,
  full_name text not null,
  work_email text not null,
  budget_range text,
  city text,
  notes text,
  speaker_id uuid references public.speakers (id) on delete set null,
  -- Slug as submitted, kept even when the speaker has no row yet (a roster
  -- name, or a full profile still living in src/data/speakers.ts).
  speaker_slug text,
  status text not null default 'new' check (status in ('new', 'shortlisted', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists enquiries_status_created_idx on public.enquiries (status, created_at desc);
create index if not exists speakers_status_idx on public.speakers (status);
create index if not exists speakers_owner_idx on public.speakers (owner_id);

-- ---------------------------------------------------------------------------
-- Row-level security (README §3)
--
-- speakers:         readable by anyone where status = 'published';
--                   writable only by the owning speaker, and an owner can
--                   never self-publish — status stays draft/pending_review.
-- topics et al:     readable by anyone (they back published pages).
-- enquiries:        insert-only for everyone; no SELECT/UPDATE for anon or
--                   authenticated roles, so the admin inbox is the service
--                   role (email notification + Supabase dashboard) only.
-- ---------------------------------------------------------------------------

alter table public.speakers enable row level security;
alter table public.topics enable row level security;
alter table public.speaker_topics enable row level security;
alter table public.testimonials enable row level security;
alter table public.past_clients enable row level security;
alter table public.enquiries enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'speakers' and policyname = 'Published speakers are readable') then
    create policy "Published speakers are readable"
      on public.speakers for select
      using (status = 'published');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'speakers' and policyname = 'Owners read their own listing') then
    create policy "Owners read their own listing"
      on public.speakers for select
      using (auth.uid() = owner_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'speakers' and policyname = 'Owners create their own listing') then
    create policy "Owners create their own listing"
      on public.speakers for insert
      with check (auth.uid() = owner_id and status in ('draft', 'pending_review'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'speakers' and policyname = 'Owners update their own listing') then
    create policy "Owners update their own listing"
      on public.speakers for update
      using (auth.uid() = owner_id)
      with check (auth.uid() = owner_id and status in ('draft', 'pending_review'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'topics' and policyname = 'Topics are readable') then
    create policy "Topics are readable" on public.topics for select using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'speaker_topics' and policyname = 'Speaker topics are readable') then
    create policy "Speaker topics are readable" on public.speaker_topics for select using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'testimonials' and policyname = 'Testimonials are readable') then
    create policy "Testimonials are readable" on public.testimonials for select using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'past_clients' and policyname = 'Past clients are readable') then
    create policy "Past clients are readable" on public.past_clients for select using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'enquiries' and policyname = 'Anyone can submit an enquiry') then
    create policy "Anyone can submit an enquiry"
      on public.enquiries for insert
      with check (true);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Storage: speaker photos and showreel thumbnails (README §2). Public read;
-- a signed-in speaker writes only inside a folder named after their user id.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('speaker-media', 'speaker-media', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Speaker media is publicly readable') then
    create policy "Speaker media is publicly readable"
      on storage.objects for select
      using (bucket_id = 'speaker-media');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Speakers upload to their own folder') then
    create policy "Speakers upload to their own folder"
      on storage.objects for insert
      with check (bucket_id = 'speaker-media' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Speakers update their own files') then
    create policy "Speakers update their own files"
      on storage.objects for update
      using (bucket_id = 'speaker-media' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Speakers delete their own files') then
    create policy "Speakers delete their own files"
      on storage.objects for delete
      using (bucket_id = 'speaker-media' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $$;

-- Gamer Aesthetic content contract (Supabase/PostgreSQL)
-- Apply only through the approved infrastructure migration process.
create table if not exists public.game_style_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  body_markdown text not null,
  category text not null,
  tags text[] not null default '{}',
  locale text not null default 'en-US',
  status text not null default 'draft' check (status in ('draft','published')),
  author text not null default 'Tara Lindqvist',
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.game_style_articles enable row level security;
create policy "published articles are public" on public.game_style_articles for select using (status = 'published');

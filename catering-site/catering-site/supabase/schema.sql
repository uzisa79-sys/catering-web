-- Supabase > SQL Editor içinde BİR KEZ çalıştırın.
-- Tüm tablolarda RLS açıktır ve hiçbir politika tanımlanmamıştır: veriye yalnızca
-- sunucu tarafındaki (Vercel) service_role anahtarıyla erişilir, tarayıcıdan doğrudan erişilemez.

create table if not exists settings (
  key   text primary key,
  value text not null default ''
);

create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  icon       text not null default '🍽️',
  max_select int  not null default 1,        -- müşteri bu kategoriden en fazla kaç yemek seçebilir (0 = sınırsız)
  sort       int  not null default 0
);

create table if not exists dishes (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  name        text not null,
  description text not null default '',
  price       numeric(10,2) not null default 0 check (price >= 0),   -- kişi başı fiyat (₺)
  image_url   text,
  active      boolean not null default true,
  sort        int not null default 0
);
create index if not exists dishes_category_idx on dishes(category_id);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  icon text not null default '🍽️', title text not null, text text not null default '', sort int not null default 0
);
create table if not exists gallery (
  id uuid primary key default gen_random_uuid(),
  caption text not null default '', image_url text, sort int not null default 0
);
create table if not exists why_us (
  id uuid primary key default gen_random_uuid(),
  title text not null, text text not null default '', sort int not null default 0
);
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null, text text not null default '', sort int not null default 0
);
create table if not exists faq (
  id uuid primary key default gen_random_uuid(),
  question text not null, answer text not null default '', sort int not null default 0
);

create table if not exists quotes (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  phone       text not null,
  email       text,
  event_type  text not null default '',
  event_date  date,
  people      int  not null,
  note        text not null default '',
  items       jsonb not null default '[]',
  per_person  numeric(10,2) not null default 0,
  total       numeric(12,2) not null default 0,
  status      text not null default 'yeni'
);
create index if not exists quotes_created_idx on quotes(created_at desc);

alter table settings   enable row level security;
alter table categories enable row level security;
alter table dishes     enable row level security;
alter table services   enable row level security;
alter table gallery    enable row level security;
alter table why_us     enable row level security;
alter table reviews    enable row level security;
alter table faq        enable row level security;
alter table quotes     enable row level security;

-- Fotoğraflar için herkese açık (okuma) Storage klasörü. Yükleme sadece sunucudan yapılır.
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

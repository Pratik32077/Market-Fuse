-- 2024-10-24 init migration for MarketFuse

create table profiles (
  id uuid primary key references auth.users(id),
  business_name text not null,
  contact_email text,
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table order_forms (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references profiles(id),
  slug text unique not null,
  title text not null,
  description text,
  is_active boolean not null default true,
  configuration jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create type order_status as enum (
  'REQUESTED','NEEDS_CLARIFICATION','CONFIRMED','IN_PRODUCTION','READY','DISPATCHED','COMPLETED','CANCELLED'
);

create table orders (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references profiles(id),
  form_id uuid references order_forms(id),
  order_number text not null,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  product_type text not null,
  quantity integer not null check (quantity > 0),
  required_by date,
  specifications jsonb not null default '{}',
  reference_urls jsonb not null default '[]',
  agreed_total numeric(12,2) check (agreed_total >= 0),
  deposit_due numeric(12,2) not null default 0 check (deposit_due >= 0),
  status order_status not null default 'REQUESTED',
  customer_approval_at timestamptz,
  internal_notes text,
  next_action_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (seller_id, order_number)
);

create table order_status_history (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  seller_id uuid not null references profiles(id),
  from_status order_status,
  to_status order_status not null,
  changed_by uuid references auth.users(id),
  note text,
  created_at timestamptz default now()
);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  seller_id uuid not null references profiles(id),
  amount numeric(12,2) not null check (amount > 0),
  payment_date date not null,
  method text not null,
  reference text,
  notes text,
  recorded_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Row Level Security policies (basic example)

alter table profiles enable row level security;
create policy "Profiles can view own" on profiles using (auth.uid() = id);
create policy "Profiles can update own" on profiles for update using (auth.uid() = id);

alter table order_forms enable row level security;
create policy "Forms can view own" on order_forms using (seller_id = auth.uid());
create policy "Forms can insert own" on order_forms for insert with check (seller_id = auth.uid());
create policy "Forms can update own" on order_forms for update using (seller_id = auth.uid());

alter table orders enable row level security;
create policy "Orders can view own" on orders using (seller_id = auth.uid());
create policy "Orders can insert via public" on orders for insert to anon with check (
  seller_id = (select seller_id from order_forms where id = NEW.form_id)
);

create policy "Orders can update own" on orders for update using (seller_id = auth.uid());

alter table order_status_history enable row level security;
create policy "History can view own" on order_status_history using (seller_id = auth.uid());
create policy "History can insert own" on order_status_history for insert with check (seller_id = auth.uid());

alter table payments enable row level security;
create policy "Payments can view own" on payments using (seller_id = auth.uid());
create policy "Payments can insert own" on payments for insert with check (seller_id = auth.uid());
create policy "Payments can update own" on payments for update using (seller_id = auth.uid());

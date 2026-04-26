-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    avatar_url text,
    bio text,
    is_premium boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subscriptions table
create table public.subscriptions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade not null,
    status text check (status in ('pending', 'active', 'expired', 'failed')) not null default 'pending',
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    amount decimal not null,
    phone_number text not null,
    mpesa_receipt text,
    checkout_request_id text unique, -- From M-Pesa STK Push
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;

-- Profile policies
create policy "Users can view their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Public profiles are viewable by everyone"
    on public.profiles for select
    using (true);

-- Subscription policies
create policy "Users can view their own subscriptions"
    on public.subscriptions for select
    using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table public.subscriptions;
alter publication supabase_realtime add table public.profiles;

-- Function to handle profile creation on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_status on public.subscriptions(status);
create index idx_subscriptions_checkout_request_id on public.subscriptions(checkout_request_id);

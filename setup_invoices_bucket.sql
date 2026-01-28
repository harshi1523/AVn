-- 1. Create the 'order-invoices' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('order-invoices', 'order-invoices', true)
on conflict (id) do nothing;

-- 2. Drop existing policies to avoid "already exists" errors (Clean Slate)
drop policy if exists "Public Access Invoices" on storage.objects;
drop policy if exists "Authenticated Users Upload Invoices" on storage.objects;
drop policy if exists "Authenticated Users Update Invoices" on storage.objects;
drop policy if exists "Public Upload Invoices" on storage.objects; -- In case you ran a version with this name

-- 3. Create Policies

-- Allow public access to view/download invoices
create policy "Public Access Invoices"
  on storage.objects for select
  using ( bucket_id = 'order-invoices' );

-- Allow PUBLIC uploads (INSERT)
-- Essential because the App uses Firebase Auth, so to Supabase, the user is 'anonymous'.
-- We must allow 'anon' uploads for this to work from the frontend without a backend proxy.
create policy "Public Upload Invoices"
  on storage.objects for insert
  with check ( bucket_id = 'order-invoices' );

-- Allow update (if needed, e.g. overwriting same invoice ID)
create policy "Public Update Invoices"
  on storage.objects for update
  with check ( bucket_id = 'order-invoices' );

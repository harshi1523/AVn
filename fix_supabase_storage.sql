-- SAFE FIX FOR SUPABASE STORAGE
-- Run this entire script in Supabase SQL Editor

-- 1. Create bucket if missing
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 2. RESET POLICIES (Drop them first to avoid "already exists" error)
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Anon Upload" on storage.objects;
drop policy if exists "Authenticated Users Upload" on storage.objects;
drop policy if exists "Authenticated Users Update" on storage.objects;

-- 3. CREATE POLICIES

-- Allow everyone to READ images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

-- Allow everyone to UPLOAD images (Needed for Firebase Auth users)
create policy "Anon Upload"
  on storage.objects for insert
  with check ( bucket_id = 'product-images' );

-- Allow everyone to UPDATE images
create policy "Anon Update"
  on storage.objects for update
  with check ( bucket_id = 'product-images' );

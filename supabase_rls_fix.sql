-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO FIX THE UPLOAD ERROR

-- 1. Create the bucket if it doesn't exist (this usually works fine)
insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', true)
on conflict (id) do nothing;

-- NOTE: We skipped 'alter table storage.objects enable row level security' 
-- because it's already enabled by default and causes permission errors.

-- 2. DROP conflicting policies if they exist to avoid errors
drop policy if exists "Allow public uploads" on storage.objects;
drop policy if exists "Allow public viewing" on storage.objects;

-- 3. ALLOW UPLOADS: Allow anyone to upload to this bucket
create policy "Allow public uploads"
on storage.objects for insert
to public
with check ( bucket_id = 'kyc-documents' );

-- 4. ALLOW VIEWING: Allow anyone to view/download these files
create policy "Allow public viewing"
on storage.objects for select
to public
using ( bucket_id = 'kyc-documents' );

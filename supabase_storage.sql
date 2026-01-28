-- Create the 'product-images' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Allow public access to view images (SELECT)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

-- Allow authenticated users to upload images (INSERT)
create policy "Authenticated Users Upload"
  on storage.objects for insert
  with check ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

-- Allow authenticated users to update their own images (UPDATE) [Optional]
create policy "Authenticated Users Update"
  on storage.objects for update
  with check ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

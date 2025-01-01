-- Drop existing policies to clean up
drop policy if exists account_image on storage.objects;

-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Grant access to authenticated users for the account_image bucket
grant all on storage.objects to authenticated;

-- Create a more permissive policy for account images
create policy "Allow authenticated users to upload their own avatar"
    on storage.objects for all
    to authenticated
    using (bucket_id = 'account_image' 
           and (storage.foldername(name))[1] = 'account_image'
           and auth.role() = 'authenticated')
    with check (bucket_id = 'account_image' 
                and (storage.foldername(name))[1] = 'account_image'
                and auth.role() = 'authenticated');

-- Ensure public access for viewing images
create policy "Give public access to account images"
    on storage.objects for select
    to public
    using (bucket_id = 'account_image');

-- Make sure bucket exists and is public
insert into storage.buckets (id, name, public)
values ('account_image', 'account_image', true)
on conflict (id) do update set public = true;

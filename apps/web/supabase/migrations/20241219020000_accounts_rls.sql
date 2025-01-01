-- Enable RLS on accounts table if not already enabled
alter table if exists public.accounts enable row level security;

-- Add RLS policy for accounts table
create policy "Users can view accounts they are members of"
on public.accounts for select
to authenticated
using (
    exists (
        select 1 
        from public.accounts_memberships 
        where account_id = id 
        and user_id = auth.uid()
    )
);

-- Add RLS policy for accounts table updates
create policy "Users can update accounts they own"
on public.accounts for update
to authenticated
using (
    exists (
        select 1 
        from public.accounts_memberships am
        join public.roles r on r.id = am.role_id
        where am.account_id = id 
        and am.user_id = auth.uid()
        and r.name = 'owner'
    )
)
with check (
    exists (
        select 1 
        from public.accounts_memberships am
        join public.roles r on r.id = am.role_id
        where am.account_id = id 
        and am.user_id = auth.uid()
        and r.name = 'owner'
    )
);

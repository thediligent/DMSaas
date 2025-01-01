-- RLS Policies for Makerkit and CMS/CRM tables

-- Roles Policies
create policy "Anyone can read roles"
on public.roles for select
to authenticated
using (true);

-- Role Permissions Policies
create policy "Anyone can read role permissions"
on public.role_permissions for select
to authenticated
using (true);

-- Account Memberships Policies
create policy "Users can read their own memberships"
on public.accounts_memberships for select
to authenticated
using (user_id = auth.uid());

create policy "Account owners can manage memberships"
on public.accounts_memberships for all
to authenticated
using (
    exists (
        select 1 from public.accounts_memberships am2
        join public.roles r on r.id = am2.role_id
        where am2.account_id = account_id
        and am2.user_id = auth.uid()
        and r.name = 'owner'
    )
);

-- Invitations Policies
create policy "Users can read invitations for their accounts"
on public.invitations for select
to authenticated
using (
    exists (
        select 1 from public.accounts_memberships am
        where am.account_id = account_id
        and am.user_id = auth.uid()
    )
);

create policy "Account admins can manage invitations"
on public.invitations for all
to authenticated
using (
    exists (
        select 1 from public.accounts_memberships am
        join public.roles r on r.id = am.role_id
        where am.account_id = account_id
        and am.user_id = auth.uid()
        and r.name in ('owner', 'admin')
    )
);

-- Billing Customers Policies
create policy "Users can view billing for their accounts"
on public.billing_customers for select
to authenticated
using (
    exists (
        select 1 from public.accounts_memberships am
        where am.account_id = id
        and am.user_id = auth.uid()
    )
);

create policy "Account owners can manage billing"
on public.billing_customers for all
to authenticated
using (
    exists (
        select 1 from public.accounts_memberships am
        join public.roles r on r.id = am.role_id
        where am.account_id = id
        and am.user_id = auth.uid()
        and r.name = 'owner'
    )
);

-- Subscriptions and Items Policies
create policy "Users can view subscriptions for their accounts"
on public.subscriptions for select
to authenticated
using (
    exists (
        select 1 from public.accounts_memberships am
        where am.account_id = account_id
        and am.user_id = auth.uid()
    )
);

create policy "Account owners can manage subscriptions"
on public.subscriptions for all
to authenticated
using (
    exists (
        select 1 from public.accounts_memberships am
        join public.roles r on r.id = am.role_id
        where am.account_id = account_id
        and am.user_id = auth.uid()
        and r.name = 'owner'
    )
);

create policy "Users can view subscription items"
on public.subscription_items for select
to authenticated
using (
    exists (
        select 1 from public.subscriptions s
        join public.accounts_memberships am on am.account_id = s.account_id
        where s.id = subscription_id
        and am.user_id = auth.uid()
    )
);

-- Orders and Items Policies
create policy "Users can view orders for their accounts"
on public.orders for select
to authenticated
using (
    exists (
        select 1 from public.accounts_memberships am
        where am.account_id = account_id
        and am.user_id = auth.uid()
    )
);

create policy "Account owners can manage orders"
on public.orders for all
to authenticated
using (
    exists (
        select 1 from public.accounts_memberships am
        join public.roles r on r.id = am.role_id
        where am.account_id = account_id
        and am.user_id = auth.uid()
        and r.name = 'owner'
    )
);

create policy "Users can view order items"
on public.order_items for select
to authenticated
using (
    exists (
        select 1 from public.orders o
        join public.accounts_memberships am on am.account_id = o.account_id
        where o.id = order_id
        and am.user_id = auth.uid()
    )
);

-- Notifications Policies
create policy "Users can view their own notifications"
on public.notifications for select
to authenticated
using (user_id = auth.uid());

create policy "Users can update their own notifications"
on public.notifications for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Workspaces Policies
create policy "Users can view workspaces they are members of"
on public.workspaces for select
to authenticated
using (
    exists (
        select 1 from public.accounts_memberships am
        where am.account_id = account_id
        and am.user_id = auth.uid()
    )
);

create policy "Account owners and admins can manage workspaces"
on public.workspaces for all
to authenticated
using (
    exists (
        select 1 from public.accounts_memberships am
        join public.roles r on r.id = am.role_id
        where am.account_id = account_id
        and am.user_id = auth.uid()
        and r.name in ('owner', 'admin')
    )
);

-- Workspace Settings Policies
create policy "Users can view workspace settings they have access to"
on public.workspace_settings for select
to authenticated
using (
    exists (
        select 1 from public.workspaces w
        join public.accounts_memberships am on am.account_id = w.account_id
        where w.id = workspace_id
        and am.user_id = auth.uid()
    )
);

create policy "Account owners and admins can manage workspace settings"
on public.workspace_settings for all
to authenticated
using (
    exists (
        select 1 from public.workspaces w
        join public.accounts_memberships am on am.account_id = w.account_id
        join public.roles r on r.id = am.role_id
        where w.id = workspace_id
        and am.user_id = auth.uid()
        and r.name in ('owner', 'admin')
    )
);

-- Content (Pages & Posts) Policies
create policy "Anyone can view published content"
on public.pages for select
to authenticated
using (
    published = true
    or (
        exists (
            select 1 from public.workspaces w
            join public.accounts_memberships am on am.account_id = w.account_id
            where w.id = workspace_id
            and am.user_id = auth.uid()
        )
    )
);

create policy "Content managers can manage pages"
on public.pages for all
to authenticated
using (
    exists (
        select 1 from public.workspaces w
        join public.accounts_memberships am on am.account_id = w.account_id
        join public.roles r on r.id = am.role_id
        where w.id = workspace_id
        and am.user_id = auth.uid()
        and r.name in ('owner', 'admin', 'editor')
    )
);

create policy "Anyone can view published posts"
on public.posts for select
to authenticated
using (
    published = true
    or (
        exists (
            select 1 from public.workspaces w
            join public.accounts_memberships am on am.account_id = w.account_id
            where w.id = workspace_id
            and am.user_id = auth.uid()
        )
    )
);

create policy "Content managers can manage posts"
on public.posts for all
to authenticated
using (
    exists (
        select 1 from public.workspaces w
        join public.accounts_memberships am on am.account_id = w.account_id
        join public.roles r on r.id = am.role_id
        where w.id = workspace_id
        and am.user_id = auth.uid()
        and r.name in ('owner', 'admin', 'editor')
    )
);

-- Forms Policies
create policy "Users can view forms they have access to"
on public.forms for select
to authenticated
using (
    exists (
        select 1 from public.workspaces w
        join public.accounts_memberships am on am.account_id = w.account_id
        where w.id = workspace_id
        and am.user_id = auth.uid()
    )
);

create policy "Content managers can manage forms"
on public.forms for all
to authenticated
using (
    exists (
        select 1 from public.workspaces w
        join public.accounts_memberships am on am.account_id = w.account_id
        join public.roles r on r.id = am.role_id
        where w.id = workspace_id
        and am.user_id = auth.uid()
        and r.name in ('owner', 'admin', 'editor')
    )
);

-- Form Submissions Policies
create policy "Form managers can view submissions"
on public.form_submissions for select
to authenticated
using (
    exists (
        select 1 from public.forms f
        join public.workspaces w on w.id = f.workspace_id
        join public.accounts_memberships am on am.account_id = w.account_id
        join public.roles r on r.id = am.role_id
        where f.id = form_id
        and am.user_id = auth.uid()
        and r.name in ('owner', 'admin', 'editor')
    )
);

create policy "Anyone can submit forms"
on public.form_submissions for insert
to authenticated
with check (true);

-- Media Library Policies
create policy "Users can view media they have access to"
on public.media_library for select
to authenticated
using (
    exists (
        select 1 from public.workspaces w
        join public.accounts_memberships am on am.account_id = w.account_id
        where w.id = workspace_id
        and am.user_id = auth.uid()
    )
);

create policy "Content managers can manage media"
on public.media_library for all
to authenticated
using (
    exists (
        select 1 from public.workspaces w
        join public.accounts_memberships am on am.account_id = w.account_id
        join public.roles r on r.id = am.role_id
        where w.id = workspace_id
        and am.user_id = auth.uid()
        and r.name in ('owner', 'admin', 'editor')
    )
);

-- Contacts (CRM) Policies
create policy "Users can view contacts they have access to"
on public.contacts for select
to authenticated
using (
    exists (
        select 1 from public.workspaces w
        join public.accounts_memberships am on am.account_id = w.account_id
        where w.id = workspace_id
        and am.user_id = auth.uid()
    )
);

create policy "Account members can manage contacts"
on public.contacts for all
to authenticated
using (
    exists (
        select 1 from public.workspaces w
        join public.accounts_memberships am on am.account_id = w.account_id
        where w.id = workspace_id
        and am.user_id = auth.uid()
    )
);

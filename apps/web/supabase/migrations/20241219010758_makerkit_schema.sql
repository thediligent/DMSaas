-- Core Makerkit Tables

-- Roles table
create table if not exists public.roles (
    id uuid primary key default extensions.uuid_generate_v4(),
    name varchar(255) not null,
    description text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Role Permissions table
create table if not exists public.role_permissions (
    id uuid primary key default extensions.uuid_generate_v4(),
    role_id uuid references public.roles(id) on delete cascade,
    permission varchar(255) not null,
    created_at timestamp with time zone default now(),
    unique(role_id, permission)
);

-- Account Memberships table
create table if not exists public.accounts_memberships (
    id uuid primary key default extensions.uuid_generate_v4(),
    account_id uuid references public.accounts(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    role_id uuid references public.roles(id) on delete set null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique(account_id, user_id)
);

-- Invitations table
create table if not exists public.invitations (
    id uuid primary key default extensions.uuid_generate_v4(),
    account_id uuid references public.accounts(id) on delete cascade,
    role_id uuid references public.roles(id) on delete set null,
    email varchar(320) not null,
    token uuid not null unique default extensions.uuid_generate_v4(),
    invited_by uuid references auth.users(id) on delete set null,
    expires_at timestamp with time zone not null default (now() + interval '24 hours'),
    created_at timestamp with time zone default now(),
    unique(account_id, email)
);

-- Billing Customers table
create table if not exists public.billing_customers (
    id uuid primary key references public.accounts(id) on delete cascade,
    customer_id varchar(255) unique,
    email varchar(320),
    active boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Subscriptions table
create table if not exists public.subscriptions (
    id uuid primary key default extensions.uuid_generate_v4(),
    account_id uuid references public.accounts(id) on delete cascade,
    status varchar(50) not null,
    price_id varchar(255),
    quantity integer,
    cancel_at_period_end boolean default false,
    currency varchar(10),
    interval varchar(20),
    interval_count integer,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    trial_end timestamp with time zone,
    trial_start timestamp with time zone,
    cancel_at timestamp with time zone,
    canceled_at timestamp with time zone,
    ended_at timestamp with time zone,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone
);

-- Subscription Items table
create table if not exists public.subscription_items (
    id uuid primary key default extensions.uuid_generate_v4(),
    subscription_id uuid references public.subscriptions(id) on delete cascade,
    price_id varchar(255),
    quantity integer,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Orders table
create table if not exists public.orders (
    id uuid primary key default extensions.uuid_generate_v4(),
    account_id uuid references public.accounts(id) on delete cascade,
    status varchar(50) not null,
    total integer not null,
    currency varchar(10) not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Order Items table
create table if not exists public.order_items (
    id uuid primary key default extensions.uuid_generate_v4(),
    order_id uuid references public.orders(id) on delete cascade,
    price_id varchar(255),
    quantity integer,
    amount integer,
    created_at timestamp with time zone default now()
);

-- Notifications table
create table if not exists public.notifications (
    id uuid primary key default extensions.uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    type varchar(255) not null,
    data jsonb default '{}'::jsonb,
    read boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- CMS/CRM Specific Tables

-- Workspaces table
create table if not exists public.workspaces (
    id uuid primary key default extensions.uuid_generate_v4(),
    account_id uuid references public.accounts(id) on delete cascade,
    name varchar(255) not null,
    slug varchar(255) unique not null,
    domain varchar(255) unique,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Workspace Settings table
create table if not exists public.workspace_settings (
    id uuid primary key default extensions.uuid_generate_v4(),
    workspace_id uuid references public.workspaces(id) on delete cascade,
    logo_url varchar(1000),
    primary_color varchar(7),
    accent_color varchar(7),
    settings jsonb default '{}'::jsonb,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Pages table
create table if not exists public.pages (
    id uuid primary key default extensions.uuid_generate_v4(),
    workspace_id uuid references public.workspaces(id) on delete cascade,
    title varchar(255) not null,
    slug varchar(255) not null,
    content jsonb,
    meta_description varchar(1000),
    published boolean default false,
    published_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique(workspace_id, slug)
);

-- Blog Posts table
create table if not exists public.posts (
    id uuid primary key default extensions.uuid_generate_v4(),
    workspace_id uuid references public.workspaces(id) on delete cascade,
    title varchar(255) not null,
    slug varchar(255) not null,
    content jsonb,
    excerpt varchar(1000),
    featured_image varchar(1000),
    meta_description varchar(1000),
    published boolean default false,
    published_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique(workspace_id, slug)
);

-- Forms table
create table if not exists public.forms (
    id uuid primary key default extensions.uuid_generate_v4(),
    workspace_id uuid references public.workspaces(id) on delete cascade,
    name varchar(255) not null,
    fields jsonb not null default '[]'::jsonb,
    settings jsonb default '{}'::jsonb,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Form Submissions table
create table if not exists public.form_submissions (
    id uuid primary key default extensions.uuid_generate_v4(),
    form_id uuid references public.forms(id) on delete cascade,
    data jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default now()
);

-- Media Library table
create table if not exists public.media_library (
    id uuid primary key default extensions.uuid_generate_v4(),
    workspace_id uuid references public.workspaces(id) on delete cascade,
    filename varchar(255) not null,
    original_name varchar(255),
    mime_type varchar(255),
    size integer,
    width integer,
    height integer,
    url varchar(1000) not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Contacts (CRM) table
create table if not exists public.contacts (
    id uuid primary key default extensions.uuid_generate_v4(),
    workspace_id uuid references public.workspaces(id) on delete cascade,
    email varchar(320),
    first_name varchar(255),
    last_name varchar(255),
    phone varchar(50),
    company varchar(255),
    title varchar(255),
    tags jsonb not null default '{}'::jsonb,
    custom_fields jsonb default '{}'::jsonb,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique(workspace_id, email)
);

-- Enable Row Level Security (RLS)
alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.accounts_memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.billing_customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.notifications enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_settings enable row level security;
alter table public.pages enable row level security;
alter table public.posts enable row level security;
alter table public.forms enable row level security;
alter table public.form_submissions enable row level security;
alter table public.media_library enable row level security;
alter table public.contacts enable row level security;

-- Create indexes for better performance
create index if not exists idx_accounts_memberships_account_id on public.accounts_memberships(account_id);
create index if not exists idx_accounts_memberships_user_id on public.accounts_memberships(user_id);
create index if not exists idx_workspaces_account_id on public.workspaces(account_id);
create index if not exists idx_pages_workspace_id on public.pages(workspace_id);
create index if not exists idx_posts_workspace_id on public.posts(workspace_id);
create index if not exists idx_forms_workspace_id on public.forms(workspace_id);
create index if not exists idx_media_library_workspace_id on public.media_library(workspace_id);
create index if not exists idx_contacts_workspace_id on public.contacts(workspace_id);
create index if not exists idx_contacts_email on public.contacts(email);

-- Insert default roles
insert into public.roles (name, description)
values 
    ('owner', 'Workspace owner with full access'),
    ('admin', 'Administrator with most permissions'),
    ('editor', 'Can manage content and forms'),
    ('member', 'Basic access to workspace');

-- Insert default permissions for roles
DO $$ 
DECLARE
    owner_role_id uuid;
    admin_role_id uuid;
    editor_role_id uuid;
    member_role_id uuid;
BEGIN
    -- Get role IDs
    SELECT id INTO owner_role_id FROM public.roles WHERE name = 'owner';
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
    SELECT id INTO editor_role_id FROM public.roles WHERE name = 'editor';
    SELECT id INTO member_role_id FROM public.roles WHERE name = 'member';

    -- Owner permissions
    INSERT INTO public.role_permissions (role_id, permission) VALUES
    (owner_role_id, 'manage.workspace'),
    (owner_role_id, 'manage.members'),
    (owner_role_id, 'manage.billing'),
    (owner_role_id, 'manage.content'),
    (owner_role_id, 'manage.forms'),
    (owner_role_id, 'view.workspace');

    -- Admin permissions
    INSERT INTO public.role_permissions (role_id, permission) VALUES
    (admin_role_id, 'manage.workspace'),
    (admin_role_id, 'manage.members'),
    (admin_role_id, 'manage.content'),
    (admin_role_id, 'manage.forms'),
    (admin_role_id, 'view.workspace');

    -- Editor permissions
    INSERT INTO public.role_permissions (role_id, permission) VALUES
    (editor_role_id, 'manage.content'),
    (editor_role_id, 'manage.forms'),
    (editor_role_id, 'view.workspace');

    -- Member permissions
    INSERT INTO public.role_permissions (role_id, permission) VALUES
    (member_role_id, 'view.workspace');
END $$;

-- Create a storage bucket for workspace assets
insert into storage.buckets (id, name, public)
values ('workspace_assets', 'workspace_assets', false);

-- Create RLS policies for workspace assets
create policy "Workspace members can read workspace assets"
on storage.objects for select
to authenticated
using (
    bucket_id = 'workspace_assets'
    and (
        exists(
            select 1
            from public.accounts_memberships am
            join public.workspaces w on w.account_id = am.account_id
            where am.user_id = auth.uid()
            and storage.foldername(name) = w.id::text
        )
    )
);

create policy "Workspace admins can insert workspace assets"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'workspace_assets'
    and (
        exists(
            select 1
            from public.accounts_memberships am
            join public.workspaces w on w.account_id = am.account_id
            join public.roles r on r.id = am.role_id
            where am.user_id = auth.uid()
            and storage.foldername(name) = w.id::text
            and (r.name = 'owner' or r.name = 'admin')
        )
    )
);

create policy "Workspace admins can update workspace assets"
on storage.objects for update
to authenticated
using (
    bucket_id = 'workspace_assets'
    and (
        exists(
            select 1
            from public.accounts_memberships am
            join public.workspaces w on w.account_id = am.account_id
            join public.roles r on r.id = am.role_id
            where am.user_id = auth.uid()
            and storage.foldername(name) = w.id::text
            and (r.name = 'owner' or r.name = 'admin')
        )
    )
);

create policy "Workspace admins can delete workspace assets"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'workspace_assets'
    and (
        exists(
            select 1
            from public.accounts_memberships am
            join public.workspaces w on w.account_id = am.account_id
            join public.roles r on r.id = am.role_id
            where am.user_id = auth.uid()
            and storage.foldername(name) = w.id::text
            and (r.name = 'owner' or r.name = 'admin')
        )
    )
);

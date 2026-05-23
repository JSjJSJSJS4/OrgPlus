-- EventPlan Database Schema and Initial Data
-- To be run in the Supabase SQL Editor

-- 1. CLEANUP (If resetting)
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop function if exists public.handle_new_user();
-- drop table if exists public.event_reports;
-- drop table if exists public.event_announcements;
-- drop table if exists public.event_registrations;
-- drop table if exists public.event_committees;
-- drop table if exists public.events;
-- drop table if exists public.onboarding_templates;
-- drop table if exists public.applications;
-- drop table if exists public.recruitment_campaigns;
-- drop table if exists public.profiles;

-- 2. CREATE CUSTOM ENUMS
create type user_role as enum ('super_admin', 'officer', 'committee_member', 'member', 'applicant');
create type campaign_type as enum ('member', 'officer');
create type campaign_status as enum ('draft', 'active', 'closed');
create type application_status as enum ('pending', 'screening', 'interview', 'approved', 'rejected');
create type onboarding_status_type as enum ('not_started', 'in_progress', 'completed');
create type event_status as enum ('proposal_draft', 'proposal_pending', 'approved', 'rejected', 'ongoing', 'completed', 'cancelled');
create type committee_role as enum ('head', 'coordinator', 'member');
create type registration_status as enum ('registered', 'cancelled');
create type attendance_status_type as enum ('absent', 'present', 'excused');

-- 3. CREATE TABLES

-- Profiles Table (links to auth.users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text not null,
    email text not null,
    avatar_url text,
    role user_role not null default 'applicant',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recruitment Campaigns Table
create table public.recruitment_campaigns (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text not null,
    type campaign_type not null default 'member',
    status campaign_status not null default 'draft',
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Applications Table
create table public.applications (
    id uuid default gen_random_uuid() primary key,
    campaign_id uuid references public.recruitment_campaigns(id) on delete cascade not null,
    applicant_id uuid references public.profiles(id) on delete cascade not null,
    status application_status not null default 'pending',
    answers jsonb not null default '{}'::jsonb,
    resume_url text,
    feedback text,
    onboarding_status onboarding_status_type not null default 'not_started',
    onboarding_steps_completed jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_campaign_applicant unique (campaign_id, applicant_id)
);

-- Onboarding Templates Table
create table public.onboarding_templates (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    role_target user_role not null default 'member',
    steps jsonb not null default '[]'::jsonb, -- Array of objects: { "id": "1", "title": "...", "description": "...", "required": true }
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Events Table
create table public.events (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text not null,
    date timestamp with time zone not null,
    location text not null,
    status event_status not null default 'proposal_draft',
    proposal_by uuid references public.profiles(id) on delete set null,
    approved_by uuid references public.profiles(id) on delete set null,
    approval_notes text,
    max_attendees integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Event Committees Table
create table public.event_committees (
    id uuid default gen_random_uuid() primary key,
    event_id uuid references public.events(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    role committee_role not null default 'member',
    department text not null, -- e.g. Logistics, Marketing, Technical, Finance
    status text not null default 'assigned',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_event_user_committee unique (event_id, user_id)
);

-- Event Registrations Table
create table public.event_registrations (
    id uuid default gen_random_uuid() primary key,
    event_id uuid references public.events(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    status registration_status not null default 'registered',
    attendance_status attendance_status_type not null default 'absent',
    registered_at timestamp with time zone default timezone('utc'::text, now()) not null,
    attended_at timestamp with time zone,
    constraint unique_event_user_registration unique (event_id, user_id)
);

-- Event Announcements Table
create table public.event_announcements (
    id uuid default gen_random_uuid() primary key,
    event_id uuid references public.events(id) on delete cascade not null,
    title text not null,
    content text not null,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Event Reports Table
create table public.event_reports (
    id uuid default gen_random_uuid() primary key,
    event_id uuid references public.events(id) on delete cascade unique not null,
    summary text not null,
    budget_spent numeric(12,2) default 0.00 not null,
    documentation_url text,
    submitted_by uuid references public.profiles(id) on delete set null,
    submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for all tables
alter table public.profiles enable row level security;
alter table public.recruitment_campaigns enable row level security;
alter table public.applications enable row level security;
alter table public.onboarding_templates enable row level security;
alter table public.events enable row level security;
alter table public.event_committees enable row level security;
alter table public.event_registrations enable row level security;
alter table public.event_announcements enable row level security;
alter table public.event_reports enable row level security;

-- 4. ROW LEVEL SECURITY (RLS) POLICIES

-- Profiles Policies
create policy "Allow public read of profiles" on public.profiles for select using (true);
create policy "Allow users to update their own profile" on public.profiles for update using (auth.uid() = id);

-- Recruitment Campaigns Policies
create policy "Allow public read of active/closed campaigns" on public.recruitment_campaigns for select using (status != 'draft' or exists (
    select 1 from public.profiles where id = auth.uid() and role in ('officer', 'super_admin')
));
create policy "Allow officers and admins to manage campaigns" on public.recruitment_campaigns for all using (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('officer', 'super_admin')
));

-- Applications Policies
create policy "Allow applicants to view their own application" on public.applications for select using (auth.uid() = applicant_id);
create policy "Allow applicants to submit applications" on public.applications for insert with check (auth.uid() = applicant_id);
create policy "Allow officers and admins full access to applications" on public.applications for all using (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('officer', 'super_admin')
));

-- Onboarding Templates Policies
create policy "Allow all users to view templates" on public.onboarding_templates for select using (true);
create policy "Allow officers/admins to manage templates" on public.onboarding_templates for all using (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('officer', 'super_admin')
));

-- Events Policies
create policy "Allow members to view approved/ongoing/completed events" on public.events for select using (status in ('approved', 'ongoing', 'completed') or exists (
    select 1 from public.profiles where id = auth.uid() and role in ('officer', 'super_admin')
));
create policy "Allow officers and admins full access to events" on public.events for all using (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('officer', 'super_admin')
));

-- Event Committees Policies
create policy "Allow members to view committee assignments" on public.event_committees for select using (true);
create policy "Allow officers/admins and committee heads to manage committees" on public.event_committees for all using (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('officer', 'super_admin')
) or exists (
    select 1 from public.event_committees head where head.event_id = event_id and head.user_id = auth.uid() and head.role = 'head'
));
create policy "Allow members to insert own pending committee application" on public.event_committees for insert with check (auth.uid() = user_id and status = 'pending');
create policy "Allow members to delete own pending committee application" on public.event_committees for delete using (auth.uid() = user_id and status = 'pending');

-- Event Registrations Policies
create policy "Allow registered users to view their registrations" on public.event_registrations for select using (auth.uid() = user_id or exists (
    select 1 from public.profiles where id = auth.uid() and role in ('officer', 'super_admin')
));
create policy "Allow users to register themselves" on public.event_registrations for insert with check (auth.uid() = user_id);
create policy "Allow users to update registration status" on public.event_registrations for update using (auth.uid() = user_id or exists (
    select 1 from public.profiles where id = auth.uid() and role in ('officer', 'super_admin')
));

-- Event Announcements Policies
create policy "Allow registered attendees and org members to view announcements" on public.event_announcements for select using (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('member', 'committee_member', 'officer', 'super_admin')
) or exists (
    select 1 from public.event_registrations where event_id = event_id and user_id = auth.uid() and status = 'registered'
));
create policy "Allow officers, admins, and committee heads to post announcements" on public.event_announcements for all using (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('officer', 'super_admin')
) or exists (
    select 1 from public.event_committees head where head.event_id = event_id and head.user_id = auth.uid() and head.role = 'head'
));

-- Event Reports Policies
create policy "Allow members to view event reports" on public.event_reports for select using (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('member', 'committee_member', 'officer', 'super_admin')
));
create policy "Allow officers, admins, and committee heads to manage reports" on public.event_reports for all using (exists (
    select 1 from public.profiles where id = auth.uid() and role in ('officer', 'super_admin')
) or exists (
    select 1 from public.event_committees head where head.event_id = event_id and head.user_id = auth.uid() and head.role = 'head'
));

-- 5. TRIGGER FOR SYNCING NEW USER REGISTRATION

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New Member'),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'applicant'::user_role)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper function to auto-update timestamp
create or replace function public.update_modified_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_profiles_modtime before update on public.profiles for each row execute procedure update_modified_column();
create trigger update_applications_modtime before update on public.applications for each row execute procedure update_modified_column();
create trigger update_events_modtime before update on public.events for each row execute procedure update_modified_column();

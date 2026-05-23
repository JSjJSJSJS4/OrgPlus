-- Seed data for EventPlan
-- Note: Profiles will be inserted automatically when new users register via Supabase Auth.
-- However, we seed recruitment campaigns, onboarding templates, and event options.

-- 1. Insert Onboarding Templates
insert into public.onboarding_templates (title, description, role_target, steps)
values 
('General Member Onboarding', 'Standard onboarding process for newly approved members.', 'member', '[
  { "id": "code_of_conduct", "title": "Read Code of Conduct", "description": "Review and agree to the organization code of conduct.", "required": true },
  { "id": "profile_setup", "title": "Setup Profile Details", "description": "Upload avatar and fill in contact numbers.", "required": true },
  { "id": "discord_join", "title": "Join Discord Community Server", "description": "Connect your discord and join the official discussion server.", "required": false },
  { "id": "orientation_quiz", "title": "Complete Orientation Quiz", "description": "Watch the orientation video and answer the short quiz.", "required": true }
]'::jsonb),
('Organization Officer Onboarding', 'Specialized onboarding for incoming executive board members.', 'officer', '[
  { "id": "nda", "title": "Sign NDA & Officer Agreement", "description": "Digitally sign the confidentiality agreement and commitment contract.", "required": true },
  { "id": "drive_access", "title": "Request Google Drive Shared Folder Access", "description": "Setup credentials to access officer shared files.", "required": true },
  { "id": "financial_briefing", "title": "Attend Financial & Budget Briefing", "description": "Meet with the treasurer for budget protocols.", "required": true },
  { "id": "handover_meeting", "title": "Conduct Handover Meeting", "description": "Discuss past files and pending issues with the outgoing officer.", "required": true }
]'::jsonb);

-- 2. Insert Recruitment Campaigns
-- We assume an officer profile will create these, but we seed default ones.
insert into public.recruitment_campaigns (id, title, description, type, status, start_date, end_date)
values 
('c0000000-0000-0000-0000-000000000001', 'Fall 2026 Member Recruitment', 'Join our organization for the Fall semester! Open to all students interested in technology and leadership.', 'member', 'active', now() - interval '5 days', now() + interval '30 days'),
('c0000000-0000-0000-0000-000000000002', 'Executive Board Officer Drive 2026', 'We are looking for passionate leaders to join the executive committee as Public Relations Officer and Logistics Coordinator.', 'officer', 'active', now() - interval '2 days', now() + interval '15 days'),
('c0000000-0000-0000-0000-000000000003', 'Spring 2027 Early Bird Recruitment', 'Register early to join our committee rosters for the next academic year.', 'member', 'draft', now() + interval '60 days', now() + interval '90 days');

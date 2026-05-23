import { 
  Profile, 
  RecruitmentCampaign, 
  Application, 
  OnboardingTemplate, 
  Event, 
  EventCommittee, 
  EventRegistration, 
  EventAnnouncement, 
  EventReport 
} from '../types'

// Setup default mock databases in LocalStorage if they do not exist
const initStorage = <T>(key: string, defaultData: T): T => {
  const data = localStorage.getItem(key)
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultData))
    return defaultData
  }
  return JSON.parse(data)
}

export const saveStorage = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data))
}

// 1. Mock Profiles
const defaultProfiles: Profile[] = [
  {
    id: 'u-admin-1',
    full_name: 'Arthur Pendragon',
    email: 'admin@eventplan.org',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Arthur',
    role: 'super_admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'u-officer-1',
    full_name: 'Guinevere Vance',
    email: 'officer@eventplan.org',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Guinevere',
    role: 'officer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'u-committee-1',
    full_name: 'Lancelot du Lac',
    email: 'committee@eventplan.org',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lancelot',
    role: 'committee_member',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'u-member-1',
    full_name: 'Galahad Knight',
    email: 'member@eventplan.org',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Galahad',
    role: 'member',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'u-applicant-1',
    full_name: 'Robin Hood',
    email: 'applicant@eventplan.org',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Robin',
    role: 'applicant',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// 2. Mock Campaigns
const defaultCampaigns: RecruitmentCampaign[] = [
  {
    id: 'c-1',
    title: 'Fall 2026 Member Recruitment',
    description: 'Join our organization for the Fall semester! Open to all students interested in technology, leadership, and community events.',
    type: 'member',
    status: 'active',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'u-admin-1',
    created_at: new Date().toISOString()
  },
  {
    id: 'c-2',
    title: 'Executive Board Officer Drive 2026',
    description: 'We are looking for passionate leaders to join the executive committee as Public Relations Officer and Logistics Coordinator.',
    type: 'officer',
    status: 'active',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'u-admin-1',
    created_at: new Date().toISOString()
  },
  {
    id: 'c-3',
    title: 'Spring 2027 Early Recruitment Drive',
    description: 'Pre-register for early committee placements next semester.',
    type: 'member',
    status: 'draft',
    start_date: null,
    end_date: null,
    created_by: 'u-officer-1',
    created_at: new Date().toISOString()
  }
]

// 3. Mock Applications
const defaultApplications: Application[] = [
  {
    id: 'a-1',
    campaign_id: 'c-1',
    applicant_id: 'u-applicant-1',
    status: 'pending',
    answers: {
      'Why do you want to join?': 'I love organizing community workshops and hope to learn technical leadership.',
      'What committees are you interested in?': 'Logistics and Technical committees.'
    },
    resume_url: '#mock-resume-url.pdf',
    feedback: null,
    onboarding_status: 'not_started',
    onboarding_steps_completed: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// 4. Mock Onboarding Templates
const defaultOnboardingTemplates: OnboardingTemplate[] = [
  {
    id: 't-member',
    title: 'General Member Onboarding',
    description: 'Standard checklist for new organization members.',
    role_target: 'member',
    steps: [
      { id: '1', title: 'Read the Code of Conduct', description: 'Review our core values and standards.', required: true },
      { id: '2', title: 'Fill in Contact Profile', description: 'Provide emergency contact details and phone number.', required: true },
      { id: '3', title: 'Join Discord Server', description: 'Connect with other members in our official workspace.', required: false }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 't-officer',
    title: 'Officer Handover',
    description: 'Checklist for newly appointed officers.',
    role_target: 'officer',
    steps: [
      { id: '1', title: 'Sign NDA Agreement', description: 'Complete official paperwork.', required: true },
      { id: '2', title: 'Drive Handover Folder Access', description: 'Obtain rights to the shared Google Drive.', required: true },
      { id: '3', title: 'Initial Officers Briefing', description: 'Meet with the Super Admin to review responsibilities.', required: true }
    ],
    created_at: new Date().toISOString()
  }
]

// Static past date helpers
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()
const daysFromNow = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString()

// 5. Mock Events — includes a fully completed past event (e-4)
const defaultEvents: Event[] = [
  {
    id: 'e-1',
    title: 'Hackathon 2026 - Code & Build',
    description: 'A 24-hour sprint where students build cool applications and compete for awards. Free food and mentorship included!',
    date: daysFromNow(5),
    location: 'School Main Library, Tech Annex',
    status: 'approved',
    proposal_by: 'u-officer-1',
    approved_by: 'u-admin-1',
    approval_notes: 'Approved. Looks solid. Budget is within limits.',
    max_attendees: 150,
    created_at: daysAgo(10),
    updated_at: daysAgo(8)
  },
  {
    id: 'e-2',
    title: 'General Members Orientation Meet',
    description: 'First formal meet for all organization members to align on goals and socialize.',
    date: daysFromNow(12),
    location: 'Student Activity Center, Hall B',
    status: 'approved',
    proposal_by: 'u-officer-1',
    approved_by: 'u-admin-1',
    approval_notes: 'Great event to start the school year!',
    max_attendees: 80,
    created_at: daysAgo(7),
    updated_at: daysAgo(5)
  },
  {
    id: 'e-3',
    title: 'Community Tech Seminar: AI & Ethics',
    description: 'A panel discussion on how generative AI impacts academic and workplace integrity.',
    date: daysFromNow(2),
    location: 'Conference Room 4',
    status: 'proposal_pending',
    proposal_by: 'u-committee-1',
    approved_by: null,
    approval_notes: null,
    max_attendees: 50,
    created_at: daysAgo(1),
    updated_at: daysAgo(1)
  },
  // ✅ COMPLETED EVENT — with full report, registrations, committees, and announcements
  {
    id: 'e-4',
    title: 'Spring Leadership Summit 2026',
    description: 'A full-day leadership conference featuring workshops on project management, public speaking, and team dynamics. Attended by 120 members from across the student body.',
    date: daysAgo(14),
    location: 'University Function Hall, Bldg. A',
    status: 'completed',
    proposal_by: 'u-officer-1',
    approved_by: 'u-admin-1',
    approval_notes: 'Excellent initiative. Fully funded by the student org budget. Proceed.',
    max_attendees: 130,
    created_at: daysAgo(45),
    updated_at: daysAgo(13)
  }
]

// 6. Mock Committees — includes e-4's committee lineup
const defaultCommittees: EventCommittee[] = [
  {
    id: 'ec-1',
    event_id: 'e-1',
    user_id: 'u-committee-1',
    role: 'head',
    department: 'Technical',
    created_at: daysAgo(10)
  },
  {
    id: 'ec-2',
    event_id: 'e-1',
    user_id: 'u-member-1',
    role: 'member',
    department: 'Logistics',
    created_at: daysAgo(10)
  },
  // e-4 committees
  {
    id: 'ec-3',
    event_id: 'e-4',
    user_id: 'u-officer-1',
    role: 'head',
    department: 'Program & Speakers',
    created_at: daysAgo(40)
  },
  {
    id: 'ec-4',
    event_id: 'e-4',
    user_id: 'u-committee-1',
    role: 'coordinator',
    department: 'Logistics',
    created_at: daysAgo(40)
  },
  {
    id: 'ec-5',
    event_id: 'e-4',
    user_id: 'u-member-1',
    role: 'member',
    department: 'Finance & Budget',
    created_at: daysAgo(40)
  }
]

// 7. Mock Registrations — includes e-4 attendance with real check-in data
const defaultRegistrations: EventRegistration[] = [
  {
    id: 'r-1',
    event_id: 'e-1',
    user_id: 'u-member-1',
    status: 'registered',
    attendance_status: 'present',
    registered_at: daysAgo(8),
    attended_at: daysAgo(8)
  },
  {
    id: 'r-2',
    event_id: 'e-1',
    user_id: 'u-committee-1',
    status: 'registered',
    attendance_status: 'absent',
    registered_at: daysAgo(8),
    attended_at: null
  },
  // e-4 registrations — all with recorded attendance
  {
    id: 'r-3',
    event_id: 'e-4',
    user_id: 'u-member-1',
    status: 'registered',
    attendance_status: 'present',
    registered_at: daysAgo(20),
    attended_at: daysAgo(14)
  },
  {
    id: 'r-4',
    event_id: 'e-4',
    user_id: 'u-committee-1',
    status: 'registered',
    attendance_status: 'present',
    registered_at: daysAgo(20),
    attended_at: daysAgo(14)
  },
  {
    id: 'r-5',
    event_id: 'e-4',
    user_id: 'u-officer-1',
    status: 'registered',
    attendance_status: 'present',
    registered_at: daysAgo(28),
    attended_at: daysAgo(14)
  },
  {
    id: 'r-6',
    event_id: 'e-4',
    user_id: 'u-admin-1',
    status: 'registered',
    attendance_status: 'excused',
    registered_at: daysAgo(28),
    attended_at: null
  }
]

// 8. Mock Announcements — includes pre-event and wrap-up announcements for e-4
const defaultAnnouncements: EventAnnouncement[] = [
  {
    id: 'ea-1',
    event_id: 'e-1',
    title: 'Hardware Requirements',
    content: 'Please make sure to bring your laptop, charging bricks, and student ID cards. Team registrations are locked now!',
    created_by: 'u-committee-1',
    created_at: daysAgo(5)
  },
  // e-4 announcements
  {
    id: 'ea-2',
    event_id: 'e-4',
    title: 'Dress Code Reminder & Schedule',
    content: 'Smart casual attire is required for the Leadership Summit. Doors open at 8:00 AM. Morning keynote starts at 9:00 AM sharp. Please bring your registration QR code and a valid student ID.',
    created_by: 'u-officer-1',
    created_at: daysAgo(16)
  },
  {
    id: 'ea-3',
    event_id: 'e-4',
    title: 'Workshop Materials Available for Download',
    content: 'All workshop slides and reading materials for the afternoon breakout sessions have been uploaded to the shared Google Drive. Links will be sent via email to all registered attendees.',
    created_by: 'u-committee-1',
    created_at: daysAgo(15)
  },
  {
    id: 'ea-4',
    event_id: 'e-4',
    title: '🎉 Thank You — Summit Recap',
    content: 'We are deeply grateful to everyone who participated in this year\'s Spring Leadership Summit! 118 out of 120 registered members attended. Certificates of participation will be distributed within the week. Watch out for the post-event photo album link!',
    created_by: 'u-officer-1',
    created_at: daysAgo(13)
  }
]

// 9. Mock Reports — includes a complete, detailed post-event report for e-4
const defaultReports: EventReport[] = [
  {
    id: 'er-1',
    event_id: 'e-2',
    summary: 'The orientation was successful. 74 members attended out of 80 registered. We had 2 guest speakers and distributed swag.',
    budget_spent: 120.50,
    documentation_url: '#orientation-report.pdf',
    submitted_by: 'u-officer-1',
    submitted_at: daysAgo(2)
  },
  // ✅ Full post-event report for the Spring Leadership Summit (e-4)
  {
    id: 'er-2',
    event_id: 'e-4',
    summary: `Spring Leadership Summit 2026 — Post-Event Report

OVERVIEW
The Spring Leadership Summit was a resounding success. Held on ${new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toDateString()} at the University Function Hall, the event attracted 118 registered attendees out of a total capacity of 130 — a 90.7% turnout rate.

KEY OUTCOMES
• 3 keynote sessions delivered by industry professionals and alumni
• 4 afternoon workshop tracks: Project Management, Public Speaking, Team Dynamics, and Conflict Resolution
• 95% of post-event survey respondents rated the event "Excellent" or "Very Good"
• 12 members signed up to lead next semester's committee drives as a result of the leadership sessions

LOGISTICS & OPERATIONS
The venue was set up by 7:30 AM by the Logistics Committee. AV equipment performed without issues throughout the day. Lunch catering served 125 people with zero food waste reported.

CHALLENGES
• One speaker cancelled 48 hours before the event. We successfully sourced a replacement within 24 hours.
• Badge printing experienced a 15-minute delay in the morning — addressed with digital QR check-in as backup.

RECOMMENDATIONS FOR FUTURE EVENTS
• Book AV technicians at least 3 weeks in advance
• Introduce a digital seat reservation system for breakout workshops
• Add a networking segment (30 mins) at the end of day

FINANCIALS
Total budget allocated: $850.00
Total spent: $742.50
Surplus returned to organization fund: $107.50`,
    budget_spent: 742.50,
    documentation_url: 'https://drive.google.com/file/d/mock-leadership-summit-docs',
    submitted_by: 'u-officer-1',
    submitted_at: daysAgo(13)
  }
]

// ─── Force Reset Utility ────────────────────────────────────────────────────
// Call resetMockData() in the browser console to wipe and re-seed all localStorage data.
// This is needed because initStorage() only sets data when the key doesn't exist yet.
export const resetMockData = () => {
  const keys = [
    'ep_mock_profiles', 'ep_mock_campaigns', 'ep_mock_applications',
    'ep_mock_onboarding_templates', 'ep_mock_events', 'ep_mock_committees',
    'ep_mock_registrations', 'ep_mock_announcements', 'ep_mock_reports'
  ]
  keys.forEach(k => localStorage.removeItem(k))

  localStorage.setItem('ep_mock_profiles', JSON.stringify(defaultProfiles))
  localStorage.setItem('ep_mock_campaigns', JSON.stringify(defaultCampaigns))
  localStorage.setItem('ep_mock_applications', JSON.stringify(defaultApplications))
  localStorage.setItem('ep_mock_onboarding_templates', JSON.stringify(defaultOnboardingTemplates))
  localStorage.setItem('ep_mock_events', JSON.stringify(defaultEvents))
  localStorage.setItem('ep_mock_committees', JSON.stringify(defaultCommittees))
  localStorage.setItem('ep_mock_registrations', JSON.stringify(defaultRegistrations))
  localStorage.setItem('ep_mock_announcements', JSON.stringify(defaultAnnouncements))
  localStorage.setItem('ep_mock_reports', JSON.stringify(defaultReports))

  console.log('✅ EventPlan mock data reset and re-seeded successfully!')
  return 'Done. Please refresh the page.'
}

// Expose globally so it can be called from the browser DevTools console
if (typeof window !== 'undefined') {
  (window as any).resetMockData = resetMockData
}

// Initialize the data structures in Storage
export const mockProfiles = initStorage<Profile[]>('ep_mock_profiles', defaultProfiles)
export const mockCampaigns = initStorage<RecruitmentCampaign[]>('ep_mock_campaigns', defaultCampaigns)
export const mockApplications = initStorage<Application[]>('ep_mock_applications', defaultApplications)
export const mockOnboardingTemplates = initStorage<OnboardingTemplate[]>('ep_mock_onboarding_templates', defaultOnboardingTemplates)
export const mockEvents = initStorage<Event[]>('ep_mock_events', defaultEvents)
export const mockCommittees = initStorage<EventCommittee[]>('ep_mock_committees', defaultCommittees)
export const mockRegistrations = initStorage<EventRegistration[]>('ep_mock_registrations', defaultRegistrations)
export const mockAnnouncements = initStorage<EventAnnouncement[]>('ep_mock_announcements', defaultAnnouncements)
export const mockReports = initStorage<EventReport[]>('ep_mock_reports', defaultReports)


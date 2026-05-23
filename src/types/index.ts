export type UserRole = 'super_admin' | 'officer' | 'committee_member' | 'member' | 'applicant'

export interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export type CampaignType = 'member' | 'officer'
export type CampaignStatus = 'draft' | 'active' | 'closed'

export interface RecruitmentCampaign {
  id: string
  title: string
  description: string
  type: CampaignType
  status: CampaignStatus
  start_date: string | null
  end_date: string | null
  created_by: string | null
  created_at: string
}

export type ApplicationStatus = 'pending' | 'screening' | 'interview' | 'approved' | 'rejected'
export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed'

export interface Application {
  id: string
  campaign_id: string
  applicant_id: string
  status: ApplicationStatus
  answers: Record<string, string>
  resume_url: string | null
  feedback: string | null
  onboarding_status: OnboardingStatus
  onboarding_steps_completed: string[] // Array of step IDs
  created_at: string
  updated_at: string
  // Joined fields
  profiles?: Profile
  recruitment_campaigns?: RecruitmentCampaign
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  required: boolean
}

export interface OnboardingTemplate {
  id: string
  title: string
  description: string | null
  role_target: UserRole
  steps: OnboardingStep[]
  created_at: string
}

export type EventStatus =
  | 'proposal_draft'
  | 'proposal_pending'
  | 'approved'
  | 'rejected'
  | 'ongoing'
  | 'completed'
  | 'cancelled'

export interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  status: EventStatus
  proposal_by: string | null
  approved_by: string | null
  approval_notes: string | null
  max_attendees: number | null
  created_at: string
  updated_at: string
  // Joined fields
  proposal_profile?: Profile
  approved_profile?: Profile
}

export type CommitteeRole = 'head' | 'coordinator' | 'member'

export interface EventCommittee {
  id: string
  event_id: string
  user_id: string
  role: CommitteeRole
  department: string
  status?: 'pending' | 'assigned'
  created_at: string
  profiles?: Profile
}

export type RegistrationStatus = 'registered' | 'cancelled'
export type AttendanceStatus = 'absent' | 'present' | 'excused'

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  status: RegistrationStatus
  attendance_status: AttendanceStatus
  registered_at: string
  attended_at: string | null
  profiles?: Profile
}

export interface EventAnnouncement {
  id: string
  event_id: string
  title: string
  content: string
  created_by: string | null
  created_at: string
  profiles?: Profile
}

export interface EventReport {
  id: string
  event_id: string
  summary: string
  budget_spent: number
  documentation_url: string | null
  submitted_by: string | null
  submitted_at: string
  profiles?: Profile
}

# Product Requirements Document (PRD)
## EventPlan — School Organization Management System

**Version:** 1.0.0  
**Status:** Active Development  
**Last Updated:** May 2026  
**Authors:** EventPlan Core Team  

---

## 1. Product Overview

### 1.1 Purpose

EventPlan is a production-ready web application designed to digitize and streamline the core operational workflows of a school-based student organization. It replaces manual, paper-based or spreadsheet-driven processes with an integrated, role-aware digital platform.

### 1.2 Problem Statement

School organizations face significant administrative overhead in managing recruitment, onboarding, and event logistics. These challenges include:

- No centralized view of applicants across multiple recruitment campaigns
- Manual and inconsistent screening processes with no audit trails
- Events proposed via chat or email with no structured approval workflow
- Attendance tracked via paper sign-in sheets with no digital records
- No post-event documentation repository or budget audit trail

### 1.3 Product Vision

> _"Give every school organization the tools of a professional events and HR platform — accessible, beautiful, and easy to use."_

EventPlan aims to be the single platform where applicants apply, officers screen, events get proposed and approved, committees are formed, attendees register, and outcomes are documented.

---

## 2. Stakeholders

| Stakeholder | Role | Primary Concern |
|---|---|---|
| Super Admin | Platform administrator | Full system control, role assignments |
| Organization Officer | Staff member | Applicant review, event management |
| Committee Member | Event-assigned staff | Committee tasks, announcements |
| General Member | Regular org member | Event registration, announcements |
| Applicant | Prospective member | Apply, track status, complete onboarding |

---

## 3. User Personas

### 3.1 Persona A — The Applicant (Robin)

- **Background**: 2nd-year college student, first time applying to a student org
- **Goals**: Submit an application, track its status, and know exactly what steps to follow after approval
- **Pain Points**: Doesn't know if the officer received the application; unclear on what "approved" means next
- **Needs**: Real-time status tracker, onboarding checklist, clear instructions

### 3.2 Persona B — The Officer (Guinevere)

- **Background**: 3rd-year officer managing 60+ applicants across two campaigns
- **Goals**: Review applications efficiently, move candidates through stages, assign committees
- **Pain Points**: Managing multiple chat threads to inform applicants; no single dashboard
- **Needs**: Kanban pipeline, bulk filtering, note-taking per applicant, committee assignment

### 3.3 Persona C — The Super Admin (Arthur)

- **Background**: Organization President / Adviser
- **Goals**: Approve event proposals, manage role assignments, audit all activity
- **Pain Points**: No visibility into what officers are doing; no financial audit of events
- **Needs**: Full-access dashboard, proposal approval queue, post-event report archive

---

## 4. Functional Requirements

### 4.1 Authentication & Access Control

| ID | Requirement | Priority |
|---|---|---|
| AUTH-01 | Users can register with email, name, and an initial role | High |
| AUTH-02 | Users can log in with email credentials | High |
| AUTH-03 | Session persists across page refreshes | High |
| AUTH-04 | Role-based route guards restrict access to unauthorized pages | High |
| AUTH-05 | Sandbox/mock mode activates when Supabase keys are absent | Medium |

### 4.2 Recruitment Campaigns

| ID | Requirement | Priority |
|---|---|---|
| REC-01 | Officers can create recruitment campaigns with title, description, type, and dates | High |
| REC-02 | Campaigns have a status of Draft, Active, or Closed | High |
| REC-03 | Only Active campaigns are visible to non-officer users | High |
| REC-04 | Applicants can browse all active campaigns from a public listing | High |
| REC-05 | Campaigns support two types: Member and Officer recruitment | High |

### 4.3 Application Submission

| ID | Requirement | Priority |
|---|---|---|
| APP-01 | Applicants can submit one application per campaign | High |
| APP-02 | Application form includes motivation, experience, and resume/portfolio link | High |
| APP-03 | Applicants can view their submitted applications and current status | High |
| APP-04 | Officers receive a notification or can view new submissions in the pipeline | High |
| APP-05 | Duplicate submissions to the same campaign are rejected | High |

### 4.4 Applicant Screening Pipeline

| ID | Requirement | Priority |
|---|---|---|
| SCR-01 | Officers view all applications in a Kanban board organized by status | High |
| SCR-02 | Application statuses: Pending → Screening → Interview → Approved / Rejected | High |
| SCR-03 | Officers can write feedback notes visible to the applicant | High |
| SCR-04 | Approving an application automatically triggers onboarding | High |
| SCR-05 | Officers can filter/search applicants by name, email, or campaign | Medium |

### 4.5 Onboarding Workflows

| ID | Requirement | Priority |
|---|---|---|
| ONB-01 | Onboarding checklists are defined per target role (member, officer) | High |
| ONB-02 | Approved applicants see their assigned onboarding checklist immediately | High |
| ONB-03 | Each step can be marked as completed by the applicant | High |
| ONB-04 | Required steps must be completed before onboarding is marked "done" | High |
| ONB-05 | Completing all required steps automatically upgrades the user's role | High |
| ONB-06 | Progress is tracked with a visual percentage bar | Medium |

### 4.6 Event Proposals

| ID | Requirement | Priority |
|---|---|---|
| EVT-01 | Any officer or committee member can submit an event proposal | High |
| EVT-02 | Proposals include title, description, date/time, location, and capacity | High |
| EVT-03 | Submitted proposals enter a "Proposal Pending" queue | High |
| EVT-04 | Officers/Super Admins can approve or reject proposals with review notes | High |
| EVT-05 | Approved events become visible to all members for registration | High |

### 4.7 Event Registration & Attendance

| ID | Requirement | Priority |
|---|---|---|
| ATT-01 | Members can register for approved events | High |
| ATT-02 | Members can cancel their registration slot before the event | Medium |
| ATT-03 | Officers can view the full attendee roster for each event | High |
| ATT-04 | Officers can mark attendees as Present, Absent, or Excused | High |
| ATT-05 | Attendance timestamp is recorded when marking Present | Medium |

### 4.8 Committee Management

| ID | Requirement | Priority |
|---|---|---|
| COM-01 | Officers can assign members/officers to committees for a specific event | High |
| COM-02 | Committee assignments include a department (Logistics, Technical, etc.) and role (head, coordinator, member) | High |
| COM-03 | Assigning a member as committee head upgrades their system role to `committee_member` | Medium |
| COM-04 | Officers can remove committee assignments | Medium |
| COM-05 | Committee members can view their own assignments | High |

### 4.9 Event Announcements

| ID | Requirement | Priority |
|---|---|---|
| ANN-01 | Officers and committee heads can post announcements per event | High |
| ANN-02 | Announcements are visible to all registered attendees | High |
| ANN-03 | Announcements display author name, timestamp, and full content | Medium |

### 4.10 Post-Event Reporting

| ID | Requirement | Priority |
|---|---|---|
| RPT-01 | Officers or committee heads can submit a post-event report | High |
| RPT-02 | Report fields: summary narrative, total budget spent, documentation link | High |
| RPT-03 | Submitting a report locks the event status as Completed | High |
| RPT-04 | Reports are permanently accessible from the event dashboard | High |
| RPT-05 | Reports are read-only to general members | Medium |

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Initial page load under 2 seconds on a standard broadband connection
- Dashboard data should load within 1 second after authentication
- No blocking spinners longer than 3 seconds for any user action

### 5.2 Security
- All Supabase tables protected by Row-Level Security (RLS) policies
- JWT tokens managed via Supabase Auth; never stored in localStorage manually
- Applicants cannot access other applicants' data
- No sensitive PII exposed through API responses

### 5.3 Responsiveness
- Fully functional on mobile (320px+), tablet (768px+), and desktop (1024px+)
- Mobile navigation via collapsible sidebar drawer
- Tables fall back to card-based views on small screens

### 5.4 Accessibility
- All interactive elements have readable labels and keyboard accessibility
- Sufficient color contrast ratios throughout (WCAG AA minimum)
- Toast notifications do not auto-close in under 4 seconds

### 5.5 Maintainability
- Service layer is fully abstracted; swapping Supabase for another backend requires only service file edits
- All shared UI components live in `/src/components/ui/`
- TypeScript strict typing throughout with no `any` overuse

---

## 6. Out of Scope (v1.0)

- Real-time push notifications (planned for v1.1 with Supabase Realtime)
- Email/SMS dispatch to applicants (planned with Resend/SendGrid integration)
- File upload for resumes (Google Drive link accepted instead)
- Mobile native application
- Integration with external school LMS systems

---

## 7. Acceptance Criteria Summary

| Feature | Acceptance Condition |
|---|---|
| Recruitment | Applicant can submit a form and see status update in real time |
| Screening | Officer can move a card from Pending to Approved in the Kanban |
| Onboarding | Completing required steps triggers role promotion automatically |
| Event Proposal | Proposal submitted → visible in proposal queue → approved → shows in event calendar |
| Attendance | Officer can check-in all attendees and view summary metrics |
| Post-Event Report | Report submitted → event status changes to "Completed" |

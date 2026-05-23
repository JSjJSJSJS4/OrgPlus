# Project Plan
## EventPlan — School Organization Management System

**Version:** 1.0.0  
**Status:** Active Development  
**Last Updated:** May 2026  
**Methodology:** Agile (Feature-driven sprints)

---

## 1. Project Summary

| Field | Detail |
|---|---|
| **Project Name** | EventPlan |
| **Type** | Web Application (SPA) |
| **Stack** | React 19, TypeScript, Vite, Tailwind CSS v4, Supabase |
| **Target Users** | School organization officers, members, applicants |
| **Deployment Target** | Vercel / Netlify + Supabase Cloud |
| **Development Mode** | Agile sprints with feature-based milestones |

---

## 2. Project Milestones

```
Phase 1: Foundation & Setup        [✅ Complete]
Phase 2: Database & Backend        [✅ Complete]
Phase 3: Auth & Core Shell         [✅ Complete]
Phase 4: Recruitment Module        [✅ Complete]
Phase 5: Event Management Module   [✅ Complete]
Phase 6: Polish & Optimization     [🔄 In Progress]
Phase 7: Production Deployment     [📋 Planned]
```

---

## 3. Detailed Phase Breakdown

### Phase 1 — Foundation & Project Setup ✅

**Goal**: Initialize the project with the correct stack and verify a working build pipeline.

| Task | Owner | Status |
|---|---|---|
| Initialize Vite + React 19 + TypeScript project | Dev | ✅ Done |
| Install core dependencies (Tailwind v4, Supabase, React Query, Lucide) | Dev | ✅ Done |
| Configure `vite.config.ts` with Tailwind Vite plugin | Dev | ✅ Done |
| Configure `tsconfig.app.json` linting rules | Dev | ✅ Done |
| Update `index.html` with Google Fonts (Outfit + Inter) | Dev | ✅ Done |
| Create global CSS design system in `index.css` | Dev | ✅ Done |
| Verify `npm run build` passes with zero errors | Dev | ✅ Done |

**Deliverables**: Runnable dev server, passing build, responsive CSS foundation.

---

### Phase 2 — Database & Backend Setup ✅

**Goal**: Define and document the complete database schema, seed data, and Supabase service integrations.

| Task | Owner | Status |
|---|---|---|
| Write `supabase/schema.sql` with all tables, enums, and RLS policies | Dev | ✅ Done |
| Write `supabase/seed.sql` with default campaigns and onboarding templates | Dev | ✅ Done |
| Create Supabase client helper (`src/lib/supabaseClient.ts`) | Dev | ✅ Done |
| Create React Query client config (`src/lib/queryClient.ts`) | Dev | ✅ Done |
| Define all TypeScript types in `src/types/index.ts` | Dev | ✅ Done |
| Build `mockData.ts` with localStorage persistence for offline/sandbox mode | Dev | ✅ Done |
| Build `authService.ts` with Supabase + mock dual-mode adapter | Dev | ✅ Done |
| Build `recruitmentService.ts` (campaigns, applications, onboarding) | Dev | ✅ Done |
| Build `eventService.ts` (events, committees, registrations, reports) | Dev | ✅ Done |

**Deliverables**: Complete database schema, full service layer, offline sandbox mode.

---

### Phase 3 — Authentication & Core Shell ✅

**Goal**: Implement working authentication with a role-aware layout.

| Task | Owner | Status |
|---|---|---|
| Build `AuthContext.tsx` (signIn, signUp, signOut, refreshUser) | Dev | ✅ Done |
| Build `ToastContext.tsx` (notification queue with auto-dismiss) | Dev | ✅ Done |
| Build `AuthPage.tsx` (login + register + developer quick-login console) | Dev | ✅ Done |
| Build `MainLayout.tsx` (responsive sidebar + sticky header) | Dev | ✅ Done |
| Implement role-based sidebar visibility | Dev | ✅ Done |
| Implement session restoration on page reload | Dev | ✅ Done |
| Implement sandbox mode badge indicator | Dev | ✅ Done |

**Deliverables**: Fully working login/register system, role-filtered navigation, persistent sessions.

---

### Phase 4 — Recruitment & Onboarding Modules ✅

**Goal**: Complete the full applicant lifecycle from campaign discovery to role promotion.

| Task | Owner | Status |
|---|---|---|
| Build `RecruitmentPage.tsx` (campaign grid + apply modal) | Dev | ✅ Done |
| Build "My Applications" tab with status tracker and response view | Dev | ✅ Done |
| Build officer campaign creation modal | Dev | ✅ Done |
| Build `ScreeningPage.tsx` (Kanban board with 5 status columns) | Dev | ✅ Done |
| Build applicant detail review modal with feedback notes | Dev | ✅ Done |
| Implement status flow: Pending → Screening → Interview → Approved/Rejected | Dev | ✅ Done |
| Build `OnboardingPage.tsx` with role-specific step checklists | Dev | ✅ Done |
| Implement auto-role promotion on onboarding completion | Dev | ✅ Done |
| Display completion progress bar | Dev | ✅ Done |

**Deliverables**: End-to-end recruitment pipeline, Kanban board, onboarding automation.

---

### Phase 5 — Event Management Module ✅

**Goal**: Complete the full event lifecycle from proposal to post-event report.

| Task | Owner | Status |
|---|---|---|
| Build `EventsPage.tsx` with filter tabs (upcoming, ongoing, completed, my registrations) | Dev | ✅ Done |
| Build event proposal submission modal | Dev | ✅ Done |
| Build event detail modal with registration toggle | Dev | ✅ Done |
| Build `EventProposalsPage.tsx` (officer review queue) | Dev | ✅ Done |
| Implement proposal approve/reject with notes | Dev | ✅ Done |
| Build `EventDashboard.tsx` with 4 tabs | Dev | ✅ Done |
| — Tab 1: Attendee roster with check-in controls (Present/Absent/Excused) | Dev | ✅ Done |
| — Tab 2: Committee planner (assign members, department, role) | Dev | ✅ Done |
| — Tab 3: Announcements feed with post form | Dev | ✅ Done |
| — Tab 4: Post-event report form with budget and docs link | Dev | ✅ Done |
| Seed completed event (Spring Leadership Summit) with full mock data | Dev | ✅ Done |
| Implement `resetMockData()` browser console utility | Dev | ✅ Done |

**Deliverables**: Full event lifecycle, attendee tracking, committee management, post-event archival.

---

### Phase 6 — Polish & Optimization 🔄

**Goal**: Improve UX, fix edge cases, and prepare for real-world usage.

| Task | Owner | Status |
|---|---|---|
| Write `docs/prd.md` — Product Requirements Document | Dev | ✅ Done |
| Write `docs/sdd.md` — System Design Document | Dev | ✅ Done |
| Write `docs/design.md` — Design System & UI Guidelines | Dev | ✅ Done |
| Write `docs/plan.md` — This project plan | Dev | ✅ Done |
| Update `README.md` with setup and usage instructions | Dev | 📋 Planned |
| Audit all forms for missing validation edge cases | Dev | 📋 Planned |
| Add empty-state illustrations to all zero-record views | Dev | 📋 Planned |
| Improve mobile layout for Kanban board (horizontal scroll) | Dev | 📋 Planned |
| Add `DashboardOverview` quick stats for committee members | Dev | 📋 Planned |
| Add loading skeleton placeholders instead of spinners | Dev | 📋 Planned |
| Verify TypeScript build passes with zero errors | Dev | 📋 Planned |
| Cross-browser QA (Chrome, Firefox, Safari, Edge) | Dev | 📋 Planned |

---

### Phase 7 — Production Deployment 📋

**Goal**: Deploy the application to a live URL with Supabase integration.

| Task | Owner | Status |
|---|---|---|
| Create Supabase cloud project | Dev | 📋 Planned |
| Run `supabase/schema.sql` in the Supabase SQL Editor | Dev | 📋 Planned |
| Run `supabase/seed.sql` to populate initial data | Dev | 📋 Planned |
| Configure Supabase Auth (email/password settings) | Dev | 📋 Planned |
| Create `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` | Dev | 📋 Planned |
| Deploy to Vercel or Netlify with environment variable injection | Dev | 📋 Planned |
| Configure custom domain (optional) | Dev | 📋 Planned |
| Set up Supabase Storage bucket for document uploads | Dev | 📋 Planned |
| Enable Supabase Realtime for live applicant pipeline updates (v1.1) | Dev | 📋 Planned |
| Smoke test all role flows in production | Dev | 📋 Planned |

---

## 4. Feature Backlog (v1.1+)

These features are scoped out of v1.0 and planned for future iterations:

| Feature | Priority | Notes |
|---|---|---|
| Email notifications for application status changes | High | Requires SendGrid / Resend integration |
| Supabase Realtime for live Kanban updates | High | `supabase.channel()` subscriptions |
| File upload for resumes (PDF) | Medium | Supabase Storage bucket |
| Bulk applicant actions (approve all screened) | Medium | Officer efficiency improvement |
| Event QR code check-in scanner | Medium | Mobile camera API + registration lookup |
| Member directory with role filters | Low | Search across all profiles |
| Budget tracker per event (line items) | Low | Detailed financial audit trail |
| Certificate generation for event attendees | Low | PDF canvas generation |
| Dark/Light mode toggle | Low | CSS variable theme switching |
| Analytics dashboard (charts) | Low | Recharts or Chart.js integration |

---

## 5. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| localStorage quota exceeded in sandbox mode | Low | Medium | Add storage size check; warn when approaching 5MB limit |
| Supabase free tier rate limits in production | Medium | Medium | Cache aggressively via React Query; upgrade plan if needed |
| TypeScript version incompatibilities with React 19 | Low | High | Pin TypeScript to `~6.x` in `package.json` |
| RLS policy misconfiguration exposing data | Low | Critical | Unit-test each policy in Supabase Studio before deploy |
| Mobile browser `backdrop-filter` support | Low | Low | Progressive enhancement; graceful degradation to opaque bg |

---

## 6. Definition of Done

A feature is considered **Done** when:

- [ ] The feature works end-to-end in both sandbox mode and Supabase mode
- [ ] All form inputs have validation with user-friendly error messages
- [ ] The feature is responsive on mobile (320px), tablet (768px), and desktop (1280px)
- [ ] No TypeScript errors in `npm run build`
- [ ] Toast notifications confirm all success and error states
- [ ] Role-based access correctly restricts or shows the feature per user role
- [ ] The relevant documentation file is updated

---

## 7. Setup Instructions

### 7.1 Local Development (Sandbox Mode)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/orgplus.git
cd orgplus

# 2. Install dependencies
npm install

# 3. Start the development server (no .env needed for sandbox mode)
npm run dev

# 4. Open the app at http://localhost:5173
# 5. Click any Quick Login button to enter as a role
```

### 7.2 Full Supabase Setup

```bash
# 1. Create a Supabase project at https://supabase.com
# 2. Open the SQL Editor and run:
#    → supabase/schema.sql  (creates all tables and RLS policies)
#    → supabase/seed.sql    (inserts initial campaign and template data)

# 3. Create a .env file at the project root:
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# 4. Restart the dev server
npm run dev
```

### 7.3 Reset Sandbox Data

If the browser's localStorage has stale seed data, open the browser console and run:

```js
resetMockData()
// Then refresh the page (F5)
```

### 7.4 Production Build

```bash
npm run build
# Output in: dist/
# Deploy the dist/ folder to Vercel, Netlify, or any static host
```

---

## 8. Team Conventions

### 8.1 Branch Naming

```
feature/feature-name
bugfix/issue-description
hotfix/critical-fix
docs/documentation-update
chore/dependency-update
```

### 8.2 Commit Message Format

```
type(scope): Short description

Types: feat | fix | docs | style | refactor | test | chore
Example: feat(events): add post-event report submission form
```

### 8.3 File Naming Conventions

| File Type | Convention | Example |
|---|---|---|
| React Components | PascalCase | `EventDashboard.tsx` |
| Service Modules | camelCase | `eventService.ts` |
| TypeScript Types | camelCase | `index.ts` |
| CSS Modules | kebab-case | `dashboard.module.css` |
| SQL Files | kebab-case | `schema.sql` |
| Documentation | lowercase | `prd.md` |

### 8.4 Code Style Rules

- All components are function components with explicit TypeScript prop interfaces
- No `any` types unless strictly unavoidable (add a comment explaining why)
- Services are pure async functions — no direct UI side effects (toast calls belong in components)
- Form state lives in the component; business logic lives in services
- Context is for truly global state only (auth session, toast queue)

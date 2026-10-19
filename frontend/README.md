# KaziHub KE — Frontend

Frontend for **KaziHub KE**, a Kenyan platform connecting job seekers, students,
employers and online earners with jobs, internships, industrial attachments,
government vacancies and eligible online microtasks.

> **Frontend only.** All listings, rewards and statistics are clearly labelled
> sample/mock data. No backend or database is connected in this phase — and the
> UI says so wherever a real service would be needed.

## Tech stack

- **Next.js 16** (App Router) + React 19
- **TypeScript**
- **Tailwind CSS v4** (theme tokens in `app/globals.css`)
- **CSS Modules** for component-scoped styles
- **lucide-react** for icons
- Local mock data in `data/`

## Getting started

```bash
npm install     # from this directory (frontend/)
npm run dev     # start the dev server (http://localhost:3000)
```

Other commands:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # run ESLint
```

## Project structure

```
app/
├── layout.tsx                # Root layout (metadata, fonts, global CSS)
├── page.tsx                  # Home page — assembles sections in order
├── globals.css               # Tailwind import + KaziHub KE brand tokens
├── login/                    # Log in
├── register/                 # Account-type choice + email registration
├── forgot-password/          # Password reset request
├── reset-password/           # New password (?token=…)
├── verify-email/             # Email verification (?token / ?status)
├── onboarding/
│   ├── job-seeker/           # 8-step progressive profile wizard
│   └── employer/             # 5-step employer onboarding wizard
├── dashboard/                # Job seeker dashboard (first-login experience)
│   ├── layout.tsx            # Role-scoped shell (sidebar + topbar + drawer)
│   ├── page.tsx              # Overview: welcome, checklist, verification, discovery
│   ├── opportunities/        # Find Opportunities (?cat / ?q filters)
│   ├── applications/         # My Applications (empty state for new accounts)
│   ├── cv/                   # My CV (upload / build / edit)
│   ├── profile/              # My Profile (saved-data status per section)
│   ├── verification/         # Verification policy + status (never fake-verified)
│   ├── tasks/                # Online Tasks (sample data, honestly labelled)
│   ├── notifications/        # State-derived notifications + alert preferences
│   ├── settings/             # Account, visibility, sign out
│   └── help/                 # Support contacts + FAQs
└── employer/dashboard/       # Employer dashboard (first-login experience)
    ├── layout.tsx            # Role-scoped shell
    ├── page.tsx              # Overview: setup checklist, verification, metrics
    ├── company-profile/      # Company profile preview + recruitment contact
    ├── verification/         # Verification workflow (policy, submit, history)
    ├── jobs/                 # Manage Jobs (drafts with workflow statuses)
    ├── jobs/new/             # Post a Job wizard (draft / preview / submit)
    ├── applications/         # Applications (empty state + privacy notes)
    ├── candidates/           # Candidate search (locked until verified)
    ├── activity/             # Recruitment Activity (empty state)
    ├── notifications/        # State-derived notifications
    ├── settings/             # Account + sign out
    └── help/                 # Support contacts + FAQs

components/
├── layout/                   # Navbar (+ mobile menu), Footer
├── home/                     # Hero, OpportunityCategories, LatestJobs, …
├── common/                   # Button, InputField, SelectField, CheckboxField,
│                             # PasswordField, TagInput, FileUpload,
│                             # StatusMessage, LoadingSpinner, Logo, cards
├── auth/                     # AuthLayout, LoginForm, RegisterForm,
│                             # AccountTypeSelector, SocialLoginButtons,
│                             # AuthDivider, ForgotPasswordForm,
│                             # ResetPasswordForm, VerifyEmailForm
└── onboarding/               # OnboardingLayout, OnboardingProgress,
    ├── job-seeker/           # PersonalInformation, EmploymentPreferences,
    │                         # EducationForm, WorkExperienceForm,
    │                         # SkillsCertifications, CVUpload, CVBuilder,
    │                         # NotificationPreferences, ProfileReview
    └── employer/             # EmployerAccountForm, CompanyInformation,
                              # RecruitmentPreferences, VerificationStatus,
                              # EmployerProfileReview

components/dashboard/        # Shared shell: DashboardSidebar, DashboardTopbar,
│                             # MobileDashboardMenu, DashboardShell, WelcomePanel,
│                             # ProfileCompletionCard, VerificationStatusCard,
│                             # DashboardStatCard, EmptyState, NotificationMenu,
│                             # PageLoading
components/job-seeker/       # OpportunityCategories, RecommendedJobs,
│                             # ApplicationActivity, CareerProfileCard,
│                             # OnlineTasksPanel, OpportunitiesExplorer
components/employer/         # CompanyProfileCard, EmployerSetupChecklist,
│                             # EmployerMetrics, RecentJobListings,
│                             # RecentApplications, JobPostingForm,
│                             # CandidateSearch, JobsManager, PostJobContent

data/                         # Mock data (jobs, tasks, categories, journeys,
                              # mock-dashboard: disclaimers + status legend)
lib/
├── constants.ts              # Site info, stats
├── cx.ts                     # Class-name joiner
├── kenya-data.ts             # 47 counties, towns, industries, skills, …
├── onboarding-types.ts       # Shared types for auth + onboarding drafts
├── validation.ts             # Email / name / phone / password / year / url / file
├── draft-storage.ts          # sessionStorage drafts (never passwords)
├── account-types.ts          # Account / profile / verification / listing status models
├── session.ts                # Local demo session (newly-registered account state)
├── dashboard-service.ts      # Async overview data (simulated latency, honest zeros)
├── profile-service.ts        # Profile completion from ACTUALLY SAVED data
├── verification-service.ts   # Verification policy + submission (never self-approves)
├── permissions.ts            # Frontend permission checks (backend still enforces)
├── job-drafts.ts             # Job listing drafts (draft / pending-review only)
└── auth-config.ts            # OAuth + API integration points
public/images/                # logo, hero image, reviewer avatars
```

## Brand palette

| Token            | Value     | Tailwind class       |
| ---------------- | --------- | -------------------- |
| Primary green    | `#008A2E` | `bg-brand`           |
| Dark green       | `#006B24` | `text-brand-dark`    |
| Red accent       | `#F00000` | `text-accent`        |
| Main text        | `#111111` | `text-ink`           |
| Secondary text   | `#5F6368` | `text-muted`         |
| Light background | `#F5F7F8` | `bg-surface`         |
| Borders          | `#E0E3E7` | `border-line`        |
| Footer           | `#111111` | (see Footer.module.css) |

## Authentication & onboarding — what works today

| Feature | Status in this build |
| --- | --- |
| Account-type selection (job seeker / employer) | ✅ Works, stores choice in session storage |
| Login / registration forms + validation | ✅ Full client-side validation and error states |
| Password strength meter + show/hide | ✅ Works |
| Social sign-in buttons (Google / Facebook / LinkedIn) | ✅ UI only — each shows a "not configured" notice |
| Forgot password | ✅ Neutral confirmation (never reveals if an account exists) |
| Reset password | ✅ Token states implemented; no backend token check yet |
| Email verification | ✅ All three states; resend has a 60s cooldown |
| Job seeker onboarding (8 steps) | ✅ Full wizard with progress, draft persistence, skip-optional |
| Education / experience repeatable records | ✅ Add, edit, remove |
| CV upload / manual / builder | ✅ Upload validated locally; parser and PDF export await backend |
| Employer onboarding (5 steps) | ✅ Full wizard |
| Verification status interface | ✅ All five states; no false "verified" claim |
| Dashboards | ✅ Preview with clearly-labelled demo data |

**Nothing is faked.** When a real service is required (login, registration,
OAuth, email sending, CV parsing, PDF export, job posting) the UI states plainly
that it is not connected instead of simulating success.

## Backend integration guide

Everything below is the only place you need to change. No page or component
edits are required.

### 1. Environment variables

Create `.env.local` (never commit it):

```bash
# API base URL — when set, the auth flows become live
NEXT_PUBLIC_API_BASE_URL=https://api.kazihub.co.ke

# OAuth — PUBLIC client identifiers only. Never put a client secret here.
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
NEXT_PUBLIC_FACEBOOK_APP_ID=xxx
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=xxx
```

Only `NEXT_PUBLIC_*` values may be read by the client. Secrets stay on the
server.

### 2. `lib/auth-config.ts`

This is the single integration point for authentication. Implement:

- `submitLogin` → `POST apiEndpoints.login`, store the returned session
  (httpOnly cookie preferred), return `{ redirectTo }` based on account type.
- `submitRegistration` → `POST apiEndpoints.register`; trigger the verification
  email server-side and return `verificationRequired`.
- `startSocialLogin` → redirect to the backend's OAuth start route so `state`
  and the token exchange stay server-side. Handle cancellation, failure, missing
  email permission and existing-account cases — the error codes in
  `AuthErrorCode` already cover them.
- `requestPasswordReset` / `resendVerificationEmail` → call the backend.

### 3. Draft persistence → `lib/draft-storage.ts`

Drafts currently live in `sessionStorage`. When the backend supports draft
saving, replace `readJson`/`writeJson` with API calls; the calling components do
not change. The module strips `password`, `confirmPassword`, `token`, `file`
and `fileContents` keys before writing — keep that guarantee.

### 4. Onboarding submission

The wizard pages call `writeJobSeekerDraft` / `writeEmployerDraft`. Swap those
calls for `POST apiEndpoints.profileJobSeeker` / `profileEmployer` and persist
the returned `profileId`.

### 5. File uploads

`FileUpload` validates type and size in the browser and stages the file locally.
Point `onChange` at `POST apiEndpoints.cvUpload` (and
`employerVerification` for documents). Server-side requirements: re-validate
type/size, scan for malware, store in private storage, and never serve a CV
publicly.

### 6. CV parsing

When a parser is available, `CVUpload` already has a "review before saving"
panel. Wire `apiEndpoints.cvParse` to it and show extracted fields for the user
to approve — never auto-overwrite profile data.

### 7. Route protection

`/dashboard` and `/employer/dashboard` are currently open so the preview is
explorable. Once sessions exist, add middleware that redirects unauthenticated
users to `/login` and role-mismatched users to their own dashboard.

### 8. Server-side rules that must be enforced on the backend

Frontend validation is a convenience, not a security boundary. Re-enforce on the
server: email format and uniqueness, password policy, phone format, rate
limiting on login/registration/reset, OAuth `state` validation, password hashing
(Argon2id/bcrypt), single-use expiring reset tokens, file type/size limits and
scanning, private CV storage, employer access controls for candidate profiles,
and consent-based visibility.

## Accessibility & responsiveness

- Keyboard-accessible controls with visible focus states (`:focus-visible`
  global rule in `globals.css`).
- Inline errors use `role="alert"` and are linked to fields via
  `aria-describedby`; invalid fields carry `aria-invalid`.
- Progress indicators expose `role="progressbar"` with live values.
- Inputs use `font-size: 16px` so iOS Safari does not zoom on focus.
- Breakpoints: mobile (320–767), tablet (768–1023), desktop (1024+). Auth pages
  use a two-column layout with a branded panel on desktop; the onboarding
  wizard collapses to a compact "Step N of M" indicator on mobile.
- `prefers-reduced-motion` disables transitions and animations site-wide.

## Notes for the next phase

- Replace `public/images/logo.png` with the official logo asset (same path,
  no code changes needed).
- Swap `data/*.ts` mock arrays for API calls; component props stay the same.
- Replace sample statistics in `lib/constants.ts` with real figures.
- Task verification, reward processing and applications require a secure backend.

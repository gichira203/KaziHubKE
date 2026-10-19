# KaziHub KE implementation requirements

## Current repository baseline

- The web application is a Next.js App Router application in `frontend/` with separate job-seeker and employer dashboards.
- The public site, onboarding, profile, CV, jobs, tasks, verification, and dashboard interfaces already exist. Many flows are explicitly local previews or use sample data.
- Authentication in `frontend/lib/auth-config.ts` and `frontend/lib/session.ts` is browser-local. It does not authenticate against a server and does not provide administrator identities or authorization.
- `backend/` currently contains dependency manifests only. There is no Express application, Prisma schema, migration, database integration, or API route implementation.
- No administrator UI, route, role, or backend authorization code was found. Nothing admin-related was removed.

## Product requirements

Build on the existing KaziHub KE UI and preserve its working public, job-seeker, and employer experiences. Add a secure full-stack platform with:

1. Public opportunity browsing and informational pages.
2. Server-backed registration, login, recovery, email verification, and session management.
3. Progressive job-seeker and employer profiles, CV management, discovery, applications, and notifications.
4. Employer verification, job drafts, moderation, and applicant management.
5. A separately protected `/admin` control panel for users, employer verification, job/task moderation, reports, support, content, analytics, role permissions, settings, and audit history.
6. PostgreSQL persistence through Prisma and a versioned Express REST API.
7. Server-enforced authorization, private document storage, validation, rate limiting, audit logging, and accurate disclosure of unavailable third-party integrations.

## Security and data rules

- Never infer administrator privileges from a user-selected account type or client-supplied role.
- Provision the first administrator only through a trusted deployment/setup process; do not provide public admin registration or seeded production passwords.
- Enforce authentication and permissions on every protected API operation. Frontend route guards are for navigation only.
- Restrict private CV and verification files to authorized access; keep credentials and secrets out of source control.
- Record consequential admin decisions with actor, timestamp, entity, outcome, and reason where applicable.
- Do not present sample listings, metrics, payments, verification, email delivery, or task completion as real outcomes.

## Delivery phases

1. **Foundation:** document current state and target architecture, establish shared configuration and backend entry points, select compatible stable dependencies, define environment variables, and plan database setup.
2. **Public website:** preserve and complete responsive public pages and connect opportunity discovery when API data exists.
3. **Authentication:** add server-backed identity, secure sessions, verification, recovery, and OAuth callbacks when provider credentials are configured.
4. **Job seeker:** persist profile completion, CV metadata/files, opportunity applications, tasks, and preferences.
5. **Employer:** persist company details, verification submissions, job lifecycle, and applicant workflows.
6. **Administration:** implement `/admin` UI and independent permission model, then enforce every action in the API and record audit events.
7. **Integration and security:** connect frontend workflows to API/database and configure storage, email, and background work as credentials become available.
8. **Verification and deployment:** add automated coverage, responsive/access-control checks, migrations, operational docs, and deployment configuration.

## Acceptance criteria

- Existing public and dashboard flows continue to work while their preview nature is clear.
- Non-admin users cannot read admin data or perform admin operations, even by calling API endpoints directly.
- Admin roles and permissions are assigned through trusted server-side processes and audited.
- Business records and moderation decisions persist in PostgreSQL; sensitive files remain private.
- External integrations are described as unavailable until configured and verified end to end.
- Setup and deployment instructions document required environment variables without secrets.

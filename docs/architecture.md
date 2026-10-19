# KaziHub KE target architecture

## Existing structure

- `frontend/`: Next.js App Router, React, TypeScript, Tailwind CSS v4 and CSS Modules. Public routes and separate job-seeker/employer dashboards are already implemented as UI workflows.
- `frontend/lib/`: client-side preview auth/session and local services. These are not a security boundary or persistent backend.
- `backend/`: package manifest currently lists Express, Prisma, PostgreSQL, Zod, and security-related dependencies, but has no application source or schema yet.

## Target structure

- **Web:** retain `frontend/` and current routes/components. Add admin routes under `frontend/app/admin/`, with its own shell and permission-aware navigation. Use API responses for protected data; do not trust client roles.
- **API:** build a versioned Express service in `backend/` under `/api/v1`. Keep auth, domain rules, validation, persistence, and authorization in the API.
- **Database:** PostgreSQL accessed through Prisma migrations. Model users/identities/sessions, profiles, education/experience/skills, private CV metadata, employers/memberships, verification submissions/reviews, categories, jobs/applications, tasks/submissions, notifications, reports/support, admin roles/permissions, audit logs, and platform settings.
- **Shared contracts:** define request/response schemas and common enums in a shared module or a clearly versioned API contract. Validate at the API boundary with Zod.
- **Integrations:** configure email, OAuth, private object storage, and background jobs through environment variables and isolated adapters. An integration remains unavailable until its credentials and full flow are verified.

## Trust boundaries

1. The browser is untrusted. It may render navigation and forms but cannot grant roles, approve verification, publish listings, assert payment, or access private files by itself.
2. Express authenticates each request, validates input, checks ownership and permissions, performs transactional business operations, and writes audit events for consequential admin actions.
3. PostgreSQL is the source of truth for account roles, verification, listings, applications, tasks, and moderation history.
4. Private object storage is accessed through server-authorized upload/download flows; public URLs are not used for sensitive documents.

## Admin authorization model

- `/admin` pages require a server-validated session and an explicit server-assigned administrator role.
- Admin API endpoints require both authentication and the permission needed for that operation (for example `jobs.moderate` or `employers.verify`).
- A seeded or deployment-provisioned initial super administrator must use a one-time trusted setup flow; there is no public registration path and no known default password.
- Sensitive decisions require a reason, persist reviewer identity and timestamp, and append an audit record. UI visibility never substitutes for API enforcement.

## Integration sequence

1. Implement backend health/configuration and Prisma schema/migrations.
2. Establish auth and role/permission middleware before exposing privileged data.
3. Move domain workflows from local preview services to API endpoints incrementally, keeping honest preview states until each backend path is complete.
4. Add admin UI only after its API permissions and data contracts exist; wire each action to a server-side operation.
5. Configure external providers and deployment secrets separately per environment.

# KaziHub KE

Job platform for Kenya: job discovery, applications, employer vacancies and
account verification. The web app is Next.js 16; the API is Express 5.

```text
frontend/   Next.js app (port 3000)
backend/    Express API (port 4000)
docs/       Requirements and architecture notes
```

## Local development

Requirements: Node.js 20.9+ (22 recommended).

```bash
# 1. Install dependencies
npm run install:all

# 2. Configure environment
#    Copy frontend/.env.example -> frontend/.env.local
#    Copy backend/.env.example  -> backend/.env
#    Set SESSION_SECRET in backend/.env (see the example file)

# 3. Run both apps (separate terminals)
npm run dev:backend
npm run dev:frontend
```

Open http://localhost:3000. The API health check is
http://localhost:4000/api/v1/health.

If `NEXT_PUBLIC_API_BASE_URL` is left empty the web app runs a clearly-labelled
browser-local preview. With it set, the app uses the API, which persists data
in PostgreSQL in production and local PGlite during development.

## Checks

```bash
npm run build    # production build + type check
npm run lint     # ESLint
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md). Short version:

- **Frontend (Vercel):** Root Directory must be `frontend`.
- **Backend (Render):** Root Directory `backend`, health check
  `/api/v1/health`, set `SESSION_SECRET` and `WEB_ORIGIN`.
- Use `app.example.com` + `api.example.com` so session cookies stay first-party.
- Render provisions PostgreSQL through the included Blueprint; migrations run
  automatically when the API starts.

## Current limitations

- The PostgreSQL API covers accounts, profiles, jobs, applications, tasks,
  notifications, and admin operations. Some dashboard screens remain preview
  interfaces and are labelled as such.
- No email provider is connected, so verification and password-reset emails are
  not sent; the UI says so instead of faking success.
- Google/Facebook sign-in is only available when both the browser client IDs
  and server credentials are configured. LinkedIn is not implemented.
- Dashboard profile and application data is still a browser-local preview.

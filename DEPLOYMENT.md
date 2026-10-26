# Deploying KaziHub KE

The repository contains two independent apps:

| App | Directory | Runtime | Suggested host |
| --- | --- | --- | --- |
| Web frontend (Next.js 16) | `frontend/` | Node.js | Vercel |
| API (Express 5) | `backend/` | Node.js | Render |

The root `package.json` only holds convenience scripts. Neither app is a
workspace of the other, so **each host must be pointed at its own directory**.

---

## 1. Prerequisites

- Node.js **20.9 or newer** (`.nvmrc` pins 22; CI/hosts should use 22).
- A Git repository containing `frontend/` and `backend/`.
- HTTPS on both apps. Production session cookies are `Secure`.

## 2. Backend on Render

### Option A — Blueprint

1. Push the repository to GitHub.
2. In Render choose **New → Blueprint** and select the repository.
3. Render reads `render.yaml` and creates `kazihub-api` with:
   - Root directory: `backend`
   - Build: `npm ci --omit=dev`
   - Start: `npm start`
   - Health check: `/api/v1/health`
4. Fill in the variables marked `sync: false` (see below).

### Option B — Manual Web Service

- **Root Directory:** `backend`
- **Build Command:** `npm ci --omit=dev`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/v1/health`
- **Environment:** Node 22

### Required environment variables

| Variable | Example | Notes |
| --- | --- | --- |
| `NODE_ENV` | `production` | Enables proxy trust and secure cookies. |
| `SESSION_SECRET` | long random string | **Required.** Generate with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. |
| `WEB_ORIGIN` | `https://app.example.com` | Exact frontend origin(s), comma-separated. No trailing slash. |
| `WEB_URL` | `https://app.example.com` | Used for OAuth error redirects. |
| `API_PUBLIC_URL` | `https://api.example.com` | Used to build OAuth redirect URIs. |
| `AUTH_DATA_FILE` | `/var/data/users.json` | Only when a persistent disk is mounted at `/var/data`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | — | Optional. Omit to keep Google sign-in disabled. |
| `FACEBOOK_APP_ID` / `FACEBOOK_CLIENT_SECRET` | — | Optional. |

Do **not** set `PORT`; Render provides it.

### Persistence warning

Accounts are stored in a JSON file (`backend/data/users.json` by default) until
the PostgreSQL phase lands. On most hosts that path is **ephemeral**: a
redeploy, restart or scale-out loses every account.

For a real deployment either:

1. Attach a Render disk mounted at `/var/data`, set
   `AUTH_DATA_FILE=/var/data/users.json`, and keep the service at **one
   instance** (the file store is not multi-instance safe), or
2. Move to PostgreSQL before launch. This is the recommended long-term fix.

## 3. Frontend on Vercel

1. In Vercel choose **Add New → Project** and import the same repository.
2. Set **Root Directory** to `frontend`. This is required: the repository root
   has no Next.js app, and deploying it will fail.
3. Framework preset: **Next.js** (detected automatically). `frontend/vercel.json`
   records the preset.
4. Add environment variables for **Production** (and Preview if needed):

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.example.com/api/v1` — include `/api/v1` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | public client ID, or leave empty |
| `NEXT_PUBLIC_FACEBOOK_APP_ID` | public app ID, or leave empty |

`NEXT_PUBLIC_*` values are compiled into the browser bundle. Never put a client
secret in a `NEXT_PUBLIC_*` variable. Changing one requires a new deployment.

Deploy from the CLI with:

```bash
cd frontend
vercel
```

## 4. Use one site (important for cookies)

The API sets an HTTP-only session cookie. Modern browsers restrict **third-party**
cookies, so `app.vercel.app` calling `api.onrender.com` can silently lose the
session in Safari and incognito windows.

Use subdomains of one domain in production:

- `https://app.example.com` → frontend
- `https://api.example.com` → backend

Then set `WEB_ORIGIN=https://app.example.com` and
`NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1`.

If you must use different sites, both hosts still need HTTPS and the cookie uses
`SameSite=None; Secure` (already configured). Test in Safari before launch.

## 5. OAuth redirect URIs

Register the exact callback URL in each provider console:

```text
Google:   https://api.example.com/api/v1/auth/oauth/google/callback
Facebook: https://api.example.com/api/v1/auth/oauth/facebook/callback
```

Local development uses:

```text
http://localhost:4000/api/v1/auth/oauth/google/callback
http://localhost:4000/api/v1/auth/oauth/facebook/callback
```

`API_PUBLIC_URL` must match the host in those URLs exactly (scheme, host, port,
no trailing slash) or the provider returns `redirect_uri_mismatch`. If a
provider is not configured, its button returns an honest "not set up" message
instead of failing silently.

## 6. Post-deploy checks

1. `GET https://api.example.com/api/v1/health` → `{"status":"ok", ...}`.
2. Register a new account on the frontend; expect a 201 and a redirect to the
   dashboard.
3. Reload the dashboard; the session should persist.
4. Sign out; the cookie should clear and the dashboard should redirect to
   `/login`.
5. Open the browser console and confirm there are no CORS errors.

## 7. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Vercel build says "No Next.js version detected" | Deployed the repository root | Set Root Directory to `frontend`. |
| "The authentication API is not deployed at the configured address yet" | `NEXT_PUBLIC_API_BASE_URL` missing, wrong, or missing `/api/v1` | Correct the variable and redeploy the frontend. |
| 503 `AUTH_NOT_CONFIGURED` | `SESSION_SECRET` missing in production | Set it on the backend host. |
| Login succeeds but dashboard is signed out on reload | Third-party cookie blocked, or `WEB_ORIGIN` mismatch | Use one site (section 4); check CORS origin. |
| CORS error | `WEB_ORIGIN` does not exactly match the browser origin | Add the exact origin, comma-separated for multiple. |
| Accounts vanish after redeploy | JSON store on ephemeral storage | Mount a disk or use PostgreSQL. |
| Google `redirect_uri_mismatch` | Registered URI differs from `API_PUBLIC_URL` + path | Register the exact URL. |
| "multiple lockfiles" warning | Stale root `package-lock.json` | Keep only `frontend/` and `backend/` lockfiles. |

## 8. Local production smoke test

```bash
# API
cd backend
npm ci
npm start

# Frontend (separate terminal)
cd frontend
npm ci
npm run build
npm start
```

Set `frontend/.env.local` and `backend/.env` from the `.env.example` files first.

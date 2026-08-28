# Deployment Runbook

Deploy this project to production:
- **Backend** (Express + Socket.io) -> **Railway** (via Dockerfile)
- **Frontend** (React/Vite) -> **Vercel** (or deploy from `client/` on Railway)
- **Database** -> MongoDB Atlas (`greentech` DB)

> The backend MUST be a persistent service, not a serverless function, because
> it uses Socket.io (long-lived WebSockets + in-memory connection state).
> Railway keeps the process running by default; disable scale-to-zero for
> WebSocket uptime.

---

## Phase 1 - Backend: Railway

### 1. Create / link the project

The Railway CLI deploys from the Git repo. Link the project and service:

```bash
railway login
railway link --project <PROJECT_NAME>   # service auto-selects "hackathon"
```

### 2. Service config (via Railway dashboard)

- Service is connected to the GitHub repo `Sensitive04/hackathon`.
- Set **Root Directory** to `server/` so Railway builds `server/Dockerfile`
  (multi-stage: installs deps, compiles TypeScript with `tsc`, runs `dist/index.js`).
- **Port / Public Networking:** expose the service's public port on the Railway
  generated domain (`<service>.up.railway.app`), pointing to the app's PORT
  (Railway injects `$PORT`; the app reads `process.env.PORT`).

### 3. Environment variables (set from CLI or dashboard)

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://Than:<PASSWORD>@cluster0.pwv6xdl.mongodb.net/greentech?retryWrites=true&w=majority` |
| `JWT_SECRET` | a long random string (generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `JWT_EXPIRES_IN` | `7d` |
| `AI_API_KEY` | your `sk-ptw-...` key |
| `AI_BASE_URL` | `https://api.pateway.ai/v1` |
| `AI_MODEL` | `deepseek-chat` (or `gpt-5.6-luna`) |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | comma-separated frontend origins (e.g. `https://<app>.vercel.app`) |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX` | `100` |

Set via CLI:

```bash
railway variable set MONGODB_URI=... --skip-deploys
railway variable set JWT_SECRET=... --skip-deploys
# ... etc
```

### 4. Trigger the first deploy

Push a commit to `main` (Railway auto-deploys from the connected GitHub branch),
then verify:

```bash
curl https://<service>.up.railway.app/api/health
# -> {"status":"ok",...}
```

---

## Phase 2 - Frontend: Vercel

1. Go to https://vercel.com/new and **Import** the repo.
2. **Root Directory** = `client`, **Framework Preset** = Vite, Build = `npm run build`, Output = `dist`.
3. Add env variable: `VITE_API_URL` = `https://<service>.up.railway.app/api`.
4. Deploy, get the URL (e.g. `https://myapp.vercel.app`).

---

## Phase 3 - Wire the two together

Set Railway's `CORS_ORIGIN` to the Vercel URL and redeploy:

```bash
railway variable set CORS_ORIGIN=https://myapp.vercel.app
```

---

## Verification checklist

- [ ] `GET /api/health` on Railway returns `{"status":"ok"}`
- [ ] Vercel site loads
- [ ] Register / login works
- [ ] Marketplace, posts, admin, AI chat work
- [ ] Real-time: browser console shows `Socket connected`; typing indicators and
      online presence update live

---

## Optional - Seed admin

Server ships a seed script creating `admin@greenverse.com` / `Admin123!`.
Run it against the Atlas `greentech` DB from a machine with network access:

```bash
cd server
MONGODB_URI="mongodb+srv://Than:<PASSWORD>@cluster0.pwv6xdl.mongodb.net/greentech?appName=Cluster0" npx tsx src/seed.ts
```

---

## Security reminders

- NEVER commit `server/.env`, `client/.env` (both in `.gitignore`).
- The Atlas URI and `AI_API_KEY` are secrets; only enter them as Railway/Vercel
  env vars, never in committed files.
- Rotate any secrets shared over chat after the deploy is complete.

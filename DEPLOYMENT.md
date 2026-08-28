# Deployment Runbook

Deploy this project to production:
- **Frontend** (React/Vite) -> **Vercel**
- **Backend** (Express + Socket.io) -> **Render** (Web Service)
- **Database** -> MongoDB Atlas (`greentech` DB)

> The backend MUST be a persistent host (Render Web Service), not a serverless
> function, because it uses Socket.io (long-lived WebSockets + in-memory state).

---

## Phase 0 - Push repo (must come first)

The repo already tracks `vercel.json`, `render.yaml`, `client/.vercelignore`.
Both platforms deploy from Git, so push everything:

```bash
git add -A
git commit -m "Add deployment config"
git push origin main
```

---

## Phase 1 - Backend: Render

1. Go to https://dashboard.render.com -> **New -> Blueprint** and select the repo.
   Render reads `render.yaml` and creates the `greentech-server` web service
   automatically (root dir `server`, build `npm ci && npm run build`,
   start `npm start`, healthcheck `/api/health`).

   (Alt: New -> Web Service -> pick repo -> Root Directory = `server`,
   Runtime = Node, Build = `npm ci && npm run build`,
   Start = `npm start`.)

2. In the service -> **Environment** tab, values synced from `render.yaml`
   come from Git. For the `sync: false` secrets, set them manually:

   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | `mongodb+srv://Than:<PASSWORD>@cluster0.pwv6xdl.mongodb.net/greentech?appName=Cluster0` |
   | `JWT_SECRET` | a long random string (not `fallback_secret`) |
   | `AI_API_KEY` | your `sk-ptw-...` key |
   | `CORS_ORIGIN` | `https://<your-app>.vercel.app` (fill in Phase 2) |

   Already set from `render.yaml`: `NODE_ENV=production`, `JWT_EXPIRES_IN=7d`,
   `AI_BASE_URL=https://api.pateway.ai/v1`, `AI_MODEL=deepseek-chat`,
   `AI_MODEL_SECONDARY=gpt-5.6-luna`, `RATE_LIMIT_WINDOW_MS=900000`,
   `RATE_LIMIT_MAX=100`.

3. Click **Manual Deploy -> Deploy latest commit**.

4. Verify:
   ```bash
   curl https://<your-service>.onrender.com/api/health
   # -> {"status":"ok",...}
   ```
   Render may need a few minutes on first boot (includes initial MongoDB connect).

> Note: On Render, mongod is reached over the public network; first connect can
> be slow on cold start. Socket.io works because Render Web Service keeps the
> process alive.

---

## Phase 2 - Frontend: Vercel

1. Go to https://vercel.com/new and **Import** the repo.
2. In project config:
   - **Root Directory** = `client`
   - **Framework Preset** = Vite (auto-detected)
   - **Build Command** = `npm run build`
   - **Output Directory** = `dist`
3. Add environment variable (use the **Production** env only):
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://<your-service>.onrender.com/api` |

   > `VITE_*` vars are inlined at build time. After setting this, trigger a
   > **Redeploy** if the build already ran.

4. Deploy. Get the URL, e.g. `https://myapp.vercel.app`.

---

## Phase 3 - Wire the two together

- Set Render's `CORS_ORIGIN` = `https://myapp.vercel.app` and redeploy the web
  service so the browser can call the API cross-origin.

---

## Verification checklist

- [ ] `GET /api/health` on Render returns `{ "status": "ok" }`
- [ ] Vercel site loads
- [ ] Register / login works
- [ ] Marketplace, posts, admin, AI chat work
- [ ] Real-time: browser console shows `Socket connected`; typing indicators and
      online presence update live

---

## Optional - Seed admin

Server ships a seed script creating `admin@greenverse.com` / `Admin123!`
(it exits 0 if the admin already exists). Run against the Atlas `greentech` DB
from a machine with network access:

```bash
cd server
MONGODB_URI="mongodb+srv://Than:<PASSWORD>@cluster0.pwv6xdl.mongodb.net/greentech?appName=Cluster0" npx tsx src/seed.ts
```

---

## Security reminders

- NEVER commit `server/.env`, `client/.env` (both in `.gitignore`).
- The Atlas URI and `AI_API_KEY` are secrets; only enter them in the Render
  dashboard env vars, never in committed files.

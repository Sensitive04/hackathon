# Deployment Runbook

Deploy this project to production:
- **Frontend** (React/Vite) -> **Vercel**
- **Backend** (Express + Socket.io) -> **Koyeb** (Web Service via Dockerfile)
- **Database** -> MongoDB Atlas (`greentech` DB)

> The backend MUST be a persistent service, not a serverless function, because
> it uses Socket.io (long-lived WebSockets + in-memory connection state).
> Koyeb's free **nano** instance keeps the process running (no auto-sleep) and
> needs **no credit card**, unlike Render which now asks for payment details.

---

## Phase 0 - Push repo (must come first)

The repo tracks `vercel.json`, `client/.vercelignore`, and `server/Dockerfile`.
Both platforms deploy from the Git repo, so push everything:

```bash
git add -A
git commit -m "Deployment config"
git push origin main
```

---

## Phase 1 - Backend: Koyeb

1. Create a free account at https://app.koyeb.com (login with GitHub).
   **No credit card required.**

2. **Create a Web Service** (Create Service -> Web Service), and connect the
   `hackathon` GitHub repo as the source.

3. Configure the service:
   - **Builder** = `Dockerfile`
   - **Dockerfile path/context** = `server/` (Koyeb builds `server/Dockerfile`
     in the `server` context, which handles the TypeScript compile)
   - **Port** = `5000` (the image EXPOSE + the app's default PORT; Koyeb sets
     `$PORT` too — the app reads `process.env.PORT` so either works)
   - **Instance type** = `nano` (free tier, 512 MB RAM)
   - Env vars (see table below)

4. Create the service, then in **Settings / Environment variables** add:

   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | `mongodb+srv://Than:<PASSWORD>@cluster0.pwv6xdl.mongodb.net/greentech?appName=Cluster0` |
   | `JWT_SECRET` | a long random string (not `fallback_secret`) |
   | `AI_API_KEY` | your `sk-ptw-...` key |
   | `CORS_ORIGIN` | `https://<your-app>.vercel.app` (fill in Phase 2) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `AI_BASE_URL` | `https://api.pateway.ai/v1` |
   | `AI_MODEL` | `deepseek-chat` |
   | `AI_MODEL_SECONDARY` | `gpt-5.6-luna` |
   | `NODE_ENV` | `production` |
   | `RATE_LIMIT_WINDOW_MS` | `900000` |
   | `RATE_LIMIT_MAX` | `100` |

5. Deploy, then verify:
   ```bash
   curl https://<your-service>.koyeb.app/api/health
   # -> {"status":"ok",...}
   ```

> Keep the instance as the free `nano` type and **avoid scale-to-zero / sleep**
> settings so the Socket.io connections stay alive. Koyeb's nano instance stays
> running by default.

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
   | `VITE_API_URL` | `https://<your-service>.koyeb.app/api` |

   > `VITE_*` vars are inlined at build time. After setting this, trigger a
   > **Redeploy** if the build already ran.

4. Deploy. Get the URL, e.g. `https://myapp.vercel.app`.

---

## Phase 3 - Wire the two together

- Set Koyeb's `CORS_ORIGIN` = `https://myapp.vercel.app` and redeploy the web
  service so the browser can call the API cross-origin.

---

## Verification checklist

- [ ] `GET /api/health` on Koyeb returns `{ "status": "ok" }`
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
- The Atlas URI and `AI_API_KEY` are secrets; only enter them in the Koyeb
  dashboard env vars, never in committed files.

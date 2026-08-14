# Deploying to Render (free tier)

Two separate Render **Web Services** from this one repo: one for the backend, one for the
frontend. Both have generous free tiers; no credit card needed for this setup.

## 1. Push this repo to GitHub

```bash
cd taskflow
git init
git add .
git commit -m "TaskFlow: full-stack task board"
git branch -M main
git remote add origin https://github.com/<your-username>/taskflow.git
git push -u origin main
```

## 2. Backend service

In the Render dashboard: **New → Web Service** → connect your GitHub repo.

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free |

**Add a persistent disk** (Render dashboard → your service → Disks → Add Disk) so the SQLite file
survives deploys/restarts — the free tier's filesystem is otherwise ephemeral:

| Setting | Value |
|---|---|
| Mount Path | `/var/data` |
| Size | 1 GB (plenty for SQLite) |

**Environment variable:**

| Key | Value |
|---|---|
| `DB_PATH` | `/var/data/taskflow.db` |

Deploy. On first boot the server auto-seeds the database since it starts empty. Note the
service's URL, e.g. `https://taskflow-api-xxxx.onrender.com` — you'll need it for the frontend.

Sanity check once it's live:

```bash
curl https://taskflow-api-xxxx.onrender.com/api/health
# {"status":"ok"}
```

## 3. Frontend service

**New → Web Service** again, same repo.

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npx serve -s dist -l $PORT` |
| Instance Type | Free |

**Environment variable:**

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://taskflow-api-xxxx.onrender.com` (your backend URL from step 2) |

Deploy. Render's free-tier services spin down after inactivity and take ~30–60s to wake on the
next request — normal for the free tier, not a bug.

## 4. Update CORS if you lock it down later

The backend currently allows all origins (`cors()` with no options) for simplicity, since this is
a take-home project rather than a production service. If you want to restrict it, in
`backend/src/app.js`:

```js
app.use(cors({ origin: 'https://your-frontend-url.onrender.com' }));
```

## Alternative: Docker on Render

Render also supports deploying directly from each service's `Dockerfile` instead of the Node
buildpack above (**New → Web Service** → pick "Docker" as the environment, root directory
`backend` or `frontend`). Same free-tier limits apply; the Dockerfiles in this repo are ready to
use either way.

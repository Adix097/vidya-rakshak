# Vidya Rakshak

An early-warning system that predicts student dropout risk from attendance, marks, homework completion, distance to school, and fee status.

## Production architecture

| Component | Hosting | Public URL |
|---|---|---|
| Frontend | Vercel | `https://vidyarakshak.in` |
| Backend API | Render Web Service | `https://api.vidyarakshak.in` |
| ML API | Render Web Service | `https://ml.vidyarakshak.in` |
| Database | MongoDB Atlas | Private connection from the backend |

The frontend calls the backend. The backend calls the ML service. The browser should not call the ML service directly.

## Environment variables

### Frontend

File: [`frontend/.env.example`](./frontend/.env.example)

| Variable | Local value | Production value |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000` | `https://api.vidyarakshak.in` |

Vite variables are embedded into the browser bundle. Do not put database credentials, JWT secrets, or other private values in the frontend.

### Backend

File: [`backend/.env.example`](./backend/.env.example)

| Variable | Required | Value |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Long, random production-only secret |
| `ML_SERVICE_URL` | Yes | `https://ml.vidyarakshak.in` |
| `PORT` | Local only | `5000`; Render supplies this automatically |

### ML service

File: [`ml-service/.env.example`](./ml-service/.env.example)

The ML service currently has no application environment variables. Render supplies `PORT`, and the start command passes it to Uvicorn. The model file is loaded from the service directory and must remain in the deployed repository.

## Deploy step by step

### 1. Prepare MongoDB Atlas

1. Create a production database (or a separate production database in the existing cluster).
2. Create a database user with only the permissions this application needs.
3. Add Render's outbound access as permitted by your Atlas network-access policy. For an initial deployment, Atlas may require `0.0.0.0/0`; restrict this later if your hosting/network setup supports a narrower policy.
4. Copy the generated connection string and replace the placeholders in `MONGO_URI`. URL-encode special characters in the database username or password.

### 2. Deploy the ML service on Render

Create a **Web Service** from this repository:

- **Root Directory:** `ml-service`
- **Runtime:** Python
- **Build Command:** `pip install uv && uv sync --frozen`
- **Start Command:** `uv run uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Health Check Path:** `/health`

After the first successful deploy, check:

```text
https://<temporary-render-ml-host>/health
```

It should return a healthy response with `model_loaded: true`. Do not connect the backend until this check succeeds.

### 3. Deploy the backend on Render

Create a second **Web Service** from the same repository:

- **Root Directory:** `backend`
- **Runtime:** Node
- **Build Command:** `npm ci`
- **Start Command:** `npm start`
- **Health Check Path:** `/`

Add these Render environment variables:

```text
MONGO_URI=<production MongoDB Atlas connection string>
JWT_SECRET=<long random production secret>
ML_SERVICE_URL=https://ml.vidyarakshak.in
```

Do not set a fixed `PORT` on Render; Render injects it. Test the temporary backend URL before adding the custom domain:

```text
https://<temporary-render-backend-host>/
```

Expected response:

```json
{"status":"ok","message":"API running"}
```

### 4. Attach the custom domains in Render

In the ML Render service, open **Settings → Custom Domains** and add:

```text
ml.vidyarakshak.in
```

In the backend Render service, add:

```text
api.vidyarakshak.in
```

Render will show the DNS records it expects. Keep those values open while configuring GoDaddy. Render should issue TLS certificates after DNS has propagated.

### 5. Configure GoDaddy DNS

In GoDaddy **DNS Management**, create the records shown by Render. Usually this is one CNAME per subdomain:

| Type | Name | Value |
|---|---|---|
| CNAME | `api` | the backend hostname Render provides |
| CNAME | `ml` | the ML hostname Render provides |

Use the exact Render target, including its trailing dot if GoDaddy displays one. Remove conflicting `A`, `AAAA`, URL forwarding, or duplicate CNAME records for `api` and `ml`. Do not create a record for the full name `api.vidyarakshak.in` when GoDaddy asks for the **Name**; enter only `api`.

DNS changes can take from a few minutes to 48 hours. Verify resolution with:

```bash
dig +short api.vidyarakshak.in
dig +short ml.vidyarakshak.in
curl -i https://api.vidyarakshak.in/
curl -i https://ml.vidyarakshak.in/health
```

### 6. Deploy the frontend

The repository already contains [`frontend/.env.production`](./frontend/.env.production) with:

```text
VITE_API_URL=https://api.vidyarakshak.in
```

In Vercel:

1. Import the repository.
2. Set **Root Directory** to `frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add `VITE_API_URL=https://api.vidyarakshak.in` under the production environment.
6. Redeploy after saving the variable.

If you use a custom frontend domain, add it in Vercel and use that origin for end-to-end testing. The existing Vercel rewrite keeps client-side routes working.

### 7. Verify the complete connection

Run these checks in order:

1. `GET https://ml.vidyarakshak.in/health` returns `200` and `model_loaded: true`.
2. `GET https://api.vidyarakshak.in/` returns the API status JSON.
3. Open the production frontend and confirm its requests target `api.vidyarakshak.in`, not an old Render hostname.
4. Log in and exercise one authenticated API operation.
5. Run one student risk prediction and inspect both the backend and ML Render logs.
6. Confirm MongoDB Atlas shows the expected production data.

Render free services can sleep after inactivity, so the first request may be slow. Treat repeated timeouts as a service/logging issue rather than retrying indefinitely.

## Run locally

Start each service from its own directory:

```text
ml-service: uv run uvicorn app:app --reload --host 0.0.0.0 --port 8000
backend:    npm run dev
frontend:   npm run dev
```

Copy the relevant `.env.example` to `.env` (or `.env.local` for Vite) and use local URLs:

```text
frontend VITE_API_URL=http://localhost:5000
backend ML_SERVICE_URL=http://localhost:8000
```

The ML service exposes `GET /health` and `POST /predict`.

## Important production follow-ups

- Replace demo credentials and seed data before launch.
- Restrict backend CORS to the production frontend origin instead of relying on the current permissive default.
- Add rate limiting, structured logging, monitoring, backups, and a production deployment strategy for the database.
- Review authentication, authorization, input validation, error responses, and secret rotation before handling real student data.
- Keep secrets only in Render/Vercel environment settings or a secret manager; never commit `.env` files.

# Vidya Rakshak backend

This directory contains the Node.js and Express API. It is the application’s central service: it authenticates users, enforces roles, reads and writes MongoDB records, and calls the ML service when a teacher requests a risk prediction.

The API is deployed at [`https://api.vidyarakshak.in`](https://api.vidyarakshak.in).

## Main responsibilities

- Login and JWT authentication
- School, class, account, and student records
- Attendance and holiday tracking
- Marks and homework assignments
- Tuition and transportation fee status
- School-wide risk overview
- Calling the ML service and saving prediction results

## API areas

All paths below are relative to `/api`. Protected routes require a bearer token.

| Area | Base path | Purpose |
|---|---|---|
| Authentication | `/auth` | Login |
| Students | `/students` | Student records, summaries, fee status, and predictions |
| Attendance | `/attendance` | Attendance, holidays, and history |
| Assignments | `/assignments` | Assignments and submissions |
| Classes | `/classes` | List and create classes |
| Accounts | `/accounts` | School staff account management |

The service also exposes `GET /` as a simple availability check.

## Local development

Install dependencies and create `.env` from [`.env.example`](./.env.example):

```bash
npm ci
cp .env.example .env
npm run dev
```

Required local values:

```env
MONGO_URI=<MongoDB connection string>
JWT_SECRET=<local development secret>
ML_SERVICE_URL=http://localhost:8000
PORT=5000
```

For a production-like run:

```bash
npm start
```

## Production deployment

The backend runs on Render as a Node web service:

- **Root directory:** `backend`
- **Build command:** `npm ci`
- **Start command:** `npm start`
- **Health check path:** `/`
- **Public URL:** `https://api.vidyarakshak.in`

Render supplies `PORT`. Configure these variables in the Render dashboard:

```env
MONGO_URI=<production MongoDB Atlas connection string>
JWT_SECRET=<long, random production secret>
ML_SERVICE_URL=https://ml.vidyarakshak.in
```

Keep the database and JWT secret out of Git. The backend should be deployed only after the ML service’s `/health` endpoint reports that the model is loaded.

## Data flow for predictions

When `POST /api/students/:id/predict` is called, the backend calculates the student’s attendance and homework completion percentages, combines them with marks, age, distance, gender, and fee/transport information, then sends the resulting feature payload to the ML service. The returned score, risk level, and explanation are stored on the student and in the student history.

## Before calling this production-ready

The service still needs a security and operations review before handling real student information. In particular, restrict CORS to the frontend domain, review role checks and input validation, add rate limiting and structured logging, and make sure MongoDB backups and access policies are in place.

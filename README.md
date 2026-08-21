# Vidya Rakshak

An early-warning system that predicts student dropout risk from attendance, marks, homework completion, distance to school, and fee status — so schools can step in before a child disappears from the classroom.

## Live Demo

- **App:** https://vidya-rakshak.vercel.app
- **Backend API:** https://vidya-rakshak.onrender.com
- **ML Service:** https://vidya-rakshak-ml.onrender.com

> Note: the backend and ML service are on Render's free tier, so the **first request after inactivity can take 30–50 seconds** to wake up. If a prediction fails on the first try, wait a few seconds and try again.

## Demo Login Credentials

All accounts use the password: **`password123`**

| Role | Email | What they can do |
|---|---|---|
| School Admin | `admin@school.edu.in` | View school-wide risk overview, add teacher/fee-coordinator accounts |
| Teacher | `teacher@school.edu.in` | Mark attendance, enter marks, run dropout-risk predictions |
| Fee Coordinator | `fees@school.edu.in` | Add students, update fee payment status |

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS + React Router — deployed on Vercel
- **Backend:** Node.js + Express + MongoDB (Atlas) + JWT auth — deployed on Render
- **ML Service:** Python + FastAPI + scikit-learn — deployed on Render

## Project Structure

```
vidya-rakshak/
├── frontend/     → React app (Teacher, Fee Coordinator, School Admin dashboards)
├── backend/      → Express API (auth, students, attendance, marks, fees, predictions)
└── ml-service/   → FastAPI service (dropout-risk model)
```

## Run Locally

Start each service from its own directory:

```text
ml-service: uvicorn app:app --reload --host 0.0.0.0 --port 8000
backend:    npm run dev
frontend:   npm run dev
```

The backend reads `ML_SERVICE_URL`, `MONGO_URI`, `JWT_SECRET`, and `PORT` from `backend/.env`.
The frontend reads `VITE_API_URL`; it defaults to `http://localhost:5000` for local development.
The ML service exposes `GET /health` and `POST /predict`.
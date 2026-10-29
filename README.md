# Vidya Rakshak

Vidya Rakshak is a school dashboard for spotting students who may be at risk of dropping out. It brings together the signals a school already has — attendance, marks, homework, distance from school, and fee status — and turns them into a risk score that staff can act on.

The project is split into three small services:

- [`frontend/`](./frontend) is the React dashboard used by school staff.
- [`backend/`](./backend) is the authenticated API and the application’s source of truth.
- [`ml-service/`](./ml-service) is the prediction API that scores a student from the data sent by the backend.

## How it works

The browser never talks to the model directly:

1. A staff member signs in through the frontend.
2. The frontend calls the backend API with the signed-in user’s JWT.
3. Teachers record attendance, marks, homework, and student information.
4. When a teacher requests a risk assessment, the backend gathers the student’s latest information.
5. The backend sends that information to the ML service.
6. The result is saved with the student and shown in the teacher’s dashboard.

This keeps database access and model communication on the server side, where they belong.

## Roles

### School admin

School admins can view the school-wide risk overview and manage staff accounts and classes.

### Teacher

Teachers can record attendance, create assignments, mark homework submissions, update marks, view student summaries, and request dropout-risk predictions.

### Fee coordinator

Fee coordinators can add students and update tuition and transportation fee status.

## Production services

| Service | URL | Hosting |
|---|---|---|
| Frontend | `https://vidya-rakshak.vercel.app` | Vercel |
| Backend API | `https://api.vidyarakshak.in` | Render |
| ML API | `https://ml.vidyarakshak.in` | Render |
| Database | MongoDB Atlas | Managed database |

Useful checks:

```bash
curl https://api.vidyarakshak.in/
curl https://ml.vidyarakshak.in/health
```

The API root should report that the API is running. The ML health endpoint should report `model_loaded: true`.

## Run it locally

You need Node.js, npm, Python 3.14, and `uv`.

Clone the repository and install each service independently:

```bash
cd backend
npm ci

cd ../frontend
npm ci

cd ../ml-service
uv sync
```

Create local environment files from the examples:

- [`backend/.env.example`](./backend/.env.example)
- [`frontend/.env.example`](./frontend/.env.example)
- [`ml-service/.env.example`](./ml-service/.env.example)

For local development, the important values are:

```text
frontend: VITE_API_URL=http://localhost:5000
backend:  ML_SERVICE_URL=http://localhost:8000
```

Start the services in separate terminals:

```bash
# Terminal 1
cd ml-service
uv run uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Terminal 2
cd backend
npm run dev

# Terminal 3
cd frontend
npm run dev
```

Open the Vite URL shown in the frontend terminal, usually `http://localhost:5173`.

## Deployments

The production deployment is intentionally split:

- Render deploys `ml-service` as a Python web service.
- Render deploys `backend` as a Node web service.
- Vercel builds and serves `frontend`.

Each directory contains its own deployment notes and environment variables. Start with [`backend/README.md`](./backend/README.md), [`ml-service/README.md`](./ml-service/README.md), and [`frontend/README.md`](./frontend/README.md).

## Current status

The three services are connected and the production health checks are passing. This is a working early-stage product, not yet a finished production platform. Before using it with real student data, the project still needs a proper security and operations pass: restrict CORS to the real frontend origin, remove demo credentials and seed data, add monitoring and backups, review authorization and validation, and establish a policy for protecting student information.

Do not commit `.env` files. Environment examples are safe to commit; real credentials belong in Render, Vercel, or a secret manager.

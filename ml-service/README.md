# Vidya Rakshak ML service

This directory contains the prediction API for Vidya Rakshak. It is a small FastAPI service that loads the trained student dropout model and returns a risk score with the most influential features.

The service is deployed at [`https://ml.vidyarakshak.in`](https://ml.vidyarakshak.in). It is intended to be called by the backend, not directly by the browser.

## Endpoints

### `GET /`

Basic service information.

### `GET /health`

Reports whether the model loaded successfully:

```json
{
  "status": "healthy",
  "model_loaded": true,
  "threshold": 0.3
}
```

### `POST /predict`

Accepts the student features used by the trained model:

```json
{
  "gender": 1,
  "age": 14,
  "attendance_pct": 82.5,
  "marks": 68,
  "homework_completion_pct": 75,
  "distance_to_school": 4.2,
  "Tution_fee_status": 1,
  "Transportation_fee_status": 1,
  "has_schlorship": 0,
  "has_transportation": 1
}
```

The response contains the binary prediction, probability score, threshold, and the top feature contributions used in the explanation.

## Local development

The project uses `uv`:

```bash
uv sync
uv run uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The model is loaded from [`student_prediction_model.pkl`](./student_prediction_model.pkl) when the application starts. Keep that file alongside `app.py`.

To check the model artifact independently:

```bash
uv run python verify.py
```

## Production deployment

The service runs on Render as a Python web service:

- **Root directory:** `ml-service`
- **Build command:** `pip install uv && uv sync --frozen`
- **Start command:** `uv run uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Health check path:** `/health`
- **Public URL:** `https://ml.vidyarakshak.in`

Render supplies `PORT`. There are currently no application secrets or required environment variables for this service; see [`.env.example`](./.env.example).

## Model notes

The model artifact contains the fitted pipeline and its prediction threshold. The API also uses SHAP to produce an explanation for each prediction. If the artifact is replaced, verify that its expected feature names and preprocessing pipeline still match the payload assembled by the backend.

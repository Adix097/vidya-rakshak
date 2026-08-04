from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI()

class StudentFeatures(BaseModel):
    student_id: str
    gender: str
    age: int
    attendance_pct: float | None = None
    marks: float | None = None
    homework_completion: float | None = None
    distance_to_school: float | None = None
    fee_status: str

@app.post("/predict")
def predict(features: StudentFeatures):
    # replace with real model once finalized
    risk_score = round(random.uniform(0, 1), 4)

    if risk_score < 0.4:
        risk_level = "low"
    elif risk_score < 0.6:
        risk_level = "medium"
    elif risk_score < 0.8:
        risk_level = "high"
    else:
        risk_level = "critical"

    return {
        "student_id": features.student_id,
        "risk_level": risk_level,
        "risk_score": risk_score,
    }
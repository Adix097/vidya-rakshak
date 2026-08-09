from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import pandas as pd

app = FastAPI()

with open("student_dropout_model.pkl", "rb") as f:
    model = pickle.load(f)

print("Model classes:", model.classes_)
DROPOUT_INDEX = 1 if model.classes_[1] == "Dropout" else 0

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
    row = pd.DataFrame([{
        "gender": features.gender,
        "age": features.age,
        "attendance_pct": features.attendance_pct,
        "marks": features.marks,
        "homework_completion": features.homework_completion,
        "distance_to_school": features.distance_to_school,
        "fee_status": features.fee_status,
    }])

    probabilities = model.predict_proba(row)[0]
    risk_score = float(probabilities[DROPOUT_INDEX])

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
        "risk_score": round(risk_score, 4),
    }
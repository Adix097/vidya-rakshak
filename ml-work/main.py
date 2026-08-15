from __future__ import annotations

import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
MODEL_PATH = Path(__file__).resolve().parent / "student_dropout_model.pkl"

with MODEL_PATH.open("rb") as fh:
    model = pickle.load(fh)

classes = model.classes_
DROPOUT_INDEX = int(np.flatnonzero(classes == 1)[0]) if 1 in classes else 1


class StudentFeatures(BaseModel):
    student_id: str
    gender: str
    age: int
    attendance_pct: float | None = None
    marks: float | None = None
    homework_completion: float | None = None
    distance_to_school: float | None = None
    fee_status: str

    @property
    def normalized_gender(self) -> str:
        return str(self.gender).strip().lower() if self.gender else "other"

    @property
    def normalized_fee_status(self) -> str:
        value = str(self.fee_status).strip().lower()
        if value in {"paid", "fully_paid", "not_due", "no"}:
            return "no"
        return "yes"


@app.post("/predict")
def predict(features: StudentFeatures):
    row = pd.DataFrame(
        [
            {
                "gender": features.normalized_gender,
                "age": features.age,
                "attendance_pct": features.attendance_pct,
                "marks": features.marks,
                "homework_completion": features.homework_completion,
                "distance_to_school": features.distance_to_school,
                "fee_status": features.normalized_fee_status,
            }
        ]
    )

    probabilities = model.predict_proba(row)[0]
    risk_score = float(probabilities[DROPOUT_INDEX])

    if risk_score < 0.2:
        risk_level = "low"
    elif risk_score < 0.45:
        risk_level = "medium"
    elif risk_score < 0.7:
        risk_level = "high"
    else:
        risk_level = "critical"

    return {
        "student_id": features.student_id,
        "risk_level": risk_level,
        "risk_score": round(risk_score, 4),
    }

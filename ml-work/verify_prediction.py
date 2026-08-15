import pickle
from pathlib import Path

import pandas as pd

MODEL_PATH = Path(__file__).resolve().parent / "student_dropout_model.pkl"
REQUIRED_COLUMNS = [
    "gender",
    "age",
    "attendance_pct",
    "marks",
    "homework_completion",
    "distance_to_school",
    "fee_status",
]

with MODEL_PATH.open("rb") as f:
    model = pickle.load(f)

sample = pd.DataFrame(
    [
        {
            "gender": "female",
            "age": 14,
            "attendance_pct": 82.0,
            "marks": 75.0,
            "homework_completion": 79.0,
            "distance_to_school": 6.5,
            "fee_status": "no",
        }
    ],
    columns=REQUIRED_COLUMNS,
)

probabilities = model.predict_proba(sample)[0]
print("classes:", model.classes_)
print("probabilities:", probabilities)
print("risk_score_for_dropout:", float(probabilities[1]))

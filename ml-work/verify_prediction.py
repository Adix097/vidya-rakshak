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

positive_index = int((model.classes_ == 1).nonzero()[0][0])

low_risk_sample = pd.DataFrame(
    [
        {
            "gender": "female",
            "age": 14,
            "attendance_pct": 92.0,
            "marks": 90.0,
            "homework_completion": 92.0,
            "distance_to_school": 1.5,
            "fee_status": "no",
        }
    ],
    columns=REQUIRED_COLUMNS,
)

high_risk_sample = pd.DataFrame(
    [
        {
            "gender": "male",
            "age": 13,
            "attendance_pct": 48.0,
            "marks": 34.0,
            "homework_completion": 22.0,
            "distance_to_school": 14.0,
            "fee_status": "yes",
        }
    ],
    columns=REQUIRED_COLUMNS,
)

low_proba = model.predict_proba(low_risk_sample)[0]
high_proba = model.predict_proba(high_risk_sample)[0]
low_score = float(low_proba[positive_index])
high_score = float(high_proba[positive_index])

print("classes:", model.classes_)
print("good_student_risk:", low_score)
print("bad_student_risk:", high_score)

assert 0.0 <= low_score <= 1.0
assert 0.0 <= high_score <= 1.0
assert high_score > low_score

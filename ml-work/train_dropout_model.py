from __future__ import annotations

import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset.csv"
MODEL_PATH = BASE_DIR / "student_dropout_model.pkl"

REQUIRED_COLUMNS = [
    "gender",
    "age",
    "attendance_pct",
    "marks",
    "homework_completion",
    "distance_to_school",
    "fee_status",
]
NUMERIC_COLUMNS = ["age", "attendance_pct", "marks", "homework_completion", "distance_to_school"]
CATEGORICAL_COLUMNS = ["gender", "fee_status"]


def normalize_gender(series: pd.Series) -> pd.Series:
    values = series.fillna("other").astype(str).str.strip().str.lower()
    values = values.str.replace(r"[^a-z]+", "", regex=True)
    values = values.where(values.isin(["male", "female", "other"]), "other")
    return values


def normalize_fee_status(series: pd.Series) -> pd.Series:
    values = series.fillna("no").astype(str).str.strip().str.lower().str.replace(" ", "_", regex=False)
    mapping = {
        "paid": "no",
        "fully_paid": "no",
        "no": "no",
        "not_due": "no",
        "due": "yes",
        "yes": "yes",
        "unpaid": "yes",
        "overdue": "yes",
        "overdue_3_months": "yes",
        "overdue_3+_months": "yes",
    }
    normalized = values.map(mapping).fillna("yes")
    return normalized


def generate_student_dropout_dataset(rows: int = 2000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    gender = rng.choice(["male", "female", "other"], size=rows, p=[0.48, 0.48, 0.04])
    age = rng.integers(10, 19, size=rows)
    fee_due = rng.random(rows) < 0.38
    attendance = rng.normal(83, 12, rows)
    marks = rng.normal(72, 16, rows)
    homework = rng.normal(76, 18, rows)
    distance = rng.gamma(shape=2.5, scale=2.4, size=rows)

    attendance = attendance + (1 - fee_due.astype(int)) * 6 - fee_due.astype(int) * 11
    marks = marks - fee_due.astype(int) * 14 - (attendance < 65).astype(int) * 12
    homework = homework - fee_due.astype(int) * 16 - (distance > 8).astype(int) * 9
    distance = distance + fee_due.astype(int) * 4

    attendance = np.clip(attendance, 25, 100)
    marks = np.clip(marks, 20, 100)
    homework = np.clip(homework, 15, 100)
    distance = np.clip(distance, 0.2, 18)

    risk_score = (
        -4.6
        + 0.05 * (100 - attendance)
        + 0.07 * (100 - marks)
        + 0.08 * (100 - homework)
        + 0.18 * distance
        + 1.2 * fee_due.astype(float)
        + 0.25 * (age < 12).astype(float)
    )
    risk_score = 1 / (1 + np.exp(-risk_score))
    dropout_label = (rng.random(rows) < risk_score).astype(int)

    df = pd.DataFrame(
        {
            "gender": normalize_gender(pd.Series(gender)),
            "age": age,
            "attendance_pct": np.round(attendance, 2),
            "marks": np.round(marks, 2),
            "homework_completion": np.round(homework, 2),
            "distance_to_school": np.round(distance, 2),
            "fee_status": normalize_fee_status(pd.Series(np.where(fee_due, "yes", "no"))),
            "dropout_label": dropout_label,
        }
    )
    return df


def build_pipeline() -> Pipeline:
    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERIC_COLUMNS),
            ("cat", categorical_transformer, CATEGORICAL_COLUMNS),
        ]
    )

    classifier = LogisticRegression(
        max_iter=5000,
        class_weight="balanced",
        random_state=42,
    )

    return Pipeline(steps=[("preprocessor", preprocessor), ("classifier", classifier)])


def main() -> None:
    dataset = generate_student_dropout_dataset()
    dataset.to_csv(DATASET_PATH, index=False)

    X = dataset[REQUIRED_COLUMNS]
    y = dataset["dropout_label"]
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.25,
        random_state=42,
        stratify=y,
    )

    model = build_pipeline()
    model.fit(X_train, y_train)

    probabilities = model.predict_proba(X_test)
    positive_index = int(np.flatnonzero(model.classes_ == 1)[0])
    predictions = model.predict(X_test)
    print(classification_report(y_test, predictions, digits=4))
    print(f"ROC AUC: {roc_auc_score(y_test, probabilities[:, positive_index]):.4f}")
    print("classes:", model.classes_)

    with MODEL_PATH.open("wb") as fh:
        pickle.dump(model, fh)

    print(f"Saved training dataset to {DATASET_PATH}")
    print(f"Saved model to {MODEL_PATH}")


if __name__ == "__main__":
    main()

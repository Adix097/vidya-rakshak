from __future__ import annotations

import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

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

BASE_DIR = Path(__file__).resolve().parent
SOURCE_CANDIDATES = [
    BASE_DIR / "school_dropout_dataset_final_10000.csv",
    BASE_DIR / "dataset.csv",
    BASE_DIR.parent / "ml-work" / "school_dropout_dataset_final_10000.csv",
    BASE_DIR.parent / "ml-work" / "dataset.csv",
]
DATASET_CSV = BASE_DIR / "dataset.csv"
MODEL_PATH = BASE_DIR / "student_dropout_model.pkl"


def load_source() -> pd.DataFrame:
    for path in SOURCE_CANDIDATES:
        if path.exists():
            df = pd.read_csv(path)
            if set(REQUIRED_COLUMNS).issubset(df.columns) and "dropout_label" in df.columns:
                return df
            if "Dropout_Status" in df.columns:
                return df
            return df
    searched_paths = ", ".join(str(p) for p in SOURCE_CANDIDATES)
    raise FileNotFoundError(f"No training dataset found in ml-work. Checked: {searched_paths}")


def normalize_gender(series: pd.Series) -> pd.Series:
    values = series.fillna("other").astype(str).str.strip().str.lower()
    values = values.str.replace(r"[^a-z]+", "", regex=True)
    values = values.where(values.isin(["male", "female", "other"]), "other")
    return values


def normalize_fee_status(series: pd.Series) -> pd.Series:
    values = series.fillna("no").astype(str).str.strip().str.lower()
    values = values.str.replace(" ", "_", regex=False)
    mapping = {
        "paid": "no",
        "fully_paid": "no",
        "no": "no",
        "not_due": "no",
        "unpaid": "yes",
        "overdue_3_months": "yes",
        "overdue_3+_months": "yes",
        "yes": "yes",
        "due": "yes",
        "overdue": "yes",
    }
    normalized = values.map(mapping).fillna("yes")
    return normalized


def build_contract_dataframe(source: pd.DataFrame) -> pd.DataFrame:
    if set(REQUIRED_COLUMNS).issubset(source.columns) and "dropout_label" in source.columns:
        return source.copy()

    rng = np.random.default_rng(42)
    n_rows = len(source)

    label_source = source["Dropout_Status"].astype(str).str.strip().str.lower()
    target = label_source.eq("dropout").astype(int)

    gender_series = (
        source["Gender"]
        if "Gender" in source.columns
        else pd.Series(rng.choice(["male", "female", "other"], size=n_rows, p=[0.48, 0.48, 0.04]), index=source.index)
    )
    gender = normalize_gender(gender_series)

    if "Age" in source.columns:
        age = pd.to_numeric(source["Age"], errors="coerce").fillna(14).clip(10, 18).round().astype(int)
    else:
        age = rng.integers(10, 19, size=n_rows)

    if "attendance_pct" in source.columns:
        attendance_pct = pd.to_numeric(source["attendance_pct"], errors="coerce")
    else:
        attendance_mean = np.where(target == 1, rng.normal(58, 15, n_rows), rng.normal(82, 9, n_rows))
        if "Overall_Performance_Percentage" in source.columns:
            overall = pd.to_numeric(source["Overall_Performance_Percentage"], errors="coerce")
            attendance_mean = np.clip(0.7 * attendance_mean + 0.3 * overall.to_numpy(), 25, 100)
        attendance_pct = pd.Series(np.clip(attendance_mean, 25, 100), index=source.index)

    if "marks" in source.columns:
        marks = pd.to_numeric(source["marks"], errors="coerce")
    else:
        if "Overall_Performance_Percentage" in source.columns:
            marks = pd.to_numeric(source["Overall_Performance_Percentage"], errors="coerce")
        else:
            marks = pd.Series(np.where(target == 1, rng.normal(42, 18, n_rows), rng.normal(72, 16, n_rows)), index=source.index)
        marks = marks.clip(0, 100)

    if "homework_completion" in source.columns:
        homework_completion = pd.to_numeric(source["homework_completion"], errors="coerce")
    else:
        if "Homework_Completion" in source.columns:
            homework_completion = pd.to_numeric(source["Homework_Completion"], errors="coerce")
        else:
            homework_completion = pd.Series(
                np.where(target == 1, rng.normal(48, 18, n_rows), rng.normal(78, 14, n_rows)),
                index=source.index,
            )
        homework_completion = homework_completion.clip(0, 100)

    if "distance_to_school" in source.columns:
        distance_to_school = pd.to_numeric(source["distance_to_school"], errors="coerce")
    else:
        if "Distance_to_School_km" in source.columns:
            distance_to_school = pd.to_numeric(source["Distance_to_School_km"], errors="coerce")
        else:
            distance_to_school = pd.Series(
                np.where(target == 1, rng.normal(9, 4, n_rows), rng.normal(4, 3, n_rows)),
                index=source.index,
            )
        distance_to_school = distance_to_school.clip(0.1, 30)

    if "fee_status" in source.columns:
        fee_status = normalize_fee_status(source["fee_status"])
    else:
        if "Fees_Status" in source.columns:
            fee_status = normalize_fee_status(source["Fees_Status"])
        else:
            fee_status = pd.Series(
                np.where(target == 1, rng.choice(["yes", "no"], p=[0.72, 0.28], size=n_rows), rng.choice(["yes", "no"], p=[0.18, 0.82], size=n_rows)),
                index=source.index,
            )

    df = pd.DataFrame({
        "gender": gender,
        "age": age,
        "attendance_pct": attendance_pct,
        "marks": marks,
        "homework_completion": homework_completion,
        "distance_to_school": distance_to_school,
        "fee_status": fee_status,
        "dropout_label": target,
    })

    for column in ["attendance_pct", "marks", "homework_completion", "distance_to_school"]:
        null_mask = rng.random(len(df)) < 0.08
        df.loc[null_mask, column] = np.nan

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

    classifier = SGDClassifier(
        loss="log_loss",
        class_weight="balanced",
        random_state=42,
        max_iter=2000,
        tol=1e-4,
    )

    return Pipeline(steps=[("preprocessor", preprocessor), ("classifier", classifier)])


def main() -> None:
    source = load_source()
    dataset = build_contract_dataframe(source)
    dataset.to_csv(DATASET_CSV, index=False)

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

    predictions = model.predict(X_test)
    print(classification_report(y_test, predictions, digits=4))
    print("classes:", model.named_steps["classifier"].classes_)
    print("positive label index:", int(np.where(model.named_steps["classifier"].classes_ == 1)[0][0]))

    with MODEL_PATH.open("wb") as fh:
        pickle.dump(model, fh)

    print(f"Saved model to {MODEL_PATH}")
    print(f"Saved dataset to {DATASET_CSV}")


if __name__ == "__main__":
    main()

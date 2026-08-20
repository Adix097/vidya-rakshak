from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib
import shap

# Load model
MODEL_PATH = "student_prediction_model.pkl"

try:
    artifact = joblib.load(MODEL_PATH)

    model = artifact["model"]
    threshold = artifact["threshold"]

    preprocessor = model.named_steps["preprocessor"]
    classifier = model.named_steps["classifier"]

except Exception as e:
    raise RuntimeError(f"Failed to load model: {e}")

# FastAPI
app = FastAPI(
    title="Student Prediction ML API",
    version="1.0.0",
)

# Input schema
class StudentData(BaseModel):
    gender: int
    age: float
    attendance_pct: float
    marks: float
    homework_completion_pct: float
    distance_to_school: float
    Tution_fee_status: int
    Transportation_fee_status: int
    has_schlorship: int
    has_transportation: int

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "student-prediction-ml"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": True,
        "threshold": float(threshold)
    }

# Prediction
@app.post("/predict")
def predict(student: StudentData):

    try:
        # Convert request to DataFrame
        data = pd.DataFrame([student.model_dump()])

        # Get probability
        probability = float(
            model.predict_proba(data)[0, 1]
        )

        prediction = int(probability >= threshold)

        # SHAP explanation
        transformed_data = preprocessor.transform(data)
        explainer = shap.TreeExplainer(classifier)
        shap_values = explainer.shap_values(transformed_data)

        shap_values = shap_values[0]

        feature_names = preprocessor.get_feature_names_out()

        contributions = []

        for feature_name, shap_value in zip(
            feature_names,
            shap_values
        ):
            contributions.append({
                "feature": feature_name,
                "impact": float(shap_value)
            })

        # Sort by absolute importance
        contributions.sort(
            key=lambda x: abs(x["impact"]),
            reverse=True
        )

        top_contributors = contributions[:5]

        return {
            "prediction": prediction,
            "score": probability,
            "threshold": float(threshold),
            "explanation": top_contributors
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )
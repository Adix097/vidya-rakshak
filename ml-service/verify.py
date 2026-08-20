import joblib

MODEL_PATH = "student_prediction_model.pkl"
TEST_DATA_PATH = "test_data.pkl"

N = 240 * 12

# Load model
artifact = joblib.load(MODEL_PATH)

model = artifact["model"]
threshold = artifact["threshold"]

# Load test data
test_data = joblib.load(TEST_DATA_PATH)

X_test = test_data["X_test"]
y_test = test_data["y_test"]

N = min(N, len(X_test))

# Select 1000 students
students = X_test.sample(
    n=N,
    random_state=42
)

actual_values = y_test.loc[students.index]

# Predict
scores = model.predict_proba(students)[:, 1]
predictions = (scores >= threshold).astype(int)

# Compare
correct = predictions == actual_values.to_numpy()

# Print every 100 students
for i in range(100, N + 1, 100):
    correct_so_far = correct[:i].sum()
    accuracy_so_far = correct_so_far / i * 100

    print(
        f"{i} students: "
        f"{correct_so_far}/{i} correct "
        f"({accuracy_so_far:.2f}%)"
    )

# Final result
total_correct = correct.sum()
accuracy = total_correct / N * 100

print(f"\nFinal: {total_correct}/{N} correct ({accuracy:.2f}%)")
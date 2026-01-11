import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from joblib import dump


def main():
    base = os.path.dirname(__file__)
    csv_path = os.path.join(base, "models", "student.csv")
    model_path = os.path.join(base, "models", "student.pkl")

    df = pd.read_csv(csv_path)

    # Features and target
    features = ["grade", "section", "institution_id", "baseline_proficiency"]
    target = "learning_pace"

    X = df[features]
    y = df[target]

    # Preprocessing: one-hot for categorical, scale numeric
    categorical_features = ["section", "institution_id"]
    numeric_features = ["grade", "baseline_proficiency"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse=False),
                categorical_features,
            ),
        ]
    )

    clf = Pipeline(
        steps=[("preprocessor", preprocessor), ("classifier", RandomForestClassifier(random_state=42))]
    )

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"Test accuracy: {acc:.4f}")
    print("Classification report:\n", classification_report(y_test, y_pred))

    # Save model
    dump(clf, model_path)
    print(f"Saved trained model to: {model_path}")


if __name__ == "__main__":
    main()

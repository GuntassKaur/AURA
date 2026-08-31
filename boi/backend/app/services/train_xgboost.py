import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
import joblib
import json
import os
import glob
from pathlib import Path

def find_dataset():
    # Use the discovered absolute path
    dataset_path = "c:/Users/Guntass Kaur/Downloads/DataSet.csv"
    if not os.path.exists(dataset_path):
        # Fallback to OneDrive
        dataset_path = "c:/Users/Guntass Kaur/OneDrive/Documents/DataSet.csv"
    print(f"Using dataset: {dataset_path}")
    return dataset_path

def train_and_evaluate():
    # 1. Read BOI dataset
    dataset_path = find_dataset()
    print("Loading dataset...")
    # Load with chunking or low memory if it's massive
    df = pd.read_csv(dataset_path)
    
    # 2. Automatically identify target variable
    print(f"Dataset shape: {df.shape}")
    target_col = None
    if 'F3924' in df.columns and df['F3924'].nunique() == 2:
        target_col = 'F3924'
        print("Identified F3924 as the binary target variable.")
    else:
        # Scan for binary column
        for col in df.columns:
            if df[col].nunique() == 2:
                target_col = col
                print(f"Identified {col} as the binary target variable.")
                break
                
    if not target_col:
        raise ValueError("Could not automatically identify a binary target variable.")

    # Drop target from features
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    # Encode labels just in case they are string boolean
    le = LabelEncoder()
    y = le.fit_transform(y)
    
    # 3. Handle categorical and scale numerical features
    print("Preprocessing features...")
    categorical_encoders = {}
    for col in X.select_dtypes(include=['object', 'category']).columns:
        print(f"Encoding categorical column: {col}")
        le_cat = LabelEncoder()
        X[col] = le_cat.fit_transform(X[col].astype(str))
        categorical_encoders[col] = le_cat
        
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # 4. Train/Test Split
    print("Splitting dataset...")
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)
    
    # 5. Train XGBoost
    print("Training XGBoost...")
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=42,
        use_label_encoder=False,
        eval_metric='logloss'
    )
    model.fit(X_train, y_train)
    
    # 6. Evaluate Model (Phase B)
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    try:
        roc_auc = roc_auc_score(y_test, y_prob)
    except:
        roc_auc = 0.0 # if only one class present in test
        
    cm = confusion_matrix(y_test, y_pred)
    
    metrics = {
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "roc_auc": float(roc_auc)
    }
    
    cm_dict = {
        "true_negatives": int(cm[0][0]),
        "false_positives": int(cm[0][1]),
        "false_negatives": int(cm[1][0]),
        "true_positives": int(cm[1][1])
    }
    
    # 7. Output files
    models_dir = Path(__file__).parent.parent / "models"
    models_dir.mkdir(parents=True, exist_ok=True)
    metrics_dir = Path(__file__).parent.parent.parent / "metrics"
    metrics_dir.mkdir(parents=True, exist_ok=True)
    
    joblib.dump(model, models_dir / "xgboost_model.pkl")
    joblib.dump(scaler, models_dir / "scaler.pkl")
    joblib.dump(le, models_dir / "label_encoder.pkl")
    
    with open(metrics_dir / "model_metrics.json", "w") as f:
        json.dump(metrics, f, indent=4)
        
    with open(metrics_dir / "confusion_matrix.json", "w") as f:
        json.dump(cm_dict, f, indent=4)
        
    print("Phase A and Phase B completed successfully.")

if __name__ == "__main__":
    train_and_evaluate()

"""
XGBoost ML Training Pipeline for AEGISNET FI
Extracts historical transactions from DB, runs strictly data-driven feature engineering,
trains a model, and saves it. No synthetic data is allowed.
"""
import numpy as np
import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.schema import Transaction, Account, GraphNode, ModelRegistry as ModelRegistryTable
from app.ml.model_registry import ModelRegistry
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.ensemble import IsolationForest
import xgboost as xgb
import shap
from loguru import logger
import joblib
import os

def extract_features(txns: list, accounts_map: dict, nodes_map: dict) -> pd.DataFrame:
    """Engineer fraud features from actual database transaction, account, and graph records."""
    data = []
    
    # Sort transactions chronologically for an account to calculate actual velocity
    # For speed in this batch function, we'll do a simple grouped sort
    df_txns = pd.DataFrame([{
        "txn_id": t.txn_id,
        "source": t.source_account,
        "dest": t.dest_account,
        "amount": float(t.amount),
        "timestamp": t.txn_timestamp,
        "channel": t.channel,
        "label": 1 if t.is_fraud else 0
    } for t in txns])
    
    df_txns = df_txns.sort_values(by=["source", "timestamp"])
    
    # Real rolling velocity (1h and 24h)
    df_txns = df_txns.set_index("timestamp")
    df_txns["velocity_1h"] = df_txns.groupby("source")["amount"].transform(lambda x: x.rolling("1h").sum().shift(1).fillna(0))
    df_txns["velocity_24h"] = df_txns.groupby("source")["amount"].transform(lambda x: x.rolling("24h").sum().shift(1).fillna(0))
    df_txns = df_txns.reset_index()

    for idx, row in df_txns.iterrows():
        src_acc = accounts_map.get(row['source'])
        src_node = nodes_map.get(row['source'])
        
        dormancy = getattr(src_acc, 'dormancy_days', 0) if src_acc else 0
        centrality = getattr(src_node, 'degree_centrality', 0.0) if src_node else 0.0
        pagerank = getattr(src_node, 'pagerank', 0.0) if src_node else 0.0
        out_deg = getattr(src_node, 'out_degree', 0) if src_node else 0
        
        amount = row['amount']
        
        # Channels one-hot
        ch = row['channel']
        
        feature_row = {
            "amount": amount,
            "dormancy_days": float(dormancy),
            "velocity_1h": float(row['velocity_1h']),
            "velocity_24h": float(row['velocity_24h']),
            "out_degree": float(out_deg),
            "network_centrality": float(centrality),
            "pagerank": float(pagerank),
            "channel_UPI": 1.0 if ch == 'UPI' else 0.0,
            "channel_NEFT": 1.0 if ch == 'NEFT' else 0.0,
            "channel_RTGS": 1.0 if ch == 'RTGS' else 0.0,
            "channel_IMPS": 1.0 if ch == 'IMPS' else 0.0,
            "channel_ATM": 1.0 if ch == 'ATM' else 0.0,
            "label": row['label']
        }
        data.append(feature_row)
        
    return pd.DataFrame(data)

async def train_model_from_db(db: AsyncSession) -> dict:
    """Loads transactions from PostgreSQL, trains XGBoost, saves to disk & logs metrics."""
    logger.info("🔮 Retraining ML models strictly from PostgreSQL data...")
    
    # 1. Fetch data
    txn_result = await db.execute(select(Transaction))
    txns = txn_result.scalars().all()
    
    if len(txns) < 50:
        logger.warning("⚠️ Insufficient transaction data in DB to train model (< 50).")
        return {"status": "skipped", "reason": "insufficient_data"}
        
    acc_result = await db.execute(select(Account))
    accounts = {a.account_id: a for a in acc_result.scalars().all()}
    
    node_result = await db.execute(select(GraphNode))
    nodes = {n.account_id: n for n in node_result.scalars().all()}
    
    # 2. Create DataFrame
    df = extract_features(txns, accounts, nodes)
    
    X = df.drop(columns=['label'])
    y = df['label']
    
    fraud_count = int(y.sum())
    non_fraud_count = len(y) - fraud_count
    
    # STRICT NO-SYNTHETIC DATA POLICY
    if fraud_count == 0:
        logger.warning("⚠️ Zero fraud rows found. Shifting to Unsupervised Anomaly Detection (Isolation Forest).")
        
        iso_forest = IsolationForest(contamination=0.01, random_state=42)
        iso_forest.fit(X)
        
        metrics = {
            "model_type": "IsolationForest",
            "training_samples": len(df),
            "anomaly_ratio": 0.01
        }
        
        # Save model
        os.makedirs("models", exist_ok=True)
        joblib.dump(iso_forest, "models/isolation_forest.pkl")
        
        # Save dummy SHAP explainer for interface compatibility
        explainer = shap.TreeExplainer(iso_forest)
        joblib.dump(explainer, "models/shap_explainer.pkl")

        registry_entry = ModelRegistryTable(
            model_name="aegisnet_iso_forest",
            model_version="v1.0",
            model_type="IsolationForest",
            accuracy=0.0,
            precision_score=0.0,
            recall_score=0.0,
            f1_score=0.0,
            auc_roc=0.0,
            training_samples=len(df),
            feature_names=list(X.columns),
            hyperparameters={"contamination": 0.01},
            model_path="./models/isolation_forest.pkl",
            is_active=True
        )
        db.add(registry_entry)
        await db.commit()
        return metrics

    # Supervised XGBoost Pipeline
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    scale_pos_weight = max(1.0, float(non_fraud_count) / max(1.0, float(fraud_count)))
    
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        scale_pos_weight=scale_pos_weight,
        use_label_encoder=False,
        eval_metric='logloss',
        random_state=42
    )
    model.fit(X_train, y_train)
    
    # Evaluation
    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]
    
    accuracy = float(accuracy_score(y_test, preds))
    precision = float(precision_score(y_test, preds, zero_division=0))
    recall = float(recall_score(y_test, preds, zero_division=0))
    f1 = float(f1_score(y_test, preds, zero_division=0))
    try:
        auc_roc = float(roc_auc_score(y_test, probs))
    except Exception:
        auc_roc = 0.5
        
    metrics = {
        "model_type": "XGBoost",
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "auc_roc": auc_roc,
        "training_samples": len(df)
    }
    
    ModelRegistry.register_model(model, metrics)
    
    # Build strict SHAP explainer
    explainer = shap.TreeExplainer(model)
    joblib.dump(explainer, "models/shap_explainer.pkl")
    
    registry_entry = ModelRegistryTable(
        model_name="aegisnet_xgb",
        model_version="v2.0_strict",
        model_type="XGBoost",
        accuracy=accuracy,
        precision_score=precision,
        recall_score=recall,
        f1_score=f1,
        auc_roc=auc_roc,
        training_samples=len(df),
        feature_names=list(X.columns),
        hyperparameters=model.get_params(),
        model_path="./models/xgboost_model.pkl",
        is_active=True
    )
    db.add(registry_entry)
    await db.commit()
    
    logger.info("🔮 Strict XGBoost model training and SHAP explainer generation complete.")
    return metrics

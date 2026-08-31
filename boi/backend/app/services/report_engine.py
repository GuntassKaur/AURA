import uuid
from datetime import datetime
from typing import Dict, Any
from loguru import logger

class ReportEngine:
    def __init__(self):
        pass

    def generate_str_report(self, base_features: Dict[str, Any], fraud_score: float, shap_explanation: dict, investigation_graph: dict) -> dict:
        """
        Generates a Suspicious Transaction Report (STR) merging pure ML metrics (Layer 1) 
        and the Operational Simulation Graph (Layer 2).
        """
        report_id = f"STR-{datetime.now().strftime('%Y%M%d')}-{str(uuid.uuid4())[:6].upper()}"
        logger.info(f"Generating STR Report: {report_id}")

        # Extract top 3 driving features from SHAP
        driving_factors = []
        if shap_explanation.get("status") == "success":
            factors = shap_explanation.get("top_factors", [])
            driving_factors = [f"{f['feature']} (Impact: {f['impact']:.4f})" for f in factors[:3]]

        # Extract network intelligence
        network_nodes = 0
        mules_detected = 0
        if investigation_graph.get("status") == "success":
            topology = investigation_graph.get("topology", {})
            nodes = topology.get("nodes", [])
            network_nodes = len(nodes)
            mules_detected = len([n for n in nodes if n.get("type") == "MULE"])

        report = {
            "report_id": report_id,
            "generated_at": datetime.now().isoformat(),
            "status": "DRAFT",
            "layer_1_intelligence": {
                "fraud_probability": fraud_score,
                "model_version": "xgboost_v1.0",
                "primary_driving_features": driving_factors
            },
            "layer_2_simulation": {
                "network_size": network_nodes,
                "suspected_mule_accounts": mules_detected,
                "graph_topology_attached": True
            },
            "narrative": (
                f"Transaction flagged by XGBoost engine with {fraud_score * 100:.1f}% probability of fraud. "
                f"SHAP analysis indicates the primary driving features were {', '.join(driving_factors)}. "
                f"The Operational Simulation layer projected a potential network containing {network_nodes} connected accounts, "
                f"including {mules_detected} possible mule hops before cash-out. Recommendation: IMMEDIATE QUARANTINE."
            )
        }

        return report

str_report_engine = ReportEngine()

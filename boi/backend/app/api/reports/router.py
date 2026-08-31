from fastapi import APIRouter
from app.services.report_engine import str_report_engine

router = APIRouter()

@router.post("/str")
async def generate_str(fraud_probability: float = 0.95):
    """Generate a Suspicious Transaction Report (STR) for demo."""
    report = str_report_engine.generate_str_report(
        base_features={},
        fraud_score=fraud_probability,
        shap_explanation={"status": "success", "top_factors": []},
        investigation_graph={"status": "success", "topology": {"nodes": [], "edges": []}}
    )
    return report

@router.get("/")
async def list_reports():
    return {"message": "STR Report engine online. POST to /str to generate."}

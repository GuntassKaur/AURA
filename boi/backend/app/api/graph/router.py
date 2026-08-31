from fastapi import APIRouter
from app.services.graph_engine import graph_simulation_engine

router = APIRouter()

@router.get("/topology")
async def get_graph_topology(fraud_probability: float = 0.9):
    """Generate a simulated investigation graph for a given fraud probability level."""
    result = graph_simulation_engine.generate_investigation_graph(
        base_fraud_probability=fraud_probability,
        base_features={}
    )
    return result

@router.get("/status")
async def graph_status():
    return {"layer": "Operational Investigation Simulation", "status": "online"}

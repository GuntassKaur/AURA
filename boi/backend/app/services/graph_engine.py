"""
LAYER 2 - INVESTIGATION INTELLIGENCE (Operational Simulation Layer)
Because the BOI dataset contains only anonymized features (F1->F3924) with no 
topological account graph, this engine synthetically generates a "Palantir-style" 
NetworkX investigation graph overlaid on top of high-risk XGBoost predictions.
"""

import networkx as nx
import random
import uuid
from typing import Dict, Any, List
from loguru import logger

class OperationalGraphEngine:
    def __init__(self):
        self.G = nx.DiGraph()

    def generate_investigation_graph(self, base_fraud_probability: float, base_features: Dict[str, Any]) -> dict:
        """
        Synthetically generates a mule cluster around a high-risk prediction.
        """
        if base_fraud_probability < 0.5:
            return {"status": "low_risk", "message": "No investigation graph required for low-risk transaction."}

        logger.info(f"Generating Operational Investigation Graph for probability {base_fraud_probability:.2f}")

        # Number of synthetic mule accounts based on fraud probability severity
        mule_count = int(base_fraud_probability * 10) + random.randint(2, 5)
        
        # Central Suspect
        central_id = f"ACC-SUSP-{str(uuid.uuid4())[:8].upper()}"
        self.G.add_node(central_id, type="SUSPECT", risk=base_fraud_probability)

        nodes = [{"id": central_id, "type": "SUSPECT", "risk": base_fraud_probability}]
        edges = []

        # Generate layer of mules receiving funds
        for i in range(mule_count):
            mule_id = f"ACC-MULE-{str(uuid.uuid4())[:8].upper()}"
            mule_risk = max(0.1, base_fraud_probability - random.uniform(0.1, 0.4))
            
            self.G.add_node(mule_id, type="MULE", risk=mule_risk)
            nodes.append({"id": mule_id, "type": "MULE", "risk": mule_risk})
            
            # Link suspect to mule
            edge_id = f"txn-{str(uuid.uuid4())[:8]}"
            amount = random.uniform(5000, 50000)
            self.G.add_edge(central_id, mule_id, txn_id=edge_id, amount=amount)
            edges.append({
                "id": edge_id,
                "source": central_id,
                "target": mule_id,
                "amount": amount,
                "type": "LAYERING"
            })

            # 30% chance a mule forwards money to an offshore/crypto exit node
            if random.random() > 0.7:
                exit_id = f"ACC-EXIT-{str(uuid.uuid4())[:8].upper()}"
                self.G.add_node(exit_id, type="EXIT_NODE", risk=0.99)
                nodes.append({"id": exit_id, "type": "EXIT_NODE", "risk": 0.99})
                
                exit_edge = f"txn-{str(uuid.uuid4())[:8]}"
                self.G.add_edge(mule_id, exit_id, txn_id=exit_edge, amount=amount * 0.95)
                edges.append({
                    "id": exit_edge,
                    "source": mule_id,
                    "target": exit_id,
                    "amount": amount * 0.95,
                    "type": "CASH_OUT"
                })

        # Calculate network topology features for the UI simulation
        centrality = nx.degree_centrality(self.G)
        pagerank = nx.pagerank(self.G, weight='amount')

        for node in nodes:
            node['betweenness'] = centrality.get(node['id'], 0)
            node['pagerank'] = pagerank.get(node['id'], 0)

        return {
            "status": "success",
            "metadata": {
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "network_density": nx.density(self.G),
                "layer_type": "Operational Investigation Simulation"
            },
            "topology": {
                "nodes": nodes,
                "edges": edges
            }
        }

graph_simulation_engine = OperationalGraphEngine()

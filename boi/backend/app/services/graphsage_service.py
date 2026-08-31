"""
GraphSAGE Deep Learning Service for AEGISNET FI
Implements PyTorch-based Node Aggregation (GraphSAGE) for fraud embeddings & node classification.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.schema import GraphNode, GraphEdge
from loguru import logger


class SageConv(nn.Module):
    """Custom SageConv layer (neighborhood mean aggregation)."""
    def __init__(self, in_features: int, out_features: int):
        super().__init__()
        self.w_self = nn.Linear(in_features, out_features)
        self.w_neigh = nn.Linear(in_features, out_features)

    def forward(self, x: torch.Tensor, adj_matrix: torch.Tensor) -> torch.Tensor:
        # Neighborhood aggregation (mean)
        # adj_matrix shape: [num_nodes, num_nodes]
        # x shape: [num_nodes, in_features]
        deg = adj_matrix.sum(dim=1, keepdim=True).clamp(min=1.0)
        neigh_x = torch.matmul(adj_matrix, x) / deg
        
        out = self.w_self(x) + self.w_neigh(neigh_x)
        return F.relu(out)


class GraphSAGEModel(nn.Module):
    """2-Layer GraphSAGE model for node embeddings & classification."""
    def __init__(self, in_features: int, hidden_features: int, out_features: int):
        super().__init__()
        self.conv1 = SageConv(in_features, hidden_features)
        self.conv2 = SageConv(hidden_features, out_features)
        self.classifier = nn.Linear(out_features, 1)

    def forward(self, x: torch.Tensor, adj_matrix: torch.Tensor) -> tuple:
        h1 = self.conv1(x, adj_matrix)
        embeddings = self.conv2(h1, adj_matrix)
        logits = self.classifier(embeddings)
        probs = torch.sigmoid(logits)
        return embeddings, probs


class GraphSAGEService:
    @classmethod
    async def train_graphsage(cls, db: AsyncSession) -> dict:
        """
        Build adjacency matrix from GraphEdges, extract node features,
        train 2-layer GraphSAGE, and save node embeddings/predictions.
        """
        try:
            logger.info("🧠 Initializing GraphSAGE Deep Learning pipeline...")
            
            # Fetch nodes and edges
            nodes_q = await db.execute(select(GraphNode))
            nodes = nodes_q.scalars().all()
            
            edges_q = await db.execute(select(GraphEdge))
            edges = edges_q.scalars().all()
            
            if len(nodes) < 10:
                return {"status": "skipped", "reason": "insufficient_graph_size"}

            # Map account_id to index
            node_map = {n.account_id: idx for idx, n in enumerate(nodes)}
            num_nodes = len(nodes)
            
            # 1. Build Adjacency Matrix
            adj = torch.zeros((num_nodes, num_nodes), dtype=torch.float32)
            for edge in edges:
                u_idx = node_map.get(edge.source_account)
                v_idx = node_map.get(edge.dest_account)
                if u_idx is not None and v_idx is not None:
                    # Directed edge weight
                    adj[u_idx, v_idx] = float(edge.txn_count)

            # 2. Build Feature Matrix (in_degree, out_degree, pagerank, degree_centrality)
            x_data = []
            labels = []
            for n in nodes:
                x_data.append([
                    float(n.in_degree),
                    float(n.out_degree),
                    float(n.pagerank),
                    float(n.degree_centrality)
                ])
                labels.append(1.0 if n.is_mule_suspect else 0.0)
                
            x = torch.tensor(x_data, dtype=torch.float32)
            y = torch.tensor(labels, dtype=torch.float32).unsqueeze(1)

            # 3. Model setup (4 input features -> 8 hidden -> 4 embedding dimensions)
            model = GraphSAGEModel(in_features=4, hidden_features=8, out_features=4)
            optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
            criterion = nn.BCELoss()

            # Train loop (30 epochs for fast training in web server context)
            model.train()
            loss_val = 0.0
            for epoch in range(30):
                optimizer.zero_grad()
                emb, probs = model(x, adj)
                loss = criterion(probs, y)
                loss.backward()
                optimizer.step()
                loss_val = float(loss.item())

            # Evaluate embeddings & predictions
            model.eval()
            with torch.no_grad():
                embeddings, probs = model(x, adj)
                
            embeddings_np = embeddings.numpy()
            probs_np = probs.numpy().flatten()

            # 4. Save results back to DB
            for idx, n in enumerate(nodes):
                emb_list = embeddings_np[idx].tolist()
                n.embedding = emb_list
                n.graphsage_fraud_prob = float(probs_np[idx])
                
            await db.commit()
            
            logger.info("🧠 GraphSAGE training & embedding updates completed successfully.")
            return {
                "status": "success",
                "loss": loss_val,
                "embedding_dim": 4,
                "node_count": num_nodes,
                "projection": [{"account_id": n.account_id, "x": float(n.embedding[0]), "y": float(n.embedding[1]), "prob": float(n.graphsage_fraud_prob)} for n in nodes[:20]]
            }

        except Exception as e:
            logger.error(f"❌ GraphSAGE training pipeline failed: {e}")
            raise e

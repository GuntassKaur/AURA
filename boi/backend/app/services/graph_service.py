"""
Graph Intelligence Service for AEGISNET FI
Uses NetworkX to build graph topology, compute centrality metrics, trace laundering paths, and detect mule clusters.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.database.schema import Transaction, Account, GraphNode, GraphEdge
from loguru import logger
import networkx as nx
import json


class GraphService:
    @classmethod
    async def build_networkx_graph(cls, db: AsyncSession) -> nx.DiGraph:
        """Fetch transactions from DB and load them into a NetworkX directed graph."""
        G = nx.DiGraph()
        
        # Load edges
        edge_result = await db.execute(select(GraphEdge))
        edges = edge_result.scalars().all()
        
        for edge in edges:
            G.add_edge(
                edge.source_account,
                edge.dest_account,
                txn_count=edge.txn_count,
                total_amount=float(edge.total_amount),
                avg_amount=float(edge.avg_amount)
            )
            
        return G

    @classmethod
    async def analyze_graph_topology(cls, db: AsyncSession) -> dict:
        """Run Graph algorithms to calculate centrality metrics, trace cycles, and identify mule clusters."""
        try:
            G = await cls.build_networkx_graph(db)
            
            if len(G) == 0:
                return {"nodes": [], "edges": [], "clusters": []}
                
            # Centrality scores
            pagerank = nx.pagerank(G, weight='total_amount')
            betweenness = nx.betweenness_centrality(G)
            degree = nx.degree_centrality(G)
            
            # Simple clustering (weekly connected components)
            components = list(nx.weakly_connected_components(G))
            clusters = []
            
            for cluster_idx, comp in enumerate(components):
                clusters.append({
                    "cluster_id": cluster_idx,
                    "nodes": list(comp),
                    "node_count": len(comp)
                })

            # Detect circular routing cycles
            cycles = []
            try:
                raw_cycles = list(nx.simple_cycles(G))
                for cyc in raw_cycles[:10]: # Cap at 10 cycles
                    cycles.append(cyc)
            except Exception as cycle_err:
                logger.debug(f"Cycle detection skipped/failed: {cycle_err}")

            # Update database GraphNodes and Accounts
            for node_id in G.nodes():
                # Get or create node details
                node_pr = float(pagerank.get(node_id, 0.0))
                node_bet = float(betweenness.get(node_id, 0.0))
                node_deg = float(degree.get(node_id, 0.0))
                
                # Check for suspect properties (e.g. high degree fan-out)
                is_mule = (G.out_degree(node_id) > 4 and G.in_degree(node_id) >= 1)
                
                await db.execute(
                    update(GraphNode)
                    .where(GraphNode.account_id == node_id)
                    .values(
                        pagerank=node_pr,
                        betweenness_centrality=node_bet,
                        degree_centrality=node_deg,
                        in_degree=int(G.in_degree(node_id)),
                        out_degree=int(G.out_degree(node_id)),
                        is_mule_suspect=is_mule
                    )
                )
                
                # Also update account record
                await db.execute(
                    update(Account)
                    .where(Account.account_id == node_id)
                    .values(
                        centrality_score=node_pr,
                        fan_out_score=float(G.out_degree(node_id))
                    )
                )

            await db.commit()
            
            # Build serialization output for React Flow graph visualization
            nodes_data = []
            for n_id in G.nodes():
                # Fetch node risk tier
                acc_q = await db.execute(select(Account.risk_tier, Account.is_frozen).where(Account.account_id == n_id))
                acc_info = acc_q.first()
                risk = acc_info[0] if acc_info else 'LOW'
                frozen = acc_info[1] if acc_info else False
                
                nodes_data.append({
                    "id": n_id,
                    "pagerank": pagerank.get(n_id, 0.0),
                    "betweenness": betweenness.get(n_id, 0.0),
                    "degree": degree.get(n_id, 0.0),
                    "in_degree": G.in_degree(n_id),
                    "out_degree": G.out_degree(n_id),
                    "risk_tier": risk,
                    "is_frozen": frozen
                })

            edges_data = []
            for u, v, d in G.edges(data=True):
                edges_data.append({
                    "source": u,
                    "target": v,
                    "txn_count": d["txn_count"],
                    "total_amount": d["total_amount"],
                    "avg_amount": d["avg_amount"]
                })

            return {
                "nodes": nodes_data,
                "edges": edges_data,
                "clusters": clusters,
                "circular_paths": cycles
            }

        except Exception as e:
            logger.error(f"❌ Graph topology analysis failed: {e}")
            raise e

    @classmethod
    async def get_flow_graph(cls, db: AsyncSession) -> dict:
        """Returns nodes and edges formatted specifically for React Flow frontend."""
        analysis = await cls.analyze_graph_topology(db)
        
        # Build UI layout nodes
        flow_nodes = []
        for idx, node in enumerate(analysis["nodes"]):
            flow_nodes.append({
                "id": node["id"],
                "type": "customNode",
                "position": {"x": 100 + (idx % 4) * 250, "y": 100 + (idx // 4) * 200},
                "data": {
                    "label": node["id"],
                    "risk_tier": node["risk_tier"],
                    "is_frozen": node["is_frozen"],
                    "pagerank": node["pagerank"],
                    "degree": node["degree"]
                }
            })
            
        flow_edges = []
        for idx, edge in enumerate(analysis["edges"]):
            is_suspicious = (edge["total_amount"] > 100000.0)
            flow_edges.append({
                "id": f"e-{edge['source']}-{edge['target']}",
                "source": edge["source"],
                "target": edge["target"],
                "label": f"₹{edge['total_amount']:.0f}",
                "animated": is_suspicious,
                "style": {"stroke": "#ff4d4d" if is_suspicious else "#22d3ee", "strokeWidth": 2 if is_suspicious else 1}
            })
            
        return {"nodes": flow_nodes, "edges": flow_edges}

"""
Seed script for AEGISNET FI
Inserts initial showcase accounts, transactions, and graph topologies into PostgreSQL.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.database.schema import Account, Transaction, GraphNode, GraphEdge, Investigation
from datetime import datetime, timedelta
import random

# Use Sync connection for simple seeding execution
sync_engine = create_engine(settings.SYNC_DATABASE_URL)
Session = sessionmaker(bind=sync_engine)


def seed_database():
    # Ensure tables exist
    from app.database.postgres import Base
    Base.metadata.create_all(sync_engine)

    session = Session()
    try:
        print("🌱 Seeding AEGISNET FI command database...")
        
        # Check if already seeded
        case_exist = session.query(Investigation).filter_by(case_id='AEGIS-2024-001').first()
        if case_exist and session.query(Account).count() > 0:
            print("✅ Database already has seeded elements. Skipping.")
            return

        # 1. Accounts list
        accounts_data = [
            ("C1234567890", "SAVINGS", 84500.0, "FREEZE", True, "Systemic lock initiated by Cyber Defense Ops"),
            ("C9876543210", "SAVINGS", 1243000.0, "FREEZE", True, "Systemic lock initiated by Cyber Defense Ops"),
            ("C1122334455", "JAN_DHAN", 120.0, "HOLD", False, ""),
            ("C5544332211", "SAVINGS", 432000.0, "WATCH", False, ""),
            ("C6677889900", "CURRENT", 4500000.0, "LOW", False, ""),
            ("C1000000001", "CURRENT", 124000.0, "LOW", False, ""),
            ("C1000000002", "SAVINGS", 3500.0, "LOW", False, "")
        ]

        accounts_map = {}
        for acc_id, a_type, bal, risk, frozen, reason in accounts_data:
            acc = Account(
                account_id=acc_id,
                account_type=a_type,
                bank_code="BOI",
                ifsc_code="BKID0000123",
                balance=bal,
                risk_tier=risk,
                is_frozen=frozen,
                freeze_reason=reason if frozen else None,
                freeze_timestamp=datetime.now() - timedelta(hours=2) if frozen else None,
                dormancy_days=random.randint(10, 200),
                last_activity=datetime.now() - timedelta(minutes=random.randint(10, 500))
            )
            session.add(acc)
            accounts_map[acc_id] = acc

        # 2. Transactions Ledger
        base_time = datetime.now() - timedelta(hours=5)
        txns_data = [
            ("TXN-90001", "C6677889900", "C1234567890", 250000.0, "NEFT", base_time),
            ("TXN-90002", "C1234567890", "C9876543210", 120000.0, "UPI", base_time + timedelta(minutes=10)),
            ("TXN-90003", "C1234567890", "C1122334455", 10000.0, "UPI", base_time + timedelta(minutes=15)),
            ("TXN-90004", "C9876543210", "C5544332211", 50000.0, "IMPS", base_time + timedelta(minutes=20)),
            ("TXN-90005", "C1122334455", "C1000000001", 8000.0, "UPI", base_time + timedelta(minutes=25)),
            ("TXN-90006", "C5544332211", "C1000000002", 45000.0, "UPI", base_time + timedelta(minutes=30)),
            ("TXN-90007", "C1000000002", "C6677889900", 3000.0, "UPI", base_time + timedelta(minutes=35)),  # Loop back
        ]

        for t_id, src, dest, amt, ch, t_time in txns_data:
            txn = Transaction(
                txn_id=t_id,
                source_account=src,
                dest_account=dest,
                amount=amt,
                channel=ch,
                txn_timestamp=t_time,
                status="COMPLETED",
                fraud_score=0.92 if src == "C1234567890" else 0.05,
                risk_tier="FREEZE" if src == "C1234567890" else "LOW",
                is_flagged=src == "C1234567890",
                is_fraud=src == "C1234567890"
            )
            session.add(txn)

        # 3. Graph Edges
        edges_data = [
            ("C6677889900", "C1234567890", 1, 250000.0),
            ("C1234567890", "C9876543210", 1, 120000.0),
            ("C1234567890", "C1122334455", 1, 10000.0),
            ("C9876543210", "C5544332211", 1, 50000.0),
            ("C1122334455", "C1000000001", 1, 8000.0),
            ("C5544332211", "C1000000002", 1, 45000.0),
            ("C1000000002", "C6677889900", 1, 3000.0)
        ]

        for src, dest, cnt, total in edges_data:
            edge = GraphEdge(
                source_account=src,
                dest_account=dest,
                txn_count=cnt,
                total_amount=total,
                avg_amount=total,
                first_seen=base_time,
                last_seen=base_time + timedelta(hours=1),
                channels=[ "UPI" if src != "C6677889900" else "NEFT" ]
            )
            session.add(edge)

        # 4. Graph Nodes
        nodes_data = [
            ("C1234567890", 0.85, 0.45, 0.52, 2, 2, True),
            ("C9876543210", 0.72, 0.32, 0.48, 1, 1, True),
            ("C1122334455", 0.40, 0.22, 0.35, 1, 1, False),
            ("C5544332211", 0.35, 0.18, 0.30, 1, 1, False),
            ("C6677889900", 0.15, 0.10, 0.12, 1, 1, False),
            ("C1000000001", 0.05, 0.04, 0.08, 1, 0, False),
            ("C1000000002", 0.08, 0.05, 0.09, 1, 1, False)
        ]

        for node_id, pr, bet, deg, in_d, out_d, mule in nodes_data:
            node = GraphNode(
                account_id=node_id,
                pagerank=pr,
                betweenness_centrality=bet,
                degree_centrality=deg,
                in_degree=in_d,
                out_degree=out_d,
                is_mule_suspect=mule
            )
            session.add(node)

        # 5. Seed the investigation
        investigation = Investigation(
            case_id='AEGIS-2024-001',
            title='High-Risk Mule Cluster Investigation — Velocity Burst Pattern Detected',
            status='ACTIVE',
            severity='CRITICAL',
            suspect_accounts=["C1234567890", "C9876543210", "C1122334455", "C5544332211", "C6677889900"],
            fraud_patterns=["Spider Web Dispersal", "UPI Test-and-Drain", "Sleeper Activation", "Burst Fan-Out"],
            total_amount_at_risk=4750000.00
        )
        session.add(investigation)

        # 6. Seed users
        from app.database.schema import User
        from app.core.auth import get_password_hash
        
        user_exist = session.query(User).filter_by(username='admin').first()
        if not user_exist:
            users_data = [
                ("admin", "admin@boi.co.in", "admin123", "Administrator"),
                ("analyst", "analyst@boi.co.in", "fraud123", "Fraud Analyst"),
                ("compliance", "fiu@boi.co.in", "fiu123", "Compliance Officer")
            ]
            for un, email, pwd, role in users_data:
                u = User(
                    username=un,
                    email=email,
                    hashed_password=get_password_hash(pwd),
                    role=role
                )
                session.add(u)

        session.commit()
        print("🌱 Seeding completed successfully.")

    except Exception as e:
        session.rollback()
        print(f"❌ Seeding failed: {e}")
    finally:
        session.close()


if __name__ == "__main__":
    seed_database()

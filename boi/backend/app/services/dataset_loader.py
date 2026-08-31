"""
Dataset Loader & Ingestion Pipeline for AEGISNET FI
Strictly parses hackathon banking datasets. Infers schemas natively.
DOES NOT GENERATE SYNTHETIC TRANSACTIONS OR MULES.
"""
import pandas as pd
import numpy as np
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database.schema import Transaction, Account, GraphNode, GraphEdge
from app.core.config import settings
from loguru import logger
from datetime import datetime, timedelta

class DatasetLoader:
    @staticmethod
    def detect_columns(df: pd.DataFrame) -> dict:
        """Detect column mappings from arbitrary CSV schema to standard banking scheme."""
        cols = [c.lower() for c in df.columns]
        mapping = {}

        # 1. Amount
        for term in ['amount', 'amt', 'value', 'volume', 'txnamt']:
            for idx, c in enumerate(cols):
                if term in c:
                    mapping['amount'] = df.columns[idx]
                    break
            if 'amount' in mapping: break
        if 'amount' not in mapping:
            numerics = df.select_dtypes(include=[np.number]).columns
            if len(numerics) > 0:
                mapping['amount'] = numerics[0]
            else:
                mapping['amount'] = df.columns[0]

        # 2. Source Account
        for term in ['orig', 'source', 'sender', 'from', 'src', 'nameorig']:
            for idx, c in enumerate(cols):
                if term in c:
                    mapping['source'] = df.columns[idx]
                    break
            if 'source' in mapping: break
        if 'source' not in mapping:
            mapping['source'] = df.columns[0]

        # 3. Dest Account
        for term in ['dest', 'recipient', 'to', 'receiver', 'namedest', 'beneficiary']:
            for idx, c in enumerate(cols):
                if term in c:
                    mapping['dest'] = df.columns[idx]
                    break
            if 'dest' in mapping: break
        if 'dest' not in mapping:
            mapping['dest'] = df.columns[1] if len(df.columns) > 1 else df.columns[0]

        # 4. Fraud Label
        for term in ['fraud', 'isfraud', 'label', 'class', 'target', 'is_fraud']:
            for idx, c in enumerate(cols):
                if term in c:
                    mapping['is_fraud'] = df.columns[idx]
                    break
            if 'is_fraud' in mapping: break

        # 5. Timestamp/Step
        for term in ['step', 'time', 'timestamp', 'date', 'txndate']:
            for idx, c in enumerate(cols):
                if term in c:
                    mapping['timestamp'] = df.columns[idx]
                    break
            if 'timestamp' in mapping: break

        # 6. Channel/Type
        for term in ['type', 'channel', 'method', 'txntype']:
            for idx, c in enumerate(cols):
                if term in c:
                    mapping['channel'] = df.columns[idx]
                    break
            if 'channel' in mapping: break

        # 7. Geo features (optional)
        for term in ['location', 'state', 'city', 'geo']:
            for idx, c in enumerate(cols):
                if term in c:
                    mapping['geo'] = df.columns[idx]
                    break
            if 'geo' in mapping: break

        logger.info(f"🔍 Detected dataset columns: {mapping}")
        return mapping

    @classmethod
    async def ingest_csv(cls, file_path: str, db: AsyncSession, limit: int = 50000) -> dict:
        """Ingests transaction CSV file into database, strictly relying on actual data."""
        try:
            logger.info(f"📂 Loading hackathon dataset CSV from {file_path}")
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Dataset {file_path} not found.")

            df = pd.read_csv(file_path, nrows=limit)
            logger.info(f"✅ Loaded {len(df)} rows")

            mapping = cls.detect_columns(df)
            
            # Clean database table first to ensure a fresh demo/dataset run
            await db.execute(delete(Transaction))
            await db.execute(delete(Account))
            await db.execute(delete(GraphNode))
            await db.execute(delete(GraphEdge))
            await db.commit()

            # Process dataframe
            df['standard_amount'] = pd.to_numeric(df[mapping['amount']], errors='coerce').fillna(0.0)
            df['standard_source'] = df[mapping['source']].astype(str)
            df['standard_dest'] = df[mapping['dest']].astype(str)
            
            if 'is_fraud' in mapping:
                df['standard_is_fraud'] = df[mapping['is_fraud']].astype(int) == 1
            else:
                # If no label is provided, do NOT inject synthetic data. Mark as False/Unknown.
                logger.warning("No fraud label found. Will be processed as unlabeled/unsupervised.")
                df['standard_is_fraud'] = False

            if 'channel' in mapping:
                df['standard_channel'] = df[mapping['channel']].astype(str)
            else:
                df['standard_channel'] = 'UNKNOWN'

            # Build timestamps natively
            if 'timestamp' in mapping:
                t_col = df[mapping['timestamp']]
                if pd.api.types.is_numeric_dtype(t_col):
                    # Steps as hours from baseline
                    base_time = datetime.now() - timedelta(days=30)
                    df['standard_timestamp'] = [base_time + timedelta(hours=int(step)) for step in t_col]
                else:
                    df['standard_timestamp'] = pd.to_datetime(t_col, errors='coerce').fillna(datetime.now())
            else:
                # Infer sequentially
                base_time = datetime.now() - timedelta(days=30)
                df['standard_timestamp'] = [base_time + timedelta(minutes=idx * 2) for idx in range(len(df))]

            # Build unique accounts set and write to DB
            all_accounts = set(df['standard_source'].unique()).union(set(df['standard_dest'].unique()))
            
            logger.info(f"👥 Generating database records for {len(all_accounts)} accounts strictly from dataset...")
            
            for acc_id in all_accounts:
                # Calculate real properties based on historical data
                # No random choices.
                is_fraud_dest = False
                if 'is_fraud' in mapping:
                    is_fraud_dest = acc_id in df[df['standard_is_fraud'] == True]['standard_dest'].values

                acc = Account(
                    account_id=acc_id,
                    account_type='STANDARD', # Do not randomize
                    bank_code='BOI',
                    ifsc_code='UNKNOWN',
                    balance=0.0, # Will be inferred by graph/transaction flow in ML step
                    risk_tier='HIGH' if is_fraud_dest else 'LOW',
                    is_frozen=is_fraud_dest,
                    dormancy_days=0, 
                    last_activity=datetime.now()
                )
                db.add(acc)

            await db.commit()
            logger.info("👥 Accounts committed to database")

            logger.info("💸 Committing transactions to database...")
            for idx, row in df.iterrows():
                txn = Transaction(
                    txn_id=f"TXN-{1000000 + idx}",
                    source_account=row['standard_source'],
                    dest_account=row['standard_dest'],
                    amount=row['standard_amount'],
                    channel=row['standard_channel'],
                    txn_timestamp=row['standard_timestamp'],
                    is_fraud=row['standard_is_fraud'],
                    is_flagged=row['standard_is_fraud'],
                    fraud_score=0.0, # To be filled by ML pipeline
                    risk_tier='HIGH' if row['standard_is_fraud'] else 'LOW'
                )
                db.add(txn)

            await db.commit()
            logger.info("💸 Transactions committed to database")

            # We offload precompute to graph_builder.py
            from app.services.graph_engine import build_graph_from_db
            await build_graph_from_db(db)

            return {
                "status": "success",
                "records_ingested": len(df),
                "unique_accounts": len(all_accounts),
                "fraud_count": int(df['standard_is_fraud'].sum())
            }

        except Exception as e:
            logger.error(f"❌ Ingestion failed: {e}")
            await db.rollback()
            raise e

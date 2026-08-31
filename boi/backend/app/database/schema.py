"""
SQLAlchemy Models for AEGISNET FI
Matches both PostgreSQL and SQLite schemas dynamically.
"""
import json
import uuid
from sqlalchemy import Column, String, Numeric, Boolean, Integer, Float, DateTime, ForeignKey, Text, Table, JSON
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import JSONB as PG_JSONB, ARRAY as PG_ARRAY, UUID as PG_UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.postgres import Base

class SafeUUID(TypeDecorator):
    """Platform-independent GUID/UUID type.
    Uses PostgreSQL's UUID type, otherwise uses CHAR(36).
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            if isinstance(value, uuid.UUID):
                return str(value)
            return value

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            if isinstance(value, str):
                try:
                    return uuid.UUID(value)
                except ValueError:
                    return value
            return value

class SafeJSONB(TypeDecorator):
    """Fallback to JSON for SQLite, PG_JSONB for PostgreSQL."""
    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_JSONB())
        return dialect.type_descriptor(JSON())

class SafeARRAY(TypeDecorator):
    """Fallback to serialized JSON Text for SQLite, PG_ARRAY for PostgreSQL."""
    impl = Text
    cache_ok = True

    def __init__(self, item_type):
        self.item_type = item_type
        super().__init__()

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_ARRAY(self.item_type))
        return dialect.type_descriptor(Text())

    def process_bind_param(self, value, dialect):
        if dialect.name == 'postgresql':
            return value
        if value is not None:
            return json.dumps(value)
        return None

    def process_result_value(self, value, dialect):
        if dialect.name == 'postgresql':
            return value
        if value is not None:
            try:
                return json.loads(value)
            except Exception:
                return []
        return None


class Account(Base):
    __tablename__ = 'accounts'
    
    id = Column(SafeUUID, primary_key=True, default=uuid.uuid4)
    account_id = Column(String(64), unique=True, nullable=False, index=True)
    account_type = Column(String(32), default='SAVINGS')
    bank_code = Column(String(16))
    ifsc_code = Column(String(16))
    balance = Column(Numeric(18, 2), default=0.0)
    risk_tier = Column(String(16), default='LOW', index=True)
    is_frozen = Column(Boolean, default=False, index=True)
    freeze_reason = Column(Text)
    freeze_timestamp = Column(DateTime(timezone=True))
    dormancy_days = Column(Integer, default=0)
    last_activity = Column(DateTime(timezone=True))
    cluster_id = Column(Integer, index=True)
    centrality_score = Column(Float, default=0.0)
    node_embedding = Column(SafeARRAY(Float))
    total_txn_count = Column(Integer, default=0)
    total_txn_volume = Column(Numeric(18, 2), default=0.0)
    fan_out_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Transaction(Base):
    __tablename__ = 'transactions'
    
    id = Column(SafeUUID, primary_key=True, default=uuid.uuid4)
    txn_id = Column(String(64), unique=True, nullable=False, index=True)
    source_account = Column(String(64), nullable=False, index=True)
    dest_account = Column(String(64), nullable=False, index=True)
    amount = Column(Numeric(18, 2), nullable=False)
    channel = Column(String(32), default='UPI')
    txn_type = Column(String(32), default='TRANSFER')
    currency = Column(String(8), default='INR')
    status = Column(String(16), default='COMPLETED')
    fraud_score = Column(Float, index=True)
    risk_tier = Column(String(16), index=True)
    is_flagged = Column(Boolean, default=False, index=True)
    is_fraud = Column(Boolean)
    fraud_label_source = Column(String(32), default='PREDICTED')
    metadata_json = Column(SafeJSONB, name='metadata', default={})
    txn_timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    processed_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FraudScore(Base):
    __tablename__ = 'fraud_scores'
    
    id = Column(SafeUUID, primary_key=True, default=uuid.uuid4)
    txn_id = Column(String(64), nullable=False, index=True)
    score = Column(Float, nullable=False, index=True)
    risk_tier = Column(String(16), nullable=False)
    model_version = Column(String(32))
    features = Column(SafeJSONB, default={})
    shap_values = Column(SafeJSONB, default={})
    top_features = Column(SafeJSONB, default=[])
    counterfactual = Column(Text)
    inference_ms = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class GraphNode(Base):
    __tablename__ = 'graph_nodes'
    
    id = Column(SafeUUID, primary_key=True, default=uuid.uuid4)
    account_id = Column(String(64), unique=True, nullable=False, index=True)
    node_type = Column(String(32), default='ACCOUNT')
    cluster_id = Column(Integer, index=True)
    betweenness_centrality = Column(Float, default=0.0)
    degree_centrality = Column(Float, default=0.0)
    pagerank = Column(Float, default=0.0)
    in_degree = Column(Integer, default=0)
    out_degree = Column(Integer, default=0)
    is_hub = Column(Boolean, default=False)
    is_mule_suspect = Column(Boolean, default=False, index=True)
    risk_score = Column(Float, default=0.0)
    embedding = Column(SafeARRAY(Float))
    graphsage_fraud_prob = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class GraphEdge(Base):
    __tablename__ = 'graph_edges'
    
    id = Column(SafeUUID, primary_key=True, default=uuid.uuid4)
    source_account = Column(String(64), nullable=False, index=True)
    dest_account = Column(String(64), nullable=False, index=True)
    txn_count = Column(Integer, default=1)
    total_amount = Column(Numeric(18, 2), default=0.0)
    avg_amount = Column(Numeric(18, 2), default=0.0)
    first_seen = Column(DateTime(timezone=True))
    last_seen = Column(DateTime(timezone=True))
    channels = Column(SafeJSONB, default=[])
    risk_weight = Column(Float, default=0.0)
    is_laundering_path = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Investigation(Base):
    __tablename__ = 'investigations'
    
    id = Column(SafeUUID, primary_key=True, default=uuid.uuid4)
    case_id = Column(String(32), unique=True, nullable=False, index=True)
    title = Column(String(256))
    status = Column(String(32), default='OPEN', index=True)
    severity = Column(String(16), default='HIGH', index=True)
    suspect_accounts = Column(SafeJSONB, default=[])
    related_transactions = Column(SafeJSONB, default=[])
    fraud_patterns = Column(SafeJSONB, default=[])
    total_amount_at_risk = Column(Numeric(18, 2), default=0.0)
    agent_narrative = Column(Text)
    analyst_notes = Column(Text)
    assigned_to = Column(String(64))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    closed_at = Column(DateTime(timezone=True))

    alerts = relationship("Alert", back_populates="investigation")
    freeze_actions = relationship("FreezeAction", back_populates="investigation")
    compliance_reports = relationship("ComplianceReport", back_populates="investigation")

class Alert(Base):
    __tablename__ = 'alerts'
    
    id = Column(SafeUUID, primary_key=True, default=uuid.uuid4)
    alert_type = Column(String(64), nullable=False)
    severity = Column(String(16), default='HIGH', index=True)
    entity_id = Column(String(64))
    entity_type = Column(String(32))
    message = Column(Text, nullable=False)
    details = Column(SafeJSONB, default={})
    is_acknowledged = Column(Boolean, default=False, index=True)
    acknowledged_by = Column(String(64))
    acknowledged_at = Column(DateTime(timezone=True))
    investigation_id = Column(SafeUUID, ForeignKey('investigations.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    investigation = relationship("Investigation", back_populates="alerts")

class FreezeAction(Base):
    __tablename__ = 'freeze_actions'
    
    id = Column(SafeUUID, primary_key=True, default=uuid.uuid4)
    freeze_id = Column(String(32), unique=True, nullable=False)
    account_ids = Column(SafeJSONB, nullable=False)
    initiated_by = Column(String(64), nullable=False)
    reason = Column(Text, nullable=False)
    freeze_type = Column(String(32), default='FULL')
    status = Column(String(16), default='ACTIVE', index=True)
    investigation_id = Column(SafeUUID, ForeignKey('investigations.id'))
    legal_authority = Column(String(128))
    rbi_reference = Column(String(64))
    freeze_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    unfreeze_timestamp = Column(DateTime(timezone=True))
    audit_log = Column(SafeJSONB, default=[])

    investigation = relationship("Investigation", back_populates="freeze_actions")

class ComplianceReport(Base):
    __tablename__ = 'compliance_reports'
    
    id = Column(SafeUUID, primary_key=True, default=uuid.uuid4)
    report_id = Column(String(32), unique=True, nullable=False)
    report_type = Column(String(32), default='STR')
    case_id = Column(String(32))
    investigation_id = Column(SafeUUID, ForeignKey('investigations.id'))
    reporting_entity = Column(String(128), default='Bank of India')
    reporting_period_start = Column(DateTime(timezone=True))
    reporting_period_end = Column(DateTime(timezone=True))
    suspect_accounts = Column(SafeJSONB, default=[])
    total_suspicious_amount = Column(Numeric(18, 2))
    fraud_patterns = Column(SafeJSONB, default=[])
    shap_evidence = Column(SafeJSONB, default={})
    graph_evidence = Column(SafeJSONB, default={})
    ai_narrative = Column(Text)
    analyst_notes = Column(Text)
    freeze_reference = Column(String(32))
    pdf_url = Column(String(512))
    generated_by = Column(String(64))
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    submitted_at = Column(DateTime(timezone=True))
    fiu_reference = Column(String(64))

    investigation = relationship("Investigation", back_populates="compliance_reports")

class ModelRegistry(Base):
    __tablename__ = 'model_registry'
    
    id = Column(SafeUUID, primary_key=True, default=uuid.uuid4)
    model_name = Column(String(64), nullable=False)
    model_version = Column(String(32), nullable=False)
    model_type = Column(String(32))
    accuracy = Column(Float)
    precision_score = Column(Float)
    recall_score = Column(Float)
    f1_score = Column(Float)
    auc_roc = Column(Float)
    training_samples = Column(Integer)
    feature_names = Column(SafeJSONB, default=[])
    hyperparameters = Column(SafeJSONB, default={})
    model_path = Column(String(512))
    is_active = Column(Boolean, default=False)
    trained_at = Column(DateTime(timezone=True), server_default=func.now())

class AnalystAction(Base):
    __tablename__ = 'analyst_actions'
    
    id = Column(SafeUUID, primary_key=True, default=uuid.uuid4)
    analyst_id = Column(String(64), nullable=False)
    action_type = Column(String(64), nullable=False)
    entity_id = Column(String(64))
    entity_type = Column(String(32))
    details = Column(SafeJSONB, default={})
    notes = Column(Text)
    investigation_id = Column(SafeUUID, ForeignKey('investigations.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ModelFeedback(Base):
    __tablename__ = 'model_feedback'
    
    id = Column(SafeUUID, primary_key=True, default=uuid.uuid4)
    txn_id = Column(String(64), nullable=False)
    predicted_score = Column(Float)
    predicted_tier = Column(String(16))
    actual_label = Column(Boolean)
    analyst_override = Column(String(16))
    override_reason = Column(Text)
    analyst_id = Column(String(64))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = 'users'
    
    id = Column(SafeUUID, primary_key=True, default=uuid.uuid4)
    username = Column(String(64), unique=True, nullable=False, index=True)
    email = Column(String(128), unique=True, nullable=False, index=True)
    hashed_password = Column(String(256), nullable=False)
    role = Column(String(32), default='Investigator', nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

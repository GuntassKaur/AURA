-- AEGISNET FI — PostgreSQL Schema
-- Full production database schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ACCOUNTS
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id VARCHAR(64) UNIQUE NOT NULL,
    account_type VARCHAR(32) DEFAULT 'SAVINGS',
    bank_code VARCHAR(16),
    ifsc_code VARCHAR(16),
    balance NUMERIC(18, 2) DEFAULT 0,
    risk_tier VARCHAR(16) DEFAULT 'LOW' CHECK (risk_tier IN ('LOW', 'WATCH', 'HOLD', 'FREEZE')),
    is_frozen BOOLEAN DEFAULT FALSE,
    freeze_reason TEXT,
    freeze_timestamp TIMESTAMPTZ,
    dormancy_days INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ,
    cluster_id INTEGER,
    centrality_score FLOAT DEFAULT 0,
    node_embedding FLOAT[],
    total_txn_count INTEGER DEFAULT 0,
    total_txn_volume NUMERIC(18, 2) DEFAULT 0,
    fan_out_score FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accounts_risk_tier ON accounts(risk_tier);
CREATE INDEX idx_accounts_is_frozen ON accounts(is_frozen);
CREATE INDEX idx_accounts_cluster_id ON accounts(cluster_id);
CREATE INDEX idx_accounts_account_id ON accounts(account_id);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    txn_id VARCHAR(64) UNIQUE NOT NULL,
    source_account VARCHAR(64) NOT NULL,
    dest_account VARCHAR(64) NOT NULL,
    amount NUMERIC(18, 2) NOT NULL,
    channel VARCHAR(32) DEFAULT 'UPI' CHECK (channel IN ('UPI', 'NEFT', 'RTGS', 'IMPS', 'ATM', 'POS', 'NETBANKING')),
    txn_type VARCHAR(32) DEFAULT 'TRANSFER',
    currency VARCHAR(8) DEFAULT 'INR',
    status VARCHAR(16) DEFAULT 'COMPLETED',
    fraud_score FLOAT,
    risk_tier VARCHAR(16),
    is_flagged BOOLEAN DEFAULT FALSE,
    is_fraud BOOLEAN,
    fraud_label_source VARCHAR(32) DEFAULT 'PREDICTED',
    metadata JSONB DEFAULT '{}',
    txn_timestamp TIMESTAMPTZ NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_txn_source ON transactions(source_account);
CREATE INDEX idx_txn_dest ON transactions(dest_account);
CREATE INDEX idx_txn_timestamp ON transactions(txn_timestamp DESC);
CREATE INDEX idx_txn_fraud_score ON transactions(fraud_score DESC);
CREATE INDEX idx_txn_is_flagged ON transactions(is_flagged);
CREATE INDEX idx_txn_risk_tier ON transactions(risk_tier);

-- ============================================================
-- FRAUD SCORES
-- ============================================================
CREATE TABLE IF NOT EXISTS fraud_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    txn_id VARCHAR(64) NOT NULL,
    score FLOAT NOT NULL,
    risk_tier VARCHAR(16) NOT NULL,
    model_version VARCHAR(32),
    features JSONB DEFAULT '{}',
    shap_values JSONB DEFAULT '{}',
    top_features JSONB DEFAULT '[]',
    counterfactual TEXT,
    inference_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fraud_scores_txn_id ON fraud_scores(txn_id);
CREATE INDEX idx_fraud_scores_score ON fraud_scores(score DESC);

-- ============================================================
-- GRAPH NODES
-- ============================================================
CREATE TABLE IF NOT EXISTS graph_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id VARCHAR(64) UNIQUE NOT NULL,
    node_type VARCHAR(32) DEFAULT 'ACCOUNT',
    cluster_id INTEGER,
    betweenness_centrality FLOAT DEFAULT 0,
    degree_centrality FLOAT DEFAULT 0,
    pagerank FLOAT DEFAULT 0,
    in_degree INTEGER DEFAULT 0,
    out_degree INTEGER DEFAULT 0,
    is_hub BOOLEAN DEFAULT FALSE,
    is_mule_suspect BOOLEAN DEFAULT FALSE,
    risk_score FLOAT DEFAULT 0,
    embedding FLOAT[],
    graphsage_fraud_prob FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_graph_nodes_cluster ON graph_nodes(cluster_id);
CREATE INDEX idx_graph_nodes_mule ON graph_nodes(is_mule_suspect);

-- ============================================================
-- GRAPH EDGES
-- ============================================================
CREATE TABLE IF NOT EXISTS graph_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_account VARCHAR(64) NOT NULL,
    dest_account VARCHAR(64) NOT NULL,
    txn_count INTEGER DEFAULT 1,
    total_amount NUMERIC(18, 2) DEFAULT 0,
    avg_amount NUMERIC(18, 2) DEFAULT 0,
    first_seen TIMESTAMPTZ,
    last_seen TIMESTAMPTZ,
    channels JSONB DEFAULT '[]',
    risk_weight FLOAT DEFAULT 0,
    is_laundering_path BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_account, dest_account)
);

CREATE INDEX idx_graph_edges_source ON graph_edges(source_account);
CREATE INDEX idx_graph_edges_dest ON graph_edges(dest_account);
CREATE INDEX idx_graph_edges_laundering ON graph_edges(is_laundering_path);

-- ============================================================
-- INVESTIGATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id VARCHAR(32) UNIQUE NOT NULL,
    title VARCHAR(256),
    status VARCHAR(32) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ACTIVE', 'ESCALATED', 'CLOSED', 'FROZEN')),
    severity VARCHAR(16) DEFAULT 'HIGH' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    suspect_accounts JSONB DEFAULT '[]',
    related_transactions JSONB DEFAULT '[]',
    fraud_patterns JSONB DEFAULT '[]',
    total_amount_at_risk NUMERIC(18, 2) DEFAULT 0,
    agent_narrative TEXT,
    analyst_notes TEXT,
    assigned_to VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

CREATE INDEX idx_investigations_status ON investigations(status);
CREATE INDEX idx_investigations_severity ON investigations(severity);

-- ============================================================
-- ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type VARCHAR(64) NOT NULL,
    severity VARCHAR(16) DEFAULT 'HIGH',
    entity_id VARCHAR(64),
    entity_type VARCHAR(32),
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(64),
    acknowledged_at TIMESTAMPTZ,
    investigation_id UUID REFERENCES investigations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_acknowledged ON alerts(is_acknowledged);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);

-- ============================================================
-- FREEZE ACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS freeze_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    freeze_id VARCHAR(32) UNIQUE NOT NULL,
    account_ids JSONB NOT NULL,
    initiated_by VARCHAR(64) NOT NULL,
    reason TEXT NOT NULL,
    freeze_type VARCHAR(32) DEFAULT 'FULL',
    status VARCHAR(16) DEFAULT 'ACTIVE',
    investigation_id UUID REFERENCES investigations(id),
    legal_authority VARCHAR(128),
    rbi_reference VARCHAR(64),
    freeze_timestamp TIMESTAMPTZ DEFAULT NOW(),
    unfreeze_timestamp TIMESTAMPTZ,
    audit_log JSONB DEFAULT '[]'
);

CREATE INDEX idx_freeze_status ON freeze_actions(status);

-- ============================================================
-- COMPLIANCE REPORTS (STR)
-- ============================================================
CREATE TABLE IF NOT EXISTS compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id VARCHAR(32) UNIQUE NOT NULL,
    report_type VARCHAR(32) DEFAULT 'STR',
    case_id VARCHAR(32),
    investigation_id UUID REFERENCES investigations(id),
    reporting_entity VARCHAR(128) DEFAULT 'Bank of India',
    reporting_period_start TIMESTAMPTZ,
    reporting_period_end TIMESTAMPTZ,
    suspect_accounts JSONB DEFAULT '[]',
    total_suspicious_amount NUMERIC(18, 2),
    fraud_patterns JSONB DEFAULT '[]',
    shap_evidence JSONB DEFAULT '{}',
    graph_evidence JSONB DEFAULT '{}',
    ai_narrative TEXT,
    analyst_notes TEXT,
    freeze_reference VARCHAR(32),
    pdf_url VARCHAR(512),
    generated_by VARCHAR(64),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    fiu_reference VARCHAR(64)
);

-- ============================================================
-- MODEL REGISTRY
-- ============================================================
CREATE TABLE IF NOT EXISTS model_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(64) NOT NULL,
    model_version VARCHAR(32) NOT NULL,
    model_type VARCHAR(32),
    accuracy FLOAT,
    precision_score FLOAT,
    recall_score FLOAT,
    f1_score FLOAT,
    auc_roc FLOAT,
    training_samples INTEGER,
    feature_names JSONB DEFAULT '[]',
    hyperparameters JSONB DEFAULT '{}',
    model_path VARCHAR(512),
    is_active BOOLEAN DEFAULT FALSE,
    trained_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(model_name, model_version)
);

-- ============================================================
-- ANALYST ACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS analyst_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analyst_id VARCHAR(64) NOT NULL,
    action_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    entity_type VARCHAR(32),
    details JSONB DEFAULT '{}',
    notes TEXT,
    investigation_id UUID REFERENCES investigations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MODEL FEEDBACK
-- ============================================================
CREATE TABLE IF NOT EXISTS model_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    txn_id VARCHAR(64) NOT NULL,
    predicted_score FLOAT,
    predicted_tier VARCHAR(16),
    actual_label BOOLEAN,
    analyst_override VARCHAR(16),
    override_reason TEXT,
    analyst_id VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED: Initial Investigation Case
-- ============================================================
INSERT INTO investigations (case_id, title, status, severity, suspect_accounts, fraud_patterns, total_amount_at_risk)
VALUES (
    'AEGIS-2024-001',
    'High-Risk Mule Cluster Investigation — Velocity Burst Pattern Detected',
    'ACTIVE',
    'CRITICAL',
    '["C1234567890", "C9876543210", "C1122334455", "C5544332211", "C6677889900"]',
    '["Spider Web Dispersal", "UPI Test-and-Drain", "Sleeper Activation", "Burst Fan-Out"]',
    4750000.00
) ON CONFLICT DO NOTHING;

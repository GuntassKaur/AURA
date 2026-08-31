"""
API Routes entrypoint for AEGISNET FI
Exposes legacy/secondary router modules for main app.
"""
from app.api.routes import accounts
from app.api.routes import agents
from app.api.routes import analytics
from app.api.routes import freeze
from app.api.routes import investigations
from app.api.routes import upload

__all__ = [
    'accounts',
    'agents',
    'analytics',
    'freeze',
    'investigations',
    'upload'
]

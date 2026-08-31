"""
AI Agent Orchestration Router for AEGISNET FI
Triggers LangGraph multi-agent analysis for threat intelligence, correlation, and STR narrative generation.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.postgres import get_db
from app.database.schema import Investigation
from app.agents.langgraph_workflow import LangGraphWorkflow
from loguru import logger
import json

router = APIRouter()


async def run_investigation_task(case_id: str, suspect_accounts: list, db_session_maker):
    """Background runner to execute LangGraph agents, update case details."""
    async with db_session_maker() as db:
        try:
            # Execute workflow
            result = await LangGraphWorkflow.execute_workflow(case_id, suspect_accounts)
            
            # Fetch and update case
            q = select(Investigation).where(Investigation.case_id == case_id)
            res = await db.execute(q)
            case = res.scalar_one_or_none()
            
            if case:
                case.agent_narrative = result["investigation_report"]
                # Append compliance notes
                case.analyst_notes = (case.analyst_notes or "") + "\n\n[Agent Narrative Added]: " + result["compliance_report"]
                await db.commit()
                logger.info(f"🤖 Case {case_id} narrative successfully updated by Agents.")
        except Exception as e:
            logger.error(f"❌ Background agent execution failed: {e}")


@router.post("/investigate/{case_id}")
async def trigger_agent_investigation(
    case_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Triggers the LangGraph autonomous investigation workflow.
    Fires asynchronous agent tasks, broadcasting status to websockets live.
    """
    q = select(Investigation).where(Investigation.case_id == case_id)
    res = await db.execute(q)
    case = res.scalar_one_or_none()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case {case_id} not found."
        )

    # Parse suspects list
    suspects = []
    if isinstance(case.suspect_accounts, str):
        suspects = json.loads(case.suspect_accounts)
    elif isinstance(case.suspect_accounts, list):
        suspects = case.suspect_accounts

    # Import Session Maker for background session scope
    from app.core.database import async_session_maker
    
    # Enqueue background task so the API returns immediately
    background_tasks.add_task(
        run_investigation_task,
        case_id,
        suspects,
        async_session_maker
    )

    return {
        "status": "success",
        "message": "LangGraph multi-agent investigation successfully triggered in background.",
        "case_id": case_id,
        "target_suspects": suspects
    }

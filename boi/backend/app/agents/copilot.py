"""
AI Investigator Copilot (LangGraph Workflow)
Powers the Risk Story Generator and interactive AI investigation console.
"""
from typing import Dict, TypedDict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.schema import Investigation, Transaction, GraphNode
from loguru import logger
import os

# Define State
class AgentState(TypedDict):
    case_id: str
    messages: list
    db_context: str
    risk_story: str
    next_action: str

# 1. Initialize LLM (Requires GOOGLE_API_KEY in env)
llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.2)

async def gather_context_node(state: AgentState, db: AsyncSession) -> AgentState:
    """Fetch all context about the case from PostgreSQL to ground the LLM."""
    try:
        case_id = state['case_id']
        
        q = await db.execute(select(Investigation).where(Investigation.case_id == case_id))
        case = q.scalar_one_or_none()
        
        if not case:
            state['db_context'] = "Case not found."
            return state

        # Fetch suspects
        suspects_str = str(case.suspect_accounts)
        
        context_str = f"Case ID: {case.case_id}\nPriority: {case.priority}\nSuspects: {suspects_str}\n"
        
        state['db_context'] = context_str
        logger.info(f"Context gathered for {case_id}")
        return state
    except Exception as e:
        logger.error(f"Error gathering context: {e}")
        state['db_context'] = "Error retrieving context."
        return state

def generate_risk_story_node(state: AgentState) -> AgentState:
    """Generates the automated Risk Story narrative."""
    sys_prompt = SystemMessage(content=(
        "You are AEGISNET AI, an elite banking fraud investigator. "
        "Based on the database context, write a concise, professional Risk Story covering: "
        "What happened, Who was involved, How money moved, Why risk increased, and What evidence supports this."
    ))
    
    context_msg = HumanMessage(content=f"Database Context:\n{state['db_context']}")
    
    try:
        response = llm.invoke([sys_prompt, context_msg])
        state['risk_story'] = response.content
        state['messages'].append(AIMessage(content=response.content))
    except Exception as e:
        logger.error(f"LLM Error: {e}")
        state['risk_story'] = "AI Copilot currently offline. Please check API configuration."
    
    return state

def copilot_chat_node(state: AgentState) -> AgentState:
    """Handles interactive Q&A from the analyst."""
    sys_prompt = SystemMessage(content=(
        "You are AEGISNET AI Copilot. You are assisting a fraud analyst. "
        "Keep your answers concise, tactical, and grounded ONLY in the provided database context. "
        "If you don't know, say so."
    ))
    
    # Prepend system prompt and context to the conversation history
    messages = [sys_prompt, HumanMessage(content=f"Case Context: {state['db_context']}")] + state['messages']
    
    try:
        response = llm.invoke(messages)
        state['messages'].append(response)
    except Exception as e:
        logger.error(f"LLM Error: {e}")
        state['messages'].append(AIMessage(content="Connection to AEGISNET AI Core lost."))
        
    return state

# Define Router
def route_action(state: AgentState) -> str:
    if state.get("next_action") == "generate_story":
        return "generate_story"
    return "chat"

# Build Graph
workflow = StateGraph(AgentState)

# Note: In a pure async FastAPI app, we might need an async wrapper for DB access within nodes, 
# but for the prototype we will inject the DB session when we execute the workflow via a wrapper.

workflow.add_node("generate_story", generate_risk_story_node)
workflow.add_node("chat", copilot_chat_node)

# In real usage, the entrypoint will just call the relevant node.
workflow.set_entry_point("chat") # Default
workflow.add_edge("generate_story", END)
workflow.add_edge("chat", END)

copilot_app = workflow.compile()

# Helper function to run the workflow from FastAPI
async def run_copilot(case_id: str, db: AsyncSession, user_message: str = None, generate_story: bool = False) -> dict:
    # 1. Manually gather context (since it needs async DB)
    state = AgentState(
        case_id=case_id,
        messages=[HumanMessage(content=user_message)] if user_message else [],
        db_context="",
        risk_story="",
        next_action="generate_story" if generate_story else "chat"
    )
    
    state = await gather_context_node(state, db)
    
    # 2. Run LangGraph (sync LLM calls)
    # We use invoke because the LLM calls are currently synchronous in this setup.
    if generate_story:
        final_state = generate_risk_story_node(state)
        return {"risk_story": final_state['risk_story']}
    else:
        final_state = copilot_chat_node(state)
        return {"reply": final_state['messages'][-1].content}

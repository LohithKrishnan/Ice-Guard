"""
AI Copilot Reasoning Endpoint - ICEGUARD AI
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from ...services.copilot_reasoner import CopilotReasoner

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])

class CopilotQueryRequest(BaseModel):
    query: str
    history: Optional[List[Dict[str, Any]]] = None

@router.post("")
def ask_copilot(req: CopilotQueryRequest):
    reasoner = CopilotReasoner()
    response = reasoner.process_query(req.query, req.history)
    return response

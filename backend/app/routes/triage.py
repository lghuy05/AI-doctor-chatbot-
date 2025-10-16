from fastapi import APIRouter
from app.schemas.schemas import SymptomInput, TriageOut
from app.services.triage_service import triage_rules

router = APIRouter()


@router.post("/triage", response_model=TriageOut)
def route_triage(inp: SymptomInput):
    return triage_rules(inp.symptoms)

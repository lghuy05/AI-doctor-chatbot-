from fastapi import APIRouter
from models.schemas import SymptomInput, TriageOut
from services.triage_service import triage_rules

router = APIRouter()


@router.post("/triage", response_model=TriageOut)
def route_triage(inp: SymptomInput):
    return triage_rules(inp.symptoms)

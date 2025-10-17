from fastapi import APIRouter
from app.schemas.schemas import SymptomInput, TriageOut
from app.services.triage_service import triage_rules
from app.routes.auth import user_dependency
from app.database.database import db_dependency

router = APIRouter()


@router.post("/triage", response_model=TriageOut)
def route_triage(inp: SymptomInput):
    return triage_rules(inp.symptoms)

from fastapi import APIRouter
from models.schemas import SymptomInput, RxDraftOut
from services.llm_service import require_json_with_retry

router = APIRouter()


@router.post("/rx_draft", response_model=RxDraftOut)
def route_rx(inp: SymptomInput):
    def build_messages():
        system = "Clinician-only medication class draft. No dosing. JSON ONLY."
        user = (
            f"Age: {inp.age}\nSymptoms: {inp.symptoms}\nMeds: {inp.meds}\nConditions: {
                inp.conditions
            }\nSchema example:\n"
            + '{"candidates":[{"drug_class":"Inhaled corticosteroid","example":"budesonide DPI","use_case":"Persistent asthma","contraindications":["hypersensitivity"],"monitoring":["symptom diary"]}],"notes":"Draft for clinician review—do not display to patient."}'
        )
        return [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]

    data = require_json_with_retry(build_messages)
    return RxDraftOut(**data)

from fastapi import APIRouter, HTTPException
from app.schemas.schemas import SymptomInput, AdviceOut
from app.services.triage_service import triage_rules
from app.services.llm_service import require_json_with_retry, PATIENT_RX_BLOCK

from rag_service import retrieve_context #for RAG retrieval

router = APIRouter()


@router.post("/advice", response_model=AdviceOut)
def route_advice(inp: SymptomInput):
    # First check for emergencies using triage
    triage = triage_rules(inp.symptoms)
    if triage.risk == "emergency":
        raise HTTPException(400, "Possible emergency. Call emergency services now.")

    #Retrieve context based on symptoms from vector db
    #Semantic search for 'k' contexts that is closest to symptoms
    context_text, sources = retrieve_context(inp.symptoms, k=5)

    def build_messages():
        """Build prompt with RAG"""
        system = (
            # "You are a clinical decision support assistant for patients. "
            # "NEVER diagnose. NEVER provide medication names/doses to patients. "
            # "Return JSON ONLY with keys: advice[], when_to_seek_care[], disclaimer."

            
            
            "You are a clinical decision support assistant for patients. "
            "Your advice **MUST** be factually based **ONLY** on the provided 'CONTEXT'. "
            "NEVER diagnose. NEVER provide medication names/doses to patients. "
            "If the context is insufficient, state: 'I cannot provide specific advice on this topic based on the available knowledge. Please consult a clinician.' "
            "Return JSON ONLY with keys: advice[], when_to_seek_care[], disclaimer."
            #Improved prompt for RAG implementation
        )
        user = (
            f"### CONTEXT ###\n"
            f"{context_text if context_text else 'No specific medical knowledge was found.'}\n"
            f"### PATIENT DATA ###\n"

            f"Age: {inp.age}\nSex: {inp.sex}\nSymptoms: {inp.symptoms}\nDuration: {
                inp.duration
            }\n"
            f"Meds: {inp.meds}\nConditions: {inp.conditions}\nSchema example:\n"
            + '{"advice":[{"step":"Hydration","details":"Small sips of water."}],"when_to_seek_care":["Trouble breathing"],"disclaimer":"This is not a diagnosis."}'
        )
        print([
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ])
        
        return [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]

    data = require_json_with_retry(build_messages)
    data['sources'] = sources

    # Post-filter: block dosing in patient-facing advice
    full = " ".join(
        f"{x.get('step', '')} {x.get('details', '')}" for x in data.get("advice", [])
    )
    if PATIENT_RX_BLOCK.search(full):
        raise HTTPException(400, "Medication instructions to patients are not allowed.")

    return AdviceOut(**data)

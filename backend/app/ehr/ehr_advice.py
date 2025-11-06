# routes/ehr_advice.py
from fastapi import APIRouter, HTTPException
from app.schemas.schemas import SymptomInput, EnhancedAdviceOut
from app.services.fhir_service import FHIRService
from app.services.triage_service import triage_rules
from app.services.llm_service import require_json_with_retry
from app.schemas.profile_schemas import PatientProfile
from app.services.rag_service import get_medical_context

router = APIRouter()


@router.post("/ehr-advice", response_model=EnhancedAdviceOut)
def enhanced_advice_with_ehr(inp: SymptomInput):
    # 1. Triage first (safety check)
    triage = triage_rules(inp.symptoms)
    if triage.risk == "emergency":
        raise HTTPException(400, "Possible emergency. Call emergency services now.")

    medical_context = get_medical_context(inp.symptoms)

    # 2. Get EHR data for LLM context
    ehr_context = {
        "ehr_medications": inp.meds,
        "ehr_conditions": inp.conditions,
        "ehr_age": inp.age,
        "ehr_gender": inp.sex,
    }
    print(
        f"📋 Using patient-provided data: {len(inp.meds)} meds, {
            len(inp.conditions)
        } conditions"
    )
    # 3. Enhanced LLM call with EHR context

    def build_messages():
        # system = (
        #     "You are a clinical decision support assistant. "
        #     "Consider the patient's existing conditions and medications from their EHR if available. "
        #     "Also consider the provided medical research context from PubMed when giving advice"
        #     "NEVER diagnose. NEVER provide medication names/doses to patients. "
        #     "Return JSON ONLY with keys: advice[], when_to_seek_care[], disclaimer."
        # )
        system = (
            "You are a clinical decision support assistant. "
            "Consider the patient's existing conditions and medications from their EHR if available. "
            "Also consider the provided medical research context from PubMed when giving advice. "
            "NEVER diagnose. NEVER provide medication names/doses to patients. "
            "CRITICAL: You MUST analyze symptom intensity and duration. "
            "For intensity (1-10 scale): "
            "- mild/annoying: 1-3, moderate/bothersome: 4-6, severe/debilitating: 7-10 "
            "- Words like 'kinda', 'a little', 'slight': 2-3 "
            "- Words like 'pretty', 'quite', 'moderate': 4-6 "
            "- Words like 'very', 'really', 'severe': 7-8 "
            "- Words like 'extreme', 'unbearable', 'worst ever': 9-10 "
            "For duration in minutes: "
            "- 'just started', 'today': 30-60 minutes "
            "- 'this morning', 'few hours': 60-240 minutes "
            "- 'all day', 'since yesterday': 480+ minutes "
            "You MUST return JSON with this EXACT structure: "
            "{"
            '"advice": [{"step": "...", "details": "..."}],'
            '"when_to_seek_care": ["..."],'
            '"disclaimer": "...",'
            '"symptom_analysis": {'
            '"intensities": ['
            '{"symptom_name": "headache", "intensity": 7, "duration_minutes": 180, "notes": "severe pain"},'
            '{"symptom_name": "nausea", "intensity": 3, "duration_minutes": 180, "notes": "mild and intermittent"}'
            "],"
            '"overall_severity": 6'
            "}"
            "}"
            "DO NOT include research_bases or research_references. ONLY use the specified JSON keys."
        )
        ehr_text = ""
        if ehr_context and (
            ehr_context.get("ehr_medications") or ehr_context.get("ehr_conditions")
        ):
            ehr_text = (
                f"EHR MEDICAL HISTORY:\n"
                f"Current Medications: {
                    ', '.join(ehr_context.get('ehr_medications', []))
                }\n"
                f"Existing Conditions: {
                    ', '.join(ehr_context.get('ehr_conditions', []))
                }\n"
                f"EHR Age: {ehr_context.get('ehr_age', 'Not specified')}\n"
                f"EHR Gender: {ehr_context.get('ehr_gender', 'Not specified')}\n\n"
            )
        else:
            ehr_text = "No EHR data available for this patient.\n\n"

        research_text = ""
        if (
            medical_context
            and "articles" in medical_context
            and medical_context["articles"]
        ):
            research_text = "MEDICAL RESEARCH CONTEXT (from recent PubMed Studies):\n"
            for i, article in enumerate(medical_context["articles"][:5], 1):
                research_text += (
                    f"{i}. {article['title']} ({article['year']}) - "
                    f"Relevance: {article['relevance_score']:.2f}\n"
                    f"Key findings: {article['content'][:200]}...\n\n"
                )
        else:
            research_text = (
                "No recent medical research text available for these symptoms."
            )

        user = (
            f"{ehr_text}"
            f"{research_text}"
            f"PATIENT-REPORTED INFORMATION:\n"
            f"Age: {inp.age}\n"
            f"Gender: {inp.sex}\n"
            f"Symptoms: {inp.symptoms}\n"
            f"Duration: {inp.duration}\n"
            f"Patient-Reported Meds: {inp.meds}\n"
            f"Patient-Reported Conditions: {inp.conditions}\n\n"
            f"Provide personalized advice considering their complete medical history.\n"
            f"JSON Schema:\n"
            + '{"advice":[{"step":"Hydration","details":"Small sips of water."}],"when_to_seek_care":["Trouble breathing"],"disclaimer":"This is not a diagnosis."}'
        )

        return [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]

    print("🤖 Generating advice with EHR context...")
    return require_json_with_retry(build_messages)

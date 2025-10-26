# routes/ehr_advice.py
from fastapi import APIRouter, HTTPException
from app.schemas.schemas import SymptomInput, AdviceOut
from app.services.fhir_service import FHIRService
from app.services.triage_service import triage_rules
from app.services.llm_service import require_json_with_retry

router = APIRouter()


@router.post("/ehr-advice", response_model=AdviceOut)
def enhanced_advice_with_ehr(inp: SymptomInput):
    # 1. Triage first (safety check)
    triage = triage_rules(inp.symptoms)
    if triage.risk == "emergency":
        raise HTTPException(400, "Possible emergency. Call emergency services now.")

    # 2. Get EHR data for LLM context
    ehr_context = {}
    patient_id = inp.patient_id

    if patient_id:
        print(f"🔍 Fetching EHR data for patient: {patient_id}")
        try:
            profile_data = FHIRService.get_patient_profile(patient_id)
            if profile_data:
                ehr_context = {
                    "ehr_medications": [
                        med["name"] for med in profile_data["active_medications"]
                    ],
                    "ehr_conditions": [
                        cond["name"] for cond in profile_data["medical_conditions"]
                    ],
                    "ehr_age": profile_data.get("age"),
                    "ehr_gender": profile_data.get("gender"),
                }
                print(
                    f"📋 EHR Context: {len(ehr_context['ehr_medications'])} meds, {
                        len(ehr_context['ehr_conditions'])
                    } conditions"
                )
            else:
                print("⚠️ No EHR data found for patient, proceeding without EHR context")
        except Exception as e:
            print(f"⚠️ EHR fetch failed: {e}, proceeding without EHR context")

    # 3. Enhanced LLM call with EHR context
    def build_messages():
        system = (
            "You are a clinical decision support assistant. "
            "Consider the patient's existing conditions and medications from their EHR if available. "
            "NEVER diagnose. NEVER provide medication names/doses to patients. "
            "Return JSON ONLY with keys: advice[], when_to_seek_care[], disclaimer."
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

        user = (
            f"{ehr_text}"
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

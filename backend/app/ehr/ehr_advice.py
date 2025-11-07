# routes/ehr_advice.py - FIXED VERSION
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.schemas import SymptomInput, EnhancedAdviceOut, SymptomIntensityCreate
from app.services.fhir_service import FHIRService
from app.services.triage_service import triage_rules
from app.services.llm_service import require_json_with_retry
from app.services.symptom_tracking_service import SymptomTrackingService
from app.services.rag_service import get_medical_context

router = APIRouter()


@router.post("/ehr-advice", response_model=EnhancedAdviceOut)
def enhanced_advice_with_ehr(inp: SymptomInput, db: Session = Depends(get_db)):
    # 1. Triage first (safety check)
    triage = triage_rules(inp.symptoms)
    if triage.risk == "emergency":
        raise HTTPException(400, "Possible emergency. Call emergency services now.")

    # 2. Get medical context (synchronous - no await needed)
    medical_context = get_medical_context(inp.symptoms)

    # 3. Get EHR data for LLM context
    ehr_context = {
        "ehr_medications": inp.meds,
        "ehr_conditions": inp.conditions,
        "ehr_age": inp.age,
        "ehr_gender": inp.sex,
    }
    print(
        f"📋 Using patient-provided data: {len(inp.meds)} meds, {len(inp.conditions)} conditions"
    )

    def build_messages():
        system = (
            "You are a clinical decision support assistant. "
            "Consider the patient's existing conditions and medications from their EHR if available. "
            "Also consider the provided medical research context from PubMed when giving advice. "
            "NEVER diagnose. NEVER provide medication names/doses to patients. "
            "Additionally, analyze the symptom intensity and estimate duration based on the patient's description. "
            "Consider words like 'mild', 'moderate', 'severe', 'excruciating', 'unbearable', 'kinda', 'very', 'pretty',... to determine intensity (1-10). "
            "Estimate duration in minutes based on time-related words like 'today','the morning','hours', 'days', 'weeks', 'constant', 'intermittent'. "
            "Return JSON ONLY with keys: advice[], when_to_seek_care[], disclaimer, symptom_analysis. "
            "symptom_analysis should contain: intensities[] (each with symptom_name, intensity 1-10, duration_minutes, notes), and overall_severity (1-10)."
            "Example JSON format: "
            '{"advice":[{"step":"Hydration","details":"Small sips of water."}],'
            '"when_to_seek_care":["Trouble breathing"],'
            '"disclaimer":"This is not a diagnosis.",'
            '"symptom_analysis":{'
            '"intensities":['
            '{"symptom_name":"headache","intensity":7,"duration_minutes":120,"notes":"Throbbing pain"},'
            '{"symptom_name":"nausea","intensity":4,"duration_minutes":45,"notes":"Intermittent"}'
            "],"
            '"overall_severity":6}}'
        )

        ehr_text = ""
        if ehr_context and (
            ehr_context.get("ehr_medications") or ehr_context.get("ehr_conditions")
        ):
            ehr_text = (
                f"EHR MEDICAL HISTORY:\n"
                f"Current Medications: {', '.join(ehr_context.get('ehr_medications', []))}\n"
                f"Existing Conditions: {', '.join(ehr_context.get('ehr_conditions', []))}\n"
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
            for i, article in enumerate(
                medical_context["articles"][:3], 1
            ):  # Reduced to 3 for speed
                research_text += (
                    f"{i}. {article['title']} ({article['year']}) - "
                    f"Relevance: {article.get('relevance_score', 0):.2f}\n"
                    f"Key findings: {article['content'][:150]}...\n\n"
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
    response = require_json_with_retry(build_messages)

    # 4. Store symptom intensity data in database
    if "symptom_analysis" in response and response["symptom_analysis"]:
        symptom_analysis = response["symptom_analysis"]

        # Convert patient_id to integer user_id
        user_id = (
            int(inp.patient_id) if inp.patient_id and inp.patient_id.isdigit() else 1
        )

        # Store each symptom intensity
        for intensity_data in symptom_analysis.get("intensities", []):
            tracking_data = SymptomIntensityCreate(
                user_id=user_id,
                symptom_name=intensity_data["symptom_name"],
                intensity=intensity_data["intensity"],
                duration_minutes=intensity_data.get("duration_minutes", 0),
                notes=intensity_data.get("notes", "AI-analyzed from chat session"),
            )
            success = SymptomTrackingService.record_symptom_intensity(db, tracking_data)
            if success:
                print(
                    f"✅ Stored: {intensity_data['symptom_name']} (intensity: {intensity_data['intensity']}/10)"
                )

        print(
            f"📊 Recorded {len(symptom_analysis.get('intensities', []))} symptom intensities"
        )

    return response

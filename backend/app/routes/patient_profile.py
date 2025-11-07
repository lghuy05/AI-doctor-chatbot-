# routes/patient_profile.py
from fastapi import APIRouter, HTTPException
from app.schemas.profile_schemas import ProfileResponse, PatientProfile
from app.services.fhir_service import FHIRService

router = APIRouter()


@router.get("/patient/profile/{patient_id}", response_model=ProfileResponse)
def get_patient_profile(patient_id: str):
    """Get comprehensive patient profile from FHIR"""
    try:
        print(f"🔍 Fetching profile for patient: {patient_id}")

        # Add validation for patient_id
        if not patient_id or patient_id.strip() == "":
            return ProfileResponse(success=False, error="Patient ID is required")

        profile_data = FHIRService.get_patient_profile(patient_id)

        if not profile_data:
            print(f"❌ No profile data returned for patient: {patient_id}")
            return ProfileResponse(
                success=False, error=f"Patient {patient_id} not found in EHR system"
            )

        # Validate required fields
        if (
            not profile_data.get("name")
            or profile_data.get("name") == "Unknown Patient"
        ):
            return ProfileResponse(success=False, error="Patient name not found in EHR")

        return ProfileResponse(success=True, profile=profile_data)

    except Exception as e:
        print(f"❌ Detailed error fetching patient profile: {str(e)}")
        import traceback

        traceback.print_exc()
        return ProfileResponse(
            success=False, error=f"Error fetching patient profile: {str(e)}"
        )


@router.get("/patient/discover")
def discover_test_patients():
    """Discover available test patients from FHIR server"""
    try:
        patient_list = FHIRService.discover_patients()

        return {
            "success": True,
            "patients": patient_list,
            "total": len(patient_list),
            "message": f"Found {len(patient_list)} patients",
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Error discovering patients: {str(e)}",
            "patients": [],
        }


@router.get("/patient/medications/{patient_id}")
def get_patient_medications(patient_id: str):
    """Get only medications for LLM context"""
    profile_data = FHIRService.get_patient_profile(patient_id)
    if not profile_data:
        return {"medications": [], "conditions": []}

    return {
        "medications": [med["name"] for med in profile_data["active_medications"]],
        "conditions": [cond["name"] for cond in profile_data["medical_conditions"]],
    }

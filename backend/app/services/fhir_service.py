# services/fhir_service.py
import requests
import os
from typing import Optional, Dict, List
from datetime import datetime
import dateutil.parser

FHIR_BASE_URL = os.getenv("FHIR_BASE_URL", "https://hapi.fhir.org/baseR4")


class FHIRService:
    @staticmethod
    def calculate_age(birth_date: str) -> Optional[int]:
        """Calculate age from FHIR birthDate"""
        try:
            birth = dateutil.parser.parse(birth_date)
            today = datetime.now()
            age = today.year - birth.year
            if today.month < birth.month or (
                today.month == birth.month and today.day < birth.day
            ):
                age -= 1
            return age
        except:
            return None

    @staticmethod
    def get_patient_profile(patient_id: str) -> Optional[Dict]:
        """Get comprehensive patient profile for display"""
        try:
            # Get patient basic info
            patient_response = requests.get(
                f"{FHIR_BASE_URL}/Patient/{patient_id}", timeout=10
            )
            if patient_response.status_code != 200:
                print(f"❌ Patient not found: {patient_id}")
                return None

            patient_data = patient_response.json()

            # Get patient's medications
            med_response = requests.get(
                f"{FHIR_BASE_URL}/MedicationRequest?patient={patient_id}&status=active",
                timeout=10,
            )
            medications = (
                med_response.json()
                if med_response.status_code == 200
                else {"entry": []}
            )

            # Get patient's conditions
            cond_response = requests.get(
                f"{FHIR_BASE_URL}/Condition?patient={patient_id}", timeout=10
            )
            conditions = (
                cond_response.json()
                if cond_response.status_code == 200
                else {"entry": []}
            )

            # Extract profile information
            profile = {
                "id": patient_id,
                "name": FHIRService._extract_patient_name(patient_data),
                "birth_date": patient_data.get("birthDate"),
                "age": FHIRService.calculate_age(patient_data.get("birthDate", "")),
                "gender": patient_data.get("gender", "").capitalize(),
                "contact": FHIRService._extract_contact_info(patient_data),
                "active_medications": FHIRService._extract_medications(medications),
                "medical_conditions": FHIRService._extract_conditions(conditions),
                "last_updated": datetime.now().isoformat(),
            }

            print(f"✅ EHR data fetched for patient: {profile['name']}")
            return profile

        except Exception as e:
            print(f"❌ FHIR API error: {e}")
            return None

    @staticmethod
    def _extract_patient_name(patient_data: Dict) -> str:
        """Extract patient name from FHIR format"""
        try:
            name = patient_data.get("name", [{}])[0]
            given = " ".join(name.get("given", []))
            family = name.get("family", "")
            return f"{given} {family}".strip() or "Unknown Patient"
        except:
            return "Unknown Patient"

    @staticmethod
    def _extract_contact_info(patient_data: Dict) -> Dict:
        """Extract contact information"""
        telecom = patient_data.get("telecom", [])
        contact = {"email": "Not available", "phone": "Not available"}

        for item in telecom:
            system = item.get("system", "")
            value = item.get("value", "")
            if system == "email":
                contact["email"] = value
            elif system == "phone":
                contact["phone"] = value

        return contact

    @staticmethod
    def _extract_medications(medications: Dict) -> List[Dict]:
        """Extract active medications"""
        med_list = []
        for entry in medications.get("entry", []):
            resource = entry.get("resource", {})
            if resource.get("resourceType") == "MedicationRequest":
                med_info = {
                    "name": resource.get("medicationCodeableConcept", {}).get(
                        "text", "Unknown Medication"
                    ),
                    "status": resource.get("status", ""),
                    "prescribed_date": resource.get("authoredOn", ""),
                    "prescriber": FHIRService._extract_prescriber(resource),
                }
                med_list.append(med_info)
        return med_list

    @staticmethod
    def _extract_conditions(conditions: Dict) -> List[Dict]:
        """Extract medical conditions"""
        cond_list = []
        for entry in conditions.get("entry", []):
            resource = entry.get("resource", {})
            if resource.get("resourceType") == "Condition":
                cond_info = {
                    "name": resource.get("code", {}).get("text", "Unknown Condition"),
                    "status": resource.get("clinicalStatus", {}).get("text", ""),
                    "recorded_date": resource.get("recordedDate", ""),
                }
                cond_list.append(cond_info)
        return cond_list

    @staticmethod
    def _extract_prescriber(med_request: Dict) -> str:
        """Extract prescriber name"""
        requester = med_request.get("requester", {})
        if "display" in requester:
            return requester["display"]
        return "Unknown Provider"

    @staticmethod
    def discover_patients() -> List[Dict]:
        """Discover available test patients"""
        try:
            response = requests.get(f"{FHIR_BASE_URL}/Patient?_count=5", timeout=10)
            if response.status_code != 200:
                return []

            patients_data = response.json()
            patient_list = []

            for entry in patients_data.get("entry", []):
                patient = entry.get("resource", {})
                patient_id = patient.get("id")
                name = FHIRService._extract_patient_name(patient)

                patient_list.append(
                    {
                        "id": patient_id,
                        "name": name,
                        "gender": patient.get("gender", ""),
                        "birth_date": patient.get("birthDate", ""),
                    }
                )

            return patient_list

        except Exception as e:
            print(f"❌ Error discovering patients: {e}")
            return []

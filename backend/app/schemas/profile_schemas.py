# schemas/ehr_schemas.py
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime


class MedicationInfo(BaseModel):
    name: str
    status: str
    prescribed_date: Optional[str]
    prescriber: str


class ConditionInfo(BaseModel):
    name: str
    status: str
    recorded_date: Optional[str]


class ContactInfo(BaseModel):
    email: str
    phone: str


class PatientProfile(BaseModel):
    id: str
    name: str
    birth_date: Optional[str]
    age: Optional[int]
    gender: str
    contact: ContactInfo
    active_medications: List[MedicationInfo]
    medical_conditions: List[ConditionInfo]
    last_updated: str


class ProfileResponse(BaseModel):
    success: bool
    profile: Optional[PatientProfile] = None
    error: Optional[str] = None


class EHRContext(BaseModel):
    patient_data: Optional[PatientProfile] = None
    enhanced_advice: Dict

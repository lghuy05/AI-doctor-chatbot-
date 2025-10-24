# ------------------------------------------------------
# Step 1: Import Pydantic BaseModel and typing helpers
# ------------------------------------------------------
from pydantic import BaseModel, Field, EmailStr
from typing import List, Literal, Optional

from app.database.database import Base

# ------------------------------------------------------
# Step 2: Define the request model the app expects from the client
# ------------------------------------------------------


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    age: int
    sex: str
    role: str = Field(..., description="User role: patient or clinician")


class UserLogin(BaseModel):
    username_or_email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    age: int
    sex: str
    role: str

    class Config:
        from_attributes = True


class SymptomInput(BaseModel):
    age: int = Field(..., ge=0, description="Patient age in years")
    sex: Optional[str] = Field(None, description="Optional: male/female/other")
    symptoms: str = Field(..., description="Free text symptom description")
    meds: List[str] = Field(default_factory=list, description="Current medications")
    conditions: List[str] = Field(default_factory=list, description="Known conditions")
    duration: Optional[str] = Field(None, description="e.g., '2 days'")


# ------------------------------------------------------
# Step 3: Define the triage response model
# ------------------------------------------------------


class TriageOut(BaseModel):
    risk: Literal["emergency", "routine"]
    next_step: Literal["call_emergency", "self_care"]
    red_flags: List[str]
    disclaimer: str


# ------------------------------------------------------
# Step 4: Define the advice response model
# ------------------------------------------------------


class AdviceStep(BaseModel):
    step: str
    details: str


class AdviceOut(BaseModel):
    advice: List[AdviceStep] = []
    when_to_seek_care: List[str] = []
    disclaimer: str


# ------------------------------------------------------
# Step 5: Define the referral response model (clinician-facing)
# ------------------------------------------------------


class ReferralSpecialty(BaseModel):
    name: str
    reason: str


class ReferralOut(BaseModel):
    suggested_specialties: List[ReferralSpecialty] = []
    pre_referral_workup: List[str] = []
    priority: Literal["routine", "expedited", "urgent"] = "routine"


# ------------------------------------------------------
# Step 6: Define the Rx-draft response model (clinician-facing)
# ------------------------------------------------------


class RxCandidate(BaseModel):
    drug_class: str
    example: str
    use_case: str
    contraindications: List[str] = []
    monitoring: List[str] = []


class RxDraftOut(BaseModel):
    candidates: List[RxCandidate] = []
    notes: str = ""

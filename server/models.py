# ------------------------------------------------------
# Step 1: Import Pydantic BaseModel and typing helpers
# ------------------------------------------------------
from pydantic import BaseModel, Field
from typing import List, Literal, Optional

# ------------------------------------------------------
# Step 2: Define the request model the app expects from the client
# ------------------------------------------------------
class SymptomInput(BaseModel):
    age: int = Field(..., ge=0, description="Patient age in years")
    sex: Optional[str] = Field(None, description="Optional: male/female/other")
    symptoms: str = Field(..., description="Free text symptom description")
    duration: Optional[str] = Field(None, description="e.g., '2 days'")
    meds: List[str] = Field(default_factory=list, description="Current medications")
    conditions: List[str] = Field(default_factory=list, description="Known conditions")

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

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openrouter_client import chat_completion
from models import SymptomInput, TriageOut, AdviceOut, ReferralOut, RxDraftOut
import re
import json
import os
from json_repair import repair_json

app = FastAPI(title="AI Doctor Backend (OpenRouter)")

# ---------- CORS (dev-friendly; tighten in prod) ----------
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Simple request logger ----------


@app.middleware("http")
async def log_requests(request, call_next):
    print(">>", request.method, request.url.path)
    try:
        resp = await call_next(request)
        print("<<", resp.status_code, request.url.path)
        return resp
    except Exception as e:
        print("!!", request.url.path, repr(e))
        raise


# ---------- Rules & helpers ----------
RED_FLAGS = [
    r"\b(chest pain|pressure in chest)\b",
    r"\b(short(ness)? of breath|difficulty breathing)\b",
    r"\b(stroke|slurred speech|face droop|arm weakness)\b",
    r"\b(uncontrolled bleeding|faint|fainting)\b",
    r"\b(anaphylaxis|severe allergy)\b",
    r"\b(suicidal|kill myself|end my life)\b",
]

PATIENT_RX_BLOCK = re.compile(
    r"\b(take|start|increase|decrease)\b.*\b(mg|tablet|capsule|ml)\b", re.I
)


def triage_rules(text: str) -> TriageOut:
    t = (text or "").lower()
    red = [p for p in RED_FLAGS if re.search(p, t)]
    if red:
        return TriageOut(
            risk="emergency",
            next_step="call_emergency",
            red_flags=red,
            disclaimer="Possible emergency. Call 911 (or local equivalent).",
        )
    return TriageOut(
        risk="routine",
        next_step="self_care",
        red_flags=[],
        disclaimer="This is not a diagnosis. If symptoms worsen, seek medical care.",
    )


def parse_or_repair(raw: str) -> dict:
    """Strict parse; if fails, attempt repair; else raise 502 with preview."""
    raw = (raw or "").strip()
    if not raw:
        raise HTTPException(502, "LLM returned empty response")

    # strip triple-backtick fences if present
    if raw.startswith("```"):
        # Remove surrounding backticks
        raw = raw.strip("`")
        # Remove a leading 'json' language tag if present
        if raw.lower().startswith("json"):
            raw = raw.split("\n", 1)[1] if "\n" in raw else ""

    # Attempt strict parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Attempt repair
    try:
        fixed = repair_json(raw)
        return json.loads(fixed)
    except Exception:
        raise HTTPException(
            status_code=502, detail=f"Model did not return valid JSON: {raw[:300]}"
        )


def require_json_with_retry(build_messages_fn) -> dict:
    """Call LLM -> parse; if fail, one-shot 'convert to JSON' retry; else raise."""
    # 1st try
    raw = chat_completion(build_messages_fn())
    try:
        return parse_or_repair(raw)
    except HTTPException:
        # Retry: ask the model to convert exactly this text to valid JSON
        fixer_msgs = [
            {
                "role": "system",
                "content": "Convert the user's text into valid, minified JSON ONLY. No prose, no markdown.",
            },
            {"role": "user", "content": raw or ""},
        ]
        raw2 = chat_completion(fixer_msgs, temperature=0.0)
        # will raise HTTPException if still invalid
        return parse_or_repair(raw2)


# ---------- Routes ----------


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/triage", response_model=TriageOut)
def route_triage(inp: SymptomInput):
    return triage_rules(inp.symptoms)


@app.post("/advice", response_model=AdviceOut)
def route_advice(inp: SymptomInput):
    triage = triage_rules(inp.symptoms)
    if triage.risk == "emergency":
        raise HTTPException(400, "Possible emergency. Call emergency services now.")

    def build_messages():
        system = (
            "You are a clinical decision support assistant for patients. "
            "NEVER diagnose. NEVER provide medication names/doses to patients. "
            "Return JSON ONLY with keys: advice[], when_to_seek_care[], disclaimer."
        )
        user = (
            f"Age: {inp.age}\nSex: {inp.sex}\nSymptoms: {inp.symptoms}\nDuration: {inp.duration}\nMeds: {inp.meds}\nConditions: {inp.conditions}\nSchema example:\n"
            + '{"advice":[{"step":"Hydration","details":"Small sips of water."}],"when_to_seek_care":["Trouble breathing"],"disclaimer":"This is not a diagnosis."}'
        )
        return [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]

    data = require_json_with_retry(build_messages)

    # Post-filter: block dosing in patient-facing advice
    full = " ".join(
        f"{x.get('step', '')} {x.get('details', '')}" for x in data.get("advice", [])
    )
    if PATIENT_RX_BLOCK.search(full):
        raise HTTPException(400, "Medication instructions to patients are not allowed.")

    return AdviceOut(**data)


@app.post("/referrals", response_model=ReferralOut)
def route_referrals(inp: SymptomInput):
    def build_messages():
        system = (
            "You assist clinicians by drafting specialist referrals. "
            "JSON ONLY; no patient instructions; no dosing."
        )
        user = (
            f"Age: {inp.age}\nSymptoms: {inp.symptoms}\nConditions: {inp.conditions}\nSchema example:\n"
            + '{"suggested_specialties":[{"name":"Pulmonology","reason":"Chronic cough"}],"pre_referral_workup":["Chest X-ray","Spirometry"],"priority":"routine"}'
        )
        return [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]

    data = require_json_with_retry(build_messages)
    return ReferralOut(**data)


@app.post("/rx_draft", response_model=RxDraftOut)
def route_rx(inp: SymptomInput):
    def build_messages():
        system = "Clinician-only medication class draft. No dosing. JSON ONLY."
        user = (
            f"Age: {inp.age}\nSymptoms: {inp.symptoms}\nMeds: {inp.meds}\nConditions: {inp.conditions}\nSchema example:\n"
            + '{"candidates":[{"drug_class":"Inhaled corticosteroid","example":"budesonide DPI","use_case":"Persistent asthma","contraindications":["hypersensitivity"],"monitoring":["symptom diary"]}],"notes":"Draft for clinician review—do not display to patient."}'
        )
        return [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]

    data = require_json_with_retry(build_messages)
    return RxDraftOut(**data)

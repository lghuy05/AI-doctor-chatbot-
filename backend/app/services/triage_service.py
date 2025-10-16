import re
from app.schemas.schemas import TriageOut

RED_FLAGS = [
    r"\b(chest pain|pressure in chest)\b",
    r"\b(short(ness)? of breath|difficulty breathing)\b",
    r"\b(stroke|slurred speech|face droop|arm weakness)\b",
    r"\b(uncontrolled bleeding|faint|fainting)\b",
    r"\b(anaphylaxis|severe allergy)\b",
    r"\b(suicidal|kill myself|end my life)\b",
]


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

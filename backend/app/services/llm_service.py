import json
import re
from json_repair import repair_json
from fastapi import HTTPException
from app.openrouter_client import chat_completion

PATIENT_RX_BLOCK = re.compile(
    r"\b(take|start|increase|decrease)\b.*\b(mg|tablet|capsule|ml)\b", re.I
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


# def require_json_with_retry(build_messages_fn) -> dict:
#     """Call LLM -> parse; if fail, one-shot 'convert to JSON' retry; else raise."""
#     # 1st try
#     raw = chat_completion(build_messages_fn())
#     try:
#         return parse_or_repair(raw)
#     except HTTPException:
#         # Retry: ask the model to convert exactly this text to valid JSON
#         fixer_msgs = [
#             {
#                 "role": "system",
#                 "content": "Convert the user's text into valid, minified JSON ONLY. No prose, no markdown.",
#             },
#             {"role": "user", "content": raw or ""},
#         ]
#         raw2 = chat_completion(fixer_msgs, temperature=0.0)
#         # will raise HTTPException if still invalid
#         return parse_or_repair(raw2)


def require_json_with_retry(build_messages_func, max_retries=3):
    for attempt in range(max_retries):
        try:
            response_text = chat_completion(build_messages_func())

            # Try to parse as JSON first
            try:
                parsed_response = json.loads(response_text)
                print(f"✅ LLM returned valid JSON")
                return parsed_response
            except json.JSONDecodeError:
                # If it's not JSON, try to extract JSON from the response
                print(f"⚠️ LLM returned non-JSON response, attempting extraction")

                # Look for JSON pattern in the response
                import re

                json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
                if json_match:
                    try:
                        parsed_response = json.loads(json_match.group())
                        print(f"✅ Extracted JSON from response")
                        return parsed_response
                    except json.JSONDecodeError:
                        pass

                # Last resort - return as string
                if attempt == max_retries - 1:
                    print(f"❌ LLM failed to return JSON after {max_retries} attempts")
                    return response_text
                continue

        except Exception as e:
            error_msg = str(e)
            print(f"❌ LLM call failed (attempt {attempt + 1}): {e}")

            # Check if it's a rate limit error
            if "Rate limit exceeded" in error_msg or "429" in error_msg:
                print("🚨 OpenRouter rate limit exceeded - cannot retry")
                return {
                    "error": "I've reached my daily limit for medical analysis. Please try again tomorrow or contact support to increase the limit.",
                    "rate_limit_exceeded": True,
                }

            if attempt == max_retries - 1:
                return {
                    "error": "I'm having trouble connecting to the medical analysis service. Please try again later.",
                    "service_unavailable": True,
                }

    return {"response": "I apologize for the technical difficulty. How can I help you?"}

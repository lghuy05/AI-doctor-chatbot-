# ------------------------------------------------------
# Step 1: Load environment variables from .env file
# ------------------------------------------------------
# We use the python-dotenv package to automatically load
# variables like OPENROUTER_API_KEY, APP_REFERER, etc.
# from your local .env file into os.environ.
# This makes development and local testing much easier.
from dotenv import load_dotenv
load_dotenv()  # so local runs pick up .env
import os, requests

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY or not OPENROUTER_API_KEY.startswith("sk-or-"):
    raise RuntimeError("OPENROUTER_API_KEY missing or malformed.")


# ------------------------------------------------------
# Step 2: Import standard libraries and dependencies
# ------------------------------------------------------
# os → access environment variables
# requests → send HTTP requests to the OpenRouter API
import os, requests

# ------------------------------------------------------
# Step 3: Read the required API variables from environment
# ------------------------------------------------------
# These should all be set in your .env file (or docker-compose env_file)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE = os.getenv("OPENROUTER_BASE", "https://openrouter.ai/api/v1")
APP_REFERER = os.getenv("APP_REFERER", "http://localhost:8000")
APP_TITLE = os.getenv("APP_TITLE", "AI Doctor App")

# ------------------------------------------------------
# Step 4: Safety check — verify API key exists and is valid
# ------------------------------------------------------
# This helps catch missing or invalid keys early on startup.
if not OPENROUTER_API_KEY or not OPENROUTER_API_KEY.startswith("sk-or-"):
    raise RuntimeError(
        "❌ Missing or invalid OPENROUTER_API_KEY.\n"
        "Make sure your .env file is in the correct location and contains a valid key.\n"
        "Example:\nOPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    )

# ------------------------------------------------------
# Step 5: Define the chat_completion function
# ------------------------------------------------------
# This function sends a POST request to OpenRouter's chat endpoint.
# It uses your LLM model (e.g. meta-llama/llama-3.3-70b-instruct:free)
# and returns the model’s response text.
def chat_completion(messages, model="meta-llama/llama-3.3-70b-instruct:free"):
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": APP_REFERER,
        "X-Title": APP_TITLE,
    }

    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": 400,
        "temperature": 0.5,
    }

    # Make the POST request to the API
    r = requests.post(f"{OPENROUTER_BASE}/chat/completions", json=payload, headers=headers, timeout=60)
    if not r.ok:
        # If unauthorized or server error, print details
        raise RuntimeError(f"OpenRouter API error {r.status_code}: {r.text[:500]}")

    # Return the model’s text output
    data = r.json()
    return data["choices"][0]["message"]["content"]

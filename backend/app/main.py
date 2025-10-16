from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Import route modules
from routes import triage, advice, referrals, rx_draft

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


# ---------- Include Routers ----------
app.include_router(triage.router)
app.include_router(advice.router)
app.include_router(referrals.router)
app.include_router(rx_draft.router)


@app.get("/health")
def health():
    return {"ok": True}

# main.py (updated)
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from sqlalchemy import text
from app.database.database import engine, Base
from app.routes import triage, advice, referrals, rx_draft, auth
import rag_service #triggers initialize_rag_service()

from dotenv import load_dotenv
load_dotenv() 


try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"❌ Error creating tables: {e}")

app = FastAPI(title="AI Doctor Backend (OpenRouter)")

# EHR Configuration
EHR_ENABLED = True
FHIR_BASE_URL = os.getenv("FHIR_BASE_URL", "https://hapi.fhir.org/baseR4")

print(f" EHR Integration: {'ENABLED' if EHR_ENABLED else 'DISABLED'}")
print(f" FHIR Server: {FHIR_BASE_URL}")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def authenticate_request(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)
    # Skip auth for these public endpoints
    public_paths = [
        "/auth/login",
        "/auth/register",
        "/",
        "/health",
        "/docs",
        "/redoc",
        "/openapi.json",
        "/favicon.ico",
        "/patient/discover",
        "/patient/profile",
        "/ehr-advice",
    ]
    if request.url.path in public_paths:
        return await call_next(request)

    # Check for Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = auth_header.replace("Bearer ", "")

    # TODO: Implement your actual token verification logic
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")

    print(f"🔐 Auth: Token received for {request.url.path}")

    response = await call_next(request)
    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(">>", request.method, request.url.path)
    try:
        resp = await call_next(request)
        print("<<", resp.status_code, request.url.path)
        return resp
    except Exception as e:
        print("!!", request.url.path, repr(e))
        raise


# Include base routers
app.include_router(auth.router)
app.include_router(triage.router)
app.include_router(advice.router)
app.include_router(referrals.router)
app.include_router(rx_draft.router)

# Conditionally include EHR routers
if EHR_ENABLED:
    try:
        from app.routes.patient_profile import router as patient_profile_router
        from app.ehr.ehr_advice import router as ehr_advice_router

        app.include_router(ehr_advice_router)
        app.include_router(patient_profile_router)
        print("✅ EHR routes registered: /ehr-advice, /patient/profile")
    except ImportError as e:
        print(f"Failed to import EHR: {e}")


@app.get("/")
async def root():
    ehr_status = "enabled" if EHR_ENABLED else "disabled"
    return {
        "message": "AI Doctor Chatbot API is running!",
        "status": "healthy",
        "ehr_integration": ehr_status,
        "fhir_server": FHIR_BASE_URL if EHR_ENABLED else "none",
    }


@app.get("/health")
async def health():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            db_test = result.scalar()

        health_info = {
            "status": "healthy",
            "database": "connected",
            "service": "AI Doctor Chatbot API",
            "database_test": db_test,
            "ehr_integration": "enabled" if EHR_ENABLED else "disabled",
        }

        if EHR_ENABLED:
            health_info["fhir_server"] = FHIR_BASE_URL

        return health_info

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "status": "unhealthy",
                "database": "disconnected",
                "ehr_integration": "enabled" if EHR_ENABLED else "disabled",
                "error": str(e),
            },
        )

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from sqlalchemy import text
from fastapi.requests import HTTPConnection
from app.database.database import engine, Base

# Import route modules
from app.routes import triage, advice, referrals, rx_draft, auth

Base.metadata.create_all(bind=engine)

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
app.include_router(auth.router)
app.include_router(triage.router)
app.include_router(advice.router)
app.include_router(referrals.router)
app.include_router(rx_draft.router)


@app.get("/")
async def root():
    return {"message": "AI Doctor Chatbot API is running!", "status": "healthy"}


@app.get("/health")
async def health():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            db_test = result.scalar()

        return {
            "status": "healthy",
            "database": "connected",
            "aws_rds": "connected",
            "service": "AI Doctor CHatbot API",
            "database_test": db_test,
        }
    except Exception as e:
        raise HTTPConnection(
            status_code=500,
            detail={
                "status": "unhealthy",
                "database": "disconnected",
                "aws_rds": "error",
                "error": str(e),
            },
        )

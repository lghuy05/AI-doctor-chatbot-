from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from sqlalchemy import text
from app.database.database import engine, Base
from app.routes import triage, advice, referrals, rx_draft, auth

try:
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
except Exception as e:
    print(f"❌ Error creating tables: {e}")

app = FastAPI(title="AI Doctor Backend (OpenRouter)")

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
    public_paths = ["/auth/login", "/auth/register", "/", "/health"]

    if request.url.path in public_paths:
        return await call_next(request)

    # Check for Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = auth_header.replace("Bearer ", "")

    # TODO: Implement your actual token verification logic
    # For now, we'll just validate the token exists and let it pass
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")

    # If you have user verification, add it here:
    # user = await verify_token_function(token)
    # if not user:
    #     raise HTTPException(status_code=401, detail="Invalid token")
    # request.state.user = user  # Add user to request state

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
            "service": "AI Doctor Chatbot API",
            "database_test": db_test,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "status": "unhealthy",
                "database": "disconnected",
                "aws_rds": "error",
                "error": str(e),
            },
        )

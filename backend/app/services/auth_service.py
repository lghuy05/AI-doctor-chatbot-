# app/services/auth_service.py - FIXED VERSION
from datetime import datetime, timedelta
from typing import Optional
from jose import ExpiredSignatureError, JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
from app.database.database import get_db

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required")

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token_service(token: str) -> dict | None:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        print("Token has expired")
        return None
    except JWTError as e:
        print(f"❌ Token verification failed: {e}")
        return None


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    from app.database.models import User

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = verify_token(token)
    if not payload:
        raise credentials_exception

    user_id: int = payload.get("user_id")
    username: str = payload.get("sub")

    if username is None:
        raise credentials_exception

    user = None
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        print(f"Looking for user by username: {username}, found: {user is not None}")
    if not user and username:
        user = db.query(User).filter(User.username == username).first()
        print(f"Looking for user by username: {username}, found: {user is not None}")
    if user is None:
        raise credentials_exception

    return user


def authenticate_user(db, username: str, password: str):
    from app.database.models import User

    user = (
        db.query(User)
        .filter((User.username == username) | (User.email == username))
        .first()
    )
    if not user:
        print(f"❌ User not found with username/email: {username}")
        return False
    if not verify_password(password, user.hashed_password):
        print(f"❌ Password incorrect for user: {user.username}")
        return False
    print(f"✅ Authentication successful for user: {user.username}")
    return user

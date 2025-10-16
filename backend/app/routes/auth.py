from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User

router = APIRouter()


@router.get("/auth")
def authentication(db: Session = Depends(get_db)):
    try:
        user_count = db.query(User).count()

        test_user = User(
            username="testuser",
            email="test@example.com",
            hash_password="fake_hashed_password",
            age=18,
            sex="male",
        )
        db.add(test_user)
        db.commit()

        retrieved_user = db.query(User).filter(User.username == "testuser").first()

        db.delete(retrieved_user)
        db.commit()
        return {
            "status": "success",
            "message": "Database connection is working!",
            "user_count": user_count,
            "test_operation": "create_read_delete successful",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection failed: {str(e)}",
        )

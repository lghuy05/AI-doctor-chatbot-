from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.schemas import ReminderCreate, ReminderUpdate, ReminderResponse
from app.services.reminder_service import ReminderService
from app.services.auth_service import get_current_user
from app.database.models import User
from typing import List

router = APIRouter()


@router.get("/reminders", response_model=List[ReminderResponse])
def get_user_reminders(
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all reminders for the current user"""
    return ReminderService.get_user_reminders(db, current_user.id, active_only)


@router.post("/reminders", response_model=ReminderResponse)
def create_reminder(
    reminder_data: ReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new reminder"""
    # Ensure the user_id matches the current user
    reminder_data.user_id = current_user.id
    return ReminderService.create_reminder(db, reminder_data)


@router.put("/reminders/{reminder_id}", response_model=ReminderResponse)
def update_reminder(
    reminder_id: int,
    update_data: ReminderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a reminder"""
    reminder = ReminderService.update_reminder(
        db, reminder_id, current_user.id, update_data
    )
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return reminder


@router.delete("/reminders/{reminder_id}")
def delete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a reminder"""
    success = ReminderService.delete_reminder(db, reminder_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"message": "Reminder deleted successfully"}


@router.post("/reminders/{reminder_id}/toggle")
def toggle_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle reminder active status"""
    reminder = ReminderService.toggle_reminder_status(db, reminder_id, current_user.id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return reminder


@router.post("/reminders/{reminder_id}/complete")
def complete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark reminder as completed"""
    reminder = ReminderService.mark_completed(db, reminder_id, current_user.id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return reminder


@router.get("/reminders/today", response_model=List[ReminderResponse])
def get_todays_reminders(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Get today's reminders"""
    return ReminderService.get_todays_reminders(db, current_user.id)

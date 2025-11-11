from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, time, date
from typing import List, Optional
from app.database.models import Reminder
from app.schemas.schemas import ReminderCreate, ReminderUpdate


class ReminderService:
    @staticmethod
    def create_reminder(
        db: Session, user_id: int, reminder_data: ReminderCreate
    ) -> Reminder:
        """Create a new reminder"""
        try:
            reminder_dict = reminder_data.dict()
            reminder_dict["user_id"] = user_id
            # Convert days_of_week to PostgreSQL array format if needed
            db_reminder = Reminder(**reminder_dict)
            db.add(db_reminder)
            db.commit()
            db.refresh(db_reminder)
            return db_reminder
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def get_user_reminders(
        db: Session, user_id: int, active_only: bool = True
    ) -> List[Reminder]:
        """Get all reminders for a user"""
        query = db.query(Reminder).filter(Reminder.user_id == user_id)

        if active_only:
            query = query.filter(Reminder.is_active == True)

        return query.order_by(Reminder.scheduled_date, Reminder.scheduled_time).all()

    @staticmethod
    def get_reminder_by_id(
        db: Session, reminder_id: int, user_id: int
    ) -> Optional[Reminder]:
        """Get a specific reminder by ID"""
        return (
            db.query(Reminder)
            .filter(Reminder.id == reminder_id, Reminder.user_id == user_id)
            .first()
        )

    @staticmethod
    def update_reminder(
        db: Session, reminder_id: int, user_id: int, update_data: ReminderUpdate
    ) -> Optional[Reminder]:
        """Update a reminder"""
        try:
            reminder = ReminderService.get_reminder_by_id(db, reminder_id, user_id)
            if not reminder:
                return None

            update_dict = update_data.dict(exclude_unset=True)
            for field, value in update_dict.items():
                setattr(reminder, field, value)

            db.commit()
            db.refresh(reminder)
            return reminder
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def delete_reminder(db: Session, reminder_id: int, user_id: int) -> bool:
        """Delete a reminder"""
        try:
            reminder = ReminderService.get_reminder_by_id(db, reminder_id, user_id)
            if not reminder:
                return False

            db.delete(reminder)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def toggle_reminder_status(
        db: Session, reminder_id: int, user_id: int
    ) -> Optional[Reminder]:
        """Toggle reminder active status"""
        try:
            reminder = ReminderService.get_reminder_by_id(db, reminder_id, user_id)
            if not reminder:
                return None

            reminder.is_active = not reminder.is_active
            db.commit()
            db.refresh(reminder)
            return reminder
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def mark_completed(
        db: Session, reminder_id: int, user_id: int
    ) -> Optional[Reminder]:
        """Mark reminder as completed"""
        try:
            reminder = ReminderService.get_reminder_by_id(db, reminder_id, user_id)
            if not reminder:
                return None

            reminder.is_completed = True
            reminder.completed_at = datetime.utcnow()
            db.commit()
            db.refresh(reminder)
            return reminder
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def get_todays_reminders(db: Session, user_id: int) -> List[Reminder]:
        """Get today's active reminders"""
        today = date.today()

        # For recurring reminders or reminders scheduled for today
        query = text("""
            SELECT * FROM reminders 
            WHERE user_id = :user_id 
            AND is_active = true
            AND (
                (scheduled_date = :today AND is_recurring = false)
                OR (is_recurring = true AND (
                    recurrence_pattern = 'daily'
                    OR (recurrence_pattern = 'weekly' AND :dow = ANY(days_of_week))
                ))
            )
            ORDER BY scheduled_time
        """)

        result = db.execute(
            query, {"user_id": user_id, "today": today, "dow": today.strftime("%a")}
        )
        return result.fetchall()

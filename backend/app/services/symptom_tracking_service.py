# services/symptom_tracking_service.py - FIXED DURATION CONSTRAINT
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.database import get_db
from app.schemas.schemas import SymptomIntensityCreate
from datetime import datetime, date
from typing import List, Dict


class SymptomTrackingService:
    @staticmethod
    def record_symptom_intensity(
        db: Session, intensity_data: SymptomIntensityCreate
    ) -> bool:
        """Record symptom intensity for a patient - FIXED DURATION CONSTRAINT"""
        try:
            # FIXED: Ensure duration_minutes is at least 1 to satisfy check constraint
            duration_minutes = intensity_data.duration_minutes or 1
            if duration_minutes < 1:
                duration_minutes = 1  # Set minimum duration to 1 minute

            current_timestamp = datetime.now()

            # Insert into symptom_intensity table
            query = text("""
                INSERT INTO symptom_intensity 
                (user_id, symptom_name, intensity, duration_minutes, notes, created_at)
                VALUES (:user_id, :symptom_name, :intensity, :duration_minutes, :notes, :created_at)
            """)

            result = db.execute(
                query,
                {
                    "user_id": intensity_data.user_id,
                    "symptom_name": intensity_data.symptom_name,
                    "intensity": intensity_data.intensity,
                    "duration_minutes": duration_minutes,
                    "notes": intensity_data.notes,
                    "created_at": current_timestamp,
                },
            )

            # Update symptom_frequency table
            current_month = date.today().replace(day=1)
            freq_query = text("""
                INSERT INTO symptom_frequency 
                (user_id, symptom_name, month_year, occurrence_count, last_occurrence)
                VALUES (:user_id, :symptom_name, :month_year, 1, NOW())
                ON CONFLICT (user_id, symptom_name, month_year) 
                DO UPDATE SET 
                    occurrence_count = symptom_frequency.occurrence_count + 1,
                    last_occurrence = :NOW()
            """)
            db.execute(
                freq_query,
                {
                    "user_id": intensity_data.user_id,
                    "symptom_name": intensity_data.symptom_name,
                    "month_year": current_month,
                },
            )

            db.commit()
            print(
                f"✅ Stored symptom: {intensity_data.symptom_name} for user {intensity_data.user_id}"
            )
            return True

        except Exception as e:
            db.rollback()
            print(f"❌ Error recording symptom intensity: {e}")
            return False

    @staticmethod
    def get_symptom_intensity_history(
        db: Session, user_id: int, days: int = 30
    ) -> List:
        """Get symptom intensity history for charts - FIXED DATE RANGE"""
        try:
            query = text("""
                SELECT 
                    symptom_name,
                    DATE(reported_at) as date,
                    AVG(intensity) as daily_avg_intensity,
                    COUNT(*) as daily_occurrences,
                    AVG(duration_minutes) as avg_duration
                FROM symptom_intensity 
                WHERE user_id = :user_id 
                AND reported_at >= (CURRENT_DATE - INTERVAL ':days days')::date
                GROUP BY symptom_name, DATE(reported_at)
                ORDER BY date ASC, symptom_name
            """)
            result = db.execute(query, {"user_id": user_id, "days": days})
            rows = result.fetchall()
            print(f"📊 Fetched {len(rows)} intensity records for user {user_id}")

            # FIXED: Added debug logging to see actual dates returned
            print("📅 DATES BEING RETURNED FROM DATABASE:")
            for row in rows:
                print(
                    f"  - {row.date}: {row.symptom_name} (intensity: {row.daily_avg_intensity})"
                )

            return rows
        except Exception as e:
            print(f"❌ Error fetching symptom history: {e}")
            # Return empty list instead of mock data for production
            return []

    @staticmethod
    def get_symptom_frequency(db: Session, user_id: int, months: int = 6) -> List:
        """Get symptom frequency for pie chart - FIXED QUERY"""
        try:
            query = text("""
                SELECT 
                    symptom_name,
                    SUM(occurrence_count) as total_occurrences,
                    MAX(last_occurrence) as last_occurrence
                FROM symptom_frequency 
                WHERE user_id = :user_id
                AND month_year >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL ':months months')
                GROUP BY symptom_name
                ORDER BY total_occurrences DESC
            """)
            result = db.execute(query, {"user_id": user_id, "months": months})
            rows = result.fetchall()
            print(f"📊 Fetched {len(rows)} frequency records for user {user_id}")
            return rows
        except Exception as e:
            print(f"❌ Error fetching symptom frequency: {e}")
            return []

    @staticmethod
    def get_recent_symptoms(db: Session, user_id: int, limit: int = 10) -> List:
        """Get recent symptoms for timeline view"""
        try:
            query = text("""
                SELECT 
                    symptom_name,
                    intensity,
                    duration_minutes,
                    notes,
                    reported_at
                FROM symptom_intensity 
                WHERE user_id = :user_id
                ORDER BY reported_at DESC
                LIMIT :limit
            """)
            result = db.execute(query, {"user_id": user_id, "limit": limit})
            return result.fetchall()
        except Exception as e:
            print(f"❌ Error fetching recent symptoms: {e}")
            return []

    @staticmethod
    def get_symptom_summary(db: Session, user_id: int) -> dict:
        """Get overall symptom summary"""
        try:
            # Total symptoms recorded
            total_query = text("""
                SELECT COUNT(*) as total_count 
                FROM symptom_intensity 
                WHERE user_id = :user_id
            """)
            total_result = db.execute(total_query, {"user_id": user_id})
            total_count = total_result.scalar() or 0

            # Most frequent symptom
            freq_query = text("""
                SELECT symptom_name, SUM(occurrence_count) as total
                FROM symptom_frequency 
                WHERE user_id = :user_id
                GROUP BY symptom_name
                ORDER BY total DESC
                LIMIT 1
            """)
            freq_result = db.execute(freq_query, {"user_id": user_id})
            most_frequent = freq_result.fetchone()

            # Highest intensity symptom
            intensity_query = text("""
                SELECT symptom_name, MAX(intensity) as max_intensity
                FROM symptom_intensity 
                WHERE user_id = :user_id
                GROUP BY symptom_name
                ORDER BY max_intensity DESC
                LIMIT 1
            """)
            intensity_result = db.execute(intensity_query, {"user_id": user_id})
            highest_intensity = intensity_result.fetchone()

            summary = {
                "total_symptoms_recorded": total_count,
                "most_frequent_symptom": most_frequent[0] if most_frequent else None,
                "most_frequent_count": most_frequent[1] if most_frequent else 0,
                "highest_intensity_symptom": highest_intensity[0]
                if highest_intensity
                else None,
                "highest_intensity_value": highest_intensity[1]
                if highest_intensity
                else 0,
            }

            print(f"📊 Summary: {summary}")
            return summary

        except Exception as e:
            print(f"❌ Error fetching symptom summary: {e}")
            return {
                "total_symptoms_recorded": 0,
                "most_frequent_symptom": None,
                "most_frequent_count": 0,
                "highest_intensity_symptom": None,
                "highest_intensity_value": 0,
            }

    @staticmethod
    def get_symptom_trends(db: Session, user_id: int, period_days: int = 30) -> Dict:
        """Get comprehensive symptom trends for analytics"""
        try:
            # Get intensity history
            intensity_history = SymptomTrackingService.get_symptom_intensity_history(
                db, user_id, period_days
            )

            # Get frequency data
            frequency_data = SymptomTrackingService.get_symptom_frequency(
                db,
                user_id,
                max(1, period_days // 30),  # Ensure at least 1 month
            )

            # Get recent symptoms
            recent_symptoms = SymptomTrackingService.get_recent_symptoms(
                db, user_id, 20
            )

            # Get summary
            summary = SymptomTrackingService.get_symptom_summary(db, user_id)

            return {
                "intensity_history": intensity_history,
                "frequency_data": frequency_data,
                "recent_symptoms": recent_symptoms,
                "summary": summary,
                "period_days": period_days,
            }

        except Exception as e:
            print(f"❌ Error getting symptom trends: {e}")
            return {}

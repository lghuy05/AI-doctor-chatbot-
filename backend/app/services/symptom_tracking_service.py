# services/symptom_tracking_service.py - FIXED DURATION CONSTRAINT
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.database import get_db
from app.schemas.schemas import SymptomIntensityCreate
from datetime import datetime, timezone, timedelta
from typing import List, Dict
from zoneinfo import ZoneInfo


class SymptomTrackingService:
    TAMPA_TZ = ZoneInfo("US/Eastern")

    @staticmethod
    def get_local_time():
        """Get current time in Tampa/EST timezone"""
        return datetime.now(SymptomTrackingService.TAMPA_TZ)

    @staticmethod
    def utc_to_local(utc_dt):
        """Convert UTC datetime to Tampa time"""
        if utc_dt.tzinfo is None:
            # If naive datetime, assume UTC
            utc_dt = utc_dt.replace(tzinfo=timezone.utc)
        return utc_dt.astimezone(SymptomTrackingService.TAMPA_TZ)

    @staticmethod
    def local_to_utc(local_dt):
        """Convert Tampa time to UTC"""
        if local_dt.tzinfo is None:
            # If naive datetime, assume it's Tampa time
            local_dt = local_dt.replace(tzinfo=SymptomTrackingService.TAMPA_TZ)
        return local_dt.astimezone(timezone.utc)

    @staticmethod
    def record_symptom_intensity(
        db: Session, intensity_data: SymptomIntensityCreate
    ) -> bool:
        """Record symptom intensity for a patient - WITH TIMEZONE HANDLING"""
        try:
            duration_minutes = intensity_data.duration_minutes or 1
            if duration_minutes < 1:
                duration_minutes = 1

            # DEBUG: Check what time we're sending to database
            current_timestamp = SymptomTrackingService.get_local_time()

            print("🔍 DEBUG - BEFORE DATABASE INSERT:")
            print(f"  Python datetime.now(): {datetime.now()}")
            print(f"  Tampa time (get_local_time): {current_timestamp}")
            print(f"  UTC time: {datetime.now(timezone.utc)}")

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
                    "created_at": datetime.now(timezone.utc),
                },
            )

            # DEBUG: Query back the record we just inserted
            debug_query = text("""
                SELECT created_at, created_at AT TIME ZONE 'UTC' as utc_time, 
                    created_at AT TIME ZONE 'US/Eastern' as tampa_time
                FROM symptom_intensity 
                WHERE user_id = :user_id AND symptom_name = :symptom_name
                ORDER BY created_at DESC 
                LIMIT 1
            """)

            debug_result = db.execute(
                debug_query,
                {
                    "user_id": intensity_data.user_id,
                    "symptom_name": intensity_data.symptom_name,
                },
            )
            debug_row = debug_result.fetchone()

            print("🔍 DEBUG - AFTER DATABASE INSERT:")
            if debug_row:
                print(f"Stored to db: {current_timestamp}")
                print(f"  Stored created_at: {debug_row.created_at}")
                print(f"  As UTC: {debug_row.utc_time}")
                print(f"  As Tampa time: {debug_row.tampa_time}")
            else:
                print("  ❌ Could not retrieve inserted record")

            # Update symptom_frequency table
            current_month = (
                SymptomTrackingService.get_local_time().date().replace(day=1)
            )
            freq_query = text("""
                INSERT INTO symptom_frequency 
                (user_id, symptom_name, month_year, occurrence_count, last_occurrence)
                VALUES (:user_id, :symptom_name, :month_year, 1, :now)
                ON CONFLICT (user_id, symptom_name, month_year) 
                DO UPDATE SET 
                    occurrence_count = symptom_frequency.occurrence_count + 1,
                    last_occurrence = :now
            """)
            db.execute(
                freq_query,
                {
                    "user_id": intensity_data.user_id,
                    "symptom_name": intensity_data.symptom_name,
                    "month_year": current_month,
                    "now": SymptomTrackingService.get_local_time(),
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
        """Get symptom intensity history - FIXED FOR TIMEZONE CONFUSION"""
        try:
            # Calculate start date
            # tampa_now = SymptomTrackingService.get_local_time()
            # start_date = tampa_now - timedelta(days=days)
            start_date = datetime.now(timezone.utc) - timedelta(days=days)
            # print(f"🔍 DEBUG - Querying from {start_date.date()} to {tampa_now.date()}")

            # FIXED: Since created_at is stored as EST but contains UTC values,
            # we need to treat it as UTC when converting to Tampa time
            query = text("""
                SELECT 
                    symptom_name,
                    DATE(created_at) as date,  
                    AVG(intensity) as daily_avg_intensity,
                    COUNT(*) as daily_occurrences,
                    AVG(duration_minutes) as avg_duration
                FROM symptom_intensity 
                WHERE user_id = :user_id 
                AND created_at >= :start_date
                GROUP BY symptom_name, DATE(created_at)  
                ORDER BY date ASC, symptom_name
            """)

            result = db.execute(query, {"user_id": user_id, "start_date": start_date})
            rows = result.fetchall()

            print(f"📊 Fetched {len(rows)} intensity records")

            # Debug the dates found
            unique_dates = set(row.date for row in rows)
            print(f"📅 UNIQUE DATES FOUND: {sorted(unique_dates)}")

            for row in rows:
                print(f"  - {row.date}: {row.symptom_name}")

            return rows

        except Exception as e:
            print(f"❌ Error fetching symptom history: {e}")
            import traceback

            traceback.print_exc()
            return []

    @staticmethod
    def get_symptom_frequency(db: Session, user_id: int, months: int = 6) -> List:
        """Get symptom frequency for pie chart - WITH TIMEZONE HANDLING"""
        try:
            # Calculate start month in Tampa time but convert to UTC for query
            tampa_now = SymptomTrackingService.get_local_time()
            start_month = (tampa_now - timedelta(days=30 * months)).replace(day=1)
            start_month_utc = SymptomTrackingService.local_to_utc(start_month)

            query = text("""
                SELECT 
                    symptom_name,
                    SUM(occurrence_count) as total_occurrences,
                    MAX(last_occurrence) as last_occurrence  
                FROM symptom_frequency 
                WHERE user_id = :user_id
                AND month_year >= :start_month
                GROUP BY symptom_name
                ORDER BY total_occurrences DESC
            """)
            result = db.execute(
                query, {"user_id": user_id, "start_month": start_month_utc}
            )
            rows = result.fetchall()

            print(f"📊 Fetched {len(rows)} frequency records for user {user_id}")
            return rows  # No conversion needed - SQL handled it
        except Exception as e:
            print(f"❌ Error fetching symptom frequency: {e}")
            return []

    @staticmethod
    def get_recent_symptoms(db: Session, user_id: int, limit: int = 10) -> List:
        """Get recent symptoms for timeline view - WITH TIMEZONE HANDLING"""
        try:
            query = text("""
                SELECT 
                    symptom_name,
                    intensity,
                    duration_minutes,
                    notes,
                    created_at AT TIME ZONE 'UTC' AT TIME ZONE 'US/Eastern' as created_at
                FROM symptom_intensity 
                WHERE user_id = :user_id
                ORDER BY created_at DESC
                LIMIT :limit
            """)
            result = db.execute(query, {"user_id": user_id, "limit": limit})
            rows = result.fetchall()
            return rows  # No conversion needed - SQL handled it
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

    @staticmethod
    def debug_symptom_data(db: Session, user_id: int, limit: int = 20):
        """Debug method to see raw symptom data with timestamps"""
        try:
            query = text("""
                SELECT 
                    symptom_name,
                    intensity,
                    created_at as stored_utc,
                    created_at AT TIME ZONE 'UTC' AT TIME ZONE 'US/Eastern' as tampa_time,
                    DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'US/Eastern') as tampa_date
                FROM symptom_intensity 
                WHERE user_id = :user_id
                ORDER BY created_at DESC
                LIMIT :limit
            """)

            result = db.execute(query, {"user_id": user_id, "limit": limit})
            rows = result.fetchall()

            print("🔍 DEBUG - RAW SYMPTOM DATA IN DATABASE:")
            for row in rows:
                print(
                    f"  {row.tampa_date} {row.tampa_time.strftime('%H:%M:%S')} - {row.symptom_name} (intensity: {row.intensity})"
                )
                print(f"    Stored as UTC: {row.stored_utc}")

            return rows

        except Exception as e:
            print(f"❌ Error in debug_symptom_data: {e}")
            return []

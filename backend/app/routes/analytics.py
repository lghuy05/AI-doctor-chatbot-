# routes/analytics.py - FIXED SYNTAX ERROR VERSION
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.symptom_tracking_service import SymptomTrackingService
from datetime import datetime, timedelta
from typing import Dict, List, Any
from app.services.auth_service import get_current_user
from app.database.models import User

router = APIRouter()


@router.get("/analytics/symptom-intensity")
def get_symptom_intensity(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get symptom intensity data - UPDATED FOR FIXED SQL"""
    try:
        user_id = current_user.id

        # Use existing service method
        intensity_data = SymptomTrackingService.get_symptom_intensity_history(
            db, user_id, days
        )

        if not intensity_data:
            return {
                "success": True,
                "data": {"dates": [], "symptoms": {}, "overall_trend": []},
                "timezone": "US/Eastern",
            }

        # Simple transformation
        dates_set = set()
        symptoms_data = {}

        for record in intensity_data:
            # FIXED: Proper date formatting for frontend
            date_str = (
                record.date.strftime("%Y-%m-%d")
                if hasattr(record.date, "strftime")
                else str(record.date)
            )
            dates_set.add(date_str)

            symptom_name = record.symptom_name
            if symptom_name not in symptoms_data:
                symptoms_data[symptom_name] = {"name": symptom_name, "data": []}

            # FIXED: Use daily_avg_intensity only (individual intensity is no longer in SELECT)
            intensity_value = (
                float(record.daily_avg_intensity)
                if record.daily_avg_intensity is not None
                else 0
            )

            symptoms_data[symptom_name]["data"].append(
                {
                    "date": date_str,
                    "intensity": intensity_value,
                    "occurrences": int(record.daily_occurrences)
                    if record.daily_occurrences
                    else 1,
                }
            )

        dates = sorted(list(dates_set))

        # Simple overall trend
        overall_trend = []
        for date_str in dates:
            date_intensities = []
            for symptom_data in symptoms_data.values():
                point = next(
                    (p for p in symptom_data["data"] if p["date"] == date_str), None
                )
                if point and point["intensity"] > 0:
                    date_intensities.append(point["intensity"])

            avg_intensity = (
                sum(date_intensities) / len(date_intensities) if date_intensities else 0
            )
            overall_trend.append(
                {"date": date_str, "average_intensity": round(avg_intensity, 2)}
            )

        return {
            "success": True,
            "data": {
                "dates": dates,
                "symptoms": symptoms_data,
                "overall_trend": overall_trend,
            },
            "timezone": "US/Eastern",
        }

    except Exception as e:
        print(f"❌ Error in symptom intensity endpoint: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "data": {"dates": [], "symptoms": {}, "overall_trend": []},
            "timezone": "Eastern",
        }


@router.get("/analytics/symptom-frequency")
def get_symptom_frequency(
    months: int = 6,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get symptom frequency data - KEEP WORKING VERSION"""
    try:
        user_id = current_user.id
        frequency_data = SymptomTrackingService.get_symptom_frequency(
            db, user_id, months
        )

        chart_data = []
        for record in frequency_data:
            chart_data.append(
                {
                    "symptom": record.symptom_name,
                    "frequency": int(record.total_occurrences),
                    "last_occurrence": record.last_occurrence.isoformat()
                    if hasattr(record.last_occurrence, "isoformat")
                    else str(record.last_occurrence),
                }
            )

        chart_data.sort(key=lambda x: x["frequency"], reverse=True)

        return {"success": True, "data": chart_data}

    except Exception as e:
        return {"success": False, "error": str(e), "data": []}


@router.get("/analytics/symptom-summary")
def get_symptom_summary(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Get overall symptom summary"""
    try:
        user_id = current_user.id
        summary = SymptomTrackingService.get_symptom_summary(db, user_id)
        return {"success": True, "summary": summary}
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "summary": {},
        }  # FIXED: Added missing closing bracket


@router.get("/analytics/debug-timezone")
def debug_timezone(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Debug endpoint to check timezone issues"""
    try:
        # Check database timezone
        SymptomTrackingService.debug_database_timezone(db)

        # Check recent symptoms with timestamps
        query = text("""
            SELECT 
                symptom_name,
                created_at,
                created_at AT TIME ZONE 'UTC' as utc_time,
                created_at AT TIME ZONE 'US/Eastern' as tampa_time,
                DATE(created_at) as date_only,
                DATE(created_at AT TIME ZONE 'US/Eastern') as tampa_date
            FROM symptom_intensity 
            WHERE user_id = :user_id
            ORDER BY created_at DESC
            LIMIT 5
        """)
        result = db.execute(query, {"user_id": current_user.id})
        rows = result.fetchall()

        debug_data = []
        for row in rows:
            debug_data.append(
                {
                    "symptom": row.symptom_name,
                    "created_at_raw": str(row.created_at),
                    "as_utc": str(row.utc_time),
                    "as_tampa": str(row.tampa_time),
                    "date_only": str(row.date_only),
                    "tampa_date": str(row.tampa_date),
                }
            )

        return {
            "success": True,
            "system_time": str(datetime.now()),
            "tampa_time": str(SymptomTrackingService.get_local_time()),
            "stored_records": debug_data,
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


@router.get("/analytics/debug-symptoms-raw")
def debug_symptoms_raw(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Debug endpoint to see raw symptom data"""
    try:
        debug_data = SymptomTrackingService.debug_symptom_data(db, current_user.id)

        formatted_data = []
        for row in debug_data:
            formatted_data.append(
                {
                    "symptom": row.symptom_name,
                    "intensity": row.intensity,
                    "stored_utc": str(row.stored_utc),
                    "tampa_time": row.tampa_time.isoformat(),
                    "tampa_date": str(row.tampa_date),
                }
            )

        return {"success": True, "count": len(debug_data), "data": formatted_data}

    except Exception as e:
        return {"success": False, "error": str(e)}

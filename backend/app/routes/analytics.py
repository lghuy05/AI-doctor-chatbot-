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
        }

    except Exception as e:
        print(f"❌ Error in symptom intensity endpoint: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "data": {"dates": [], "symptoms": {}, "overall_trend": []},
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

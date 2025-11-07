# routes/analytics.py - COMPLETE IMPLEMENTATION
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, date, timedelta
from app.database.database import get_db
from app.services.auth_service import get_current_user
from app.database.models import User
from app.services.symptom_tracking_service import SymptomTrackingService

router = APIRouter(prefix="/analytics", tags=["analytics"])


# routes/analytics.py - UPDATED FOR CHART DATA
@router.get("/symptom-intensity")
def get_symptom_intensity_analytics(
    current_user: User = Depends(get_current_user),
    days: int = 30,
    db: Session = Depends(get_db),
):
    """Get symptom intensity data for charts"""
    try:
        print(
            f"📈 Fetching symptom intensity for user {current_user.id}, last {days} days"
        )

        history = SymptomTrackingService.get_symptom_intensity_history(
            db, current_user.id, days
        )

        # Process data for frontend charts
        chart_data = process_intensity_data_for_charts(history, days)

        return {
            "success": True,
            "data": chart_data,
            "timeframe_days": days,
            "user_id": current_user.id,
        }

    except Exception as e:
        print(f"❌ Error fetching symptom intensity analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics data")


def process_intensity_data_for_charts(history: List, days: int) -> Dict[str, Any]:
    """Process database results for frontend charts"""
    from datetime import datetime, timedelta

    chart_data = {"dates": [], "symptoms": {}, "overall_trend": []}

    # Generate date range for the period
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days - 1)

    current_date = start_date
    while current_date <= end_date:
        chart_data["dates"].append(current_date.isoformat())
        current_date += timedelta(days=1)

    # Group by symptom and date
    symptom_data = {}

    for record in history:
        symptom_name = record.symptom_name
        record_date = (
            record.date.isoformat()
            if hasattr(record.date, "isoformat")
            else str(record.date)
        )
        intensity = float(record.daily_avg_intensity)

        if symptom_name not in symptom_data:
            symptom_data[symptom_name] = {}

        symptom_data[symptom_name][record_date] = {
            "intensity": intensity,
            "occurrences": record.daily_occurrences,
        }

    # Build structured data for each symptom
    for i, (symptom_name, date_data) in enumerate(symptom_data.items()):
        symptom_points = []

        for date_str in chart_data["dates"]:
            if date_str in date_data:
                point = date_data[date_str]
                symptom_points.append(
                    {
                        "date": date_str,
                        "intensity": point["intensity"],
                        "occurrences": point["occurrences"],
                    }
                )
            else:
                # Add zero point for missing dates
                symptom_points.append(
                    {"date": date_str, "intensity": 0, "occurrences": 0}
                )

        chart_data["symptoms"][symptom_name] = {
            "name": symptom_name,
            "data": symptom_points,
            "color": get_symptom_color(
                symptom_name, i
            ),  # Pass index for color assignment
        }

    return chart_data

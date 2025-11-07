# app/routes/analytics.py - NEW FILE
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, date, timedelta
from app.database.database import get_db
from app.services.auth_service import get_current_user
from app.database.models import User
from app.services.symptom_tracking_service import SymptomTrackingService

router = APIRouter(prefix="/analytics", tags=["analytics"])


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


@router.get("/symptom-frequency")
def get_symptom_frequency_analytics(
    current_user: User = Depends(get_current_user),
    months: int = 6,
    db: Session = Depends(get_db),
):
    """Get symptom frequency data for pie charts"""
    try:
        print(
            f"📊 Fetching symptom frequency for user {current_user.id}, last {months} months"
        )

        frequency_data = SymptomTrackingService.get_symptom_frequency(
            db, current_user.id, months
        )

        pie_data = process_frequency_data_for_pie_chart(frequency_data)

        return {
            "success": True,
            "data": pie_data,
            "timeframe_months": months,
            "user_id": current_user.id,
        }

    except Exception as e:
        print(f"❌ Error fetching symptom frequency analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch frequency data")


@router.get("/symptom-summary")
def get_symptom_summary(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get overall symptom summary statistics"""
    try:
        summary = SymptomTrackingService.get_symptom_summary(db, current_user.id)

        return {
            "success": True,
            "summary": summary,
            "user_id": current_user.id,
            "generated_at": datetime.now().isoformat(),
        }

    except Exception as e:
        print(f"❌ Error fetching symptom summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch summary")


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

    # Color palette for symptoms
    symptom_colors = [
        "#3B82F6",
        "#EF4444",
        "#10B981",
        "#F59E0B",
        "#8B5CF6",
        "#EC4899",
        "#06B6D4",
        "#84CC16",
    ]

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
            "color": symptom_colors[i % len(symptom_colors)],
        }

    return chart_data


def process_frequency_data_for_pie_chart(frequency_data: List) -> List[Dict]:
    """Process frequency data for pie chart"""
    pie_data = []

    for record in frequency_data:
        symptom_name = record.symptom_name
        frequency = record.total_occurrences

        pie_data.append(
            {
                "symptom": symptom_name,
                "frequency": frequency,
            }
        )

    # Sort by frequency
    pie_data.sort(key=lambda x: x["frequency"], reverse=True)

    return pie_data


def get_symptom_color(symptom_name: str, index: int) -> str:
    """Assign consistent colors to symptoms"""
    color_map = {
        "headache": "#3B82F6",
        "fever": "#EF4444",
        "cough": "#10B981",
        "fatigue": "#F59E0B",
        "nausea": "#8B5CF6",
        "pain": "#EC4899",
        "dizziness": "#06B6D4",
        "insomnia": "#84CC16",
    }

    return color_map.get(symptom_name.lower(), "#6B7280")

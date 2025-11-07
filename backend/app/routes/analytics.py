# routes/analytics.py - COMPLETE FIXED VERSION
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.symptom_tracking_service import SymptomTrackingService
from datetime import datetime, timedelta
from typing import Dict, List
import json

router = APIRouter()


@router.get("/analytics/symptom-intensity")
def get_symptom_intensity(days: int = 30, db: Session = Depends(get_db)):
    """Get symptom intensity data for charts - FIXED FOR GIFTED CHARTS"""
    try:
        # For demo - use user_id 1, in production get from auth
        user_id = 1

        # Get raw data from database
        intensity_data = SymptomTrackingService.get_symptom_intensity_history(
            db, user_id, days
        )

        print(f"📊 Raw intensity data: {len(intensity_data)} records")

        # Transform data for gifted charts
        dates_set = set()
        symptoms_data = {}

        # First pass: collect all dates and organize by symptom
        for record in intensity_data:
            date_str = (
                record.date.isoformat()
                if hasattr(record.date, "isoformat")
                else str(record.date)
            )
            dates_set.add(date_str)

            symptom_name = record.symptom_name
            if symptom_name not in symptoms_data:
                symptoms_data[symptom_name] = {"name": symptom_name, "data": []}

            # Add intensity point for this symptom
            intensity_value = (
                float(record.daily_avg_intensity)
                if record.daily_avg_intensity
                else float(record.intensity)
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

        # Sort dates chronologically
        dates = sorted(
            list(dates_set),
            key=lambda x: datetime.fromisoformat(x)
            if "T" in x
            else datetime.strptime(x, "%Y-%m-%d"),
        )

        # Ensure all symptoms have data for all dates and sort their data
        for symptom_name, symptom_data in symptoms_data.items():
            # Sort symptom data by date
            symptom_data["data"].sort(
                key=lambda x: datetime.fromisoformat(x["date"])
                if "T" in x["date"]
                else datetime.strptime(x["date"], "%Y-%m-%d")
            )

            # Fill missing dates with zero intensity
            existing_dates = {point["date"] for point in symptom_data["data"]}
            for date_str in dates:
                if date_str not in existing_dates:
                    symptom_data["data"].append(
                        {"date": date_str, "intensity": 0.0, "occurrences": 0}
                    )

            # Re-sort after filling
            symptom_data["data"].sort(
                key=lambda x: datetime.fromisoformat(x["date"])
                if "T" in x["date"]
                else datetime.strptime(x["date"], "%Y-%m-%d")
            )

        # Calculate overall trend (average intensity across all symptoms per date)
        overall_trend = []
        for date_str in dates:
            date_intensities = []
            for symptom_data in symptoms_data.values():
                for point in symptom_data["data"]:
                    if point["date"] == date_str and point["intensity"] > 0:
                        date_intensities.append(point["intensity"])

            avg_intensity = (
                sum(date_intensities) / len(date_intensities)
                if date_intensities
                else 0.0
            )
            overall_trend.append(
                {"date": date_str, "average_intensity": round(avg_intensity, 2)}
            )

        result = {
            "dates": dates,
            "symptoms": symptoms_data,
            "overall_trend": overall_trend,
        }

        print(f"✅ Processed {len(dates)} dates, {len(symptoms_data)} symptoms")
        return {"success": True, "data": result}

    except Exception as e:
        print(f"❌ Error in symptom intensity analytics: {e}")
        import traceback

        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "data": {"dates": [], "symptoms": {}, "overall_trend": []},
        }


@router.get("/analytics/symptom-frequency")
def get_symptom_frequency(months: int = 6, db: Session = Depends(get_db)):
    """Get symptom frequency data for pie chart - FIXED"""
    try:
        user_id = 1  # Demo user

        frequency_data = SymptomTrackingService.get_symptom_frequency(
            db, user_id, months
        )

        print(f"📊 Raw frequency data: {len(frequency_data)} records")

        # Transform for gifted charts
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

        # Sort by frequency descending
        chart_data.sort(key=lambda x: x["frequency"], reverse=True)

        return {"success": True, "data": chart_data}

    except Exception as e:
        print(f"❌ Error in symptom frequency analytics: {e}")
        import traceback

        traceback.print_exc()
        return {"success": False, "error": str(e), "data": []}


@router.get("/analytics/symptom-summary")
def get_symptom_summary(db: Session = Depends(get_db)):
    """Get overall symptom summary"""
    try:
        user_id = 1  # Demo user

        summary = SymptomTrackingService.get_symptom_summary(db, user_id)

        return {"success": True, "summary": summary}

    except Exception as e:
        print(f"❌ Error in symptom summary: {e}")
        import traceback

        traceback.print_exc()
        return {"success": False, "error": str(e), "summary": {}}


@router.get("/analytics/test-data")
def get_test_analytics_data():
    """Return test data to verify gifted charts integration"""
    test_data = {
        "symptomIntensity": {
            "dates": ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04"],
            "symptoms": {
                "headache": {
                    "name": "headache",
                    "data": [
                        {"date": "2024-01-01", "intensity": 5.0, "occurrences": 1},
                        {"date": "2024-01-02", "intensity": 7.0, "occurrences": 2},
                        {"date": "2024-01-03", "intensity": 3.0, "occurrences": 1},
                        {"date": "2024-01-04", "intensity": 4.0, "occurrences": 1},
                    ],
                },
                "fever": {
                    "name": "fever",
                    "data": [
                        {"date": "2024-01-01", "intensity": 2.0, "occurrences": 1},
                        {"date": "2024-01-02", "intensity": 8.0, "occurrences": 1},
                        {"date": "2024-01-03", "intensity": 4.0, "occurrences": 1},
                        {"date": "2024-01-04", "intensity": 3.0, "occurrences": 1},
                    ],
                },
                "fatigue": {
                    "name": "fatigue",
                    "data": [
                        {"date": "2024-01-01", "intensity": 6.0, "occurrences": 1},
                        {"date": "2024-01-02", "intensity": 5.0, "occurrences": 1},
                        {"date": "2024-01-03", "intensity": 4.0, "occurrences": 1},
                        {"date": "2024-01-04", "intensity": 3.0, "occurrences": 1},
                    ],
                },
            },
            "overall_trend": [
                {"date": "2024-01-01", "average_intensity": 4.33},
                {"date": "2024-01-02", "average_intensity": 6.67},
                {"date": "2024-01-03", "average_intensity": 3.67},
                {"date": "2024-01-04", "average_intensity": 3.33},
            ],
        },
        "symptomFrequency": [
            {"symptom": "headache", "frequency": 5, "percentage": 38.5},
            {"symptom": "fever", "frequency": 4, "percentage": 30.8},
            {"symptom": "fatigue", "frequency": 4, "percentage": 30.8},
        ],
        "summary": {
            "total_symptoms_recorded": 13,
            "most_frequent_symptom": "headache",
            "most_frequent_count": 5,
            "highest_intensity_symptom": "fever",
            "highest_intensity_value": 8,
        },
    }

    return {"success": True, "data": test_data}

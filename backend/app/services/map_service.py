# app/services/maps_service.py
import os
import requests
from typing import List, Optional, Dict, Any
import math


class MapsService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_MAP_API")
        self.base_url = "https://maps.googleapis.com/maps/api/place"

    def get_nearby_healthcare_providers(
        self,
        latitude: float,
        longitude: float,
        provider_type: str,
        radius: int = 20000,  # Increased to 20km
        max_results: int = 5,
    ) -> List[Dict[str, Any]]:
        if not self.api_key:
            print("⚠️ Google Maps API key not configured")
            return []

        try:
            print(f"🔍 Searching for '{provider_type}' at {latitude},{longitude}")

            # Better specialty mappings for Google Places
            specialty_mappings = {
                "ophthalmologist": "ophthalmologist",
                "optometrist": "optometrist",
                "cardiologist": "cardiologist",
                "dermatologist": "dermatologist",
                "neurologist": "neurologist",
                "gastroenterologist": "gastroenterologist",
                "orthopedist": "orthopedist",
                "primary_care": "primary care phycisian",
                "hospital": "hospital",
            }

            search_keyword = specialty_mappings.get(provider_type, provider_type)

            # Try multiple search strategies
            search_url = f"{self.base_url}/nearbysearch/json"

            # Strategy 1: Health type with broader search
            params = {
                "key": self.api_key,
                "location": f"{latitude},{longitude}",
                "radius": radius,
                "type": "doctor",  # Use "health" instead of "doctor" - it's broader
                "keyword": provider_type,  # Add "medical" for better results
            }

            print(f"🔍 Search params: type=health, keyword={search_keyword}")

            response = requests.get(search_url, params=params, timeout=10)
            data = response.json()

            print(f"🔍 Raw API response status: {data.get('status')}")
            if data.get("results"):
                print(f"🔍 Raw results count: {len(data['results'])}")
                for i, place in enumerate(data["results"][:3]):
                    print(
                        f"   {i + 1}. {place.get('name')} - types: {place.get('types')}"
                    )
            else:
                print("🔍 No raw results found")

            print(
                f"📋 API Status: {data.get('status')}, Results: {len(data.get('results', []))}"
            )

            # If no results, try doctor type
            if data.get("status") == "ZERO_RESULTS":
                print("🔄 Trying fallback with type=doctor...")
                params_fallback = {
                    "key": self.api_key,
                    "location": f"{latitude},{longitude}",
                    "radius": radius,
                    "type": "doctor",
                    "keyword": search_keyword,
                }
                response_fallback = requests.get(
                    search_url, params=params_fallback, timeout=10
                )
                data_fallback = response_fallback.json()
                print(
                    f"📋 Fallback Status: {data_fallback.get('status')}, Results: {len(data_fallback.get('results', []))}"
                )
                data = data_fallback

            # If still no results, try hospital type for emergencies
            if data.get("status") == "ZERO_RESULTS" and provider_type == "hospital":
                print("🔄 Trying hospital search...")
                params_hospital = {
                    "key": self.api_key,
                    "location": f"{latitude},{longitude}",
                    "radius": radius,
                    "type": "hospital",
                }
                response_hospital = requests.get(
                    search_url, params=params_hospital, timeout=10
                )
                data = response_hospital.json()
                print(
                    f"📋 Hospital Status: {data.get('status')}, Results: {len(data.get('results', []))}"
                )

            if data.get("status") != "OK":
                print(f"⚠️ Google Places API error: {data.get('status')}")
                return []

            places = data.get("results", [])[:max_results]

            # Filter for relevant providers based on name and types
            relevant_places = places

            print(f"✅ Filtered to {len(relevant_places)} relevant providers")

            # Enrich results
            enriched_places = []
            for place in relevant_places:
                enriched_place = self._enrich_place_details(place, latitude, longitude)
                if enriched_place:
                    enriched_places.append(enriched_place)

            return enriched_places

        except Exception as e:
            print(f"❌ Error fetching healthcare providers: {e}")
            import traceback

            traceback.print_exc()
            return []

    def _enrich_place_details(
        self, place: Dict[str, Any], user_lat: float, user_lng: float
    ) -> Optional[Dict[str, Any]]:
        """
        Enrich place with additional details and distance calculation
        """
        try:
            # Get place details for additional info
            details_url = f"{self.base_url}/details/json"
            params = {
                "key": self.api_key,
                "place_id": place["place_id"],
                "fields": "formatted_phone_number,website,opening_hours,rating,user_ratings_total",
            }

            details_response = requests.get(details_url, params=params, timeout=10)
            details_data = details_response.json()

            place_details = details_data.get("result", {})

            # Calculate distance
            place_lat = place["geometry"]["location"]["lat"]
            place_lng = place["geometry"]["location"]["lng"]
            distance_km = self._calculate_distance(
                user_lat, user_lng, place_lat, place_lng
            )

            return {
                "name": place.get("name"),
                "address": place.get("vicinity"),
                "phone": place_details.get("formatted_phone_number"),
                "website": place_details.get("website"),
                "rating": place_details.get("rating"),
                "total_ratings": place_details.get("user_ratings_total"),
                "open_now": place_details.get("opening_hours", {}).get("open_now"),
                "distance_km": round(distance_km, 1),
                "place_id": place.get("place_id"),
                "types": place.get("types", []),
                "google_maps_url": f"https://www.google.com/maps/place/?q=place_id:{place['place_id']}",
            }

        except Exception as e:
            print(f"❌ Error enriching place details: {e}")
            # Return basic info if details fail
            return {
                "name": place.get("name"),
                "address": place.get("vicinity"),
                "distance_km": 0,
                "place_id": place.get("place_id"),
                "google_maps_url": f"https://www.google.com/maps/place/?q=place_id:{place['place_id']}",
            }

    def _calculate_distance(
        self, lat1: float, lng1: float, lat2: float, lng2: float
    ) -> float:
        """
        Calculate approximate distance between two points using Haversine formula
        """
        R = 6371  # Earth radius in kilometers

        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lng = math.radians(lng2 - lng1)

        a = (
            math.sin(delta_lat / 2) ** 2
            + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return R * c

    def geocode_zipcode(self, zipcode: str) -> Optional[tuple[float, float]]:
        """Convert zipcode to coordinates"""
        try:
            url = f"https://maps.googleapis.com/maps/api/geocode/json"
            params = {
                "key": self.api_key,
                "address": zipcode,
                "components": "country:US",
            }

            response = requests.get(url, params=params, timeout=10)
            data = response.json()

            if data["status"] == "OK" and data["results"]:
                location = data["results"][0]["geometry"]["location"]
                return location["lat"], location["lng"]

            return None
        except Exception as e:
            print(f"❌ Geocoding failed: {e}")
            return None

    def get_providers_by_zipcode(
        self, zipcode: str, specialty: str, max_results: int = 5
    ):
        """Get providers by zipcode instead of coordinates"""
        coords = self.geocode_zipcode(zipcode)
        if not coords:
            print(f"❌ Could not geocode zipcode: {zipcode}")
            return []

        lat, lng = coords
        return self.get_nearby_healthcare_providers(lat, lng, specialty, max_results)


# Singleton instance
maps_service = MapsService()

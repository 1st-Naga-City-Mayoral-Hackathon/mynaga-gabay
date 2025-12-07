#!/usr/bin/env python3
"""
Google Places API Fetcher for Naga City Health Facilities
Fetches hospitals, clinics, pharmacies, and health centers from Google Places API (New).

Requires: GOOGLE_PLACES_API_KEY environment variable
"""

import json
import os
import time
from typing import Any

import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Naga City coordinates (center point)
NAGA_CITY_LAT = 13.6218
NAGA_CITY_LNG = 123.1948
SEARCH_RADIUS_METERS = 10000  # 10km radius covers all of Naga City

# Health facility types to search
FACILITY_TYPES = [
    "hospital",
    "doctor",
    "pharmacy",
    "physiotherapist",
    "dentist",
]

# Text searches for additional coverage
TEXT_SEARCHES = [
    "health center in Naga City",
    "clinic in Naga City",
    "diagnostic center in Naga City",
    "lying-in in Naga City",
    "laboratory in Naga City",
]


class GooglePlacesAPI:
    """Client for Google Places API (New)."""
    
    # New Places API endpoint
    BASE_URL = "https://places.googleapis.com/v1/places"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": ",".join([
                "places.id",
                "places.displayName",
                "places.formattedAddress",
                "places.location",
                "places.types",
                "places.nationalPhoneNumber",
                "places.internationalPhoneNumber",
                "places.regularOpeningHours",
                "places.websiteUri",
                "places.googleMapsUri",
                "places.rating",
                "places.userRatingCount",
            ])
        })
    
    def nearby_search(self, lat: float, lng: float, radius: int, place_type: str) -> list[dict]:
        """
        Search for places near a location by type.
        Uses the new Nearby Search (New) endpoint.
        """
        url = f"{self.BASE_URL}:searchNearby"
        
        payload = {
            "includedTypes": [place_type],
            "maxResultCount": 20,
            "locationRestriction": {
                "circle": {
                    "center": {
                        "latitude": lat,
                        "longitude": lng
                    },
                    "radius": radius
                }
            }
        }
        
        try:
            response = self.session.post(url, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get("places", [])
        except requests.RequestException as e:
            print(f"  [ERROR] Nearby search failed: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"  [ERROR] Response: {e.response.text[:500]}")
            return []
    
    def text_search(self, query: str, lat: float, lng: float, radius: int) -> list[dict]:
        """
        Search for places using text query.
        """
        url = f"{self.BASE_URL}:searchText"
        
        payload = {
            "textQuery": query,
            "maxResultCount": 20,
            "locationBias": {
                "circle": {
                    "center": {
                        "latitude": lat,
                        "longitude": lng
                    },
                    "radius": radius
                }
            }
        }
        
        try:
            response = self.session.post(url, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get("places", [])
        except requests.RequestException as e:
            print(f"  [ERROR] Text search failed: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"  [ERROR] Response: {e.response.text[:500]}")
            return []


def parse_place(place: dict) -> dict:
    """Parse a place response into our standard format."""
    
    # Get display name
    display_name = place.get("displayName", {})
    name = display_name.get("text", "") if isinstance(display_name, dict) else str(display_name)
    
    # Get location
    location = place.get("location", {})
    lat = location.get("latitude")
    lng = location.get("longitude")
    
    # Get opening hours
    hours_data = place.get("regularOpeningHours", {})
    weekday_text = hours_data.get("weekdayDescriptions", [])
    hours = "; ".join(weekday_text[:3]) if weekday_text else ""  # First 3 days as sample
    
    # Determine facility type
    types = place.get("types", [])
    facility_type = "other"
    if "hospital" in types:
        facility_type = "hospital"
    elif "pharmacy" in types:
        facility_type = "pharmacy"
    elif "doctor" in types:
        facility_type = "clinic"
    elif "dentist" in types:
        facility_type = "dental"
    elif "physiotherapist" in types:
        facility_type = "therapy"
    
    return {
        "place_id": place.get("id", ""),
        "name": name,
        "type": facility_type,
        "address": place.get("formattedAddress", ""),
        "phone": place.get("nationalPhoneNumber") or place.get("internationalPhoneNumber", ""),
        "website": place.get("websiteUri", ""),
        "google_maps_url": place.get("googleMapsUri", ""),
        "coordinates": {
            "lat": lat,
            "lng": lng
        },
        "hours": hours,
        "rating": place.get("rating"),
        "review_count": place.get("userRatingCount"),
        "types": types,
        "source": "Google Places API"
    }


def fetch_naga_facilities(api: GooglePlacesAPI) -> list[dict]:
    """Fetch all health facilities in Naga City."""
    
    all_places = []
    seen_ids = set()
    
    # Nearby search by type
    print("[FETCH] Searching by facility type...")
    for facility_type in FACILITY_TYPES:
        print(f"  - Searching: {facility_type}")
        places = api.nearby_search(
            NAGA_CITY_LAT, NAGA_CITY_LNG,
            SEARCH_RADIUS_METERS, facility_type
        )
        
        for place in places:
            place_id = place.get("id", "")
            if place_id and place_id not in seen_ids:
                seen_ids.add(place_id)
                all_places.append(parse_place(place))
        
        print(f"    Found {len(places)} results")
        time.sleep(0.2)  # Rate limiting
    
    # Text search for additional coverage
    print("\n[FETCH] Searching by text query...")
    for query in TEXT_SEARCHES:
        print(f"  - Searching: {query}")
        places = api.text_search(
            query,
            NAGA_CITY_LAT, NAGA_CITY_LNG,
            SEARCH_RADIUS_METERS
        )
        
        for place in places:
            place_id = place.get("id", "")
            if place_id and place_id not in seen_ids:
                seen_ids.add(place_id)
                all_places.append(parse_place(place))
        
        print(f"    Found {len(places)} results")
        time.sleep(0.2)
    
    return all_places


def merge_with_existing(new_facilities: list[dict], existing_path: str) -> list[dict]:
    """Merge new facilities with existing curated data."""
    
    merged = []
    
    # Load existing data
    if os.path.exists(existing_path):
        with open(existing_path, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
            existing_facilities = existing_data.get("facilities", [])
    else:
        existing_facilities = []
    
    # Index existing by name (normalized)
    existing_by_name = {}
    for fac in existing_facilities:
        key = fac.get("name", "").lower().strip()
        existing_by_name[key] = fac
    
    # Merge - prefer existing curated data, add new from Google
    merged_names = set()
    
    # Add existing facilities first
    for fac in existing_facilities:
        fac_id = fac.get("id") or f"fac-{len(merged)+1:03d}"
        merged_entry = {
            "id": fac_id,
            "name": fac.get("name", ""),
            "type": fac.get("type", ""),
            "address": fac.get("address", ""),
            "barangay": fac.get("barangay", ""),
            "city": fac.get("city", "Naga City"),
            "province": fac.get("province", "Camarines Sur"),
            "phone": fac.get("phone", ""),
            "hours": fac.get("hours", ""),
            "services": fac.get("services", []),
            "philhealthAccredited": fac.get("philhealthAccredited", False),
            "notes": fac.get("notes", ""),
            "source": "Curated"
        }
        merged.append(merged_entry)
        merged_names.add(fac.get("name", "").lower().strip())
    
    # Add new facilities from Google
    for fac in new_facilities:
        name_key = fac.get("name", "").lower().strip()
        
        # Skip if already exists
        if name_key in merged_names:
            continue
        
        # Skip if not in Naga City area (basic check)
        address = fac.get("address", "").lower()
        if "naga" not in address and "camarines sur" not in address:
            continue
        
        fac_id = f"goog-{len(merged)+1:03d}"
        merged_entry = {
            "id": fac_id,
            "name": fac.get("name", ""),
            "type": fac.get("type", ""),
            "address": fac.get("address", ""),
            "city": "Naga City",
            "province": "Camarines Sur",
            "phone": fac.get("phone", ""),
            "hours": fac.get("hours", ""),
            "coordinates": fac.get("coordinates"),
            "website": fac.get("website", ""),
            "googleMapsUrl": fac.get("google_maps_url", ""),
            "rating": fac.get("rating"),
            "reviewCount": fac.get("review_count"),
            "source": "Google Places API"
        }
        merged.append(merged_entry)
        merged_names.add(name_key)
    
    return merged


def save_json(data: Any, filepath: str) -> None:
    """Save to JSON file."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[SAVE] Written to: {filepath}")


def main():
    """Main entry point."""
    print("=" * 60)
    print("Google Places API - Naga City Health Facilities Fetcher")
    print("=" * 60)
    
    # Check for API key
    api_key = os.getenv("GOOGLE_PLACES_API_KEY")
    if not api_key:
        print("[ERROR] GOOGLE_PLACES_API_KEY not found in environment!")
        print("        Set it in your .env file or export it:")
        print("        export GOOGLE_PLACES_API_KEY=your_key_here")
        return
    
    print(f"[INIT] API Key: {api_key[:10]}...{api_key[-4:]}")
    
    # Create API client
    api = GooglePlacesAPI(api_key)
    
    # Fetch facilities
    print("\n" + "-" * 40)
    print("FETCHING FACILITIES")
    print("-" * 40)
    new_facilities = fetch_naga_facilities(api)
    print(f"\n[RESULT] Fetched {len(new_facilities)} facilities from Google")
    
    # Save raw Google data
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, '..', 'output', 'facilities')
    os.makedirs(output_dir, exist_ok=True)
    
    save_json(new_facilities, os.path.join(output_dir, 'google_places_raw.json'))
    
    # Merge with existing data
    print("\n" + "-" * 40)
    print("MERGING WITH EXISTING DATA")
    print("-" * 40)
    
    kb_path = os.path.join(script_dir, '..', 'knowledge-base', 'facilities', 'naga-health-centers.json')
    merged = merge_with_existing(new_facilities, kb_path)
    
    # Save merged data
    merged_output = {"facilities": merged}
    save_json(merged_output, os.path.join(output_dir, 'naga_facilities_merged.json'))
    
    # Also update knowledge base
    save_json(merged_output, kb_path)
    
    # Summary
    print("\n" + "=" * 60)
    print("FETCH COMPLETE")
    print("=" * 60)
    
    # Count by type
    type_counts = {}
    for fac in merged:
        ftype = fac.get("type", "other")
        type_counts[ftype] = type_counts.get(ftype, 0) + 1
    
    print(f"Total facilities: {len(merged)}")
    print("\n[BY TYPE]")
    for ftype, count in sorted(type_counts.items(), key=lambda x: -x[1]):
        print(f"  - {ftype}: {count}")


if __name__ == "__main__":
    main()

import requests
import json
import csv
import os
import time
from datetime import datetime

import fetch_districts

CACHE_DIR = "../api_cache"
CACHE_LOCATION_COORDINATES_FILE = os.path.join(CACHE_DIR, "malls_coordinates.csv")

def ensure_cache_dir():
    """Create cache directory if it doesn't exist."""
    if not os.path.exists(CACHE_DIR):
        os.makedirs(CACHE_DIR)

def fetch_malls(mall_name: str) -> dict:
    """
    Fetch coordinates for a specific mall.
    
    Args:
        mall_name: Name of the mall to search for.
        
    Return: Dict with mall_name as key and coordinates as value.
    """
    # First check if the mall exists in the cache
    if os.path.exists(CACHE_LOCATION_COORDINATES_FILE):
        with open(CACHE_LOCATION_COORDINATES_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['mall_name'].lower() == mall_name.lower():
                    return {
                        mall_name: {
                            'latitude': float(row['latitude']),
                            'longitude': float(row['longitude']),
                            'planning_area': row['planning area']
                        }
                    }
    
    # Return an empty dict if not found
    return {}

def fetch_all_malls() -> list:
    """
    Fetch all malls from the cache or API.
    
    Return: List of dicts with mall information.
    """
    malls = []
    
    if os.path.exists(CACHE_LOCATION_COORDINATES_FILE):
        with open(CACHE_LOCATION_COORDINATES_FILE, 'r', encoding='utf-8') as f:
            # The CSV module should handle quotes automatically
            reader = csv.DictReader(f)
            for row in reader:
                malls.append({
                    'mall_name': row['mall_name'],
                    'latitude': float(row['latitude']),
                    'longitude': float(row['longitude']),
                    'planning_area': row['planning area']
                })
    
    return malls

def get_all_malls_by_location(location_name: str) -> list:
    """
    Return: All malls in a location. List of dicts with mall information.
    
    Args:
        location_name: Name of the location/district to search in.
    """
    # Get all malls
    all_malls = fetch_all_malls()
    
    # Filter malls by planning area
    nearby_malls = []
    for mall in all_malls:
        if mall['planning_area'].lower() == location_name.lower():
            nearby_malls.append(mall)
    
    return nearby_malls

def get_num_malls_by_district(district_name: str) -> int:
    """
    Return: Number of malls in a district. Integer
    
    Args:
        district_name: Name of the district/planning area.
    """
    # Get all malls
    all_malls = fetch_all_malls()
    
    # Filter malls by planning area
    count = 0
    for mall in all_malls:
        if mall['planning_area'].lower() == district_name.lower():
            count += 1
    
    return count

if __name__ == "__main__":
    ensure_cache_dir()
    
    try:
        # Example usage
        print("Fetching all malls...")
        all_malls = fetch_all_malls()
        print(f"Found {len(all_malls)} malls in total.")
        
        # Example: Find malls in a specific location
        location = "Orchard"
        print(f"\nFetching malls in {location}...")
        location_malls = get_all_malls_by_location(location)
        print(f"Found {len(location_malls)} malls in {location}.")
        print(location_malls)
        
        # Example: Get the number of malls in a district
        district_name = "Marina Bay"
        mall_count = get_num_malls_by_district(district_name)
        print(f"\nNumber of malls in {district_name}: {mall_count}")
        
        # Example: Search for a specific mall
        mall_name = "313@SOMERSET"
        mall_info = fetch_malls(mall_name)
        if mall_info:
            print(f"\nFound mall: {mall_name}")
            coords = mall_info[mall_name]
            print(f"Coordinates: {coords['latitude']}, {coords['longitude']}")
            print(f"Planning Area: {coords['planning_area']}")
        else:
            print(f"\nMall '{mall_name}' not found.")
            
    except Exception as e:
        print(f"Error occurred: {e}")
        # Print the row causing the error for debugging
        print("Try opening the CSV file manually to check its format and contents")
import requests
import json
import csv
import os
import time
import sqlite3
from datetime import datetime

from fetch_districts import DB_PATH

CACHE_DIR = "../api_cache"
CACHE_LOCATION_COORDINATES_FILE = os.path.join(CACHE_DIR, "mrt_coordinates.csv")

def ensure_cache_dir():
    """Create cache directory if it doesn't exist."""
    if not os.path.exists(CACHE_DIR):
        os.makedirs(CACHE_DIR)

def fetch_mrt_stations(station_name: str) -> dict:
    """
    Fetch coordinates for a specific MRT station.
    
    Args:
        station_name: Name of the MRT station to search for.
        
    Return: Dict with station_name as key and coordinates as value.
    """
    # First check if the station exists in the cache
    if os.path.exists(CACHE_LOCATION_COORDINATES_FILE):
        with open(CACHE_LOCATION_COORDINATES_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['Name'].lower() == station_name.lower():
                    return {
                        station_name: {
                            'latitude': float(row['Latitude']),
                            'longitude': float(row['Longitude']),
                            'planning_area': row['Planning Area']
                        }
                    }
    
    # Return an empty dict if not found
    return {}

def fetch_all_mrt_stations() -> list:
    """
    Fetch all MRT stations from the cache.
    
    Return: List of dicts with MRT station information.
    """
    stations = []
    
    if os.path.exists(CACHE_LOCATION_COORDINATES_FILE):
        with open(CACHE_LOCATION_COORDINATES_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                stations.append({
                    'station_name': row['Name'],
                    'latitude': float(row['Latitude']),
                    'longitude': float(row['Longitude']),
                    'planning_area': row['Planning Area']
                })
    
    return stations

def get_all_stations_by_location(location_name: str) -> list:
    """
    Return: All MRT stations in a location. List of dicts with station information.
    
    Args:
        location_name: Name of the location/district to search in.
    """
    # Get all stations
    all_stations = fetch_all_mrt_stations()
    
    # Filter stations by planning area
    nearby_stations = []
    for station in all_stations:
        if station['planning_area'].lower() == location_name.lower():
            nearby_stations.append(station)
    
    return nearby_stations

def get_num_stations_by_district(district_name: str) -> int:
    """
    Return: Number of MRT stations in a district. Integer
    
    Args:
        district_name: Name of the district/planning area.
    """
    # Get all stations
    all_stations = fetch_all_mrt_stations()
    
    # Filter stations by planning area
    count = 0
    for station in all_stations:
        if station['planning_area'].lower() == district_name.lower():
            count += 1
    
    return count

def save_num_stations_to_db(db_path=DB_PATH):
    """
    Save number of MRT stations for each location in num_transport column in locations table in app.db.
    """
    try:
        # Establish a database connection
        with sqlite3.connect(db_path) as conn:
            # Set row_factory to get dictionary instead of tuple
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Get all location names from the locations table
            cursor.execute("SELECT location_name FROM locations")
            locations = cursor.fetchall()
            
            for location in locations:
                location_name = location['location_name']
                
                # Get number of MRT stations for this location
                num_stations = get_num_stations_by_district(district_name=location_name)
            
                # Update the locations table with the number of MRT stations
                query = "UPDATE locations SET num_transport = ? WHERE location_name = ?"
                cursor.execute(query, (num_stations, location_name))
            
            # Commit changes
            conn.commit()
            return True
    
    except Exception as e:
        print(f"Error occurred: {e}")
        return False
    
def test_fetch_specific_station():
    """Test fetching a specific MRT station's details."""
    print("\n=== Testing fetch_mrt_stations() ===")
    station_name = "ADMIRALTY MRT STATION"
    result = fetch_mrt_stations(station_name)
    print(f"Details for {station_name}:")
    print(result)

def test_fetch_all_stations():
    """Test fetching all MRT stations."""
    print("\n=== Testing fetch_all_mrt_stations() ===")
    all_stations = fetch_all_mrt_stations()
    print(f"Total stations found: {len(all_stations)}")
    print("First 3 stations:")
    for station in all_stations[:3]:
        print(station)

def test_stations_by_location():
    """Test getting all stations in a specific location."""
    print("\n=== Testing get_all_stations_by_location() ===")
    location = "Woodlands"
    stations = get_all_stations_by_location(location)
    print(f"Found {len(stations)} stations in {location}:")
    for station in stations:
        print(f"- {station['station_name']}")

def test_count_by_district():
    """Test counting stations in various districts."""
    print("\n=== Testing get_num_stations_by_district() ===")
    districts = ["Woodlands", "Ang Mo Kio", "Downtown Core"]
    for district in districts:
        count = get_num_stations_by_district(district)
        print(f"Number of stations in {district}: {count}")

if __name__ == "__main__":
    ensure_cache_dir()

    # test_fetch_specific_station()
    # test_fetch_all_stations()
    # test_stations_by_location()
    # test_count_by_district()

    save_num_stations_to_db()
import requests
import sqlite3
import os
import csv
import pathlib
from .fetch_districts import get_access_token, DB_PATH
from collections import defaultdict

# Define API URL
BASE_URL = "https://www.onemap.gov.sg/api/public/themesvc/retrieveTheme"

# Use absolute paths based on the location of the current script
SCRIPT_DIR = pathlib.Path(__file__).parent.absolute()
PROJECT_ROOT = SCRIPT_DIR.parent
CACHE_DIR = os.path.join(PROJECT_ROOT, "api_cache")
CACHE_LOCATION_COORDINATES_FILE = os.path.join(CACHE_DIR, "schools_coordinates.csv")

def ensure_cache_dir():
    """Create cache directory if it doesn't exist."""
    if not os.path.exists(CACHE_DIR):
        os.makedirs(CACHE_DIR)

def save_to_csv():
    """Fetch kindergarten locations from API and save to CSV."""

    # Get access token
    access_token = get_access_token()
    headers = {"Authorization": access_token}

    query_params = {"queryName": "Kindergartens"}  

    full_url = requests.Request("GET", "https://www.onemap.gov.sg/api/public/themesvc/retrieveTheme", params=query_params).prepare().url

    print(f"Full request URL: {full_url}")

    response = requests.get(BASE_URL, headers=headers, params=query_params)

    if response.status_code != 200:
        print(f"Error fetching data: {response.status_code}")
        return
    
    data = response.json()

    # Ensure the response contains the expected key
    if "SrchResults" not in data:
        print("Unexpected response format:", data)
        return
    
    schools = data["SrchResults"]

    if not schools:
        print("No kindergartens found.")
        return

    ensure_cache_dir()

    with open(CACHE_LOCATION_COORDINATES_FILE, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["name", "latitude", "longitude", "Planning Area"])  # CSV headers

        for school in schools:
            name = school.get("NAME", "Unknown")
            latlng = school.get("LatLng", "N/A")
            if latlng != "N/A":
                lat, lng = latlng.split(',')
                # Note: The Planning Area should be determined using another API or method. Script at https://github.com/horensen/sg-areas#
                writer.writerow([name, lat, lng, ""])

    print(f"Saved {len(schools)} kindergartens to {CACHE_LOCATION_COORDINATES_FILE}")
    
    print("Now you need to run a script to tag each school to a planning area")


def save_num_schools_to_db(db_path=DB_PATH):
    """
    Save number of schools for each location in num_schools column in locations in app.db.
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
                
                # Get number of schools for this location
                num_schools = get_num_schools_by_district(location_name=location_name)
                
                # Update the locations table with the number of schools
                query = "UPDATE locations SET num_schools = ? WHERE location_name = ?"
                cursor.execute(query, (num_schools, location_name))
            
            # Commit changes
            conn.commit()
            return True
    
    except Exception as e:
        print(f"Error occurred: {e}")
        return False

def load_schools_data():
    """Load schools data from the CSV file."""
    schools_data = []
    if os.path.exists(CACHE_LOCATION_COORDINATES_FILE):
        with open(CACHE_LOCATION_COORDINATES_FILE, mode="r", newline="") as file:
            reader = csv.DictReader(file)
            for row in reader:
                schools_data.append(row)
    return schools_data

def get_all_schools_by_district(location_name: str):
    """
    Get all schools in a specific planning area/district.
    
    Args:
        location_name: Name of the planning area/district
        
    Returns:
        List of schools in the specified district.
    """
    schools_data = load_schools_data()
    schools_in_district = []
    
    for school in schools_data:
        if school.get("Planning Area", "").lower() == location_name.lower() or \
           school.get("PlanningArea", "").lower() == location_name.lower():
            schools_in_district.append(school)
    
    return schools_in_district

def get_num_schools_by_district(location_name: str):
    """
    Get the number of schools in a specific planning area/district.
    
    Args:
        location_name: Name of the planning area/district
        
    Returns:
        Number of schools in the specified district
    """
    schools_in_district = get_all_schools_by_district(location_name)
    return len(schools_in_district)

def list_all_districts():
    """List all unique planning areas/districts in the data."""
    schools_data = load_schools_data()
    districts = set()
    
    for school in schools_data:
        district = school.get("Planning Area") or school.get("PlanningArea")
        if district and district.strip():
            districts.add(district)
    
    return sorted(list(districts))

def get_district_statistics():
    """Get statistics about schools per district."""
    schools_data = load_schools_data()
    district_counts = defaultdict(int)
    
    for school in schools_data:
        district = school.get("Planning Area") or school.get("PlanningArea")
        if district and district.strip():
            district_counts[district] += 1
    
    return dict(sorted(district_counts.items(), key=lambda x: x[1], reverse=True))

if __name__ == "__main__":
    # Uncomment the function you want to run
    
    # Fetch and save data from API
    # save_to_csv()
    # save_num_schools_to_db()
    
    # Example: Get all schools in Yishun
    yishun_schools = get_all_schools_by_district("Bedok")
    print(f"Schools in Bedok ({len(yishun_schools)}):")
    for school in yishun_schools:
        print(f"- {school['name']}")
    
    # # Example: Get number of schools by district
    # serangoon_count = get_num_schools_by_district("Serangoon")
    # print(f"Number of schools in Serangoon: {serangoon_count}")
    
    # # Example: List all districts
    # print("\nAll districts:")
    # for district in list_all_districts():
    #     print(f"- {district}")
    
    # # Example: Get statistics about schools per district
    # print("\nSchools per district:")
    # for district, count in get_district_statistics().items():
    #     print(f"{district}: {count} schools")
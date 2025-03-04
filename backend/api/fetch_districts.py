# OneMap API boundary

# Output Polygon https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/

import requests
import os
import json
import csv
from dotenv import load_dotenv

CACHE_DIR = "../api_cache"
CACHE_LOCATION_COORDINATES_FILE = os.path.join(CACHE_DIR, "location_coordinates.csv")

def get_access_token():
    load_dotenv()
                
    url = "https://www.onemap.gov.sg/api/auth/post/getToken"
                
    payload = {
                "email": os.environ['ONEMAP_EMAIL'],
                "password": os.environ['ONEMAP_EMAIL_PASSWORD']
                }
                
    response = requests.request("POST", url, json=payload)

    data = json.loads(response.text)
                
    return data["access_token"]


def save_location_geodata_to_csv(access_token, csv_filename=CACHE_LOCATION_COORDINATES_FILE):
        
    url = "https://www.onemap.gov.sg/api/public/popapi/getAllPlanningarea?year=2019"
        
    headers = {"Authorization": access_token}
        
    response = requests.request("GET", url, headers=headers)
        
    data = json.loads(response.text)

    results = data['SearchResults']

    return save_to_csv(csv_filename, results)

def save_to_csv(csv_filename, data):
    try:
        # Extract required fields and write to CSV
        with open(csv_filename, mode="w", newline="") as file:

            print("opened")

            writer = csv.writer(file)
            writer.writerow(["Planning Area", "Coordinates"])  # Header row

            for district in data:
                planning_area = district.get("pln_area_n")
                geojson_str = district.get("geojson")
                
                # Parse geojson string into a Python dictionary
                geojson_data = json.loads(geojson_str)
                
                # Extract coordinates (assuming it's a MultiPolygon)
                coordinates = geojson_data.get("coordinates", [])

                # Flatten and format coordinates as a string
                formatted_coords = json.dumps(coordinates)

                # Write to CSV
                writer.writerow([planning_area, formatted_coords])

        print(f"Data saved to {csv_filename}")
        return True
    
    except Exception as e:
        print(f"Error: {e}")
        return False
    
def get_location_geodata(location_name, csv_filename=CACHE_LOCATION_COORDINATES_FILE):
    try:
        with open(csv_filename, mode="r", newline="") as file:
            reader = csv.DictReader(file)
            for row in reader:
                if row["Planning Area"].strip().lower() == location_name.strip().lower():
                    return json.loads(row["Coordinates"])
    except FileNotFoundError:
        print(f"Error: CSV file '{csv_filename}' not found.")
    except Exception as e:
        print(f"Error: {e}")
    
    return None  # Return None if location is not found


# For testing
if __name__ == "__main__":
    access_token = get_access_token()
    save_location_geodata_to_csv(access_token)
    print(get_location_geodata('BEDOK'))

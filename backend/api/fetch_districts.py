# OneMap API boundary

# Output Polygon https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/

import requests
import os
import sqlite3
import json
import csv
from dotenv import load_dotenv

CACHE_DIR = "../api_cache"
CACHE_LOCATION_COORDINATES_FILE = os.path.join(CACHE_DIR, "locations_coordinates.csv")
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'app.db')

# Ignore this i shifted it here to resolve circular import error
npc_to_district = {
    "Ang Mo Kio": "Ang Mo Kio South NPC",
    "Bedok": "Bedok NPC",
    "Bishan": "Bishan NPC",
    "Boon Lay": "Jurong West NPC",
    "Bukit Batok": "Bukit Batok NPC",
    "Bukit Merah": "Bukit Merah West NPC",
    "Bukit Panjang": "Bukit Panjang NPC",
    "Bukit Timah": "Bukit Timah NPC",
    "Central Water Catchment": "Woodlands West NPC",
    "Changi": "Changi NPC",
    "Changi Bay": "Changi NPC",  # Added
    "Choa Chu Kang": "Choa Chu Kang NPC",
    "Clementi": "Clementi NPC",
    "Downtown Core": "Marina Bay NPC",
    "Geylang": "Geylang NPC",
    "Hougang": "Hougang NPC",
    "Jurong East": "Jurong East NPC",
    "Jurong West": "Jurong West NPC",
    "Kallang": "Kampong Java NPC",
    "Lim Chu Kang": "Nanyang NPC",
    "Mandai": "Woodlands East NPC",
    "Marine Parade": "Marine Parade NPC",
    "Marina East": "Marina Bay NPC",  # Added
    "Marina South": "Marina Bay NPC",  # Added
    "Museum": "Rochor NPC",
    "Newton": "Orchard NPC",
    "Novena": "Toa Payoh NPC",
    "Orchard": "Orchard NPC",
    "Outram": "Bukit Merah East NPC",
    "Pasir Ris": "Pasir Ris NPC",
    "Paya Lebar": "Hougang NPC",
    "Pioneer": "Nanyang NPC",
    "Punggol": "Punggol NPC",
    "Queenstown": "Queenstown NPC",
    "River Valley": "Orchard NPC",
    "Rochor": "Rochor NPC",
    "Seletar": "Sengkang NPC",
    "Sembawang": "Sembawang NPC",
    "Sengkang": "Sengkang NPC",
    "Serangoon": "Serangoon NPC",
    "Simpang": "Yishun North NPC",
    "Singapore River": "Marina Bay NPC",
    "Southern Islands": "Marina Bay NPC",
    "Straits View": "Marina Bay NPC",  # Added
    "Sungei Kadut": "Woodlands West NPC",
    "Tampines": "Tampines NPC",
    "Tanglin": "Bukit Timah NPC",
    "Tengah": "Choa Chu Kang NPC",
    "Toa Payoh": "Toa Payoh NPC",
    "Tuas": "Nanyang NPC",
    "Western Islands": "Nanyang NPC",
    "Western Water Catchment": "Nanyang NPC",
    "Woodlands": "Woodlands West NPC",
    "Yishun": "Yishun South NPC",
    "North-Eastern Islands": "Pasir Ris NPC"
}

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

    return save_to_csv(results, csv_filename=csv_filename)

def save_to_csv(data, csv_filename=CACHE_LOCATION_COORDINATES_FILE):
    try:
        # Extract required fields and write to CSV
        with open(csv_filename, mode="w", newline="") as file:

            print("opened")

            writer = csv.writer(file)
            writer.writerow(["Planning Area", "Coordinates"])  # Header row

            for district in data:
                planning_area = district.get("pln_area_n")

                # Find matching key in npc_to_district (case-insensitive) This is a bandaid fix resolve the mismatch in capitalisation error in the location_name
                location_name_lower = planning_area.lower()
                matching_key = None
                for key in npc_to_district:
                    if key.lower() == location_name_lower:
                        matching_key = key
                        break
                planning_area = matching_key

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
    
def save_location_name_to_db(db_path=DB_PATH):
    """
    Save all unique locations to location_name column in locations in app.db.
    """
    locations_geodata = get_all_location_geodata_from_csv()
    
    try:
        # Establish a database connection
        with sqlite3.connect(db_path) as conn:
            # Set row_factory to get dictionary instead of tuple
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            for location_geodata in locations_geodata:
                # Each location_geodata is a dict with one item where key is location name
                for location_name in location_geodata.keys():
                    # Check if location_name already exists
                    cursor.execute("SELECT COUNT(*) FROM locations WHERE location_name = ?", (location_name,))
                    exists = cursor.fetchone()[0] > 0
                    
                    if not exists:
                        # Insert only if it doesn't exist
                        query = "INSERT INTO locations (location_name) VALUES (?)"
                        cursor.execute(query, (location_name,))
            
            # Commit changes
            conn.commit()
            return True
    
    except Exception as e:
        print(f"Error occurred: {e}")
        return False
    
def save_location_coords_to_db(db_path=DB_PATH):
    """
    Save all locations geodata to coordinates column in location_details in app.db.
    Update existing records or insert new ones if location_name doesn't exist.
    """
    locations_geodata = get_all_location_geodata_from_csv()

    try:
        # Establish a database connection
        with sqlite3.connect(db_path) as conn:
            # Set row_factory to get dictionary instead of tuple
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            for location_geodata in locations_geodata: 
                # Each location_geodata is a dict with one item where key is location name and value is coordinates
                for location_name, coordinates in location_geodata.items():
                    # Convert coordinates to JSON string
                    coordinates_json = json.dumps(coordinates)
                    
                    # Check if location_name exists
                    cursor.execute("SELECT COUNT(*) FROM location_details WHERE location_name = ?", (location_name,))
                    exists = cursor.fetchone()[0] > 0
                    
                    if exists:
                        # Update existing record
                        query = "UPDATE location_details SET coordinates = ? WHERE location_name = ?"
                        cursor.execute(query, (coordinates_json, location_name))
                    else:
                        # Insert new record
                        query = "INSERT INTO location_details (location_name, coordinates) VALUES (?, ?)"
                        cursor.execute(query, (location_name, coordinates_json))
            
            # Commit changes
            conn.commit()
            return True

    except Exception as e:
        print(f"Error occurred: {e}")
        return False
    
def get_all_location_geodata_from_csv(csv_filename=CACHE_LOCATION_COORDINATES_FILE) -> list:
    """
    Return: list of dicts, each location has 1 dict, with key as location name and value as location coordinates.
    """
    result = []
    try:
        with open(csv_filename, mode="r", newline="") as file:
            reader = csv.DictReader(file)
            for row in reader:
                location_name = row["Planning Area"].strip()
                coordinates = json.loads(row["Coordinates"])
                result.append({location_name: coordinates})
    except FileNotFoundError:
        print(f"Error: CSV file '{csv_filename}' not found.")
    except Exception as e:
        print(f"Error: {e}")
    
    return result

def get_location_geodata(location_name: str, db_path=DB_PATH):
    """
    Return a list of coordinates, location's geodata.
    """
    try:
        # Establish a database connection
        with sqlite3.connect(db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Query to get coordinates for a specific location
            query = "SELECT coordinates FROM location_details WHERE location_name = ?"
            cursor.execute(query, (location_name.strip(),))
            
            result = cursor.fetchone()
            if result:
                coordinates = json.loads(result['coordinates'])
                return {location_name: coordinates}
            
    except Exception as e:
        print(f"Error: {e}")
    
    return None  # Return None if location is not found


def get_all_locations_geodata(db_path=DB_PATH):
    """
    Return: list of dicts, each location has 1 dict, with key as location name and value as location coordinates.
    """
    result = []
    try:
        # Establish a database connection
        with sqlite3.connect(db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Query to get all locations and their coordinates
            query = "SELECT location_name, coordinates FROM location_details"
            cursor.execute(query)
            
            rows = cursor.fetchall()
            for row in rows:
                location_name = row['location_name']
                coordinates = json.loads(row['coordinates'])
                result.append({location_name: coordinates})
                
    except Exception as e:
        print(f"Error: {e}")
    
    return result

# Theme Layers

import json

def get_all_themes(access_token):    
    url = "https://www.onemap.gov.sg/api/public/themesvc/getAllThemesInfo?moreInfo=Y"
    
    headers = {"Authorization": access_token}
    
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(f"Error fetching data: {response.status_code}")
        return
    
    data = response.json()  # Convert response to JSON

    print(json.dumps(data, indent=4))  # Pretty-print response for debugging

    # Extract required fields and write to CSV
    themes = data.get("Theme_Names", [])  # Extract "Theme_Names" safely

    if not themes:
        print("No themes found.")
        return

    file_path = "themes.csv"
    with open(file_path, mode="w", newline="") as file:
        print("Opened CSV file")
        writer = csv.writer(file)
        writer.writerow(["Theme Name"])  # Header row
        
        for theme in themes:
            writer.writerow([theme])  # Write each theme as a row

    print(f"Saved {len(themes)} themes to {file_path}")


# For testing
if __name__ == "__main__":
    access_token = get_access_token()
    get_all_themes(access_token=access_token)
    # save_location_geodata_to_csv(access_token=access_token)
    # # get_all_themes(access_token)

    # # save_to_location_coords_to_db()
    # save_location_name_to_db()

    # save_location_geodata_to_csv(access_token)
    # print(get_location_geodata('BUKIT TIMAH'))

import requests
import os
import csv
import sqlite3
import json
import pathlib

from .fetch_districts import DB_PATH, npc_to_district, CACHE_DIR

# Constants
DATASET_ID = "d_ca0b908cf06a267ca06acbd5feb4465c"
API_URL = f"https://data.gov.sg/api/action/datastore_search?resource_id={DATASET_ID}"

CACHE_CRIME_DATA_FILE = os.path.join(CACHE_DIR, "crimes.csv")
CACHE_CRIME_RATE_FILE = os.path.join(CACHE_DIR, "crimes_by_npc.csv")
CACHE_POPULATION_SIZE_FILE = os.path.join(CACHE_DIR, "population_size.csv")


def load_crime_data_from_cache(file=CACHE_CRIME_DATA_FILE):
    """
    Load crime data from the cached CSV file.
    """
    with open(file, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        return list(reader)

def fetch_crime_data_from_api():
    """
    Fetch crime data from the API and save it to a CSV file.
    """
    response = requests.get(API_URL)
    if response.status_code == 200:
        data = response.json()
        records = data.get("result", {}).get("records", [])
        
        # Save data to CSV
        os.makedirs(CACHE_DIR, exist_ok=True)
        with open(CACHE_CRIME_DATA_FILE, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=records[0].keys())
            writer.writeheader()
            writer.writerows(records)
        return records
    else:
        raise Exception(f"Failed to fetch data from API. Status code: {response.status_code}")
    
def fetch_all_crimes():
    """
    Fetch all crimes from cache or API.
    """
    if os.path.exists(CACHE_CRIME_DATA_FILE):
        return load_crime_data_from_cache()
    else:
        return fetch_crime_data_from_api()

def load_crime_rate_from_cache():
    """
    Load crime rate from the CSV file and stop at an empty line.
    
    Args:
        file_path (str): Path to the CSV file containing crime rate
        
    Returns:
        list: List of dictionaries containing the crime rates
    """
    crime_data = []
    
    with open(CACHE_CRIME_RATE_FILE, mode="r", encoding="utf-8") as file:
        # Read the header line
        header = file.readline().strip().split(',')
        header = [col.strip() for col in header]
        
        # Read data lines until empty line is found
        while True:
            line = file.readline()
            
            # Stop reading if line is empty or just whitespace
            if not line or line.strip() == "":
                break
                
            # Split the line and strip whitespace
            values = [val.strip() for val in line.strip().split(',')]
            
            # Create a dictionary for this row
            row_dict = {}

            for i, col_name in enumerate(header):
                # Convert year values to integers
                if col_name.strip().isdigit():
                    if values[i] == 'na':
                        row_dict[col_name] = 0
                    else:
                        row_dict[col_name] = int(values[i])
                else:
                    row_dict[col_name] = values[i]
                    
            crime_data.append(row_dict)


    return crime_data

def fetch_all_crime_rate():
    """
    Fetch all crime rates from cache.
    """
    if os.path.exists(CACHE_CRIME_RATE_FILE):
        return load_crime_rate_from_cache()
    else:
        return "Error: crimes_by_npc file not found."
    
def load_population_data_from_cache():
    """
    Load population size from the CSV file and stop at an empty line.
        
    Returns:
        Dict: A dictionary with planning area as key and population size as value
    """
    pop_dict = {}
    
    with open(CACHE_POPULATION_SIZE_FILE, mode="r", encoding="utf-8") as file:
        # Read the header line
        header = file.readline().strip().split(',')
        
        # Read data lines until empty line is found
        while True:
            line = file.readline()
            
            # Stop reading if line is empty or just whitespace
            if not line or line.strip() == "":
                break
                
            # Split the line and strip whitespace
            values = [val.strip() for val in line.strip().split(',')]
            
            # Extract planning area and population size
            planning_area = values[0]
            
            # Skip if population is not available
            if len(values) >= 2 and values[1]:
                try:
                    population = int(values[1])
                    pop_dict[planning_area] = population
                except ValueError:
                    pop_dict[planning_area] = 0
                    pass
            
    return pop_dict

def fetch_crime_rate_by_location(location_name: str):
    """
    Fetch crime rate filtered by location.
    """
    crime_rates = fetch_all_crime_rate()

    population_size_by_district = load_population_data_from_cache()

    # Find matching key in npc_to_district (case-insensitive)
    location_name_lower = location_name.lower()
    matching_key = None
    for key in npc_to_district:
        if key.lower() == location_name_lower:
            matching_key = key
            break

    district_pop_size = population_size_by_district.get(matching_key)

    print("district_pop_size ", district_pop_size)
    print('location_name ', location_name)
    
    location_npc = npc_to_district[matching_key]
    print("location_npc:", location_npc)

    for crime_rate_by_npc in crime_rates:
        npc = crime_rate_by_npc["NPC"]
        if npc == location_npc:

            #CALCULATE CRIME RATE, number of crime per million people
            if district_pop_size == 0:
                return 0

            crime_rate = ( crime_rate_by_npc["2023"] / district_pop_size ) * 1000000
            return crime_rate

    return 0

def save_crime_rate_to_db(db_path=DB_PATH):
    """
    Save location crime rate for each location in crime_rate column in locations table in app.db.
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
                print(location_name)
                
                # Get crime rate for this location
                crime_rate = fetch_crime_rate_by_location(location_name=location_name)

                print(crime_rate, type(crime_rate))
                
                # Update the locations table with the crime rate
                query = "UPDATE locations SET crime_rate = ? WHERE location_name = ?"
                cursor.execute(query, (crime_rate, location_name))
            
            # Commit changes
            conn.commit()
            return True
    
    except Exception as e:
        print(f"Error occurred: {e}")
        return False

def fetch_all_crimes_by_location(location: str):
    """
    Fetch crimes filtered by location.
    """
    crimes = fetch_all_crimes()
    print(f"Total crimes in dataset: {len(crimes)}")
    
    # Check if Planning Area is correctly formatted in the crimes data
    if crimes and 'Planning Area' not in crimes[0]:
        # Check for case sensitivity issues
        keys = list(crimes[0].keys())
        print(f"Available keys in crime data: {keys}")
        # Try to find the correct key
        planning_area_key = next((k for k in keys if k.lower() == 'planning area'), None)
        if planning_area_key:
            print(f"Found Planning Area as: {planning_area_key}")
            # Filter using the correct key
            return [crime for crime in crimes if crime.get(planning_area_key) == location]
        else:
            print("Planning Area column not found in crime data!")
            return []
    
    # Process each crime and check if it matches the location
    matching_crimes = []
    for crime in crimes:
        crime_location = crime.get("Planning Area", "")
        # # Print sample data to verify structure
        # if len(matching_crimes) == 0 and crime_location:
        #     print(f"Sample location in data: '{crime_location}'")
        #     print(f"Looking for location: '{location}'")
        
        if crime_location == location:
            matching_crimes.append(crime)
            
    print(f"Found {len(matching_crimes)} crimes matching location: {location}")
    return matching_crimes

def save_crimes_to_db(db_path=DB_PATH):
    """
    Save location crimes for each location in crimes column in location_details table in app.db.
    """
    try:
        # Establish a database connection
        with sqlite3.connect(db_path) as conn:
            # Set row_factory to get dictionary instead of tuple
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Verify database tables and columns
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='location_details'")
            if not cursor.fetchone():
                print("Error: location_details table does not exist")
                return False
                
            # Get all location names from the locations table
            cursor.execute("SELECT location_name FROM location_details")
            locations = cursor.fetchall()
            
            # Print current values for debugging
            cursor.execute("SELECT location_name, crimes FROM location_details LIMIT 3")
            sample_rows = cursor.fetchall()
            print("Current sample data in database:")
            for row in sample_rows:
                print(f"  {row['location_name']}: {row['crimes'][:30]}...")
            
            # Debug flag to track if any changes were made
            changes_made = False
            
            for location in locations:
                location_name = location['location_name']
                print(f"\nProcessing location: {location_name}")
                
                # Get all crimes for this location
                crimes = fetch_all_crimes_by_location(location=location_name)
                
                # If no crimes found, continue to next location
                if not crimes:
                    print(f"No crimes found for location: {location_name}")
                    continue
                
                # Convert to JSON string
                json_crimes = json.dumps(crimes)
                print(f"Saving {len(crimes)} crimes for location: {location_name}")
                print(f"JSON length: {len(json_crimes)} characters")
                
                # Update the location_details table with the crimes
                query = "UPDATE location_details SET crimes = ? WHERE location_name = ?"
                cursor.execute(query, (json_crimes, location_name))
                
                # Check if the update actually changed anything
                if cursor.rowcount > 0:
                    print(f"Updated {cursor.rowcount} rows for {location_name}")
                    changes_made = True
                else:
                    print(f"No rows updated for {location_name}")
            
            # Verify that changes were made
            if changes_made:
                # Commit changes
                conn.commit()
                print("Changes committed to database")
                
                # Verify changes were saved
                cursor.execute("SELECT location_name, crimes FROM location_details WHERE json_array_length(crimes) > 0 LIMIT 3")
                updated_rows = cursor.fetchall()
                if updated_rows:
                    print("Successfully updated rows in database:")
                    for row in updated_rows:
                        print(f"  {row['location_name']}: {row['crimes'][:30]}...")
                else:
                    print("No rows with non-empty crimes array found after update!")
            else:
                print("No changes made to database")
            
            return True
    
    except Exception as e:
        print(f"Error occurred: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Uncomment the function you want to run
    
    # Fetch and save data from API
    # save_to_csv()
    # save_crime_rate_to_db()
    save_crimes_to_db()
import requests
import os
import csv

# Constants
DATASET_ID = "d_ca0b908cf06a267ca06acbd5feb4465c"
API_URL = f"https://data.gov.sg/api/action/datastore_search?resource_id={DATASET_ID}"
CACHE_DIR = "../api_cache"
CACHE_FILE = os.path.join(CACHE_DIR, "crimes.csv")
LOCATIONS_DETAILS_DB = None

def fetch_data_from_api():
    """
    Fetch crime data from the API and save it to a CSV file.
    """
    response = requests.get(API_URL)
    if response.status_code == 200:
        data = response.json()
        records = data.get("result", {}).get("records", [])
        
        # Save data to CSV
        os.makedirs(CACHE_DIR, exist_ok=True)
        with open(CACHE_FILE, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=records[0].keys())
            writer.writeheader()
            writer.writerows(records)
        return records
    else:
        raise Exception(f"Failed to fetch data from API. Status code: {response.status_code}")

def load_data_from_cache():
    """
    Load crime data from the cached CSV file.
    """
    with open(CACHE_FILE, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        return list(reader)

def fetch_all_crimes():
    """
    Fetch all crimes from cache or API.
    """
    if os.path.exists(CACHE_FILE):
        return load_data_from_cache()
    else:
        return fetch_data_from_api()

def fetch_all_crimes_by_location(location: str):
    """
    Fetch crimes filtered by location.
    """
    crimes = fetch_all_crimes()
    return [crime for crime in crimes if crime.get("Planning Area") == location]

def csv_to_db():
    """
    Updates LocationDetailsDB and LocationsDB
    """
    pass
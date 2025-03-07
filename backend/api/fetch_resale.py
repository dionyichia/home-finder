import requests
import os
import csv

# Constants
DATASET_ID = "d_8b84c4ee58e3cfc0ece0d773c8ca6abc"
API_URL = f"https://data.gov.sg/api/action/datastore_search?resource_id={DATASET_ID}"
CACHE_DIR = "../api_cache"
CACHE_RESALE_DATA_FILE = os.path.join(CACHE_DIR, "hdb_resale_prices.csv")

def fetch_data_from_api():
    """
    Fetch HDB resale price data from the API and save it to a CSV file.
    """
    response = requests.get(API_URL)
    if response.status_code == 200:
        data = response.json()
        records = data.get("result", {}).get("records", [])
        
        # Save data to CSV
        os.makedirs(CACHE_DIR, exist_ok=True)
        with open(CACHE_RESALE_DATA_FILE, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=records[0].keys())
            writer.writeheader()
            writer.writerows(records)
        return records
    else:
        raise Exception(f"Failed to fetch data from API. Status code: {response.status_code}")

def load_resale_data_from_cache():
    """
    Load HDB resale price data from the cached CSV file.
    """
    with open(CACHE_RESALE_DATA_FILE, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        return list(reader)

def fetch_all_resale_transactions():
    """
    Fetch all HDB resale transactions from cache or API.
    """
    if os.path.exists(CACHE_RESALE_DATA_FILE):
        return load_resale_data_from_cache()
    else:
        return fetch_data_from_api()

def fetch_resale_transactions_by_location(location: str):
    """
    Fetch resale transactions filtered by location/district.
    """
    transactions = fetch_all_resale_transactions()
    return [transaction for transaction in transactions if transaction.get("district") == location]

def calculate_average_resale_price_by_location(location: str):
    """
    Calculate average resale price for a specific location/district.
    
    Args:
        location (str): The district/location to calculate average price for
    
    Returns:
        float: Average resale price for the location, or None if no transactions found
    """
    location_transactions = fetch_resale_transactions_by_location(location)
    
    if not location_transactions:
        return None
    
    total_prices = [float(transaction['resale_price']) for transaction in location_transactions]
    average_price = sum(total_prices) / len(total_prices)
    
    return round(average_price, 2)

def get_unique_districts():
    """
    Retrieve a list of unique districts in the resale transactions dataset.
    
    Returns:
        list: List of unique district names
    """
    transactions = fetch_all_resale_transactions()
    return list(set(transaction['district'] for transaction in transactions))

def filter_transactions_by_year(year: int):
    """
    Filter resale transactions by a specific year.
    
    Args:
        year (int): The year to filter transactions by
    
    Returns:
        list: List of transactions for the specified year
    """
    transactions = fetch_all_resale_transactions()
    return [transaction for transaction in transactions if transaction.get('month').startswith(str(year))]

def generate_resale_price_summary(location: str):
    """
    Generate a summary of resale prices for a specific location.
    
    Args:
        location (str): The town/location to generate summary for
    
    Returns:
        dict: Summary statistics for resale prices in the location
    """
    location_transactions = fetch_resale_transactions_by_location(location)
    
    if not location_transactions:
        return None
    
    prices = [float(transaction['resale_price']) for transaction in location_transactions]
    
    summary = {
        'location': location,
        'total_transactions': len(prices),
        'average_price': round(sum(prices) / len(prices), 2),
        'min_price': round(min(prices), 2),
        'max_price': round(max(prices), 2)
    }
    
    return summary

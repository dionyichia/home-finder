import requests
import os
import csv
import sqlite3
import json

from fetch_districts import DB_PATH
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
    Fetch resale transactions filtered by location/planning area.
    """
    transactions = fetch_all_resale_transactions()
    return [transaction for transaction in transactions if transaction.get("town") == location]

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

def get_latest_resale_price_by_location(location: str, flat_type: str = '3 ROOM'):
    """
    Get the latest resale price for a specified flat type in a location.
    
    Args:
        location (str): The planning area/location to search for
        flat_type (str): The flat type to filter by (default: '3 ROOM')
    
    Returns:
        float: The latest resale price for the specified flat type in the location,
               or None if no matching transactions found
    """
    transactions = fetch_resale_transactions_by_location(location)
    
    # Filter transactions by flat type
    filtered_transactions = [t for t in transactions if t['flat_type'] == flat_type]
    
    if not filtered_transactions:
        return None
    
    # Sort transactions by month (most recent first)
    sorted_transactions = sorted(filtered_transactions, key=lambda x: x['month'], reverse=True)
    
    # Return the price of the most recent transaction
    return float(sorted_transactions[0]['resale_price'])

def save_resale_price_to_db(db_path=DB_PATH, flat_type='3 ROOM'):
    """
    Save the latest resale price for a specified flat type for each location
    in the resale_price column in locations table in app.db.
    
    Args:
        db_path (str): Path to the SQLite database file
        flat_type (str): The flat type to save prices for (default: '3 ROOM')
    
    Returns:
        bool: True if successful, False otherwise
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
                
                # Get latest resale price for this location and flat type
                latest_price = get_latest_resale_price_by_location(
                    location=location_name, 
                    flat_type=flat_type
                )

                print(f"Updating {location_name} with price {latest_price}")  # Debugging line

                # Skip if no price found
                if latest_price is None:
                    continue
                
                # Update the locations table with the latest resale price
                query = "UPDATE locations SET price = ? WHERE location_name = ?"
                cursor.execute(query, (latest_price, location_name))
            
            # Commit changes
            conn.commit()
            return True
    
    except Exception as e:
        print(f"Error occurred: {e}")
        return False

def get_unique_districts():
    """
    Retrieve a list of unique planning areas in the resale transactions dataset.
    
    Returns:
        list: List of unique planning area names
    """
    transactions = fetch_all_resale_transactions()
    return list(set(transaction['town'] for transaction in transactions))

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

def get_all_transactions_by_location(location: str):
    """
    Get all resale transactions for a specific location.
    
    Args:
        location (str): The location name to get transactions for
        
    Returns:
        list: List of transaction dictionaries for the specified location
    """
    transactions = fetch_all_resale_transactions()
    location_transactions = [t for t in transactions if t.get("town") == location]
    
    # Convert to a more manageable structure with relevant fields only
    simplified_transactions = []
    for transaction in location_transactions:
        simplified_transactions.append({
            'month': transaction['month'],
            'flat_type': transaction['flat_type'],
            'block': transaction['block'],
            'street_name': transaction['street_name'],
            'storey_range': transaction['storey_range'],
            'floor_area_sqm': transaction['floor_area_sqm'],
            'flat_model': transaction['flat_model'],
            'lease_commence_date': transaction['lease_commence_date'],
            'remaining_lease': transaction['remaining_lease'],
            'resale_price': transaction['resale_price']
        })
    
    # Sort by month (most recent first)
    simplified_transactions.sort(key=lambda x: x['month'], reverse=True)
    
    return simplified_transactions

def save_transactions_to_db(db_path=DB_PATH):
    """
    Save all transactions for each location as a JSON string in the 
    retail_prices column of the location_details table.
    
    Args:
        db_path (str): Path to the SQLite database file
        
    Returns:
        bool: True if successful, False otherwise
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
                
                # Get all transactions for this location
                transactions = get_all_transactions_by_location(location=location_name)
                
                # Skip if no transactions found
                if not transactions:
                    print(f"No transactions found for {location_name}")
                    continue
                
                # Convert transactions to JSON string
                transactions_json = json.dumps(transactions)
                
                print(f"Updating {location_name} with {len(transactions)} transactions")
                
                # Update the location_details table with the transactions JSON
                query = "UPDATE location_details SET retail_prices = ? WHERE location_name = ?"
                cursor.execute(query, (transactions_json, location_name))
            
            # Commit changes
            conn.commit()
            return True
    
    except Exception as e:
        print(f"Error occurred: {e}")
        return False


import random
def test_load_resale_data():
    """Test loading resale data and display summary statistics."""
    print("\n=== Testing Resale Data Loading ===")
    transactions = fetch_all_resale_transactions()
    print(f"Total transactions loaded: {len(transactions)}")
    print(f"Sample data (1 record):")
    print(transactions[0])

def test_unique_districts():
    """Test getting unique districts from the data."""
    print("\n=== Testing Unique Districts ===")
    districts = get_unique_districts()
    print(f"Total unique districts: {len(districts)}")
    print(f"Sample districts: {sorted(districts)[:]}")

def test_average_price_calculation():
    """Test calculating average prices for selected districts."""
    print("\n=== Testing Average Price Calculation ===")
    # Get a few random districts to test
    districts = get_unique_districts()
    test_districts = random.sample(districts, min(5, len(districts)))
    
    for district in test_districts:
        avg_price = calculate_average_resale_price_by_location(district)
        if avg_price:
            print(f"Average price in {district}: ${avg_price:,.2f}")
        else:
            print(f"No data available for {district}")

def test_price_summary():
    """Test generating price summaries for selected districts."""
    print("\n=== Testing Price Summary Generation ===")
    # Get a few random districts to test
    districts = get_unique_districts()
    test_districts = random.sample(districts, min(3, len(districts)))
    
    for district in test_districts:
        summary = generate_resale_price_summary(district)
        if summary:
            print(f"\nSummary for {district}:")
            print(summary)
        else:
            print(f"No data available for {district}")

def test_transactions_by_year():
    """Test filtering transactions by year."""
    print("\n=== Testing Transactions by Year ===")
    # Test for a specific year (e.g., 2022)
    year = 2022
    year_transactions = filter_transactions_by_year(year)
    print(f"Transactions from {year}: {len(year_transactions)}")
    if year_transactions:
        print("Sample transaction:")
        print(year_transactions[0])

def test_database_update():
    """Test the database update function with limited output."""
    print("\n=== Testing Database Price Update ===")
    
    # First, get a few locations from the database to check before values
    with fetch_districts.get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT location_name, price FROM locations LIMIT 5")
        before_rows = cursor.fetchall()
    
    print("Before update (sample of 5 locations):")
    for row in before_rows:
        print(f"- {row['location_name']}: ${row['price'] or 0:,.2f}")
    
    # Update prices in the database
    success = save_price_to_db()
    print(f"\nDatabase update {'successful' if success else 'failed'}")
    
    # Check the same locations after update
    with fetch_districts.get_db_connection() as conn:
        cursor = conn.cursor()
        location_names = [row['location_name'] for row in before_rows]
        placeholders = ', '.join(['?'] * len(location_names))
        cursor.execute(f"SELECT location_name, price FROM locations WHERE location_name IN ({placeholders})", 
                      location_names)
        after_rows = cursor.fetchall()
    
    print("\nAfter update (same locations):")
    for row in after_rows:
        print(f"- {row['location_name']}: ${row['price'] or 0:,.2f}")

if __name__ == "__main__":
    # test_load_resale_data()
    
    # # Test district retrieval
    # test_unique_districts()
    
    # # Test price calculations
    # test_average_price_calculation()
    
    # # Test summary generation
    # test_price_summary()
    
    # # Test year filtering
    # test_transactions_by_year()

    # districts = get_unique_districts()
    # for district in districts:
    #     latest_price = get_latest_resale_price_by_location(district)
    #     print(f"latest price for {district} is {latest_price} ")
    
    # save_resale_price_to_db()
    save_transactions_to_db()
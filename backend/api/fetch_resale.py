import requests
import os
import csv
import sqlite3
import json
import pathlib
from datetime import datetime
import random

from .fetch_districts import DB_PATH, CACHE_DIR

# Constants
DATASET_ID = "d_8b84c4ee58e3cfc0ece0d773c8ca6abc"
API_URL = f"https://data.gov.sg/api/action/datastore_search?resource_id={DATASET_ID}"

# Use absolute paths based on the location of the current script
CACHE_RESALE_DATA_FILE = os.path.join(CACHE_DIR, "hdb_resale_prices.csv")

def fetch_data_from_api():
    """
    Fetch HDB resale price data from the API with pagination and save it directly to SQLite.
    """
    # Create the cache directory if it doesn't exist
    os.makedirs(DB_PATH, exist_ok=True)
    
    # Initialize the database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Fetch data with pagination
    offset = 0
    limit = 1000
    total_records = 0
    
    print(f"Fetching data from API...")
    while True:
        paginated_url = f"{API_URL}&limit={limit}&offset={offset}"
        response = requests.get(paginated_url)
        
        if response.status_code != 200:
            raise Exception(f"Failed to fetch data from API. Status code: {response.status_code}")
        
        data = response.json()
        records = data.get("result", {}).get("records", [])
        
        if not records:
            break
            
        # Insert records into the database
        records_to_insert = []
        for record in records:
            # Convert numeric fields to the right type
            resale_price = float(record.get('resale_price', 0)) if record.get('resale_price') else 0
            
            records_to_insert.append((
                record.get('_id', ''),
                record.get('month', ''),
                record.get('town', ''),
                record.get('flat_type', ''),
                record.get('block', ''),
                record.get('street_name', ''),
                resale_price,
            ))
        
        cursor.executemany('''
        INSERT OR REPLACE INTO resale_transactions 
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', records_to_insert)
        
        conn.commit()
        total_records += len(records)
        offset += limit
        
        print(f"Fetched {total_records} records so far...")
        
        # Check if we've reached the end of the dataset
        if len(records) < limit:
            break
    
    print(f"Successfully fetched {total_records} records from API")
    conn.close()
    return total_records

def _migrate_csv_to_db():
    """
    Migrate existing CSV data to SQLite database.
    Returns the number of records migrated.
    """
    if not os.path.exists(CACHE_RESALE_DATA_FILE):
        return 0

    print(f"Migrating CSV data to SQLite database...")

    # Create the database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("DROP TABLE IF EXISTS resale_transactions")

    print("table dropped")

    # Create the table (with more fields)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS resale_transactions (
        _id TEXT PRIMARY KEY,
        month TEXT,
        town TEXT,
        flat_type TEXT,
        block TEXT,
        street_name TEXT,
        resale_price REAL
    )
    ''')

    # Create indices for common query fields
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_town ON resale_transactions (town)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_month ON resale_transactions (month)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_flat_type ON resale_transactions (flat_type)')

    total_records = 0

    with open(CACHE_RESALE_DATA_FILE, 'r', encoding='utf-8') as f:
        csv_reader = csv.DictReader(f)
        
        batch_size = 5000
        batch = []

        for row in csv_reader:
            try:
                resale_price = float(row.get('resale_price', 0)) if row.get('resale_price') else 0
            except (ValueError, TypeError):
                resale_price = 0

            # Generate a unique _id (can also use UUID)
            unique_id = f"{row.get('month', '')}-{row.get('town', '')}-{row.get('block', '')}-{row.get('street_name', '')}-{resale_price}"
            unique_id = unique_id.replace(" ", "_")  # Ensure no spaces or special characters

            batch.append((
                unique_id,
                row.get('month', ''),
                row.get('town', ''),
                row.get('flat_type', ''),
                row.get('block', ''),
                row.get('street_name', ''),
                resale_price,
            ))

            total_records += 1

            if len(batch) >= batch_size:
                cursor.executemany('''
                INSERT OR REPLACE INTO resale_transactions 
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', batch)
                conn.commit()
                batch = []
                print(f"Migrated {total_records} records so far...")

        # Insert any remaining records
        if batch:
            cursor.executemany('''
            INSERT OR REPLACE INTO resale_transactions 
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', batch)
            conn.commit()

    print(f"Successfully migrated {total_records} records from CSV to database")
    conn.close()
    return total_records


def ensure_db_exists():
    """
    Ensure the SQLite database exists and is populated with data.
    Returns True if database exists or was successfully created.
    """
    if os.path.exists(DB_PATH):
        return True
    
    if os.path.exists(CACHE_RESALE_DATA_FILE):
        return _migrate_csv_to_db() > 0
    else:
        return fetch_data_from_api() > 0

def get_all_transactions_by_location(location_name: str):
    """
    Get all resale transactions for a specific location directly from the database.
    
    Args:
        location_name (str): The location name to get transactions for
        
    Returns:
        list: List of transaction dictionaries for the specified location
    """
    # Ensure the database exists
    if not ensure_db_exists():
        return []
    
    # Query the database
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT month, resale_price, flat_type
    FROM resale_transactions 
    WHERE town = ? 
    ORDER BY month DESC
    ''', (location_name,))
    
    # Convert to list of dictionaries
    simplified_transactions = [
        {
            'month': row['month'], 
            'resale_price': row['resale_price'],
            'flat_type': row['flat_type']
        } 
        for row in cursor.fetchall()
    ]
    
    conn.close()
    return simplified_transactions

def fetch_all_resale_transactions():
    """
    For compatibility with existing code. Returns all transactions.
    WARNING: This will be very memory-intensive for large datasets.
    Consider using get_all_transactions_by_location() instead.
    """
    # Ensure the database exists
    if not ensure_db_exists():
        return []
    
    print("Warning: Fetching all transactions - this may be memory intensive")
    
    # Query all transactions
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM resale_transactions')
    transactions = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return transactions

def calculate_average_resale_price_by_location(location: str):
    """
    Calculate average resale price for a specific location/district using efficient SQL query.
    
    Args:
        location (str): The district/location to calculate average price for
    
    Returns:
        float: Average resale price for the location, or None if no transactions found
    """
    # Ensure the database exists
    if not ensure_db_exists():
        return None
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT AVG(resale_price) as avg_price
    FROM resale_transactions
    WHERE town = ?
    ''', (location,))
    
    result = cursor.fetchone()
    conn.close()
    
    if result and result[0]:
        return round(float(result[0]), 2)
    return None

def get_latest_resale_price_by_location(location: str, flat_type: str = '3 ROOM'):
    """
    Get the latest resale price for a specified flat type in a location using SQL.
    
    Args:
        location (str): The planning area/location to search for
        flat_type (str): The flat type to filter by (default: '3 ROOM')
    
    Returns:
        float: The latest resale price for the specified flat type in the location,
               or None if no matching transactions found
    """
    # Ensure the database exists
    if not ensure_db_exists():
        return None
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT resale_price
    FROM resale_transactions
    WHERE town = ? AND flat_type = ?
    ORDER BY month DESC
    LIMIT 1
    ''', (location, flat_type))
    
    result = cursor.fetchone()
    conn.close()
    
    if result:
        return float(result[0])
    return None

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
    # Ensure the cache database exists
    if not ensure_db_exists():
        return False
    
    try:
        # Open connections to both databases
        app_conn = sqlite3.connect(db_path)
        app_conn.row_factory = sqlite3.Row
        app_cursor = app_conn.cursor()
        
        # Get all location names from the locations table
        app_cursor.execute("SELECT location_name FROM locations")
        locations = app_cursor.fetchall()
        
        # Execute transactions in a batch
        updates = []
        for location in locations:
            location_name = location['location_name']
            
            # Get latest resale price directly from cache DB
            app_cursor.execute('''
            SELECT resale_price
            FROM resale_transactions
            WHERE town = ? AND flat_type = ?
            ORDER BY month DESC
            LIMIT 1
            ''', (location_name, flat_type))
            
            result = app_cursor.fetchone()
            if result:
                latest_price = float(result['resale_price'])
                updates.append((latest_price, location_name))
            if not result:
                updates.append((0, location_name))
        
        # Perform batch update
        app_cursor.executemany("UPDATE locations SET price = ? WHERE location_name = ?", updates)
        app_conn.commit()
        
        # Close connections
        app_conn.close()
        
        print(f"Updated prices for {len(updates)} locations")
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
    # Ensure the database exists
    if not ensure_db_exists():
        return []
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT DISTINCT town FROM resale_transactions')
    districts = [row[0] for row in cursor.fetchall()]
    
    conn.close()
    return districts

def filter_transactions_by_year(year: int):
    """
    Filter resale transactions by a specific year using SQL directly.
    
    Args:
        year (int): The year to filter transactions by
    
    Returns:
        list: List of transactions for the specified year
    """
    # Ensure the database exists
    if not ensure_db_exists():
        return []
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    year_pattern = f"{year}-%"
    cursor.execute('SELECT * FROM resale_transactions WHERE month LIKE ?', (year_pattern,))
    transactions = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return transactions

def generate_resale_price_summary(location: str):
    """
    Generate a summary of resale prices for a specific location using SQL aggregation.
    
    Args:
        location (str): The town/location to generate summary for
    
    Returns:
        dict: Summary statistics for resale prices in the location
    """
    # Ensure the database exists
    if not ensure_db_exists():
        return None
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT 
        COUNT(*) as total_transactions,
        AVG(resale_price) as average_price,
        MIN(resale_price) as min_price,
        MAX(resale_price) as max_price
    FROM resale_transactions
    WHERE town = ?
    ''', (location,))
    
    result = cursor.fetchone()
    conn.close()
    
    if result and result[0] > 0:
        return {
            'location': location,
            'total_transactions': result[0],
            'average_price': round(result[1], 2),
            'min_price': round(result[2], 2),
            'max_price': round(result[3], 2)
        }
    return None

def save_transactions_to_db(db_path=DB_PATH):
    """
    Save all transactions for each location as a JSON string in the 
    retail_prices column of the location_details table.
    
    Args:
        db_path (str): Path to the SQLite database file
        
    Returns:
        bool: True if successful, False otherwise
    """
    # Ensure the cache database exists
    if not ensure_db_exists():
        return False
    
    try:
        # Open connections to both databases
        app_conn = sqlite3.connect(db_path)
        app_conn.row_factory = sqlite3.Row
        app_cursor = app_conn.cursor()
        
        cache_conn = sqlite3.connect(DB_PATH)
        cache_conn.row_factory = sqlite3.Row
        cache_cursor = cache_conn.cursor()
        
        # Get all location names from the locations table
        app_cursor.execute("SELECT location_name FROM locations")
        locations = app_cursor.fetchall()
        
        batch_updates = []
        for location in locations:
            location_name = location['location_name']
            
            # Get transactions for this location directly from cache DB
            cache_cursor.execute('''
            SELECT month, resale_price, flat_type
            FROM resale_transactions
            WHERE town = ?
            ORDER BY month DESC
            ''', (location_name,))
            
            transactions = [
                {'month': row['month'], 'resale_price': row['resale_price'], 'flat_type': row['flat_type']}
                for row in cache_cursor.fetchall()
            ]
            
            if not transactions:
                print(f"No transactions found for {location_name}")
                continue
            
            # Convert transactions to JSON string
            transactions_json = json.dumps(transactions)
            batch_updates.append((transactions_json, location_name))
            print(f"Preparing {location_name} with {len(transactions)} transactions")
        
        # Perform batch update
        app_cursor.executemany(
            "UPDATE location_details SET retail_prices = ? WHERE location_name = ?", 
            batch_updates
        )
        app_conn.commit()
        
        # Close connections
        app_conn.close()
        cache_conn.close()
        
        print(f"Updated transaction data for {len(batch_updates)} locations")
        return True
    
    except Exception as e:
        print(f"Error occurred: {e}")
        return False

# Testing functions
def test_load_resale_data():
    """Test loading resale data and display summary statistics."""
    print("\n=== Testing Resale Data Loading ===")
    
    # Get total count directly from database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM resale_transactions")
    count = cursor.fetchone()[0]
    
    # Get a sample record
    cursor.execute("SELECT * FROM resale_transactions LIMIT 1")
    sample = cursor.fetchone()
    conn.close()
    
    print(f"Total transactions in database: {count}")
    print(f"Sample data (1 record):")
    print(sample)

def test_unique_districts():
    """Test getting unique districts from the data."""
    print("\n=== Testing Unique Districts ===")
    districts = get_unique_districts()
    print(f"Total unique districts: {len(districts)}")
    print(f"Sample districts: {sorted(districts)[:10]}")

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
            for key, value in summary.items():
                print(f"  {key}: {value}")
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
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT location_name, price FROM locations LIMIT 5")
        before_rows = cursor.fetchall()
    
    print("Before update (sample of 5 locations):")
    for row in before_rows:
        price = row['price'] if row['price'] else 0
        print(f"- {row['location_name']}: ${price:,.2f}")
    
    # Update prices in the database
    success = save_resale_price_to_db()
    print(f"\nDatabase update {'successful' if success else 'failed'}")
    
    # Check the same locations after update
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        location_names = [row['location_name'] for row in before_rows]
        placeholders = ', '.join(['?'] * len(location_names))
        cursor.execute(f"SELECT location_name, price FROM locations WHERE location_name IN ({placeholders})", 
                      location_names)
        after_rows = cursor.fetchall()
    
    print("\nAfter update (same locations):")
    for row in after_rows:
        price = row['price'] if row['price'] else 0
        print(f"- {row['location_name']}: ${price:,.2f}")

if __name__ == "__main__":
    # Uncomment to run individual tests
    # test_load_resale_data()
    # test_unique_districts()
    # test_average_price_calculation()
    # test_price_summary()
    # test_transactions_by_year()
    
    # Run price updates
    # save_resale_price_to_db()
    # save_transactions_to_db()

    save_resale_price_to_db()
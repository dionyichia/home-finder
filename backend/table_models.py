import sqlite3

def create_database():
    conn = sqlite3.connect("app.db")  # Single database file
    cursor = conn.cursor()

    # Users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
    ''')

    # Preferences table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS preferences (
        user_id INTEGER PRIMARY KEY,
        crime_rate REAL,
        price REAL,
        num_transport REAL,
        num_malls REAL,
        num_schools REAL,
        importance_rank TEXT,
        FOREIGN KEY (user_id) REFERENCES users (user_id)
    )
    ''')

    # Favourites table - restructured to allow multiple favorites per user
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS favourites (
        favourite_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        location_name TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (user_id),
        FOREIGN KEY (location_name) REFERENCES locations (location_name),
        UNIQUE(user_id, location_name)
    )
    ''')

    # Locations table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS locations (
        location_name TEXT PRIMARY KEY,
        crime_rate REAL,
        price REAL,
        num_transport REAL,
        num_malls REAL,
        num_schools REAL
    )
    ''')

    # Location Details table
    # retail_prices contains JSON data of default retail prices
    # crime TEXT, contains JSON data of location specific major crime updates
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS location_details (
        location_name TEXT PRIMARY KEY,
        coordinates TEXT, 
        retail_prices TEXT, 
        crimes TEXT,
        FOREIGN KEY (location_name) REFERENCES locations (location_name)
    )
    ''')

    # Notifications table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS notifications (
        notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        location_name TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (user_id),
        FOREIGN KEY (location_name) REFERENCES locations (location_name)
    )
    ''')

    # Create the table to store location transactions, csv is too slow
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS resale_transactions (
        _id TEXT PRIMARY KEY,
        month TEXT,
        town TEXT,
        flat_type TEXT,
        block TEXT,
        street_name TEXT,
        resale_price REAL,
    )
    ''')

    conn.commit()
    conn.close()

def reset_preferences_table():
    """Deletes all rows from the preferences table while keeping the structure intact."""
    cursor.execute("DELETE FROM preferences;")  # Clears all data
    conn.commit()  # Commit before running VACUUM
    cursor.execute("VACUUM;")  # Reclaims space
    conn.commit()
    print("Preferences table has been reset.")

def reset_users_table():
    """Deletes all rows from the users table while keeping the structure intact."""
    cursor.execute("DELETE FROM users;")  # Clears all data
    conn.commit()  # Commit before running VACUUM
    cursor.execute("VACUUM;")  # Reclaims space
    conn.commit()
    print("users table has been reset.")


if __name__ == "__main__":
    # create_database()

    # Database connection
    conn = sqlite3.connect("app.db")  # Single database file
    cursor = conn.cursor()

    reset_preferences_table()
    reset_users_table()

    # Close connection
    conn.close()
    
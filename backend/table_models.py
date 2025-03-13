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
    # location_geodata contains jsonified location geodata, i.e. a list of coordinates
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
        crime TEXT,
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

    conn.commit()
    conn.close()

create_database()
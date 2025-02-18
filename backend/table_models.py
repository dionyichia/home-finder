import sqlite3

def create_db():
    conn = sqlite3.connect("data.db")  # Create or open the database
    cursor = conn.cursor()

    # Create table for user preferences
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT,
        location TEXT,
        max_price INTEGER
    )
    ''')

    conn.commit()
    conn.close()

create_db()  # Run the function to create the database

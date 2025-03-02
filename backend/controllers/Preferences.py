import sqlite3
import os

class PreferenceController:
    """
    A class that stores the user's preferences using stateless methods
    """
    
    @staticmethod
    def get_db_path(db_name=':memory:'):
        """Returns the database path based on the provided name"""
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', db_name)
    
    @staticmethod
    def get_user_preferences(user_id: int, db_name='preferences.db'):
        """
        Gets all user preferences from PreferenceDB
        Args: user_id, db_name (optional)
        Return: A dictionary of user preferences or None if not found
        """
        db_path = PreferenceController.get_db_path(db_name)
        
        try:
            # Establish a database connection
            with sqlite3.connect(db_path) as conn:
                cursor = conn.cursor()
                
                # Query to get all preferences for the user
                query = "SELECT user_id, crime_rate, resale_price, num_schools, num_malls, num_transport, importance_rank FROM preferences WHERE user_id = ?"
                cursor.execute(query, (user_id,))
                
                # Fetch the result
                result = cursor.fetchone()
                
                # Return a dictionary of preferences if found, otherwise None
                if result:
                    return {
                        'user_id': result[0],
                        'crime_rate': result[1],
                        'resale_price': result[2],
                        'num_schools': result[3],
                        'num_malls': result[4],
                        'num_transport': result[5],
                        'importance_rank': result[6]
                    }
                return None
        except Exception as e:
            print(f"Error occurred: {e}")
            return None

    @staticmethod
    def add_user_preferences(user_id: int, preferences: list, db_name='preferences.db'):
        """
        Adds or updates user preferences in the PreferenceDB
        Args: user_id, preferences (list containing crime_rate, resale_price, 
            num_schools, num_malls, num_transport, importance_rank),
            db_name (optional)
        Return: True if operation is successful, False if some error occurs.
        """
        db_path = PreferenceController.get_db_path(db_name)
        
        crime_rate = preferences['crime']
        resale_price = preferences['price']
        num_schools = preferences['schools']
        num_malls = preferences['malls']
        num_transport = preferences['transport']
        importance_rank = preferences['importance_rank']

        try:
            # Establish a database connection
            with sqlite3.connect(db_path) as conn:
                cursor = conn.cursor()

                # Check if the user_id exists in the preferences table
                cursor.execute("SELECT COUNT(*) FROM preferences WHERE user_id = ?", (user_id,))
                exists = cursor.fetchone()[0] > 0

                if exists:
                    # Update the existing user preferences
                    update_query = """
                    UPDATE preferences 
                    SET crime_rate = ?, resale_price = ?, 
                        num_schools = ?, num_malls = ?, 
                        num_transport = ?, importance_rank = ? 
                    WHERE user_id = ?
                    """
                    cursor.execute(update_query, (crime_rate, resale_price, 
                                                num_schools, num_malls, 
                                                num_transport, importance_rank, 
                                                user_id))
                else:
                    # Insert the new user preferences into the preferences table
                    insert_query = """
                    INSERT INTO preferences 
                        (user_id, crime_rate, resale_price, 
                        num_schools, num_malls, num_transport, 
                        importance_rank) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """
                    cursor.execute(insert_query, (user_id, crime_rate, resale_price, 
                                                num_schools, num_malls, 
                                                num_transport, importance_rank))

                # Commit the transaction
                conn.commit()
                
            return True
        
        except Exception as e:
            print(f"Error occurred: {e}")
            return False
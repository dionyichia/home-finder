import sqlite3
import os
from typing import List, Dict, Any, Optional

class Favorites:
    @staticmethod
    def get_db_path(db_name='app.db'):
        """Returns the database path based on the provided name"""
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', db_name)
    
    @staticmethod
    def get_favourites(user_id: str, db_name='app.db') -> List[Dict[str, Any]]:
        """
        Get all favorite locations for a specific user.
        
        Args:
            user_id: The ID of the user to get favorites for
            db_name: Name of the database file
            
        Returns:
            A list of dictionaries containing favorite location information
        """
        db_path = Favorites.get_db_path(db_name)
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # This enables column access by name
        cursor = conn.cursor()
        
        try:
            # Join with locations table to get all location details
            cursor.execute('''
                SELECT f.favourite_id, f.location_name, 
                       l.crime_rate, l.price, l.num_transport, l.num_malls, l.num_schools
                FROM favourites f
                JOIN locations l ON f.location_name = l.location_name
                WHERE f.user_id = ?
            ''', (user_id,))
            
            result = [dict(row) for row in cursor.fetchall()]
            return result
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return []
        finally:
            conn.close()
    
    @staticmethod
    def add_to_favorites(user_id: str, location_name: str, db_name='app.db') -> bool:
        """
        Add a location to a user's favorites.
        
        Args:
            user_id: The ID of the user
            location_name: The name of the location to add
            db_name: Name of the database file
            
        Returns:
            Boolean indicating success
        """
        db_path = Favorites.get_db_path(db_name)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            # First check if the location exists
            cursor.execute('SELECT location_name FROM locations WHERE location_name = ?', (location_name,))
            if not cursor.fetchone():
                print(f"Location '{location_name}' does not exist")
                return False
            
            # Add to favorites
            cursor.execute('''
                INSERT INTO favourites (user_id, location_name)
                VALUES (?, ?)
            ''', (user_id, location_name))
            
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            # This will catch the UNIQUE constraint violation if the user already has this location favorited
            print(f"Location '{location_name}' already in favorites for user {user_id}")
            return False
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    @staticmethod
    def remove_from_favourites(user_id: str, location_name: str, db_name='app.db') -> bool:
        """
        Remove a location from a user's favorites.
        
        Args:
            user_id: The ID of the user
            location_name: The name of the location to remove
            db_name: Name of the database file
            
        Returns:
            Boolean indicating success
        """
        db_path = Favorites.get_db_path(db_name)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                DELETE FROM favourites
                WHERE user_id = ? AND location_name = ?
            ''', (user_id, location_name))
            
            if cursor.rowcount == 0:
                # No rows were deleted, meaning the favorite didn't exist
                print(f"Location '{location_name}' was not in favorites for user {user_id}")
                return False
            
            conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    @staticmethod
    def count_user_favourites(user_id: str, db_name='app.db') -> int:
        """
        Count how many favorites a user has.
        
        Args:
            user_id: The ID of the user
            db_name: Name of the database file
            
        Returns:
            Number of favorites the user has
        """
        db_path = Favorites.get_db_path(db_name)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('SELECT COUNT(*) FROM favourites WHERE user_id = ?', (user_id,))
            count = cursor.fetchone()[0]
            return count
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return 0
        finally:
            conn.close()
    
    @staticmethod
    def is_favorite(user_id: str, location_name: str, db_name='app.db') -> bool:
        """
        Check if a location is in a user's favorites.
        
        Args:
            user_id: The ID of the user
            location_name: The name of the location to check
            db_name: Name of the database file
            
        Returns:
            Boolean indicating if the location is a favorite
        """
        db_path = Favorites.get_db_path(db_name)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT 1 FROM favourites
                WHERE user_id = ? AND location_name = ?
                LIMIT 1
            ''', (user_id, location_name))
            
            return cursor.fetchone() is not None
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return False
        finally:
            conn.close()
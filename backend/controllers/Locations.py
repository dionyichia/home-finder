from api import fetch_districts
from controllers import Preferences, Scoring
import os
import sqlite3

class LocationsController:

    @staticmethod
    def get_db_path(db_name=':memory:'):
        """Returns the database path based on the provided name"""
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', db_name)

    @staticmethod
    def get_locations(db_name='app.db'):
        """
        SQL Query for DB data for all locations

        Return: List of dicts, each location 1 dict
        """
        db_path = LocationsController.get_db_path(db_name)

        try:
            all_location_details = []
            # Establish a database connection
            with sqlite3.connect(db_path) as conn:
                # Set row_factory to get dictionaries instead of tuples
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()

                # Query to get all locations
                query = "SELECT * FROM locations"
                cursor.execute(query)
                
                # Fetch all results and convert to dictionaries
                rows = cursor.fetchall()
                
                if rows:
                    for row in rows:
                        # Convert each sqlite3.Row to a dictionary
                        location_details = dict(row)

                        # Get location's geojson data
                        location_details["geojson"] = fetch_districts.get_location_geodata(location_details['location_name'])

                        all_location_details.append(location_details)
                
                        return all_location_details

                else:
                    return []
                

        except Exception as e:
            print(f"Error occurred: {e}")
            return []

    @staticmethod
    def get_location(location_name, db_name='app.db'):
        """
        SQL Query for DB data for single location

        Return: 1 dict of location or None if not found
        """
        db_path = LocationsController.get_db_path(db_name)

        try:
            # Establish a database connection
            with sqlite3.connect(db_path) as conn:
                # Set row_factory to get dictionary instead of tuple
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()

                # Query to get location by name
                query = "SELECT * FROM locations WHERE location_name = ?"
                cursor.execute(query, (location_name,))
                
                # Fetch the result
                result = cursor.fetchone()

                if result:
                    # Convert sqlite3.Row to dictionary
                    return dict(result)
                else:
                    return None

        except Exception as e:
            print(f"Error occurred: {e}")
            return None
        
    def get_all_locations_geojson():
        """
        Return: List of dicts, each location 1 dict
        """
        return fetch_districts.get_all_locations_geodata()


    @staticmethod
    def sort_by_category(sorting_category, user_id=None):
        """
        Return: A list of tuples, (ranked location, their score)
        """

        locations = LocationsController.get_locations()

        if sorting_category == 'score':
            if not user_id:
                return None
            else:
                preferences = Preferences.PreferenceContoller.get_user_preferences(user_id=user_id)
                return Scoring.ScoringController.assign_score_n_rank_all_locations(locations=locations, category='score', preferences=preferences)
            
        else:
            return Scoring.ScoringController.assign_score_n_rank_all_locations(locations=locations, category=sorting_category)
            

    def summarised_details(location: str, sorting_category='price'):
        """
        WHEN WILL U EVER NEED THIS??

        Get the summarised details of the location.
        Sumarised details include: 
        1. Category Rank
        2. Category score, i.e. if Price score
        3. Average price of housing

        Return: A dict, (top 5 locations, their score) 
        """
        pass
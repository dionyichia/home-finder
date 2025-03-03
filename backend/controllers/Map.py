import Locations
import os

"""
Used to interface with saved location geodata and other data cached from onemap api
"""

class Map:
    @staticmethod
    def get_db_path(db_name=':memory:'):
        """Returns the database path based on the provided name"""
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', db_name)

    @staticmethod
    def get_location_geo_data(location_name: str):
        """
        Return a list of geo_data (points)
        """
        pass
    
    @staticmethod
    def get_all_locations_geo_data():
        """
        Return a dict, location name: geo_data
        """
        pass

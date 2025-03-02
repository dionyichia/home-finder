import api
import Preferences
import Scoring

class LocationsController:
    def __init__(self):
        pass

    @staticmethod
    def get_locations():
        """
        SQL Query for DB data for all locations

        Return: List of dicts, each location 1 dict
        """
        pass
    
    def get_location(location_name):
        """
        SQL Query for DB data for single location

        Return: 1 dict of locations
        """
        pass

    @staticmethod
    def sort_by_category(sorting_category, user_id):
        """
        Return: A tuple, (ranked locations, their score)
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


class LocationsDetailController:
    """
    On call, function gets location details from multiple caches
    Eliminates the need for a specific LocationsDetailsDB

    """

    @staticmethod
    def get_location_details(location_name: str) -> dict:
        """
        SQL Query for DB data for single location details

        Args: Unique Location Name
        Return: Dict containing location details
        
        """

        """"""
        location = LocationsController.get_location(location_name=location_name)

        # Get Location Details
        past_resale_prices = location

        # Get Price Trend Graph
        price = PricePlotterClass.plot_price_trend(past_resale_prices)

        # Get crimes and crime_rate
        crimes = api.fetch_crimes.fetch_all_crimes_by_location(location=location_name)
        crime_rate = location.get('crime_rate', 0.00)

        # Get nums schools /and distance to nearest schools
        schools = location.get('schools', 0)
        # api.fetch_district.fetch_all_schools_by_location() , havent do

        # Get malls /and distance to nearest schools
        malls = location.get('malls', 0)

        # Score Location according to preferences
        all_locations = LocationsController.get_locations()

        # Check if user has registered !!!! If no default to price, if yes change to score

        all_location_scored = Scoring.ScoringController.assign_score_n_rank_all_locations(all_locations, category='score')
        for location, score in all_location_scored:
            if location.get('name') == location_name:
                location_score = score
                break

        return {
            'price': price,
            'crime': crimes,
            'crime_rate': crime_rate,
            'schools': schools,
            'malls': malls,
            'score': location_score,
        }

class PricePlotterClass:

    @staticmethod
    def plot_price_trend(past_resale_prices):
        """
        Plot the price trend of resale prices for a given location.
        Args: Takes in past resale prices, plot graph of time vs price for ave 3 room flat
        Returns: 
        """
        pass


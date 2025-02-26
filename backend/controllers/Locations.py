import api
import Preferences, Scoring
import api.fetch_crimes


class LocationsController:
    def __init__(self):
        pass

    @staticmethod
    def get_locations():
        """
        SQL Query for DB data
        """
        pass

    def sortByPrice():
        """
        SQL Query for DB data
        """
        pass

    @staticmethod
    def sort_by_crime_rate():
        """
        Return: List of all locations ranked by crime rate
        """
        pass

    def sortBySchools():
        pass

    def sortByMalls():
        pass

    def sortByScore(user_id):
        """
        Get top 5 locations, their score and summarised details
        """
        all_locations = LocationsController.get_locations()
        importance_rank = Preferences.PreferenceContoller.get_user_preference(user_id=user_id)
        top5_ranked_locations = Scoring.ScoringController.assign_score_to_all_locations(all_locations, category='score', importance_rank=importance_rank)

        return top5_ranked_locations

    def summarised_details(location: str, sort_by='price'):
        """
        Get the summarised details of the location.
        Sumarised details include: 
        1. Category Rank
        2. Category score, i.e. if Price score
        3. Average price of housing
        """
        
        pass


class LocationsDetailController:
    """
    
    """
    def __init__(self):
        """
        Composition relationship for PricePlotter
        """
        self.price = None
        self.crime = None
        self.crime_rate = None
        self.schools = None
        self.malls = None
        self.score = None
        pass

    def get_location_details(self, location_name: str) -> dict:
        """
        Args: Unique Location Name
        Return: Dict containing location details
        
        """

        # Get Location Details

        past_resale_prices = [(0,0)]

        # Get Price Trend Graph
        price = PricePlotterClass.plot_price_trend(past_resale_prices)

        # Get crimes and crime_rate from LocationDetails table
        crimes = api.fetch_crimes.fetch_all_crimes_by_location(location=location_name)
        crime_rate = api.fetch_crimes.fetch_crime_rate_by_location(location_name=location_name)

        # Get schools from LocationDetails table
        schools = None

        # Get malls from LocationDetails table
        malls = None

        # Score Location according to preferences
        all_locations = LocationsController.get_locations()
        all_location_scored = Scoring.ScoringController.assign_score_to_all_locations(locations=all_locations)
        for location in all_location_scored:
            if location.get('name') == location_name:
                location_score = location.get('score') 
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
    def __init__(self):
        pass

    @staticmethod
    def plot_price_trend(past_resale_prices):
        """
        Plot the price trend of resale prices for a given location.
        Args: Takes in past resale prices, plot graph of time vs price for ave 3 room flat
        Returns: 
        """
        pass


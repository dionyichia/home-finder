class PreferenceContoller:
    """
    A class that stores the user's preferences
    """
        
    def __init__(self, user_preferences: dict):
        self.user_preferences = user_preferences
        pass

class ScoringController(PreferenceContoller):
    """
    A utility subclass that extends PreferenceContoller.
    This class calculates and assigns scores given to each location based on the users' preferences.
    """

    def __init__(self, user_preferences: dict):
        super().__init__(user_preferences)
        # If weights not provided stick to default rankings
        self.weights = self.user_preferences.get('priorityWeights', ['price', 'crime', 'transport', 'schools', 'malls'])

    def compute_score_for_location(self, location_data):
        """
        Compute the score for a single location based on user preferences.
        """
        pass

    def compute_score_for_list_of_locations(self, locations_data):
        """
        Compute scores for multiple locations.
        """
        pass
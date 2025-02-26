import Locations, Preferences

class ScoringController:
    def __init__(self, importance_rank):
        """
        Upon registering, take importance rank and set it as attribute of scoring class. 
        """
        self.importance_rank = importance_rank
        self.weights = [1, 0.75, 0.5, 0.25] 


    @staticmethod
    def assign_score_to_all_locations(locations, category='price', importance_rank=['price', 'crime', 'transport', 'schools', 'malls']):
        """
        Used for filter by category 
        Assigns a category score to a list of locations. 
        If the category is 'score', user is registered and top5 locations is returned instead.
        Else, user is not registered.

        Args: Category used for filter, default is price
        Return: If unregistered, All locations ranked by category score. If registered, top 5 locations ranked by score.

        Assumptions: Assumes an importance rank of ['price', 'crime', 'transport', 'schools', 'malls']
        Chosen category assumes rank 1, followed by rest in the same order as above. 
        """

        scored_and_ranked_locations = {}

        # Alter list of importance rank, make the categroy rank 1
        if category != 'score':
            importance_rank.remove(category)
            importance_rank.insert(0, category)

        match category:

            case 'crime':
                pass

            case 'schools':
                pass

            case 'malls':
                pass

            case 'transport':
                pass

            # Return top 5 locations, scored by user's importance rank
            case 'score':
                

                return scored_and_ranked_locations

            # Default Price
            case _:

                pass


        return scored_and_ranked_locations

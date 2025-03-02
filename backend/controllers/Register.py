from controllers import User, Preferences

class RegisterController:
    def register_new_user(username: str, email: str, password: str, preferences: list):
        """
        Function to register a new user
        """

        try: 
            user_id = User.UserController.create_new_user(username=username, email=email, password=password)
            Preferences.PreferenceController.add_user_preferences(user_id=user_id, preferences=preferences)
            # one more into favourite db

            return True
        except Exception as e:
            print(f"Error occurred: {e}")
            return False
        
    def change_user_details(user_id: int, preferences: list):
        """
        Args: UserID, Updated Prefereneces list
        Return: True if changed, False if error
        """

        try:
            Preferences.PreferenceController.add_user_preferences(user_id=user_id, preferences=preferences)

            return True
        except Exception as e:
            print(f"Error occurred: {e}")
            return None
        
    def check_if_user_does_not_exist(username: str, email: str):
        """
        Return: True if user is not found
        """

        return True

    def verify_user(username: str, email: str, password: str):
        pass
    

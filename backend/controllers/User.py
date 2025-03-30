import sqlite3
import os
from controllers import Preferences

class UserController:
    @staticmethod
    def get_db_path(db_name='app.db'):
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', db_name)

    @staticmethod
    def create_new_user(username: str, email: str, password: str, preferences: list) -> int:
        """
        Register a new user and set their preferences.

        Returns: UserID if insertion is successful, None if an error occurs.
        """
        db_path = UserController.get_db_path()
        
        try:
            with sqlite3.connect(db_path) as conn:
                cursor = conn.cursor()
                
                # Insert the new user into the database
                insert_query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
                cursor.execute(insert_query, (username, email, password))
                
                # Get the generated user ID
                user_id = cursor.lastrowid
                
                # Commit the transaction
                conn.commit()

            # Add user preferences
            Preferences.PreferenceController.add_user_preferences(user_id=user_id, preferences=preferences)

            return user_id
        except Exception as e:
            print(f"Error occurred: {e}")
            return None

    @staticmethod
    def change_user_details(user_id: int, new_username: str, new_user_email: str, new_password: str, preferences: list):
        """
        Updates user details and preferences, skipping empty fields.

        Returns: True if updated, False if error.
        """
        db_path = UserController.get_db_path()
        
        try:
            with sqlite3.connect(db_path) as conn:
                cursor = conn.cursor()

                # Check if the user_id exists
                cursor.execute("SELECT username, email, password FROM users WHERE user_id = ?", (user_id,))
                result = cursor.fetchone()
                
                if not result:
                    print(f"Error occurred: User not found in users")
                    return False
                    
                current_username, current_email, current_password = result
                
                # Only update non-empty fields
                update_parts = []
                params = []
                
                if new_username != "":
                    update_parts.append("username = ?")
                    params.append(new_username)
                
                if new_user_email != "":
                    update_parts.append("email = ?")
                    params.append(new_user_email)
                
                if new_password != "":
                    update_parts.append("password = ?")
                    params.append(new_password)
                
                # Only proceed with user update if there are fields to update
                if update_parts:
                    update_query = f"""
                    UPDATE users 
                    SET {', '.join(update_parts)}
                    WHERE user_id = ?
                    """
                    params.append(user_id)
                    cursor.execute(update_query, params)
                    conn.commit()
                
            # Update preferences regardless of user detail changes
            if preferences:
                Preferences.PreferenceController.add_user_preferences(user_id=user_id, preferences=preferences)
                
            return True
        except Exception as e:
            print(f"Error occurred: {e}")
            return str(e)
        
    @staticmethod
    def check_user_existence(username: str, email: str):
        """
        Checks if a user exists based on the provided username or email.
        
        Returns:
            - None if the user does not exist.
            - A string indicating whether the username or email already exists.
        """
        db_path = UserController.get_db_path()
        
        try:
            with sqlite3.connect(db_path) as conn:
                cursor = conn.cursor()
                query = "SELECT username, email FROM users WHERE username = ? OR email = ?"
                cursor.execute(query, (username, email))
                user = cursor.fetchone()
                
                if user:
                    existing_username, existing_email = user
                    if existing_username == username:
                        return "Username already exists."
                    if existing_email == email:
                        return "Email already exists."
            
            return None
        except Exception as e:
            print(f"Error occurred: {e}")
            return "Error checking user existence."

    @staticmethod
    def verify_user(username_or_email: str, password: str):
        """
        Verifies user login credentials.

        Returns: User ID if valid, None otherwise.
        """
        db_path = UserController.get_db_path()
        
        try:
            with sqlite3.connect(db_path) as conn:
                cursor = conn.cursor()
                query = "SELECT user_id FROM users WHERE (username = ? OR email = ?) AND password = ?"
                cursor.execute(query, (username_or_email, username_or_email, password))
                result = cursor.fetchone()
                
                if result:
                    return result[0]  # Return the user_id
                return None
            
        except Exception as e:
            print(f"Error occurred: {e}")
            return None

    @staticmethod
    def delete_user(user_id: int) -> bool:
        """
        Deletes a user and all associated data (preferences, favorites, notifications).
        
        Returns: True if deletion is successful, False if an error occurs.
        """
        db_path = UserController.get_db_path()
        
        try:
            with sqlite3.connect(db_path) as conn:
                cursor = conn.cursor()
                
                # Start transaction
                cursor.execute("BEGIN TRANSACTION")
                
                # Delete from preferences table
                cursor.execute("DELETE FROM preferences WHERE user_id = ?", (user_id,))
                
                # Delete from favourites table
                cursor.execute("DELETE FROM favourites WHERE user_id = ?", (user_id,))
                
                # Delete from notifications table
                cursor.execute("DELETE FROM notifications WHERE user_id = ?", (user_id,))
                
                # Finally delete the user
                cursor.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
                
                # Commit transaction
                cursor.execute("COMMIT")
                
                return True
        except Exception as e:
            print(f"Error occurred during user deletion: {e}")
            
            # Roll back transaction if an error occurs
            try:
                cursor.execute("ROLLBACK")
            except:
                pass
                
            return False
        
    @staticmethod
    def get_user_id(username: str, email: str):
        """
        Get a user's ID by their username and email.
        
        Returns: User ID if found, None if not found or an error occurs.
        """
        db_path = UserController.get_db_path()
        
        try:
            with sqlite3.connect(db_path) as conn:
                cursor = conn.cursor()
                query = "SELECT user_id FROM users WHERE username = ? AND email = ?"
                cursor.execute(query, (username, email))
                result = cursor.fetchone()
                
                if result:
                    return result[0]
                return None
        except Exception as e:
            print(f"Error occurred: {e}")
            return None
        
    @staticmethod
    def get_user_login_details(user_id: int) -> dict:
        """
        Get user details by ID.
        
        Returns: Dict with user details if found, None if not found or an error occurs.
        """
        db_path = UserController.get_db_path()
        
        try:
            with sqlite3.connect(db_path) as conn:
                cursor = conn.cursor()
                query = "SELECT user_id, username, email FROM users WHERE user_id = ?"
                cursor.execute(query, (user_id,))
                result = cursor.fetchone()
                
                if result:
                    return {
                        "user_id": result[0],
                        "username": result[1],
                        "email": result[2]
                    }
                return None
        except Exception as e:
            print(f"Error occurred: {e}")
            return None
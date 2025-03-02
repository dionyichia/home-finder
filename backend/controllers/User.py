import sqlite3
import os

class UserController:
    @staticmethod
    def get_db_path(db_name=':memory:'):
        # Set the database path to the parent folder
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', db_name)

    @staticmethod
    def create_new_user(username: str, email: str, db_name='users.db') -> int:
        """
        Add a new user into the UserDB with some SQL commands.

        Return: UserID if insertion is successful, None if some error occurs.
        """
        db_path = UserController.get_db_path(db_name)
        
        try:
            # Establish a database connection
            with sqlite3.connect(db_path) as conn:
                cursor = conn.cursor()
                
                # Insert the new user into the UserDB
                insert_query = "INSERT INTO users (userid, username, email) VALUES (NULL, ?, ?)"
                cursor.execute(insert_query, (username, email))
                
                # Get the auto-generated user ID
                user_id = cursor.lastrowid
                
                # Commit the transaction
                conn.commit()
                
            return user_id
        except Exception as e:
            print(f"Error occurred: {e}")
            return None
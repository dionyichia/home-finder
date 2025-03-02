import sqlite3
import os

class UserController:
    def __init__(self, db_name=':memory:'):
        # Set the database path to the parent folder
        self.db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', db_name)

    def create_new_user(self, username: str, email: str) -> int:
        """
        Add a new user into the UserDB with some SQL commands.

        Return: UserID if insertion is successful, None if some error occurs.
        """
        try:
            # Establish a database connection
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Insert the new user into the UserDB
                insert_query = "INSERT INTO UserDB (userid, username, email) VALUES (NULL, ?, ?)"
                cursor.execute(insert_query, (username, email))
                
                # Commit the transaction
                conn.commit()


            
                
            return True
        except Exception as e:
            print(f"Error occurred: {e}")
            return False
        
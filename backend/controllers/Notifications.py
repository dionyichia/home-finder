import sqlite3
import os
from typing import List, Dict, Any, Optional

class NotificationsController:
    @staticmethod
    def get_db_path(db_name='app.db'):
        """Returns the database path based on the provided name"""
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', db_name)
    
    @staticmethod
    def enable_notification(user_id: str, location_name: str, db_name='app.db') -> bool:
        """
        Enable notifications for a user for a specific location.
        If not already enabled, creates a new notification record with status 'enabled'.
        
        Args:
            user_id: The ID of the user
            location_name: The name of the location
            db_name: Name of the database file
            
        Returns:
            Boolean indicating success
        """
        db_path = NotificationsController.get_db_path(db_name)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            # Check if a notification record already exists
            cursor.execute('''
                SELECT notification_id, status FROM notifications 
                WHERE user_id = ? AND location_name = ?
            ''', (user_id, location_name))
            
            result = cursor.fetchone()
            
            if result:
                # Record exists, update status if needed
                notification_id, status = result
                if status == 'disabled':
                    cursor.execute('''
                        UPDATE notifications 
                        SET status = 'enabled' 
                        WHERE notification_id = ?
                    ''', (notification_id,))
            else:
                # No record exists, create a new one
                cursor.execute('''
                    INSERT INTO notifications (user_id, location_name, status)
                    VALUES (?, ?, 'enabled')
                ''', (user_id, location_name))
            
            conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    @staticmethod
    def disable_notification(user_id: str, location_name: str, db_name='app.db') -> bool:
        """
        Disable notifications for a user for a specific location.
        If enabled, sets status to 'disabled'.
        
        Args:
            user_id: The ID of the user
            location_name: The name of the location
            db_name: Name of the database file
            
        Returns:
            Boolean indicating success
        """
        db_path = NotificationsController.get_db_path(db_name)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            # Check if a notification record exists
            cursor.execute('''
                SELECT notification_id, status FROM notifications 
                WHERE user_id = ? AND location_name = ?
            ''', (user_id, location_name))
            
            result = cursor.fetchone()
            
            if result:
                # Record exists, update status if needed
                notification_id, status = result
                if status == 'enabled':
                    cursor.execute('''
                        UPDATE notifications 
                        SET status = 'disabled' 
                        WHERE notification_id = ?
                    ''', (notification_id,))
                    conn.commit()
                return True
            else:
                # No record exists, nothing to disable
                return False
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    @staticmethod
    def send_notification(location_name: str, notification_type: str, db_name='app.db') -> List[str]:
        """
        Send notifications to all users who have enabled notifications for the location.
        
        Args:
            location_name: The name of the location
            notification_type: The type of notification (price, crime, schools, malls, transport)
            db_name: Name of the database file
            
        Returns:
            List of user IDs who were notified
        """
        # Validate notification type
        valid_types = ['price', 'crime', 'schools', 'malls', 'transport']
        if notification_type not in valid_types:
            print(f"Invalid notification type: {notification_type}. Must be one of {valid_types}")
            return []
        
        db_path = NotificationsController.get_db_path(db_name)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            # Get all users who have enabled notifications for this location
            cursor.execute('''
                SELECT user_id FROM notifications
                WHERE location_name = ? AND status = 'enabled'
            ''', (location_name,))
            
            user_ids = [row[0] for row in cursor.fetchall()]
            
            # In a real application, this would connect to a notification service
            # Here we just return the list of users who would be notified
            print(f"Sending {notification_type} update for {location_name} to {len(user_ids)} users")
            
            # Record the notification in a notifications history table if you have one
            # This is optional but useful for tracking
            
            return user_ids
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return []
        finally:
            conn.close()
    
    @staticmethod
    def get_user_notifications(user_id: str, db_name='app.db') -> List[Dict[str, Any]]:
        """
        Get all locations for which a user has enabled notifications.
        
        Args:
            user_id: The ID of the user
            db_name: Name of the database file
            
        Returns:
            List of dictionaries with notification information
        """
        db_path = NotificationsController.get_db_path(db_name)
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # This enables column access by name
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT n.notification_id, n.location_name, n.status,
                       l.crime_rate, l.price, l.num_transport, l.num_malls, l.num_schools
                FROM notifications n
                JOIN locations l ON n.location_name = l.location_name
                WHERE n.user_id = ? AND n.status = 'enabled'
            ''', (user_id,))
            
            result = [dict(row) for row in cursor.fetchall()]
            return result
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return []
        finally:
            conn.close()
    
    @staticmethod
    def get_notification_status(user_id: str, location_name: str, db_name='app.db') -> str:
        """
        Check if notifications are enabled for a user and location.
        
        Args:
            user_id: The ID of the user
            location_name: The name of the location
            db_name: Name of the database file
            
        Returns:
            Status string ('enabled', 'disabled', or 'not_set')
        """
        db_path = NotificationsController.get_db_path(db_name)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT status FROM notifications
                WHERE user_id = ? AND location_name = ?
            ''', (user_id, location_name))
            
            result = cursor.fetchone()
            if result:
                return result[0]
            return 'not_set'
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return 'error'
        finally:
            conn.close()
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
    def create_notification_log(location_name: str, notification_type: str, message: str, db_name='app.db') -> int:
        """
        Create a new notification log entry.
        
        Args:
            location_name: The name of the location
            notification_type: The type of notification (price, crime, schools, malls, transport)
            message: The notification message
            db_name: Name of the database file
            
        Returns:
            ID of the created notification log or -1 if failed
        """
        # Validate notification type
        valid_types = ['price', 'crime', 'schools', 'malls', 'transport']
        if notification_type not in valid_types:
            print(f"Invalid notification type: {notification_type}. Must be one of {valid_types}")
            return -1
        
        db_path = NotificationsController.get_db_path(db_name)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO notification_logs (type, location_name, message, sent)
                VALUES (?, ?, ?, 0)
            ''', (notification_type, location_name, message))
            
            notification_id = cursor.lastrowid
            conn.commit()
            return notification_id
        except sqlite3.Error as e:
            print(f"Database error when creating notification log: {e}")
            conn.rollback()
            return -1
        finally:
            conn.close()

    @staticmethod
    def process_notifications():
        """Process all unsent notifications and send them to users"""
        notifications_sent = 0
        unsent_notifications = NotificationsController.get_unsent_notifications()
        
        print(f"Found {len(unsent_notifications)} unsent notifications")
        
        for notification in unsent_notifications:
            print(f"Processing notification: {notification['notification_id']} - {notification['message']}")
            notified_users = NotificationsController.send_notification(
                notification['location_name'], 
                notification['type']
            )
            
            if notified_users:
                print(f"Sent notification to {len(notified_users)} users")
                notifications_sent += 1
            else:
                print("No users to notify")
        
        print(f"Processed {notifications_sent}/{len(unsent_notifications)} notifications")
        return notifications_sent
        
    @staticmethod
    def get_unsent_notifications(user_id: int, db_name='app.db') -> List[dict]:
        """
        Find all unsent notifications for a specific user who has enabled notifications
        for those locations.
        
        Args:
            user_id: ID of the user to get notifications for
            db_name: Name of the database file
            
        Returns:
            List of dictionaries containing notification details
        """
        db_path = NotificationsController.get_db_path(db_name)
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # This allows accessing columns by name
        cursor = conn.cursor()
        
        unsent_notifications = []
        
        try:
            # Get locations where this user has enabled notifications
            cursor.execute('''
                SELECT location_name FROM notifications
                WHERE user_id = ? AND status = 'enabled'
            ''', (user_id,))
            
            enabled_locations = [row['location_name'] for row in cursor.fetchall()]
            
            if not enabled_locations:
                return []  # User hasn't enabled notifications for any locations
            
            # Get all unsent notifications for locations this user cares about
            placeholder = ','.join(['?'] * len(enabled_locations))
            query = f'''
                SELECT notification_id, type, location_name, message, created_at
                FROM notification_logs
                WHERE sent = 0 AND location_name IN ({placeholder})
                ORDER BY created_at DESC
            '''
            
            cursor.execute(query, enabled_locations)
            notifications = cursor.fetchall()
            
            # Format each notification for the response
            for notification in notifications:
                unsent_notifications.append({
                    'notification_id': notification['notification_id'],
                    'type': notification['type'],
                    'location_name': notification['location_name'],
                    'message': notification['message'],
                    'created_at': notification['created_at']
                })
                
                # Optionally mark as sent for this user
                # If you want to track which users have seen which notifications,
                # you would need an additional table for that purpose
                
            return unsent_notifications
        except sqlite3.Error as e:
            print(f"Database error when getting unsent notifications for user {user_id}: {e}")
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
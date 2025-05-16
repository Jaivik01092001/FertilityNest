import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useToast } from '@chakra-ui/react';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';

// Create context
const NotificationContext = createContext();

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  
  const { user, token } = useAuth();
  const toast = useToast();
  
  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (user && token) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token
        }
      });
      
      setSocket(newSocket);
      
      // Clean up on unmount
      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, token]);
  
  // Set up socket event listeners
  useEffect(() => {
    if (socket && user) {
      // Join user's personal room
      socket.emit('join', user._id);
      
      // Listen for new notifications
      socket.on('receiveNotification', (notification) => {
        // Add new notification to state
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast for high priority notifications
        if (notification.priority === 'high' || notification.priority === 'urgent') {
          toast({
            title: notification.title,
            description: notification.message,
            status: notification.priority === 'urgent' ? 'error' : 'warning',
            duration: notification.priority === 'urgent' ? 9000 : 5000,
            isClosable: true,
            position: 'top-right'
          });
        }
      });
      
      // Listen for distress alerts
      socket.on('distressAlert', (data) => {
        toast({
          title: 'URGENT: Distress Signal',
          description: `${data.senderName} needs your immediate attention!`,
          status: 'error',
          duration: null,
          isClosable: true,
          position: 'top',
          variant: 'solid'
        });
      });
      
      // Clean up listeners on unmount
      return () => {
        socket.off('receiveNotification');
        socket.off('distressAlert');
      };
    }
  }, [socket, user, toast]);
  
  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);
  
  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/notifications`);
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.notifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/notifications/read-all`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${API_URL}/notifications/${notificationId}`);
      
      // Update local state
      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );
      
      // Update unread count if needed
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Send distress signal
  const sendDistressSignal = async (message, location) => {
    try {
      if (socket) {
        // Emit distress signal to server
        socket.emit('distressSignal', {
          userId: user._id,
          partnerId: user.partnerId,
          message,
          location,
          timestamp: new Date()
        });
      }
      
      // Also send via API for reliability
      await axios.post(`${API_URL}/partners/distress`, {
        message,
        location
      });
      
      toast({
        title: 'Distress Signal Sent',
        description: 'Your emergency contacts have been notified.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error sending distress signal:', error);
      
      toast({
        title: 'Error Sending Distress Signal',
        description: 'Please try again or call emergency services directly.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
      
      return { success: false, error };
    }
  };
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        socket,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        sendDistressSignal
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;

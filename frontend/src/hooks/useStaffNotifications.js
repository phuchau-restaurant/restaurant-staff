import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { showNotificationWithSound, requestNotificationPermission } from '../utils/notificationSound';

/**
 * Custom hook to manage staff notifications via Socket.IO
 * Listens for customer call events and plays notification sounds
 */
export const useStaffNotifications = () => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Get token and setup socket connection
    const token = localStorage.getItem('token'); // Adjust based on your auth implementation
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    if (!token) {
      console.warn('No token found, cannot connect to socket');
      return;
    }

    // Create socket connection
    const newSocket = io(backendUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      setIsConnected(false);
    });

    // Listen for customer call events
    newSocket.on('staff:customer_call', (data) => {
      console.log('🔔 Customer call received:', data);
      
      // Add notification to list
      const notification = {
        id: Date.now(),
        ...data,
        read: false
      };
      
      setNotifications(prev => [notification, ...prev]);
      
      // Play notification sound and show browser notification
      showNotificationWithSound({
        title: '🔔 Khách hàng cần hỗ trợ!',
        body: data.message,
        soundType: 'double'
      });
      
      // Auto-remove after 30 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 30000);
    });

    setSocket(newSocket);

    // Request notification permission on mount
    requestNotificationPermission();

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  // Clear notification
  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    socket,
    isConnected,
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    markAsRead,
    clearNotification,
    clearAllNotifications
  };
};

export default useStaffNotifications;

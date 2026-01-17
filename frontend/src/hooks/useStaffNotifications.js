import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { showNotificationWithSound, requestNotificationPermission } from '../utils/notificationSound';

/**
 * Custom hook to manage staff notifications via Socket.IO
 * Uses existing SocketContext instead of creating new connection
 */
export const useStaffNotifications = () => {
  const { socket, isConnected } = useSocket(); // Use existing socket from context
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!socket || !isConnected) {
      console.warn('Socket not connected yet');
      return;
    }

    console.log('🔔 Setting up staff notification listeners');

    // Join waiters room to receive notifications
    const userId = localStorage.getItem('userId') || 'waiter';
    socket.emit('join_waiter', userId);
    console.log('🏠 Joined waiters room with user:', userId);

    // Listen for customer call events
    const handleCustomerCall = (data) => {
      console.log('🔔 Customer call received:', data);
      
      const notification = {
        id: Date.now(),
        type: 'service',
        requestType: 'service',
        ...data,
        read: false,
        timestamp: data.timestamp || new Date().toISOString()
      };
      
      setNotifications(prev => [notification, ...prev]);
      
      showNotificationWithSound({
        title: '🔔 Khách hàng cần hỗ trợ!',
        body: data.message || `Bàn ${data.tableNumber} cần hỗ trợ`,
        soundType: 'double'
      });
      
      // Auto-remove after 30 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 30000);
    };

    // Listen for payment request events (from Customer Backend webhook)
    const handlePaymentRequest = (data) => {
      console.log('💰 Payment request received:', data);
      
      const notification = {
        id: Date.now(),
        type: 'payment',
        requestType: 'payment',
        ...data,
        read: false,
        timestamp: data.timestamp || new Date().toISOString()
      };
      
      setNotifications(prev => [notification, ...prev]);
      
      showNotificationWithSound({
        title: '💰 Yêu cầu thanh toán',
        body: `Bàn ${data.tableNumber} cần thanh toán`,
        soundType: 'double'
      });
      
      // Auto-remove after 30 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 30000);
    };

    // Listen for new order events
    const handleOrderCreated = (data) => {
      console.log('📦 New order notification received:', data);
      console.log('📦 Data details:', {
        orderId: data.orderId,
        tableNumber: data.tableNumber,
        displayOrder: data.displayOrder,
        status: data.status
      });
      
      const notification = {
        id: Date.now(),
        type: 'order',
        requestType: 'service',
        tableNumber: data.tableNumber || data.tableId,
        orderId: data.orderId,
        message: `Đơn hàng mới #${data.displayOrder || data.orderId}`,
        read: false,
        timestamp: data.timestamp || new Date().toISOString()
      };
      
      console.log('📦 Creating notification:', notification);
      setNotifications(prev => {
        console.log('📦 Current notifications:', prev.length);
        return [notification, ...prev];
      });
      
      // No sound here - WaiterScreen already plays sound for new orders
      // Just add to notification list
      
      // Auto-remove after 60 seconds (longer for orders)
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 60000);
    };

    console.log('🔔 Registering socket listeners...');
    
    // Register listeners
    socket.on('staff:customer_call', handleCustomerCall);
    socket.on('payment_request', handlePaymentRequest);
    socket.on('order:created', handleOrderCreated);
    
    console.log('✅ Socket listeners registered:', {
      'staff:customer_call': 'handleCustomerCall',
      'payment_request': 'handlePaymentRequest', 
      'order:created': 'handleOrderCreated'
    });

    // Request notification permission on mount
    requestNotificationPermission();

    // Cleanup listeners on unmount
    return () => {
      socket.off('staff:customer_call', handleCustomerCall);
      socket.off('payment_request', handlePaymentRequest);
      socket.off('order:created', handleOrderCreated);
      console.log('🔕 Cleaned up staff notification listeners');
    };
  }, [socket, isConnected]);

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

import React from 'react';
import { useStaffNotifications } from '../hooks/useStaffNotifications';
import './StaffNotificationPanel.css';

/**
 * Staff Notification Panel Component
 * Displays real-time customer service requests
 */
const StaffNotificationPanel = () => {
  const {
    isConnected,
    notifications,
    unreadCount,
    markAsRead,
    clearNotification,
    clearAllNotifications
  } = useStaffNotifications();

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'payment':
        return '💳';
      case 'service':
        return '🍽️';
      case 'help':
        return '🆘';
      default:
        return '🔔';
    }
  };

  const getRequestTypeText = (type) => {
    switch (type) {
      case 'payment':
        return 'Thanh toán';
      case 'service':
        return 'Phục vụ';
      case 'help':
        return 'Hỗ trợ';
      default:
        return 'Yêu cầu';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="staff-notification-panel">
      {/* Header */}
      <div className="notification-header">
        <div className="header-left">
          <h3>🔔 Thông báo</h3>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        <div className="header-right">
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {isConnected ? 'Đang kết nối' : 'Mất kết nối'}
          </div>
          {notifications.length > 0 && (
            <button 
              className="clear-all-btn"
              onClick={clearAllNotifications}
              title="Xóa tất cả"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <p>📭 Không có thông báo mới</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-item ${notif.read ? 'read' : 'unread'}`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className="notification-icon">
                {getRequestTypeIcon(notif.requestType)}
              </div>
              
              <div className="notification-content">
                <div className="notification-title">
                  <strong>Bàn {notif.tableNumber}</strong>
                  <span className="request-type">
                    {getRequestTypeText(notif.requestType)}
                  </span>
                </div>
                
                <p className="notification-message">{notif.message}</p>
                
                <div className="notification-meta">
                  <span className="notification-time">
                    ⏰ {formatTime(notif.timestamp)}
                  </span>
                  {notif.orderId && (
                    <span className="order-id">
                      Đơn #{notif.orderId}
                    </span>
                  )}
                </div>
              </div>
              
              <button
                className="clear-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  clearNotification(notif.id);
                }}
                title="Xóa thông báo"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffNotificationPanel;

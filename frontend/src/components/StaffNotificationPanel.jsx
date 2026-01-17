import React, { useState } from 'react';
import { useStaffNotifications } from '../hooks/useStaffNotifications';
import { Bell, X, Trash2 } from 'lucide-react';

/**
 * Staff Notification Panel Component
 * Desktop: Fixed sidebar on the right (320px)
 * Mobile: Floating icon + slide-in drawer
 */
const StaffNotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  
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
      case 'order':
        return '📦';
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
      case 'order':
        return 'Đơn mới';
      case 'service':
        return 'Phục vụ';
      case 'help':
        return 'Hỗ trợ';
      default:
        return 'Yêu cầu';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'payment':
        return 'from-green-100 to-emerald-100 border-green-300';
      case 'order':
        return 'from-blue-100 to-cyan-100 border-blue-300';
      case 'service':
        return 'from-orange-100 to-amber-100 border-orange-300';
      default:
        return 'from-blue-100 to-indigo-100 border-blue-300';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const PanelContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-800 text-lg">Thông báo</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {isConnected ? 'Live' : 'Offline'}
          </div>
          
          {/* Clear All Button */}
          {notifications.length > 0 && (
            <button 
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={clearAllNotifications}
              title="Xóa tất cả"
            >
              <Trash2 className="w-4 h-4 text-gray-600" />
            </button>
          )}
          
          {/* Close button (mobile only) */}
          <button 
            className="lg:hidden p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Bell className="w-16 h-16 mb-3 opacity-30" />
            <p className="text-sm font-medium">Không có thông báo mới</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`group relative bg-gradient-to-br ${getTypeColor(notif.type)} border-2 rounded-xl p-4 transition-all cursor-pointer hover:shadow-md ${
                notif.read 
                  ? 'opacity-75' 
                  : 'shadow-sm'
              }`}
              onClick={() => markAsRead(notif.id)}
            >
              {/* Unread indicator */}
              {!notif.read && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
              )}
              
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                  {getRequestTypeIcon(notif.type || notif.requestType)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{notif.tableNumber}</span>
                    <span className="px-2 py-0.5 bg-white/70 text-gray-700 text-xs font-semibold rounded-full">
                      {getRequestTypeText(notif.type || notif.requestType)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                    {notif.message}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      ⏰ {formatTime(notif.timestamp)}
                    </span>
                    {notif.orderId && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-white/50 rounded">
                        📋 #{notif.orderId}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Close button */}
                <button
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 hover:bg-red-100 rounded-lg transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearNotification(notif.id);
                  }}
                  title="Xóa"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: Fixed sidebar on the right - 320px width */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 lg:border-l lg:border-gray-200 lg:bg-gray-50 lg:fixed lg:right-0 lg:top-0 lg:bottom-0 lg:z-40">
        <PanelContent />
      </div>

      {/* Mobile: Floating icon */}
      <button
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
        onClick={() => setIsOpen(true)}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Mobile: Slide-in drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer */}
          <div className="lg:hidden fixed right-0 top-0 bottom-0 w-full max-w-sm bg-gray-50 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <PanelContent />
          </div>
        </>
      )}
    </>
  );
};

export default StaffNotificationPanel;

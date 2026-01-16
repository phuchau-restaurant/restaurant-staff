import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './CustomerCallStaffButton.css';

/**
 * Customer Call Staff Button Component
 * Allows customers to request staff assistance via Socket.IO
 */
const CustomerCallStaffButton = ({ 
  tableNumber, 
  tableId, 
  orderId,
  requestType = 'payment' // 'payment', 'service', 'help'
}) => {
  const [socket, setSocket] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastCallTime, setLastCallTime] = useState(null);

  useEffect(() => {
    // Get token and setup socket connection
    const token = localStorage.getItem('customerToken') || localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    if (!token) {
      console.warn('No token found for socket connection');
      return;
    }

    // Create socket connection
    const newSocket = io(backendUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true
    });

    newSocket.on('connect', () => {
      console.log('✅ Customer socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Customer socket disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleCallStaff = () => {
    if (!socket || !isConnected) {
      alert('Không thể kết nối đến server. Vui lòng thử lại!');
      return;
    }

    // Prevent spam clicking (minimum 10 seconds between calls)
    const now = Date.now();
    if (lastCallTime && (now - lastCallTime) < 10000) {
      const remainingSeconds = Math.ceil((10000 - (now - lastCallTime)) / 1000);
      alert(`Vui lòng đợi ${remainingSeconds} giây trước khi gọi lại!`);
      return;
    }

    setIsCalling(true);
    setLastCallTime(now);

    // Emit socket event to call staff
    socket.emit('customer:call_staff', {
      tableNumber,
      tableId,
      orderId,
      requestType,
      message: getRequestMessage(requestType, tableNumber)
    });

    console.log('📞 Called staff:', { tableNumber, requestType });

    // Reset button state after 3 seconds
    setTimeout(() => {
      setIsCalling(false);
    }, 3000);
  };

  const getRequestMessage = (type, table) => {
    switch (type) {
      case 'payment':
        return `Bàn ${table} cần thanh toán`;
      case 'service':
        return `Bàn ${table} cần phục vụ`;
      case 'help':
        return `Bàn ${table} cần hỗ trợ`;
      default:
        return `Bàn ${table} cần hỗ trợ`;
    }
  };

  const getButtonText = () => {
    if (isCalling) {
      return '⏳ Đang gọi...';
    }
    switch (requestType) {
      case 'payment':
        return '💳 Gọi nhân viên thanh toán';
      case 'service':
        return '🍽️ Gọi nhân viên phục vụ';
      case 'help':
        return '🆘 Gọi nhân viên hỗ trợ';
      default:
        return '🔔 Gọi nhân viên';
    }
  };

  return (
    <div className="customer-call-staff-container">
      <button
        className={`call-staff-button ${isCalling ? 'calling' : ''} ${requestType}`}
        onClick={handleCallStaff}
        disabled={isCalling || !isConnected}
      >
        {getButtonText()}
      </button>
      
      {isCalling && (
        <div className="call-success-message">
          ✅ Đã gọi nhân viên! Vui lòng đợi trong giây lát.
        </div>
      )}
      
      {!isConnected && (
        <div className="connection-warning">
          ⚠️ Mất kết nối. Đang thử kết nối lại...
        </div>
      )}
    </div>
  );
};

export default CustomerCallStaffButton;

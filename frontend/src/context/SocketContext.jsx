// SocketContext.jsx - Context để quản lý WebSocket connection
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { accessToken, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Debug: Log auth state
    console.log("🔍 Socket Auth State:", {
      isAuthenticated,
      hasToken: !!accessToken,
    });

    // Only connect if user is authenticated
    if (!isAuthenticated || !accessToken) {
      // Disconnect if already connected
      if (socketRef.current) {
        console.log("🔌 Disconnecting socket (user logged out)");
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection (encapsulated so we can reuse for manual connect)
    const createSocket = () => {
      console.log("🔌 Connecting to Socket.IO server...");
      const newSocket = io(
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
        {
          auth: {
            token: accessToken,
          },
          autoConnect: true,
          // Ensure WebSocket transport works on production
          transports: ["websocket", "polling"],
          // Reconnection settings
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        }
      );

      // Connection event handlers
      newSocket.on("connect", () => {
        console.log("✅ Socket connected:", newSocket.id);
        setIsConnected(true);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error.message);
        setIsConnected(false);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    };

    // initialize
    createSocket();

    // Cleanup on unmount or token change
    return () => {
      if (socketRef.current) {
        console.log("🔌 Cleaning up socket connection");
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated, accessToken]);

  // Allow manual connect/disconnect from UI
  const connectSocket = () => {
    if (socketRef.current) {
      socketRef.current.connect();
      return;
    }
    if (isAuthenticated && accessToken) {
      // create a new socket if none exists
      const newSocket = io(
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
        {
          auth: { token: accessToken },
          autoConnect: true,
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        }
      );

      newSocket.on("connect", () => setIsConnected(true));
      newSocket.on("disconnect", () => setIsConnected(false));
      newSocket.on("connect_error", () => setIsConnected(false));

      socketRef.current = newSocket;
      setSocket(newSocket);
    }
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      try {
        socketRef.current.disconnect();
      } catch (e) {
        console.error("Error disconnecting socket:", e);
      }
    }
  };

  const value = {
    socket,
    isConnected,
    connectSocket,
    disconnectSocket,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

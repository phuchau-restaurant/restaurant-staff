// Socket.IO Configuration
import { Server } from "socket.io";
import { verifyToken } from "../utils/jwt.js";

let io;

/**
 * Initialize Socket.IO server
 * @param {import('http').Server} httpServer - HTTP server instance
 */
export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      console.log("🔑 Socket token received:", token ? "✓" : "✗");

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = verifyToken(token);
      console.log("✅ Token verified. Payload:", {
        id: decoded.id,
        tenantId: decoded.tenantId,
        role: decoded.role,
      });

      socket.userId = decoded.id;
      socket.tenantId = decoded.tenantId;
      socket.role = decoded.role;

      next();
    } catch (error) {
      console.error("❌ Socket auth error:", error.message);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `✅ Client connected: ${socket.id} (User: ${socket.userId}, Tenant: ${socket.tenantId})`
    );

    // Join tenant-specific room
    const tenantRoom = `tenant:${socket.tenantId}`;
    socket.join(tenantRoom);

    // Join role-specific rooms
    if (socket.role === "kitchen_staff") {
      socket.join(`${tenantRoom}:kitchen`);
    } else if (socket.role === "admin" || socket.role === "manager") {
      socket.join(`${tenantRoom}:admin`);
    }

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Handle kitchen calling waiter (without changing order status)
    socket.on("kitchen:call_waiter", (data) => {
      console.log("📞 Kitchen calling waiter:", data);
      const tenantRoom = `tenant:${socket.tenantId}`;
      // Broadcast to all users in tenant so waiter can receive
      io.to(tenantRoom).emit("waiter:call", {
        orderId: data.orderId,
        tableNumber: data.tableNumber,
        waiterId: data.waiterId,
        message: data.message || `Bàn ${data.tableNumber} - Đơn #${data.orderId} cần phục vụ!`,
      });
    });

    // Handle customer calling staff (for payment or service request)
    socket.on("customer:call_staff", (data) => {
      console.log("🔔 Customer calling staff:", data);
      const tenantRoom = `tenant:${socket.tenantId}`;
      
      // Broadcast to all staff members in the tenant
      io.to(tenantRoom).emit("staff:customer_call", {
        tableNumber: data.tableNumber,
        tableId: data.tableId,
        orderId: data.orderId,
        requestType: data.requestType || "payment", // "payment", "service", "help"
        message: data.message || `Bàn ${data.tableNumber} cần hỗ trợ thanh toán!`,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  console.log("✅ Socket.IO server initialized");
  return io;
};

/**
 * Get Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initializeSocket first.");
  }
  return io;
};

/**
 * Emit event to specific tenant
 */
export const emitToTenant = (tenantId, event, data) => {
  const io = getIO();
  io.to(`tenant:${tenantId}`).emit(event, data);
};

/**
 * Emit event to kitchen staff of specific tenant
 */
export const emitToKitchen = (tenantId, event, data) => {
  const io = getIO();
  io.to(`tenant:${tenantId}:kitchen`).emit(event, data);
};

/**
 * Emit event to admins of specific tenant
 */
export const emitToAdmin = (tenantId, event, data) => {
  const io = getIO();
  io.to(`tenant:${tenantId}:admin`).emit(event, data);
};
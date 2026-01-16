//Nơi khởi động Express App

import express from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initializeSocket } from "./configs/socket.js";

// Import các routes

import { connectDatabase } from "./configs/database.js";
import categoriesRoutes from "./routers/categories.routes.js";
import usersRoutes from "./routers/users.routes.js";
import authRoutes from "./routers/auth.routes.js";
import menusRoutes from "./routers/menus.routes.js";
import ordersRoutes from "./routers/orders.routes.js";
import appSettingsRoutes from "./routers/appSettings.routes.js";
import adminRoutes from "./routers/admin.routes.js";
import uploadRoutes from "./routers/upload.routes.js";
import menuItemPhotoRoutes from "./routers/menuItemPhoto.routes.js";
import modifiersRoutes from "./routers/modifiers.routes.js";
import menuItemModifierGroupRoutes from "./routers/menuItemModifierGroup.routes.js";
import reportRoutes from "./routers/report.routes.js";
import tenantsRoutes from "./routers/tenants.routes.js";
import paymentRoutes from "./routers/payment.routes.js";;

//Import middlewares
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { requestLogger } from "./middlewares/loggerMiddleware.js";

// Cấu hình môi trường
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Cho phép gửi cookies
  })
); // Cho phép Frontend gọi API
app.use(cookieParser()); // Parse cookies từ request
app.use(express.json()); // QUAN TRỌNG: Để server đọc được JSON từ body request (req.body)
app.use(express.urlencoded({ extended: true }));
// [LOGGER] Đặt ở đây để ghi lại MỌI request bay vào server
app.use(requestLogger);

// --- ROUTES ---
// Gắn route categories vào đường dẫn gốc /api/categories
app.use("/api/categories", categoriesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/menus", menusRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/appsettings", appSettingsRoutes);
app.use("/api/admin", adminRoutes);
//route upload image
app.use("/api/upload", uploadRoutes);
//route menu item photo
app.use("/api/admin/menu/items", menuItemPhotoRoutes);
app.use("/api/admin/menu", modifiersRoutes);
app.use("/api/menu-item-modifier-group", menuItemModifierGroupRoutes); // <-- thêm dòng này

app.use("/api/report", reportRoutes);
app.use("/api/tenants", tenantsRoutes);
app.use("/api/payments", paymentRoutes);
//Nghiệp vụ cho admin
app.use("/api/admin", adminRoutes);

// Route kiểm tra server sống hay chết
app.get("/", (req, res) => {
  res.send("🚀 Server is running...");
});

// --- ERROR HANDLING  ---
// Nếu controller gọi next(error), nó sẽ nhảy thẳng xuống đây
app.use(errorMiddleware);

// --- START SERVER ---
const startServer = async () => {
  // 1. Kiểm tra kết nối DB trước
  await connectDatabase();

  // 2. Initialize Socket.IO
  initializeSocket(httpServer);

  // 3. Chạy server
  httpServer.listen(PORT, () => {
    console.log(`\n✅ Server đang chạy tại: http://localhost:${PORT}`);
  });
};

startServer();

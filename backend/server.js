//Nơi khởi động Express App

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import các routes

import { connectDatabase } from "./configs/database.js";
import categoriesRoutes from "./routers/categories.routes.js";
import usersRoutes from "./routers/users.routes.js";
import authRoutes from "./routers/auth.routes.js";
import menusRoutes from './routers/menus.routes.js';
import ordersRoutes from './routers/orders.routes.js';
import kitchenRoutes from './routers/kitchen.routes.js';
import appSettingsRoutes from './routers/appSettings.routes.js';
import adminRoutes from './routers/admin.routes.js';

//Import middlewares
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { requestLogger } from "./middlewares/loggerMiddleware.js";

// Cấu hình môi trường
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.json()); // QUAN TRỌNG: Để server đọc được JSON từ body request (req.body)
// [LOGGER] Đặt ở đây để ghi lại MỌI request bay vào server
app.use(requestLogger);

// --- ROUTES ---
// Gắn route categories vào đường dẫn gốc /api/categories
app.use("/api/categories", categoriesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/menus', menusRoutes); 
app.use('/api/orders', ordersRoutes);
app.use('/api/appsettings', appSettingsRoutes); 
app.use('/api/admin', adminRoutes); 

//route nghiệp vụ cho kitchen
app.use('/api/kitchen', kitchenRoutes);
//Nghiệp vụ cho admin
app.use('/api/admin', adminRoutes);

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

  // 2. Chạy server
  app.listen(PORT, () => {
    console.log(`\n✅ Server đang chạy tại: http://localhost:${PORT}`);
  });
};

startServer();

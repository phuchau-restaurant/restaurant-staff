//Nơi khởi động Express App

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import các routes
import categoriesRoutes from './routers/categories.routes.js';
import { connectDatabase } from './configs/database.js';

// Cấu hình môi trường
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.json()); // QUAN TRỌNG: Để server đọc được JSON từ body request (req.body)

// --- ROUTES ---
// Gắn route categories vào đường dẫn gốc /api/categories
app.use('/api/categories', categoriesRoutes);

// Route kiểm tra server sống hay chết
app.get('/', (req, res) => {
  res.send('🚀 Server is running...');
});

// --- START SERVER ---
const startServer = async () => {
  // 1. Kiểm tra kết nối DB trước
  await connectDatabase();

  // 2. Chạy server
  app.listen(PORT, () => {
    console.log(`\n✅ Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`👉 Test API Categories tại: http://localhost:${PORT}/api/categories`);
  });
};

startServer();
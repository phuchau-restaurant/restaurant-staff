// File: backend/src/configs/database.js
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Cấu hình đường dẫn tuyệt đối tới file .env
// Logic: Từ file này (/configs) đi ra ngoài 1 cấp (../) để về root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

// Thêm dòng này để kiểm tra ngay lập tức khi chạy server:
//console.log('Loaded .env from:', envPath);


// 2. Load biến môi trường
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`⚠️  Cảnh báo: Không tìm thấy file .env tại ${envPath}`);
}

// 3. Lấy biến và Validate
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ LỖI NGHIÊM TRỌNG: Thiếu SUPABASE_URL hoặc SUPABASE_KEY trong .env");
  process.exit(1); // Dừng chương trình ngay lập tức nếu thiếu config
}

// 4. Tạo client Supabase
// persistSession: false -> Vì đây là server-side, ta không cần lưu token vào storage/cookie
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// 5. Hàm test kết nối (Health Check)
export async function connectDatabase() {
  try {
    console.log('⏳ Đang kết nối tới Supabase...');

    // Query thử bảng user_account (Lấy 1 dòng để test thôi cho nhẹ)
    // Lưu ý: Đảm bảo bảng 'user_account' đã tồn tại trên Supabase
    const { data, error } = await supabase
      .from('tenants')
      .select('*') 
      .limit(2);

    if (error) throw error;

    console.log('✅ Kết nối Supabase thành công!');
     //console.log('Sample Data:', data); // Bật lên nếu muốn xem dữ liệu
    
  } catch (err) {
    console.error('❌ Lỗi kết nối Supabase:', err.message);
    // Có thể throw err tiếp để tầng trên xử lý nếu muốn
  }
}
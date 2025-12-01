// backend/helpers/validationHelper.js

/**
 * Kiểm tra định dạng số điện thoại Việt Nam
 * Quy tắc:
 * 1. Bắt đầu bằng số 0
 * 2. Theo sau là 9 chữ số (Tổng độ dài là 10)
 * 3. Không chứa ký tự chữ hoặc ký tự đặc biệt
 */
export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  
  // Regex: ^0 bắt đầu bằng 0,\d{9,10} : Theo sau là từ 9 đến 10 chữ số nữa, $ là kết thúc chuỗi
  const phoneRegex = /^0\d{9,10}$/;
  
  return phoneRegex.test(phone);
};

export const isValidFullName = (fullName) => {
    if (!fullName || fullName.trim().length < 2) return false;

    // \p{L}: Bất kỳ chữ cái nào (bao gồm tiếng Việt, tiếng Nhật, v.v.)
    // \s: Khoảng trắng
    // u: Cờ Unicode (Bắt buộc để dùng \p{L})
    const regex = /^[\p{L}\s]+$/u;

    return regex.test(fullName.trim());
};

export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
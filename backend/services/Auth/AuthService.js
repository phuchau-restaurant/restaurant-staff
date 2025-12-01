// backend/services/Auth/AuthService.js
import bcrypt from 'bcryptjs';

class AuthService {
  // Constructor Injection: Nhận vào UsersRepository
  constructor(usersRepository) {
    this.usersRepo = usersRepository;
  }

  /**
   * Đăng nhập người dùng
   * @param {string} email - Email của người dùng
   * @param {string} password - Mật khẩu người dùng
   * @returns {Object} - Trả về thông tin user nếu đăng nhập thành công
   */
  async login(email, password, tenantId) {
    // 1. Validate dữ liệu đầu vào
    if (!email || email.trim() === "") {
      throw new Error("Email is required");
    }
    if (!password || password.trim() === "") {
      throw new Error("Password is required");
    }

    // 2. Tìm user theo email (nếu có tenantId, chỉ tìm trong tenant đó)
    const users = await this.usersRepo.findByEmail(email.trim(), tenantId);

    if (!users || users.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = users[0];

    // 3. Kiểm tra user có active không
    if (!user.isActive) {
      throw new Error("User account is inactive");
    }

    // 4. Kiểm tra mật khẩu sử dụng bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // 5. Trả về user info (không trả mật khẩu/passwordHash)
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Xác minh token (Optional - nếu cần)
   * @param {string} token - JWT token
   */
  async verifyToken(token) {
    // TODO: Implement JWT verification logic
    throw new Error("Not implemented yet");
  }
}

export default AuthService;

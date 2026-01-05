// backend/services/Auth/AuthService.js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";

class AuthService {
  // Constructor Injection: Nhận vào UsersRepository
  constructor(usersRepository) {
    this.usersRepo = usersRepository;
  }

  /**
   * Đăng nhập người dùng
   * @param {string} email - Email của người dùng
   * @param {string} password - Mật khẩu người dùng
   * @param {string} tenantId - Tenant ID
   * @returns {Object} - Trả về thông tin user, accessToken và refreshToken
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

    // 5. Tạo Access Token (thời gian ngắn: 15 phút)
    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    // 6. Tạo Refresh Token (thời gian dài: 7 ngày)
    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
    });

    // 7. Hash refresh token và lưu vào database
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày

    await this.usersRepo.update(user.id, {
      refresh_token_hash: refreshTokenHash,
      refresh_token_expires: refreshTokenExpires.toISOString(),
    });

    // 8. Trả về user info và tokens (không trả mật khẩu/passwordHash)
    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Tạo token để reset password
   * @param {string} email
   * @param {string} tenantId
   */
  async forgotPassword(email, tenantId) {
    if (!email) throw new Error("Email is required");

    const users = await this.usersRepo.findByEmail(email.trim(), tenantId);
    const user = users?.[0];

    if (!user) {
      // Không báo lỗi "user not found" để tránh lộ thông tin
      // Chỉ đơn giản là không làm gì cả
      return;
    }

    // 1. Tạo một token ngẫu nhiên
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash token và lưu vào DB
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 3. Đặt thời gian hết hạn (ví dụ: 10 phút)
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    // 4. Cập nhật user trong DB
    await this.usersRepo.update(user.id, {
      passwordResetToken,
      passwordResetExpires,
    });

    // 5. Gửi email cho người dùng (logic gửi email sẽ ở một service riêng)
    // Ở đây chúng ta chỉ trả về token để bạn có thể test
    // TRONG THỰC TẾ: KHÔNG BAO GIỜ TRẢ TOKEN VỀ API RESPONSE
    console.log(`Reset token for ${email}: ${resetToken}`); // In ra để test
    // Ví dụ: await emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message:
        "If your email is registered, you will receive a password reset link.",
    };
  }

  /**
   * Đặt lại mật khẩu bằng token
   * @param {string} token - Token người dùng nhận được từ email
   * @param {string} newPassword - Mật khẩu mới
   */
  async resetPassword(token, newPassword) {
    if (!token || !newPassword) {
      throw new Error("Token and new password are required.");
    }
    // TODO: Implement logic to find user by hashed token, check expiry,
    // update password, and clear the token fields.
    // 1. Hash the incoming token to find the user in DB.
    // 2. Check if token is not expired.
    // 3. Hash the newPassword.
    // 4. Update user's passwordHash and set passwordResetToken/Expires to null.

    // Logic này khá phức tạp, tôi sẽ để lại comment để bạn có thể phát triển thêm.
    // Bạn sẽ cần thêm một phương thức trong UsersRepository để tìm user bằng `passwordResetToken`.

    throw new Error(
      "Reset password functionality is not fully implemented yet."
    );
  }

  /**
   * Xác minh token (Optional - nếu cần)
   * @param {string} token - JWT token
   */
  async verifyToken(token) {
    // TODO: Implement JWT verification logic
    throw new Error("Not implemented yet");
  }

  /**
   * Làm mới access token bằng refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} - Trả về accessToken mới và thông tin user
   */
  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    // 1. Xác minh refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }

    // 2. Lấy thông tin user
    const user = await this.usersRepo.getById(payload.id);
    if (!user || !user.isActive) {
      throw new Error("User not found or inactive");
    }

    // 3. Kiểm tra refresh token có khớp với hash trong DB không
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    if (user.refreshTokenHash !== refreshTokenHash) {
      throw new Error("Refresh token not found or has been revoked");
    }

    // 4. Kiểm tra refresh token đã hết hạn chưa
    if (new Date(user.refreshTokenExpires) < new Date()) {
      // Xóa token hết hạn
      await this.usersRepo.update(user.id, {
        refresh_token_hash: null,
        refresh_token_expires: null,
      });
      throw new Error("Refresh token has expired");
    }

    // 5. Tạo access token mới
    const newAccessToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    // 6. Trả về user info và access token mới
    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken: newAccessToken,
    };
  }

  /**
   * Đăng xuất - Thu hồi refresh token
   * @param {string} refreshToken - Refresh token cần thu hồi
   */
  async logout(refreshToken) {
    if (!refreshToken) {
      return; // Không có token thì không cần làm gì
    }

    try {
      // Xác minh token trước khi xóa
      const payload = verifyRefreshToken(refreshToken);
      const user = await this.usersRepo.getById(payload.id);

      if (user) {
        // Xóa refresh token khỏi database
        await this.usersRepo.update(user.id, {
          refresh_token_hash: null,
          refresh_token_expires: null,
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Không throw error để tránh lỗi khi logout
    }
  }
}

export default AuthService;

// backend/controllers/Auth/AuthController.js

class AuthController {
  // Constructor Injection: Nhận vào AuthService
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * [POST] /api/auth/login
   * Xử lý yêu cầu đăng nhập
   */
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const tenantId = req.tenantId || null; // Optional - null nếu không có

      // Gọi Service để xác thực
      const result = await this.authService.login(email, password, tenantId);

      // Lưu refresh token vào httpOnly cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Chỉ dùng HTTPS trong production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" cho cross-origin trong production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      if (
        error.message.includes("Invalid") ||
        error.message.includes("is required")
      ) {
        error.statusCode = 401;
      }
      next(error);
    }
  };

  /**
   * [POST] /api/auth/forgot-password
   * Xử lý yêu cầu quên mật khẩu
   */
  forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      const tenantId = req.tenantId; // Giả sử tenantId được lấy từ middleware

      const result = await this.authService.forgotPassword(email, tenantId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * [POST] /api/auth/reset-password
   * Xử lý đặt lại mật khẩu mới
   */
  resetPassword = async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;
      await this.authService.resetPassword(token, newPassword);

      return res.status(200).json({
        success: true,
        message: "Password has been reset successfully.",
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };

  /**
   * [POST] /api/auth/logout
   * Xử lý yêu cầu đăng xuất
   */
  logout = async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      // Thu hồi refresh token
      await this.authService.logout(refreshToken);

      // Xóa cookie
      res.clearCookie("refreshToken");

      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * [POST] /api/auth/refresh
   * Làm mới access token bằng refresh token
   */
  refresh = async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      
      console.log("🔄 Refresh request received");
      console.log("📦 Cookies:", req.cookies);
      console.log("🎫 Refresh token present:", !!refreshToken);

      if (!refreshToken) {
        const error = new Error("Refresh token not found");
        error.statusCode = 401;
        throw error;
      }

      // Làm mới access token
      const result = await this.authService.refreshAccessToken(refreshToken);

      return res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      // Xóa cookie nếu refresh token không hợp lệ
      res.clearCookie("refreshToken");
      error.statusCode = 401;
      next(error);
    }
  };
}

export default AuthController;

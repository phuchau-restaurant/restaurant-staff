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
      const tenantId = req.tenantId;


      // Gọi Service để xác thực
      const user = await this.authService.login(email, password, tenantId);

      // TODO: Tạo JWT token và trả về
      // const token = generateToken(user);
      // return res.status(200).json({
      //   success: true,
      //   message: "Login successful",
      //   data: {
      //     user,
      //     token
      //   }
      // });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user,
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
   * [POST] /api/auth/logout
   * Xử lý yêu cầu đăng xuất
   */
  logout = async (req, res, next) => {
    try {
      // TODO: Implement logout logic (invalidate token, etc.)
      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;

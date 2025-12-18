// backend/middlewares/tenantMiddleware.js

export const tenantMiddleware = (req, res, next) => {
  try {
    // Ưu tiên 1: Lấy từ User đã đăng nhập (nếu đã cài Auth Middleware)
    if (req.user && req.user.tenant_id) return req.user.tenant_id;

    // ưu tiên 2 lấy từ header
    const tenantId = req.headers['x-tenant-id'];

    // Validate
    if (!tenantId) {
      // Nếu không có, chặn request
      return res.status(400).json({
        success: false,
        message: "Missing Tenant ID header (x-tenant-id)."
      });
    }

    // Gắn vào Request Object để các tầng sau dùng
    req.tenantId = tenantId;

    //Cho phép đi tiếp
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Tenant Middleware Error" });
  }
};
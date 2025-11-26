//backend/controllers/Categories/categoriesControllers.js
import CategoriesService from "../../services/Categories/categoriesService.js";

// Thêm dòng này để kiểm tra ngay lập tức khi chạy server:
//console.log('Loaded .env from:', envPath);

class CategoriesController {

  /**
   * Helper: Lấy Tenant ID từ Request
   * ------------------------------------------------
   * TRONG THỰC TẾ: TenantID nên được lấy từ JWT Token (req.user.tenant_id) sau khi qua Middleware xác thực.
   * TẠM THỜI: sẽ lấy từ Header 'x-tenant-id' để tiện test API.
   */
  getTenantId(req) {
    // Ưu tiên 1: Lấy từ User đã đăng nhập (nếu đã cài Auth Middleware)
    if (req.user && req.user.tenant_id) return req.user.tenant_id;


    //TODO: nhớ xóa sau khi hoàn thành Auth Middleware
    // Ưu tiên 2: Lấy từ Header (Dùng cho Testing/Postman)
    const tenantIdHeader = req.headers['x-tenant-id'];
    
    // Nếu không có -> Báo lỗi ngay. Hệ thống Multi-tenant không được phép thiếu.
    if (!tenantIdHeader) {
      throw new Error("Missing Tenant ID header (x-tenant-id)");
    }
    return tenantIdHeader;
  }

  // [GET] /api/categories
  async getAll(req, res) {
    try {
      const tenantId = this.getTenantId(req);
      // Lấy tham số onlyActive từ query param (ví dụ: ?active=true)
      const onlyActive = req.query.active === 'true';

      const data = await CategoriesService.getCategoriesByTenant(tenantId, onlyActive);
      
      return res.status(200).json({
        success: true,
        data: data
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // [GET] /api/categories/:id
  async getById(req, res) {
    try {
      const tenantId = this.getTenantId(req);
      const { id } = req.params;

      const data = await CategoriesService.getCategoryById(id, tenantId);

      return res.status(200).json({
        success: true,
        data: data
      });
    } catch (error) {
      // Phân loại lỗi: Nếu là "Not found" trả 404, còn lại 500 hoặc 403
      const status = error.message.includes("not found") ? 404 : 
                     error.message.includes("Access denied") ? 403 : 500;
      
      return res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  // [POST] /api/categories
  async create(req, res) {
    try {
      const tenantId = this.getTenantId(req); // sẽ lấy tenant id từ Header (nếu như đang test API)
      
      // Gọi Service
      const newCategory = await CategoriesService.createCategory({
        ...req.body,
        tenant_id: tenantId // Force tenant_id từ header/token, không tin tưởng body
      });

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: newCategory
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // [PUT] /api/categories/:id
  async update(req, res) {
    try {
      const tenantId = this.getTenantId(req);
      const { id } = req.params;

      const updatedCategory = await CategoriesService.updateCategory(id, tenantId, req.body);

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: updatedCategory
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // [DELETE] /api/categories/:id
  async delete(req, res) {
    try {
      const tenantId = this.getTenantId(req);
      const { id } = req.params;

      await CategoriesService.deleteCategory(id, tenantId);

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully"
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

// Export Singleton
export default new CategoriesController();
//backend/controllers/Categories/categoriesControllers.js

//Ko cần import - nhận service thông qua constructor: 
  //ko cần: import CategoriesService from "../../services/Categories/categoriesService.js";

// Thêm dòng này để kiểm tra ngay lập tức khi chạy server:
//console.log('Loaded .env from:', envPath);

class CategoriesController {
  //inject service vào controller thông qua constructor
  constructor(categoriesService) {
      this.categoriesService = categoriesService;
    }

  // [GET] /api/categories
  getAll = async (req, res) => {
    try {
      // Lấy trực tiếp từ req.tenantId (do Middleware đã gắn vào)
      const tenantId = req.tenantId;
      
      const onlyActive = req.query.active === 'true';

      // Gọi Service
      const data = await this.categoriesService.getCategoriesByTenant(tenantId, onlyActive); //sử dụng this vì tại constructor đã inject service vào this.categoriesService
      return res.status(200).json({ success: true, data });
    } catch (error) {
      // Xử lý lỗi tập trung
      //console.log("Something went wrong in getAll:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // [GET] /api/categories/:id
  getById = async (req, res) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      const data = await this.categoriesService.getCategoryById(id, tenantId);

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
  create = async (req, res) => {
    try {
      const tenantId = req.tenantId;
      // Gọi Service
      const newCategory = await this.categoriesService.createCategory({
        ...req.body,
        tenantId: tenantId // Force tenantId từ header/token, không tin tưởng body
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
  update = async (req, res) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      const updatedCategory = await this.categoriesService.updateCategory(id, tenantId, req.body);

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
  delete = async (req, res) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      await this.categoriesService.deleteCategory(id, tenantId);

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

export default CategoriesController;
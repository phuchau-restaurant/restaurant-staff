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
  getAll = async (req, res, next) => {
    try {
      // Lấy trực tiếp từ req.tenantId (do Middleware đã gắn vào)
      const tenantId = req.tenantId;
      
      const onlyActive = req.query.active === 'true';

      // Gọi Service
      const data = await this.categoriesService.getCategoriesByTenant(tenantId, onlyActive); //sử dụng this vì tại constructor đã inject service vào this.categoriesService
      
      const returnData = data.map(({ tenantId, ...rest }) => rest);

      return res.status(200).json({ 
        message: "Categories fetched successfully",
        success: true, 
        total: returnData.length,
        data: returnData
       });

    } catch (error) {
      //return res.status(500).json({ success: false, message: error.message });
      next(error); // in middleware
    }
  }

  // [GET] /api/categories/:id
  getById = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      const data = await this.categoriesService.getCategoryById(id, tenantId);

      // Lọc bỏ id và tenantId (Object destructuring)
      const { id: _id, tenantId: _tid, ...returnData } = data;

      return res.status(200).json({
        success: true,
        message: "Category fetched successfully",
        data: returnData
      });
    } catch (error) {
      if (error.message.includes("not found")) error.statusCode = 404;
      else if (error.message.includes("Access denied")) error.statusCode = 403;
      
      next(error);
    }
  }

  // [POST] /api/categories
  create = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      // Gọi Service
      const newCategory = await this.categoriesService.createCategory({
        ...req.body,
        tenantId: tenantId // Force tenantId từ header/token, không tin tưởng body
      });

      // Lọc bỏ id và tenantId
      const { id: _id, tenantId: _tid, ...returnData } = newCategory;

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: returnData
      });
    } catch (error) {
      // gán 400 để middleware biết không phải lỗi server sập
      error.statusCode = 400;
      next(error);
    }
  }

  // [PUT] /api/categories/:id
  update = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      const updatedCategory = await this.categoriesService.updateCategory(id, tenantId, req.body);

      // Lọc bỏ id và tenantId
      const { id: _id, tenantId: _tid, ...returnData } = updatedCategory;

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: returnData
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  // [DELETE] /api/categories/:id
  delete = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      await this.categoriesService.deleteCategory(id, tenantId);

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully"
      });
    } catch (error) {
        error.statusCode = 400;
        next(error);
    }
  }
}

export default CategoriesController;
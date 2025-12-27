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

  // [GET] /api/categories?status=active&pageNumber=1&pageSize=10
  getAll = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      
      // Xử lý filter theo status
      const { status } = req.query;
      let onlyActive = false;
      if (status === 'active') {
        onlyActive = true;
      }
      
      const { pageNumber, pageSize } = req.query;

      // Xử lý phân trang nếu có
      let pagination = null;
      if (pageNumber && pageSize) {
        pagination = {
          pageNumber: parseInt(pageNumber, 10),
          pageSize: parseInt(pageSize, 10)
        };
        if (pagination.pageNumber < 1) pagination.pageNumber = 1;
        if (pagination.pageSize < 1) pagination.pageSize = 10;
        if (pagination.pageSize > 100) pagination.pageSize = 100;
      }

      // Gọi Service
      const result = await this.categoriesService.getCategoriesByTenant(tenantId, onlyActive, pagination);
      
      // Xử lý response dựa trên có phân trang hay không
      let categoryData, paginationInfo;
      if (pagination) {
        categoryData = result.data;
        paginationInfo = result.pagination;
      } else {
        categoryData = result;
        paginationInfo = null;
      }

      const returnData = categoryData.map(({ tenantId, ...rest }) => rest);

      // Build response
      const response = { 
        message: "Categories fetched successfully",
        success: true, 
        total: paginationInfo ? paginationInfo.totalItems : returnData.length,
        data: returnData
      };

      // Thêm thông tin phân trang nếu có
      if (paginationInfo) {
        response.pagination = paginationInfo;
      }

      return res.status(200).json(response);

    } catch (error) {
      next(error);
    }
  };

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
        data: returnData,
      });
    } catch (error) {
      if (error.message.includes("not found")) error.statusCode = 404;
      else if (error.message.includes("Access denied")) error.statusCode = 403;

      next(error);
    }
  };

  // [POST] /api/categories
  create = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      // Gọi Service
      const newCategory = await this.categoriesService.createCategory({
        ...req.body,
        tenantId: tenantId, // Force tenantId từ header/token, không tin tưởng body
      });

      // Lọc bỏ id và tenantId
      const { id: _id, tenantId: _tid, ...returnData } = newCategory;

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: returnData,
      });
    } catch (error) {
      // gán 400 để middleware biết không phải lỗi server sập
      error.statusCode = 400;
      next(error);
    }
  };

  // [PUT] /api/categories/:id
  update = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      const updatedCategory = await this.categoriesService.updateCategory(
        id,
        tenantId,
        req.body
      );

      // Lọc bỏ id và tenantId
      const { id: _id, tenantId: _tid, ...returnData } = updatedCategory;

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: returnData,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };

  // [DELETE] /api/categories/:id
  delete = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      await this.categoriesService.deleteCategory(id, tenantId);

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };

  // [DELETE] /api/categories/:id/permanent - Xóa vĩnh viễn
  deletePermanent = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      await this.categoriesService.deletePermanent(id, tenantId);

      return res.status(200).json({
        success: true,
        message: "Category permanently deleted successfully",
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };
}

export default CategoriesController;

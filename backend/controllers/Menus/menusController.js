// backend/controllers/Menus/menusController.js
import {
  emitMenuCreated,
  emitMenuUpdated,
  emitMenuDeleted,
} from "../../utils/menuSocketEmitters.js";

class MenusController {
  constructor(menusService, categoriesService) {
    this.menusService = menusService;
    this.categoriesService = categoriesService;
  }

  // [GET] /api/menus/?categoryId=<id>&available=true&pageNumber=1&pageSize=10
  getAll = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { categoryId, available, pageNumber, pageSize } = req.query; // Lấy query params
      const onlyAvailable = available === "true";

      // Xử lý phân trang nếu có
      let pagination = null;
      if (pageNumber && pageSize) {
        pagination = {
          pageNumber: parseInt(pageNumber, 10),
          pageSize: parseInt(pageSize, 10)
        };
        // Validate pagination params
        if (pagination.pageNumber < 1) pagination.pageNumber = 1;
        if (pagination.pageSize < 1) pagination.pageSize = 10;
        if (pagination.pageSize > 100) pagination.pageSize = 100; // Limit max page size
      }

      const result = await this.menusService.getMenusByTenant(
        tenantId,
        categoryId,
        onlyAvailable,
        pagination
      );

      // Xử lý response dựa trên có phân trang hay không
      let menuData, paginationInfo;
      if (pagination) {
        menuData = result.data;
        paginationInfo = result.pagination;
      } else {
        menuData = result;
        paginationInfo = null;
      }

      // Lọc bỏ tenantId từ danh sách
      const returnData = menuData.map((item) => {
        const { tenantId, ...rest } = item;
        return rest;
      });

      //Nếu có categoryId được truyền vào thì lấy nó và search, nếu không thì null
      let categoryName = "";
      if (categoryId) {
        const category = await this.categoriesService.getCategoryById(
          categoryId,
          tenantId
        );
        categoryName = category.name + " category";
      }

      // Build response
      const response = {
        success: true,
        message: `Menus fetched ${categoryName} successfully`,
        total: paginationInfo ? paginationInfo.totalItems : returnData.length,
        data: returnData,
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

  // [GET] /api/menus/search/fuzzy?q=<search_term>&threshold=0.3
  fuzzySearch = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { q, threshold } = req.query;

      if (!q || q.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Search term (q) is required",
          data: []
        });
      }

      const searchThreshold = threshold ? parseFloat(threshold) : 0.3;
      
      // Validate threshold
      if (searchThreshold < 0 || searchThreshold > 1) {
        return res.status(400).json({
          success: false,
          message: "Threshold must be between 0 and 1",
          data: []
        });
      }

      const result = await this.menusService.fuzzySearchMenus(
        tenantId,
        q.trim(),
        searchThreshold
      );

      // Lọc bỏ tenantId từ danh sách
      const returnData = result.map((item) => {
        const { tenantId, ...rest } = item;
        return rest;
      });

      return res.status(200).json({
        success: true,
        message: `Found ${returnData.length} menu items matching "${q}"`,
        total: returnData.length,
        data: returnData,
      });
    } catch (error) {
      next(error);
    }
  };

  // [GET] /api/menus/:id
  getById = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      const data = await this.menusService.getMenuById(id, tenantId);

      // Lọc bỏ id và tenantId
      const { id: _id, tenantId: _tid, ...returnData } = data;

      return res.status(200).json({
        success: true,
        message: "Menu fetched successfully",
        data: returnData,
      });
    } catch (error) {
      if (error.message.includes("not found")) error.statusCode = 404;
      else if (error.message.includes("Access denied")) error.statusCode = 403;
      next(error);
    }
  };

  // [POST] /api/menus
  create = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const newMenu = await this.menusService.createMenu({
        ...req.body,
        tenantId: tenantId, // Force tenantId
      });

      // Lọc bỏ id và tenantId
      const {tenantId: _tid, ...returnData } = newMenu;

      // Emit socket event for real-time updates
      emitMenuCreated(tenantId, returnData);

      return res.status(201).json({
        success: true,
        message: "Menu item created successfully",
        data: returnData,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };

  // [PUT] /api/menus/:id
  update = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      const updatedMenu = await this.menusService.updateMenu(
        id,
        tenantId,
        req.body
      );

      // Lọc bỏ id và tenantId
      const { id: _id, tenantId: _tid, ...returnData } = updatedMenu;

      // Emit socket event for real-time updates
      emitMenuUpdated(tenantId, { ...returnData, id });

      return res.status(200).json({
        success: true,
        message: "Menu item updated",
        data: returnData,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };

  // [DELETE] /api/menus/:id
  delete = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      await this.menusService.deleteMenu(id, tenantId);

      // Emit socket event for real-time updates
      emitMenuDeleted(tenantId, id);

      return res.status(200).json({
        success: true,
        message: "Menu item deleted",
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };
}

export default MenusController;

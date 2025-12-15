// backend/controllers/Menus/menusController.js

class MenusController {
  constructor(menusService, categoriesService) {
    this.menusService = menusService;
    this.categoriesService = categoriesService;
  }

  // [GET] /api/menus/?token=xxx&categoryId=<id>&available=true
  getAll = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { categoryId, available } = req.query; // Lấy query params
      const onlyAvailable = available === "true";

      const data = await this.menusService.getMenusByTenant(
        tenantId,
        categoryId,
        onlyAvailable
      );

      // Lọc bỏ id và tenantId từ danh sách
      const returnData = data.map((item) => {
        const { id, tenantId, ...rest } = item;
        return rest;
      });
      //Nếu có categoryId được truyền vào thì lấy nó và search, nếu không thì null
      //const categoryName = categoryId ? this.categoriesService.getCategoryById(categoryId)?.name + ' category' : '';
      let categoryName = "";
      if (categoryId) {
        const category = await this.categoriesService.getCategoryById(
          categoryId,
          tenantId
        );
        categoryName = category.name + " category";
      }

      // Thêm thông tin bàn nếu có QR token
      const responseData = {
        success: true,
        message: `Menus fetched ${categoryName} successfully`,
        total: returnData.length,
        data: returnData,
      };

      // Nếu request từ customer (có qrToken), thêm thông tin bàn
      if (req.qrToken) {
        responseData.table = {
          tableNumber: req.qrToken.tableNumber,
          tableId: req.qrToken.tableId,
        };
      }

      return res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  };

  // [GET] /api/menus/:id?token=xxx
  getById = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      const data = await this.menusService.getMenuById(id, tenantId);

      // Lọc bỏ id và tenantId
      const { id: _id, tenantId: _tid, ...returnData } = data;

      const responseData = {
        success: true,
        message: "Menu fetched successfully",
        data: returnData,
      };

      // Nếu request từ customer (có qrToken), thêm thông tin bàn
      if (req.qrToken) {
        responseData.table = {
          tableNumber: req.qrToken.tableNumber,
          tableId: req.qrToken.tableId,
        };
      }

      return res.status(200).json(responseData);
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
      const { id: _id, tenantId: _tid, ...returnData } = newMenu;

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

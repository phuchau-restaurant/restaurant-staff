// backend/controllers/Menus/menusController.js

class MenusController {
  constructor(menusService) {
    this.menusService = menusService;
  }

  // [GET] /api/menus
  getAll = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { categoryId, available } = req.query; // Lấy query params
      const onlyAvailable = available === 'true';

      const data = await this.menusService.getMenusByTenant(tenantId, categoryId, onlyAvailable);
      
      return res.status(200).json({ 
        success: true,
        message: "Menus fetched successfully",
        total: data.length,
        data: data
      });
    } catch (error) {
      next(error);
    }
  }

  // [GET] /api/menus/:id
  getById = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      const data = await this.menusService.getMenuById(id, tenantId);
      
      return res.status(200).json({ 
        success: true,
        message: "Menu fetched successfully",
        data: data
      });
    } catch (error) {
      if (error.message.includes("not found")) error.statusCode = 404;
      else if (error.message.includes("Access denied")) error.statusCode = 403;
      next(error);
    }
  }

  // [POST] /api/menus
  create = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const newMenu = await this.menusService.createMenu({
        ...req.body,
        tenantId: tenantId // Force tenantId
      });

      return res.status(201).json({ 
        success: true, 
        message: "Menu item created successfully", 
        data: newMenu 
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  // [PUT] /api/menus/:id
  update = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      const updatedMenu = await this.menusService.updateMenu(id, tenantId, req.body);

      return res.status(200).json({ 
        success: true, 
        message: "Menu item updated", 
        data: updatedMenu 
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  // [DELETE] /api/menus/:id
  delete = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      await this.menusService.deleteMenu(id, tenantId);

      return res.status(200).json({ 
        success: true, 
        message: "Menu item deleted" 
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }
}

export default MenusController;
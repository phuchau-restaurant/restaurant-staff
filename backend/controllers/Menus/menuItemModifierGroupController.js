// backend/controllers/Menus/menuItemModifierGroupController.js

class MenuItemModifierGroupController {
  constructor(service) {
    this.service = service;
  }

  // [POST] /api/menu-item-modifier-group
  addLink = async (req, res, next) => {
    try {
      const { dishId, groupId } = req.body;
      if (!dishId || !groupId) throw new Error("dishId và groupId là bắt buộc");
      const result = await this.service.addLink(dishId, groupId);
      res.status(201).json({ success: true, data: result.toResponse() });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };

  // [DELETE] /api/menu-item-modifier-group
  removeLink = async (req, res, next) => {
    try {
      const { dishId, groupId } = req.body;
      if (!dishId || !groupId) throw new Error("dishId và groupId là bắt buộc");
      await this.service.removeLink(dishId, groupId);
      res
        .status(200)
        .json({ success: true, message: "Xóa liên kết thành công" });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };

  // [GET] /api/menu-item-modifier-group?dishId=...&groupId=...
  findLink = async (req, res, next) => {
    try {
      const { dishId, groupId } = req.query;
      if (!dishId) throw new Error("dishId là bắt buộc");
      let result;
      if (groupId) {
        result = await this.service.findLink(dishId, groupId);
      } else {
        result = await this.service.findByDishId(dishId);
      }
      res
        .status(200)
        .json({ success: true, data: result.map((r) => r.toResponse()) });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };
}

export default MenuItemModifierGroupController;

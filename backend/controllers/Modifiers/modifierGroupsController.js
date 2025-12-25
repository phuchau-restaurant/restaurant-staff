// backend/controllers/Modifiers/modifierGroupsController.js

/**
 * Controller xử lý HTTP requests cho Modifier Groups và Options
 */
class ModifierGroupsController {
  constructor(modifierGroupsService) {
    this.modifierGroupsService = modifierGroupsService;
  }

  // ==================== MODIFIER GROUPS ====================

  /**
   * [GET] /api/admin/menu/modifier-groups
   * Lấy danh sách modifier groups (có thể search)
   */
  getAll = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;

      const { search, status } = req.query;
      const data = await this.modifierGroupsService.getAllGroups(
        tenantId,
        search,
        status
      );

      return res.status(200).json({
        success: true,
        message: "Modifier groups fetched successfully",
        total: data.length,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * [GET] /api/admin/menu/modifier-groups/:id
   * Lấy chi tiết modifier group theo ID
   */
  getById = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      const data = await this.modifierGroupsService.getGroupById(id, tenantId);

      return res.status(200).json({
        success: true,
        message: "Modifier group fetched successfully",
        data,
      });
    } catch (error) {
      if (error.message.includes("not found")) error.statusCode = 404;
      else if (error.message.includes("Access denied")) error.statusCode = 403;
      next(error);
    }
  };

  /**
   * [POST] /api/admin/menu/modifier-groups
   * Tạo modifier group mới (có thể kèm options)
   */
  create = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const groupData = req.body;

      const newGroup = await this.modifierGroupsService.createGroup(
        groupData,
        tenantId
      );

      return res.status(201).json({
        success: true,
        message: "Modifier group created successfully",
        data: newGroup,
      });
    } catch (error) {
      if (error.message.includes("already exists")) error.statusCode = 409;
      else error.statusCode = 400;
      next(error);
    }
  };

  /**
   * [PUT] /api/admin/menu/modifier-groups/:id
   * Cập nhật modifier group (bao gồm options)
   */
  update = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      const updateData = req.body;

      const updatedGroup = await this.modifierGroupsService.updateGroup(
        id,
        updateData,
        tenantId
      );

      return res.status(200).json({
        success: true,
        message: "Modifier group updated successfully",
        data: updatedGroup,
      });
    } catch (error) {
      if (error.message.includes("not found")) error.statusCode = 404;
      else if (error.message.includes("Access denied")) error.statusCode = 403;
      else if (error.message.includes("already exists")) error.statusCode = 409;
      else error.statusCode = 400;
      next(error);
    }
  };

  /**
   * [DELETE] /api/admin/menu/modifier-groups/:id
   * Xóa modifier group (cascade delete options)
   */
  delete = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      await this.modifierGroupsService.deleteGroup(id, tenantId);

      return res.status(200).json({
        success: true,
        message: "Modifier group deleted successfully",
      });
    } catch (error) {
      if (error.message.includes("not found")) error.statusCode = 404;
      else if (error.message.includes("Access denied")) error.statusCode = 403;
      next(error);
    }
  };

  /**
   * [PATCH] /api/admin/menu/modifier-groups/:id/status
   * Toggle trạng thái active/inactive
   */
  toggleStatus = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      const { isActive } = req.body;

      if (isActive === undefined) {
        return res.status(400).json({
          success: false,
          message: "isActive is required",
        });
      }

      const updatedGroup = await this.modifierGroupsService.toggleGroupStatus(
        id,
        isActive,
        tenantId
      );

      return res.status(200).json({
        success: true,
        message: `Modifier group ${
          isActive ? "activated" : "deactivated"
        } successfully`,
        data: updatedGroup,
      });
    } catch (error) {
      if (error.message.includes("not found")) error.statusCode = 404;
      else if (error.message.includes("Access denied")) error.statusCode = 403;
      next(error);
    }
  };

  // ==================== MODIFIER OPTIONS ====================

  /**
   * [POST] /api/admin/menu/modifier-groups/:id/options
   * Tạo option mới trong group
   */
  createOption = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id: groupId } = req.params;
      const optionData = req.body;

      const newOption = await this.modifierGroupsService.createOption(
        groupId,
        optionData,
        tenantId
      );

      return res.status(201).json({
        success: true,
        message: "Modifier option created successfully",
        data: newOption,
      });
    } catch (error) {
      if (error.message.includes("not found")) error.statusCode = 404;
      else if (error.message.includes("Access denied")) error.statusCode = 403;
      else error.statusCode = 400;
      next(error);
    }
  };

  /**
   * [PUT] /api/admin/menu/modifier-options/:id
   * Cập nhật option
   */
  updateOption = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id: optionId } = req.params;
      const optionData = req.body;

      const updatedOption = await this.modifierGroupsService.updateOption(
        optionId,
        optionData,
        tenantId
      );

      return res.status(200).json({
        success: true,
        message: "Modifier option updated successfully",
        data: updatedOption,
      });
    } catch (error) {
      if (error.message.includes("not found")) error.statusCode = 404;
      else if (error.message.includes("Access denied")) error.statusCode = 403;
      else error.statusCode = 400;
      next(error);
    }
  };

  /**
   * [DELETE] /api/admin/menu/modifier-options/:id
   * Xóa option
   */
  deleteOption = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id: optionId } = req.params;

      await this.modifierGroupsService.deleteOption(optionId, tenantId);

      return res.status(200).json({
        success: true,
        message: "Modifier option deleted successfully",
      });
    } catch (error) {
      if (error.message.includes("not found")) error.statusCode = 404;
      else if (error.message.includes("Access denied")) error.statusCode = 403;
      next(error);
    }
  };
}

export default ModifierGroupsController;

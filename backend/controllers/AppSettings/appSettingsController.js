// backend/controllers/AppSettings/appSettingsController.js

class AppSettingsController {
  constructor(appSettingsService) {
    this.appSettingsService = appSettingsService;
  }

  // [GET] /api/settings?category=Printer
  getAll = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { category } = req.query;

      const data = await this.appSettingsService.getSettingsByTenant(tenantId, category);

      // Clean Response (Array .map)
      const returnData = data.map(item => {
        const { id, tenantId, ...rest } = item;
        return rest;
      });

      return res.status(200).json({
        success: true,
        message: "Settings fetched successfully",
        total: returnData.length,
        data: returnData
      });
    } catch (error) {
      next(error);
    }
  }

  // [GET] /api/settings/:id
  getById = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      const data = await this.appSettingsService.getSettingById(id, tenantId);

      // Clean Response (Destructuring)
      const { id: _id, tenantId: _tid, ...returnData } = data;

      return res.status(200).json({
        success: true,
        message: "Setting fetched successfully",
        data: returnData
      });
    } catch (error) {
      if (error.message.includes("not found")) error.statusCode = 404;
      else if (error.message.includes("Access denied")) error.statusCode = 403;
      next(error);
    }
  }

  // [POST] /api/settings
  create = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const newSetting = await this.appSettingsService.createSetting({
        ...req.body,
        tenantId: tenantId // Force TenantID
      });

      const { id: _id, tenantId: _tid, ...returnData } = newSetting;

      return res.status(201).json({
        success: true,
        message: "App setting created successfully",
        data: returnData
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  // [PUT] /api/settings/:id
  update = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      const updatedSetting = await this.appSettingsService.updateSetting(id, tenantId, req.body);

      const { id: _id, tenantId: _tid, ...returnData } = updatedSetting;

      return res.status(200).json({
        success: true,
        message: "App setting updated successfully",
        data: returnData
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  // [DELETE] /api/settings/:id
  delete = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      await this.appSettingsService.deleteSetting(id, tenantId);

      return res.status(200).json({
        success: true,
        message: "App setting deleted successfully"
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }
}

export default AppSettingsController;
// backend/controllers/Tables/tablesController.js

class TablesController {
  constructor(tablesService) {
    this.tablesService = tablesService;
  }

  // [GET] /api/admin/tables?location=<tableLocation>&status=<tableStatus>
  getAll = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { location, status } = req.query;
      
      const filters = {};
      if (location) filters.location = location;
      if (status) filters.status = status;

      const data = await this.tablesService.getAllTables(tenantId, filters);

      // Clean response
      const returnData = data.map(t => {
          const { id: _id, tenantId: _tid, ...rest } = t;
          return rest;
      });
      const locationMess = location ? ` with location '${location}'` : "";
      const statusMess = status ? ` and status '${status}'` : "";
      return res.status(200).json({
        success: true,
        message: `Tables fetched successfully${locationMess}${statusMess}`,
        total: returnData.length,
        data: returnData
      });
    } catch (error) {
      next(error);
    }
  }

  // [GET] /api/admin/tables/:id
  getById = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      const data = await this.tablesService.getTableById(id, tenantId);
      
      const { id: _id, tenantId: _tid, ...returnData } = data;

      return res.status(200).json({
        success: true,
        message: `Table with id ${id} fetched successfully`,
        data: returnData
      });
    } catch (error) {
       if (error.message.includes("not found")) error.statusCode = 404;
       else if (error.message.includes("Access denied")) error.statusCode = 403;
       next(error);
    }
  }

  // [POST] /api/admin/tables
  create = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const newTable = await this.tablesService.createTable({
        ...req.body,
        tenantId
      });

      const { id: _id, tenantId: _tid, ...returnData } = newTable;

      return res.status(201).json({
        success: true,
        message: "Table created successfully",
        data: returnData
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  // [PUT] /api/admin/tables/:id
  update = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      
      const updatedTable = await this.tablesService.updateTable(id, tenantId, req.body);
      
      const { id: _id, tenantId: _tid, ...returnData } = updatedTable;

      return res.status(200).json({
        success: true,
        message: `Table with id ${id} updated successfully`,
        data: returnData
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  // [PATCH] /api/admin/tables/:id/status
  updateStatus = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      const { status } = req.body; // { status: 'Inactive' }

      if (!status) throw new Error("Status is required");

      const updatedTable = await this.tablesService.updateTableStatus(id, tenantId, status);
      
      const { id: _id, tenantId: _tid, ...returnData } = updatedTable;

      return res.status(200).json({
        success: true,
        message: `Table with id ${id} status updated successfully`,
        data: returnData
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }
}

export default TablesController;
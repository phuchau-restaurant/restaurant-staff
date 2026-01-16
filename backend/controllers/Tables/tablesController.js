// backend/controllers/Tables/tablesController.js
import {
  emitTableCreated,
  emitTableUpdated,
  emitTableStatusChanged,
  emitTableDeleted,
} from "../../utils/tableSocketEmitters.js";

class TablesController {
  constructor(tablesService) {
    this.tablesService = tablesService;
  }

  // [GET] /api/admin/tables?location=<tableLocation>&status=<tableStatus>&pageNumber=1&pageSize=10
  getAll = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { location, status, pageNumber, pageSize } = req.query;
      
      const filters = {};
      if (location) filters.location = location;
      if (status) filters.status = status;

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

      const result = await this.tablesService.getAllTables(tenantId, filters, pagination);

      // Xử lý response dựa trên có phân trang hay không
      let tableData, paginationInfo;
      if (pagination) {
        tableData = result.data;
        paginationInfo = result.pagination;
      } else {
        tableData = result;
        paginationInfo = null;
      }

      // Clean response
      const returnData = tableData.map(t => {
          const { tenantId: _tid, ...rest } = t;
          return rest;
      });
      const locationMess = location ? ` with location '${location}'` : "";
      const statusMess = status ? ` and status '${status}'` : "";
      
      // Build response
      const response = {
        success: true,
        message: `Tables fetched successfully${locationMess}${statusMess}`,
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

      // Emit socket event for real-time updates
      emitTableCreated(tenantId, { ...returnData, tableId: newTable.id });

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

      // Emit socket event for real-time updates
      emitTableUpdated(tenantId, { ...returnData, tableId: id });

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

      // Emit socket event for real-time updates
      emitTableStatusChanged(tenantId, { ...returnData, tableId: id });

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

  // [DELETE] /api/admin/tables/:id
  delete = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      await this.tablesService.deleteTable(id, tenantId);

      // Emit socket event for real-time updates
      emitTableDeleted(tenantId, id);

      return res.status(200).json({
        success: true,
        message: `Table with id ${id} deleted permanently`,
      });
    } catch (error) {
      if (error.message.includes("not found")) error.statusCode = 404;
      else if (error.message.includes("Access denied")) error.statusCode = 403;
      else error.statusCode = 400;
      next(error);
    }
  }
}

export default TablesController;
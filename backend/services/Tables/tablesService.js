// backend/services/Tables/tablesService.js
import TableLocation from "../../constants/tableLocation.js";
import TableStatus from "../../constants/tableStatus.js";

class TablesService {
  constructor(tablesRepo) {
    this.tablesRepo = tablesRepo;
  }

  // Helper: Validate Data chung
  validateTableData(data) {
    const { capacity, location, status } = data;

    // Check Capacity
    if (capacity !== undefined) {
        if (!Number.isInteger(Number(capacity)) || capacity <= 0 || capacity > 20) {
            throw new Error("Capacity must be a positive integer between 1 and 20");
        }
    }

    // Check Location Enum
    if (location && !Object.values(TableLocation).includes(location)) {
        throw new Error(`Invalid location. Allowed: ${Object.values(TableLocation).join(", ")}`);
    }

    // Check Status Enum
    if (status && !Object.values(TableStatus).includes(status)) {
        throw new Error(`Invalid status. Allowed: ${Object.values(TableStatus).join(", ")}`);
    }
  }

  /**
   * Lấy danh sách tables của tenant
   * @param {string} tenantId - ID của tenant
   * @param {object} filters - Các filter (location, status)
   * @param {object|null} pagination - { pageNumber, pageSize } (optional)
   */
  async getAllTables(tenantId, filters = {}, pagination = null) {
    if (!tenantId) throw new Error("Tenant ID is required");
    // Force tenant_id vào filter
    filters.tenant_id = tenantId;
    return await this.tablesRepo.getAll(filters, pagination);
  }

  async getTableById(id, tenantId) {
    const table = await this.tablesRepo.getById(id);
    if (!table) throw new Error("Table not found");
    if (tenantId && table.tenantId !== tenantId) throw new Error("Access denied");
    return table;
  }

  async createTable(data) {
    const { tenantId, tableNumber, capacity, location } = data;

    // 1. Validation Required Fields
    if (!tenantId) throw new Error("Tenant ID is required");
    if (!tableNumber) throw new Error("Table number is required");
    if (!capacity) throw new Error("Capacity is required");
    
    // 2. Validate Values
    this.validateTableData(data);

    // 3. Check Unique Table Number
    const existing = await this.tablesRepo.findByTableNumber(tenantId, tableNumber);
    if (existing) {
        throw new Error(`Table number '${tableNumber}' already exists`);
    }

    // 4. Create (Mặc định status là Active nếu không truyền)
    return await this.tablesRepo.create({
        ...data,
        status: data.status || TableStatus.ACTIVE
    });
  }

  async updateTable(id, tenantId, updates) {
    // 1. Check tồn tại
    const currentTable = await this.getTableById(id, tenantId);

    // 2. Validate Values nếu có update
    this.validateTableData(updates);

    // 3. Check Unique Table Number (nếu có đổi tên bàn)
    if (updates.tableNumber && updates.tableNumber !== currentTable.tableNumber) {
        const existing = await this.tablesRepo.findByTableNumber(tenantId, updates.tableNumber, id);
        if (existing) {
            throw new Error(`Table number '${updates.tableNumber}' already exists`);
        }
    }

    // 4. Update
    return await this.tablesRepo.update(id, updates);
  }

  // PATCH Status (Chỉ đổi status)
  async updateTableStatus(id, tenantId, status) {
    // 1. Validate Status
    if (!Object.values(TableStatus).includes(status)) {
        throw new Error(`Invalid status. Allowed: ${Object.values(TableStatus).join(", ")}`);
    }

    // 2. Logic nghiệp vụ khi Deactivate
    if (status === TableStatus.INACTIVE) {
        const currentTable = await this.getTableById(id, tenantId);
        
        // Kiểm tra xem bàn có đang có đơn hàng Active không (occupied)
        // Logic này dựa trên trường currentOrderId hoặc truy vấn bảng Orders
        // Tạm thời check đơn giản qua status của bàn
        if (currentTable.status === TableStatus.OCCUPIED 
            //|| currentTable.currentOrderId
        ) {
            // Tùy nghiệp vụ: Cảnh báo hoặc Chặn
            // Ở đây ta throw warning để Controller xử lý confirm (hoặc chặn luôn API)
            throw new Error("Cannot deactivate a table that has active orders");
        }
    }

    return await this.tablesRepo.update(id, { status });
  }
}

export default TablesService;
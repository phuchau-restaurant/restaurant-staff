// backend/repositories/implementation/OrdersRepository.js
import { BaseRepository } from "./BaseRepository.js";
import { Orders } from "../../models/Orders.js";
import { supabase } from "../../configs/database.js";

export class OrdersRepository extends BaseRepository {
  constructor() { //orders: [id, tenant_id, table_id, display_order, status, total_amount, created_at, completed_at, waiter_id] 
    super("orders", "id");
  }

  // Hàm lấy danh sách đơn hàng có lọc linh hoạt
  async getAll(filters = {}) {
    let query = supabase.from(this.tableName).select("*");

    // Lọc theo status (Unsubmit, Pending, Approved, Completed...)
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Lọc theo tenant_id
    if (filters.tenant_id) {
      query = query.eq('tenant_id', filters.tenant_id);
    }

    // Lọc theo waiter_id (đơn của tôi)
    if (filters.waiter_id) {
      query = query.eq('waiter_id', filters.waiter_id);
    }

    // Lọc theo thời gian tạo (lấy đơn từ thời điểm này trở đi)
    if (filters.created_after) {
      query = query.gte('created_at', filters.created_after.toISOString());
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(`[Orders] GetAll failed: ${error.message}`);
    return data.map(item => new Orders(item));
  }

  /**
   * Lấy danh sách đơn hàng có phân trang
   * @param {Object} filters - { status, tenant_id, waiter_id }
   * @param {number} pageNumber - Số trang (bắt đầu từ 1)
   * @param {number} pageSize - Số items mỗi trang
   * @returns {Promise<Object>} { data, totalCount, totalPages, currentPage, pageSize }
   */
  async getAllWithPagination(filters = {}, pageNumber = 1, pageSize = 10) {
    // Query cho count
    let countQuery = supabase.from(this.tableName).select("*", { count: "exact", head: true });

    // Query cho data
    let dataQuery = supabase.from(this.tableName).select("*");

    // Apply filters cho cả 2 queries
    const applyFilters = (query) => {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.tenant_id) {
        query = query.eq('tenant_id', filters.tenant_id);
      }
      if (filters.waiter_id) {
        query = query.eq('waiter_id', filters.waiter_id);
      }
      // Lọc theo thời gian tạo (lấy đơn từ thời điểm này trở đi)
      if (filters.created_after) {
        query = query.gte('created_at', filters.created_after.toISOString());
      }
      return query;
    };

    countQuery = applyFilters(countQuery);
    dataQuery = applyFilters(dataQuery);

    // Order và pagination
    const from = (pageNumber - 1) * pageSize;
    const to = from + pageSize - 1;

    dataQuery = dataQuery
      .order('created_at', { ascending: false })
      .range(from, to);

    // Execute queries
    const [{ count, error: countError }, { data, error: dataError }] = await Promise.all([
      countQuery,
      dataQuery
    ]);

    if (countError) throw new Error(`[Orders] Count failed: ${countError.message}`);
    if (dataError) throw new Error(`[Orders] GetAll with pagination failed: ${dataError.message}`);

    const totalPages = Math.ceil(count / pageSize);

    return {
      data: data.map(item => new Orders(item)),
      totalCount: count,
      totalPages,
      currentPage: pageNumber,
      pageSize
    };
  }




  // Override create để trả về Model
  async create(data) {
    const entity = new Orders(data);
    const dbPayload = entity.toPersistence();

    // Clean payload
    Object.keys(dbPayload).forEach(key => dbPayload[key] === undefined && delete dbPayload[key]);

    // Gọi cha (BaseRepository) -> Sử dụng super. thay vì await supabase
    const rawData = await super.create(dbPayload);
    return rawData ? new Orders(rawData) : null;
  }

  async getById(id) {
    const rawData = await super.getById(id);
    return rawData ? new Orders(rawData) : null;
  }

  async update(id, updates) {
    // Chỉ convert những field có trong updates gốc
    // Tránh việc model set default null và xóa mất dữ liệu
    const fieldMapping = {
      tenantId: 'tenant_id',
      tableId: 'table_id',
      status: 'status',
      totalAmount: 'total_amount',
      prepTimeOrder: 'prep_time_order',
      createdAt: 'created_at',
      completedAt: 'completed_at',
      waiterId: 'waiter_id',
    };

    const dbPayload = {};
    for (const [jsKey, dbKey] of Object.entries(fieldMapping)) {
      if (updates.hasOwnProperty(jsKey)) {
        dbPayload[dbKey] = updates[jsKey];
      }
      // Nếu key đã là snake_case thì giữ nguyên
      if (updates.hasOwnProperty(dbKey)) {
        dbPayload[dbKey] = updates[dbKey];
      }
    }

    const rawData = await super.update(id, dbPayload);
    return rawData ? new Orders(rawData) : null;
  }

  async delete(id) {
    const rawData = await super.delete(id);
    return rawData ? new Orders(rawData) : null;
  }
}
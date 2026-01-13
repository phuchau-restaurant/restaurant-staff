// backend/repositories/implementation/OrdersRepository.js
import { BaseRepository } from "./BaseRepository.js";
import { Orders } from "../../models/Orders.js";
import { supabase } from "../../configs/database.js";

export class OrdersRepository extends BaseRepository {
  constructor() { //orders: [id, tenant_id, table_id, display_order, status, total_amount, created_at, completed_at, waiter_id] 
    super("orders", "id");
  }

  // Hàm lấy danh sách đơn hàng có lọc status
  async getAll(filters = {}) {
    let query = supabase.from(this.tableName).select("*"); //supabase ? -> super.

    // Lọc theo status (pending, completed...)
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Lọc theo tenant_id
    if (filters.tenant_id) {
      query = query.eq('tenant_id', filters.tenant_id);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(`[Orders] GetAll failed: ${error.message}`);
    return data.map(item => new Orders(item));
  }

  // Lấy đơn hàng theo waiter_id (đơn của tôi)
  async getByWaiterId(waiterId, tenantId) {
    let query = supabase
      .from(this.tableName)
      .select("*")
      .eq('waiter_id', waiterId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(`[Orders] GetByWaiterId failed: ${error.message}`);
    return data.map(item => new Orders(item));
  }

  // Lấy đơn hàng chưa có người nhận (waiter_id = null)
  async getUnassignedOrders(tenantId) {
    let query = supabase
      .from(this.tableName)
      .select("*")
      .is('waiter_id', null)
      .eq('status', 'Unsubmit') // Chỉ lấy đơn chưa được xác nhận
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(`[Orders] GetUnassignedOrders failed: ${error.message}`);
    return data.map(item => new Orders(item));
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
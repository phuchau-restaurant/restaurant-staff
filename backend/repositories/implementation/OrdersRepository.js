// backend/repositories/implementation/OrdersRepository.js
import { BaseRepository } from "./BaseRepository.js";
import { Orders } from "../../models/Orders.js";
import { supabase } from "../../configs/database.js";

export class OrdersRepository extends BaseRepository {
  constructor() { //orders: [id, tenant_id, table_id, display_order, status, total_amount, created_at, completed_at] 
    super("orders", "id");
  }

  // Hàm lấy danh sách đơn hàng có lọc status
  async getAll(filters = {}) {
    let query = supabase.from(this.tableName).select("*"); //supabase ? -> super.

    // Lọc theo status (pending, completed...)
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(`[Orders] GetAll failed: ${error.message}`);
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
    const entity = new Orders(updates);
    const dbPayload = entity.toPersistence();
    Object.keys(dbPayload).forEach(key => dbPayload[key] === undefined && delete dbPayload[key]);

    const rawData = await super.update(id, dbPayload);
    return rawData ? new Orders(rawData) : null;
  }

  async delete(id) {
    const rawData = await super.delete(id);
    return rawData ? new Orders(rawData) : null;
  }
}
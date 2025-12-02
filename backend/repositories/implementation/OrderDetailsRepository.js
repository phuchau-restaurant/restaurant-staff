import { BaseRepository } from "./BaseRepository.js";
import { supabase } from "../../configs/database.js";
import { OrderDetails } from "../../models/OrderDetails.js";

export class OrderDetailsRepository extends BaseRepository {
  constructor() {
    // order_details [id, tenant_id, order_id, dish_id, quantity, unit_price, note, status]
    super("order_details", "id");
  }

  // Hàm tạo nhiều bản ghi cùng lúc
  async createMany(detailsArray) {
    // 1. Map sang Persistence format
    const dbPayloads = detailsArray.map(item => {
      const entity = new OrderDetails(item);
      const payload = entity.toPersistence();
      // Clean payload
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
      return payload;
    });

    // 2. Insert bulk bằng Supabase
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(dbPayloads)
      .select();

    if (error) throw new Error(`[OrderDetails] CreateMany failed: ${error.message}`);
    
    // 3. Map kết quả về Model
    return data.map(item => new OrderDetails(item));
  }

  ///<summary>
  /// Lấy chi tiết đơn hàng theo nhiều Order IDs
  /// Có thể lọc thêm theo trạng thái món (itemStatus)
  ///</summary>
  async getByOrderIds(orderIds, itemStatus = null) {
    if (orderIds.length === 0) return [];

    let query = supabase
      .from(this.tableName)
      .select("*")
      .in('order_id', orderIds);

    // Lọc cấp 2: Trạng thái của từng món (Ví dụ: chỉ lấy món 'pending' chưa nấu)
    if (itemStatus) {
      query = query.eq('status', itemStatus);
    }

    const { data, error } = await query;
    if (error) throw new Error(`[OrderDetails] GetByOrderIds failed: ${error.message}`);

    return data.map(item => new OrderDetails(item));
  }
  
  async getByOrderId(orderId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("order_id", orderId);

    if (error) throw new Error(`[OrderDetails] GetByOrderId failed: ${error.message}`);
    return data.map(item => new OrderDetails(item));
  }
  
  async deleteByOrderId(orderId) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq("order_id", orderId);

    if (error) throw new Error(`[OrderDetails] DeleteByOrderId failed: ${error.message}`);
    return true;
  }
}
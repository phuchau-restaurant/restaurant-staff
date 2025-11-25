// backend/repositories/CategoryRepository.js
import { BaseRepository } from "./BaseRepository.js";
import { supabase } from "../configs/database.js";

class CategoryRepository extends BaseRepository {
  constructor() {
    // Mapping đúng với schema: [id, tenant_id, name, display_order, is_active]
    super("categories", "id"); 
  }
  /**
   * Tìm category theo tên (Bắt buộc phải có tenant_id để tránh lộ data)
   * @param {string} tenantId - ID của nhà hàng/thuê bao
   * @param {string} name - Tên cần tìm
   */
  async findByName(tenantId, name) {
    if (!tenantId) throw new Error("TenantID is required for search");

    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq('tenant_id', tenantId) // Quan trọng: Chỉ tìm trong tenant này
      .ilike('name', `%${name}%`);

    if (error) throw new Error(`FindByName failed: ${error.message}`);
    return data || [];
  }

  // Các hàm create, update, delete, getById... ĐÃ CÓ SẴN từ BaseRepository.
  // KHÔNG CẦN viết lại nếu không có logic gì đặc biệt khác.
}
export default new CategoryRepository();
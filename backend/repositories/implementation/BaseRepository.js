// backend/repositories/supabaseImplementation/BaseRepository.js
import { IBaseRepository } from "../interfaces/IBaseRepository.js";
import { supabase } from "../../configs/database.js"; // Phụ thuộc cụ thể vào Supabase
/**
 * SupabaseBaseRepository
 * Lớp thực thi giao tiếp cụ thể với Supabase.
 * Kế thừa từ IBaseRepository để đảm bảo đúng chuẩn.
 */

// Kế thừa từ Interface để đảm bảo tuân thủ hợp đồng
export class BaseRepository extends IBaseRepository {
  /**
   * @param {string} tableName - Tên bảng trong Supabase
   * @param {string} primaryKey - Tên khóa chính (mặc định: "id")
   */
  constructor(tableName, primaryKey = "id") {
    super();
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  async create(data) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert([data])
      .select();

    if (error) 
      {
        throw new Error(`[${this.tableName}] Create failed: ${error.message}`);
      }
    return result?.[0] || null;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq(this.primaryKey, id)
      .single();
// Mã lỗi PGRST116 nghĩa là không tìm thấy bản ghi -> Trả về null thay vì throw lỗi
    if (error && error.code !== "PGRST116") {
      throw new Error(`[${this.tableName}] GetById failed: ${error.message}`);
    }
    return data || null;
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq(this.primaryKey, id)
      .select();

    if (error) {
      throw new Error(`[${this.tableName}] Update failed: ${error.message}`);
    }
    return data?.[0] || null;
  }

  async delete(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .delete()
      .eq(this.primaryKey, id)
      .select();

    if (error) {
      throw new Error(`[${this.tableName}] Delete failed: ${error.message}`);
    }
    return data?.[0] || null;
  }

  // Logic tốt để xử lý tenant_id và is_active
  async getAll(filters = {}) {
    let query = supabase.from(this.tableName).select("*");

    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }

    // Thêm order để dữ liệu nhất quán (Optional)
    // Nếu bảng có display_order thì nên sort, còn không thì sort theo id
    // query = query.order('id', { ascending: true }); 

    const { data, error } = await query;
    if (error) {
      throw new Error(`[${this.tableName}] GetAll failed: ${error.message}`);
    }
    return data || [];
  }
}
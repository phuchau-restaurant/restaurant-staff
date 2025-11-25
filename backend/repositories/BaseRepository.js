// backend/repositories/BaseRepository.js
import { supabase } from "../configs/database.js"; 

/**
 * BaseRepository - Lớp cha phụ trách giao tiếp Database
 * -----------------------------------------------------
 */
export class BaseRepository {
  constructor(tableName, primaryKey = "id") {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  async create(data) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert([data])
      .select();

    if (error) throw new Error(`[${this.tableName}] Create failed: ${error.message}`);
    return result?.[0] || null;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq(this.primaryKey, id)
      .single();

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

    if (error) throw new Error(`[${this.tableName}] Update failed: ${error.message}`);
    return data?.[0] || null;
  }

  async delete(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .delete()
      .eq(this.primaryKey, id)
      .select();

    if (error) throw new Error(`[${this.tableName}] Delete failed: ${error.message}`);
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
    if (error) throw new Error(`[${this.tableName}] GetAll failed: ${error.message}`);
    return data || [];
  }
}
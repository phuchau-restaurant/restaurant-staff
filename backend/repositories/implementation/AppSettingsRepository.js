// backend/repositories/implementation/AppSettingRepository.js
import { BaseRepository } from "./BaseRepository.js";
import { supabase } from "../../configs/database.js";
import { AppSetting } from "../../models/AppSettings.js";

export class AppSettingRepository extends BaseRepository {
  constructor() {
    // Mapping: [id, tenant_id, key, value, value_type, category, description, is_system]
    super("app_settings", "id"); 
  }

  async create(data) {
    const entity = new AppSetting(data);
    const dbPayload = entity.toPersistence(); 

    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert([dbPayload])
      .select();

    if (error) throw new Error(`[AppSetting] Create failed: ${error.message}`);
    
    return result?.[0] ? new AppSetting(result[0]) : null;
  }

  async update(id, updates) {
    const entity = new AppSetting(updates);
    const dbPayload = entity.toPersistence();

    // Clean Payload: Loại bỏ các key undefined để tránh ghi đè null/default
    Object.keys(dbPayload).forEach(key => {
        if (dbPayload[key] === undefined) {
            delete dbPayload[key];
        }
    });

    const { data, error } = await supabase
      .from(this.tableName)
      .update(dbPayload) 
      .eq(this.primaryKey, id)
      .select();

    if (error) throw new Error(`[AppSetting] Update failed: ${error.message}`);
    
    return data?.[0] ? new AppSetting(data[0]) : null;
  }

  async getById(id) {
    const rawData = await super.getById(id);
    return rawData ? new AppSetting(rawData) : null;
  }

  async getAll(filters = {}) {
    const rawData = await super.getAll(filters);    
    return rawData.map(item => new AppSetting(item));
  }

  /**
   * Tìm Setting theo Key 
   * Ví dụ: Lấy cấu hình 'tax_rate' của tenant A
   */
  async findByKey(tenantId, key) {
    if (!tenantId) throw new Error("TenantID is required");

    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq('tenant_id', tenantId)
      .eq('key', key) // Tìm chính xác key
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 là lỗi không tìm thấy
        throw new Error(`[AppSetting] FindByKey failed: ${error.message}`);
    }
    
    return data ? new AppSetting(data) : null;
  }

  /**
   * Tìm tất cả Settings thuộc về một Category
   * Ví dụ: Lấy toàn bộ cấu hình thuộc nhóm 'Printer'
   */
  async findByCategory(tenantId, category) {
    if (!tenantId) throw new Error("TenantID is required");

    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq('tenant_id', tenantId)
      .eq('category', category);

    if (error) throw new Error(`[AppSetting] FindByCategory failed: ${error.message}`);

    return data.map(item => new AppSetting(item));
  }
}
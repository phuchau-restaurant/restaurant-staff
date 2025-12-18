// backend/repositories/implementation/MenusRepository.js
import { BaseRepository } from "./BaseRepository.js";
import { supabase } from "../../configs/database.js";
import { Menus } from "../../models/Menus.js";

//Các hàm đc override cần trả về Model, không phải raw data.

export class MenusRepository extends BaseRepository {
  constructor() {
    // Mapping: [id, tenant_id, category_id, name, description, price, img_url, is_available]
    super("dishes", "id"); 
  }
  /**
   * Tìm category theo tên (Bắt buộc phải có tenant_id để tránh lộ data)
   * @param {string} tenantId - ID của nhà hàng/thuê bao
   * @param {string} name - Tên cần tìm
   */
//
  async create(data) {
    const menuEntity = new Menus(data);

    const dbPayload = menuEntity.toPersistence(); 

    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert([dbPayload]) 
      .select();

    if (error) throw new Error(`Create failed: ${error.message}`);
    
    //  Map kết quả trả về ngược lại thành Model để trả lên Service
    return result?.[0] ? new Menus(result[0]) : null;
  }

async update(id, updates) {
    //"Clean Payload"  
    const menuEntity = new Menus(updates);
    const dbPayload = menuEntity.toPersistence();

    // Loại bỏ các key có giá trị undefined -> Vì default value của is_active có thể không đc truyền vào
    // lọc sạch object dbPayload.
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

    if (error) throw new Error(`[Menu] Update failed: ${error.message}`);
    
    //mapping return model
    return data?.[0] ? new Menus(data[0]) : null;
  }

  async findByName(tenantId, name) {
    if (!tenantId) throw new Error("TenantID is required for search");

    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq('tenant_id', tenantId) // Chỉ tìm trong tenant này
      .ilike('name', `%${name}%`);

    if (error) throw new Error(`FindByName failed: ${error.message}`);
    // return model not raw
    return data.map(item => new Menus(item)) || [];
  }

// override thêm getById để trả về Model
async getById(id) {
    const rawData = await super.getById(id); // Gọi cha lấy raw data
    return rawData ? new Menus(rawData) : null; // Map sang Model
}
 async getAll(filters = {}) {
    // Gọi hàm cha để lấy data thô (đã xử lý logic filter)
    const rawData = await super.getAll(filters);
    // Map sang Model
    return rawData.map(item => new Menus(item));
  }


  ///<summary>
  /// Lấy danh sách món ăn theo danh sách ID
  ///</summary>
  async getByIds(ids) {
    if (ids.length === 0) return [];

    // Lọc trùng ID trước khi query để tối ưu
    const uniqueIds = [...new Set(ids)];

    const { data, error } = await supabase
      .from(this.tableName) // 'dishes' table
      .select("*")
      .in('id', uniqueIds);

    if (error) throw new Error(`[Menus] GetByIds failed: ${error.message}`);
    
    return data.map(item => new Menus(item)); 
  }
}

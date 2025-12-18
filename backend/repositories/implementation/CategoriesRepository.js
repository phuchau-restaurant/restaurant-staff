// backend/repositories/implementation/CategoriesRepository.js
import { BaseRepository } from "./BaseRepository.js";
import { supabase } from "../../configs/database.js";
import { Categories } from "../../models/Categories.js";

//Các hàm đc override cần trả về Model, không phải raw data.

export class CategoryRepository extends BaseRepository {
  constructor() {
    // Mapping: [id, tenant_id, name, display_order, is_active]
    super("categories", "id"); 
  }
  /**
   * Tìm category theo tên (Bắt buộc phải có tenant_id để tránh lộ data)
   * @param {string} tenantId - ID của nhà hàng/thuê bao
   * @param {string} name - Tên cần tìm
   */

  async create(data) {
    // Chuyển đổi dữ liệu đầu vào thành Model để sử dụng mapping ngược bằng toPersistence
    const categoryEntity = new Categories(data);

    // Chuyển đổi Model thành format của Database (toPersistence)
    const dbPayload = categoryEntity.toPersistence(); 
    // dbPayload lúc này sẽ là: { tenant_id: ..., display_order: ... }

    // Gọi Supabase với payload đã map đúng tên cột
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert([dbPayload]) // Gửi snake_case xuống DB
      .select();

    if (error) throw new Error(`Create failed: ${error.message}`);
    
    //  Map kết quả trả về ngược lại thành Model để trả lên Service
    return result?.[0] ? new Categories(result[0]) : null;
  }

async update(id, updates) {
    //"Clean Payload"  

    const categoryEntity = new Categories(updates);
    const dbPayload = categoryEntity.toPersistence();

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

    if (error) throw new Error(`[Category] Update failed: ${error.message}`);
    
    //mapping return model
    return data?.[0] ? new Categories(data[0]) : null;
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
    return data.map(item => new Categories(item)) || [];
  }

// override thêm getById để trả về Model
async getById(id) {
    const rawData = await super.getById(id); // Gọi cha lấy raw data
    return rawData ? new Categories(rawData) : null; // Map sang Model
}

async getAll(filters = {}) {
  // 1. Gọi cha để lấy dữ liệu thô từ DB (Snake_case)
  const rawData = await super.getAll(filters);    
  
  // 2. Map sang Model (CamelCase) để đồng bộ với toàn hệ thống
  return rawData.map(item => new Categories(item));
}
 
}
// LƯU Ý QUAN TRỌNG:
// KHÔNG export "new SupabaseCategoryRepository()" ở đây như kiến trúc 3 lớp.
// Vì ta muốn tiêm (Inject) nó ở bên ngoài.
// -> Chỉ export class thôi.
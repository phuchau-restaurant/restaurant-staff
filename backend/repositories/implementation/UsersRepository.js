// backend/repositories/implementation/UsersRepository.js
import { BaseRepository } from "./BaseRepository.js";
import { supabase } from "../../configs/database.js";
import { Users } from "../../models/Users.js";

//Các hàm đc override cần trả về Model, không phải raw data.

export class UsersRepository extends BaseRepository {
  constructor() {
    // Mapping: [id, tenant_id, email, name, phone, is_active]
    super("users", "id");
  }
  /**
   * Tìm user theo email (Bắt buộc phải có tenant_id để tránh lộ data)
   * @param {string} tenantId - ID của nhà hàng/thuê bao
   * @param {string} email - Email cần tìm
   */

  async create(data) {
    // Chuyển đổi dữ liệu đầu vào thành Model
    const userEntity = new Users(data);

    // Chuyển đổi Model thành format của Database (toPersistence)
    const dbPayload = userEntity.toPersistence();
    // dbPayload lúc này sẽ là: { tenant_id: ..., email: ..., name: ..., phone: ... }

    // Gọi Supabase với payload đã map đúng tên cột
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert([dbPayload]) // Gửi snake_case xuống DB
      .select();

    if (error) throw new Error(`Create failed: ${error.message}`);

    //  Map kết quả trả về ngược lại thành Model để trả lên Service
    return result?.[0] ? new Users(result[0]) : null;
  }

  async update(id, updates) {
    //"Clean Payload"

    const userEntity = new Users(updates);
    const dbPayload = userEntity.toPersistence();

    // Loại bỏ các key có giá trị undefined -> Vì default value của is_active có thể không đc truyền vào
    // lọc sạch object dbPayload.
    Object.keys(dbPayload).forEach((key) => {
      if (dbPayload[key] === undefined) {
        delete dbPayload[key];
      }
    });
    const { data, error } = await supabase
      .from(this.tableName)
      .update(dbPayload)
      .eq(this.primaryKey, id)
      .select();

    if (error) throw new Error(`[Users] Update failed: ${error.message}`);

    //mapping return model
    return data?.[0] ? new Users(data[0]) : null;
  }

  async findByEmail(email, tenantId = null) {
    if (!email) throw new Error("Email is required for search");

    let query = supabase
      .from(this.tableName)
      .select("*")
      .ilike("email", `%${email}%`);

    // Nếu có tenantId, chỉ tìm trong tenant này (cho CRUD operations)
    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data, error } = await query;

    if (error) throw new Error(`FindByEmail failed: ${error.message}`);
    // return model not raw
    return data.map((item) => new Users(item)) || [];
  }

  // override thêm getById để trả về Model
  async getById(id) {
    const rawData = await super.getById(id); // Gọi cha lấy raw data
    return rawData ? new Users(rawData) : null; // Map sang Model
  }

  // override getAll để trả về Model
  async getAll(filters = {}) {
    const rawData = await super.getAll(filters); // Gọi cha lấy raw data
    return rawData.map((item) => new Users(item)) || []; // Map sang Model
  }
}
// LƯU Ý QUAN TRỌNG:
// KHÔNG export "new UsersRepository()" ở đây như kiến trúc 3 lớp.
// Vì ta muốn tiêm (Inject) nó ở bên ngoài.
// -> Chỉ export class thôi.

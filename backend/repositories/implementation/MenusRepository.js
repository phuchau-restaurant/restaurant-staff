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
    console.log('[MenusRepo] Update received:', { id, updates });
    console.log('[MenusRepo] isRecommended in updates:', updates.isRecommended);
    
    //"Clean Payload"  
    const menuEntity = new Menus(updates);
    console.log('[MenusRepo] menuEntity.isRecommended:', menuEntity.isRecommended);
    
    const dbPayload = menuEntity.toPersistence();
    console.log('[MenusRepo] dbPayload.is_recommended:', dbPayload.is_recommended);

    // Loại bỏ các key có giá trị undefined -> Vì default value của is_active có thể không đc truyền vào
    // lọc sạch object dbPayload.
    Object.keys(dbPayload).forEach(key => {
        if (dbPayload[key] === undefined) {
            delete dbPayload[key];
        }
    });
    console.log('[MenusRepo] Final dbPayload:', dbPayload);
    
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
 async getAll(filters = {}, pagination = null) {
    // Extract special filters that need custom handling
    const { 
      categoryId, 
      onlyAvailable, 
      search, 
      sortBy, 
      sortOrder,
      priceMin,
      priceMax,
      ...basicFilters 
    } = filters;

    // Sử dụng count để lấy tổng số bản ghi
    let query = supabase.from(this.tableName).select("*", { count: "exact" });

    // Apply basic equality filters (like tenant_id)
    for (const [key, value] of Object.entries(basicFilters)) {
      if (value !== null && value !== undefined) {
        query = query.eq(key, value);
      }
    }

    // Filter by category
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Filter by availability
    if (onlyAvailable) {
      query = query.eq('is_available', true);
    }

    // Search by name (case-insensitive)
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Filter by price range
    if (priceMin !== null && priceMin !== undefined) {
      query = query.gte('price', priceMin);
    }
    if (priceMax !== null && priceMax !== undefined) {
      query = query.lte('price', priceMax);
    }

    // Apply sorting
    const validSortColumns = ['id', 'name', 'price', 'created_at', 'updated_at'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'id';
    const ascending = sortOrder !== 'desc';
    query = query.order(sortColumn, { ascending });

    // Áp dụng phân trang nếu có
    if (pagination && pagination.pageNumber && pagination.pageSize) {
      const { pageNumber, pageSize } = pagination;
      const from = (pageNumber - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    if (error) {
      throw new Error(`[${this.tableName}] GetAll failed: ${error.message}`);
    }

    // Map to Model
    const mappedData = (data || []).map(item => new Menus(item));

    // Trả về object chứa data và thông tin phân trang
    if (pagination && pagination.pageNumber && pagination.pageSize) {
      return {
        data: mappedData,
        pagination: {
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
          totalItems: count || 0,
          totalPages: Math.ceil((count || 0) / pagination.pageSize)
        }
      };
    }

    return mappedData;
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

// backend/repositories/implementation/ModifierGroupsRepository.js
import { BaseRepository } from "./BaseRepository.js";
import { supabase } from "../../configs/database.js";
import { ModifierGroups } from "../../models/ModifierGroups.js";
import { ModifierOptions } from "../../models/ModifierOptions.js";

/**
 * Repository cho Modifier Groups
 * Bảng: modifier_groups
 */
export class ModifierGroupsRepository extends BaseRepository {
  constructor() {
    super("modifier_groups", "id");
  }

  /**
   * Tạo modifier group mới
   */
  async create(data) {
    const entity = new ModifierGroups(data);
    const dbPayload = entity.toPersistence();

    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert([dbPayload])
      .select();

    if (error) throw new Error(`Create modifier group failed: ${error.message}`);

    return result?.[0] ? new ModifierGroups(result[0]) : null;
  }

  /**
   * Cập nhật modifier group
   */
  async update(id, updates) {
    const entity = new ModifierGroups(updates);
    const dbPayload = entity.toPersistence();

    // Loại bỏ các key có giá trị undefined
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

    if (error) throw new Error(`Update modifier group failed: ${error.message}`);

    return data?.[0] ? new ModifierGroups(data[0]) : null;
  }

  /**
   * Lấy modifier group theo ID
   */
  async getById(id) {
    const rawData = await super.getById(id);
    return rawData ? new ModifierGroups(rawData) : null;
  }

  /**
   * Lấy tất cả modifier groups theo tenant
   * @param {Object} filters - Các filter bao gồm tenant_id, search, is_active
   */
  async getAll(filters = {}) {
    const rawData = await super.getAll(filters);
    return rawData.map((item) => new ModifierGroups(item));
  }

  /**
   * Lấy tất cả modifier groups với options (modifiers) kèm theo
   * @param {string} tenantId - ID của tenant
   * @param {string} search - Từ khóa tìm kiếm (optional)
   */
  async getAllWithOptions(tenantId, search = "") {
    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        modifier_options (
          id,
          name,
          price_adjustment,
          is_active,
          created_at
        )
      `)
      .eq("tenant_id", tenantId)
      .order("display_order", { ascending: true });

    // Tìm kiếm theo tên
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw new Error(`GetAllWithOptions failed: ${error.message}`);

    // Map sang model và transform modifier_options thành modifiers
    return (data || []).map((item) => {
      const group = new ModifierGroups(item);
      group.modifiers = (item.modifier_options || []).map(
        (opt) => new ModifierOptions(opt).toResponse()
      );
      return group;
    });
  }

  /**
   * Lấy modifier group theo ID với options kèm theo
   */
  async getByIdWithOptions(id, tenantId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        modifier_options (
          id,
          name,
          price_adjustment,
          is_active,
          created_at
        )
      `)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`GetByIdWithOptions failed: ${error.message}`);
    }

    if (!data) return null;

    const group = new ModifierGroups(data);
    group.modifiers = (data.modifier_options || []).map(
      (opt) => new ModifierOptions(opt).toResponse()
    );
    return group;
  }

  /**
   * Tìm modifier group theo tên trong tenant
   */
  async findByName(tenantId, name) {
    if (!tenantId) throw new Error("TenantID is required for search");

    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("tenant_id", tenantId)
      .ilike("name", `%${name}%`);

    if (error) throw new Error(`FindByName failed: ${error.message}`);

    return data.map((item) => new ModifierGroups(item)) || [];
  }

  /**
   * Kiểm tra tên trùng lặp (chính xác)
   */
  async checkDuplicateName(tenantId, name, excludeId = null) {
    let query = supabase
      .from(this.tableName)
      .select("id")
      .eq("tenant_id", tenantId)
      .ilike("name", name);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) throw new Error(`CheckDuplicateName failed: ${error.message}`);

    return data && data.length > 0;
  }
}

// backend/repositories/implementation/ModifierOptionsRepository.js
import { BaseRepository } from "./BaseRepository.js";
import { supabase } from "../../configs/database.js";
import { ModifierOptions } from "../../models/ModifierOptions.js";

/**
 * Repository cho Modifier Options
 * Bảng: modifier_options
 */
export class ModifierOptionsRepository extends BaseRepository {
  constructor() {
    super("modifier_options", "id");
  }

  /**
   * Tạo modifier option mới
   */
  async create(data) {
    const entity = new ModifierOptions(data);
    const dbPayload = entity.toPersistence();

    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert([dbPayload])
      .select();

    if (error) throw new Error(`Create modifier option failed: ${error.message}`);

    return result?.[0] ? new ModifierOptions(result[0]) : null;
  }

  /**
   * Tạo nhiều modifier options cùng lúc
   */
  async createMany(options) {
    if (!options || options.length === 0) return [];

    const dbPayloads = options.map((opt) => {
      const entity = new ModifierOptions(opt);
      return entity.toPersistence();
    });

    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(dbPayloads)
      .select();

    if (error) throw new Error(`CreateMany modifier options failed: ${error.message}`);

    return (result || []).map((item) => new ModifierOptions(item));
  }

  /**
   * Cập nhật modifier option
   */
  async update(id, updates) {
    const entity = new ModifierOptions(updates);
    const dbPayload = entity.toPersistence();

    // Loại bỏ các key có giá trị undefined
    Object.keys(dbPayload).forEach((key) => {
      if (dbPayload[key] === undefined) {
        delete dbPayload[key];
      }
    });

    // Không cho phép update group_id
    delete dbPayload.group_id;

    const { data, error } = await supabase
      .from(this.tableName)
      .update(dbPayload)
      .eq(this.primaryKey, id)
      .select();

    if (error) throw new Error(`Update modifier option failed: ${error.message}`);

    return data?.[0] ? new ModifierOptions(data[0]) : null;
  }

  /**
   * Lấy modifier option theo ID
   */
  async getById(id) {
    const rawData = await super.getById(id);
    return rawData ? new ModifierOptions(rawData) : null;
  }

  /**
   * Lấy tất cả options của một group
   */
  async getByGroupId(groupId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("group_id", groupId)
      .order("id", { ascending: true });

    if (error) throw new Error(`GetByGroupId failed: ${error.message}`);

    return (data || []).map((item) => new ModifierOptions(item));
  }

  /**
   * Xóa tất cả options của một group
   */
  async deleteByGroupId(groupId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .delete()
      .eq("group_id", groupId)
      .select();

    if (error) throw new Error(`DeleteByGroupId failed: ${error.message}`);

    return data || [];
  }

  /**
   * Kiểm tra option có thuộc về group không
   */
  async belongsToGroup(optionId, groupId) {
    const option = await this.getById(optionId);
    return option && option.groupId === groupId;
  }
}

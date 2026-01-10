import { BaseRepository } from "./BaseRepository.js";
import { supabase } from "../../configs/database.js";
import { OrderItemModifier } from "../../models/OrderItemModifier.js";

export class OrderItemModifiersRepository extends BaseRepository {
  constructor() {
    super("order_item_modifiers", "id");
  }

  /**
   * Tạo nhiều modifiers cùng lúc
   */
  async createMany(modifiersArray) {
    const dbPayloads = modifiersArray.map((item) => {
      const entity = new OrderItemModifier(item);
      const payload = entity.toPersistence();
      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key]
      );
      return payload;
    });

    const { data, error } = await supabase
      .from(this.tableName)
      .insert(dbPayloads)
      .select();

    if (error)
      throw new Error(
        `[OrderItemModifiers] CreateMany failed: ${error.message}`
      );

    return data.map((item) => new OrderItemModifier(item));
  }

  /**
   * Lấy modifiers của một order detail
   */
  async getByOrderDetailId(orderDetailId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("order_detail_id", orderDetailId);

    if (error)
      throw new Error(
        `[OrderItemModifiers] GetByOrderDetailId failed: ${error.message}`
      );
    return data.map((item) => new OrderItemModifier(item));
  }

  /**
   * Lấy modifiers của nhiều order details
   */
  async getByOrderDetailIds(orderDetailIds) {
    if (orderDetailIds.length === 0) return [];

    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .in("order_detail_id", orderDetailIds);

    if (error)
      throw new Error(
        `[OrderItemModifiers] GetByOrderDetailIds failed: ${error.message}`
      );
    return data.map((item) => new OrderItemModifier(item));
  }

  /**
   * Xóa modifiers của một order detail
   */
  async deleteByOrderDetailId(orderDetailId) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq("order_detail_id", orderDetailId);

    if (error)
      throw new Error(
        `[OrderItemModifiers] DeleteByOrderDetailId failed: ${error.message}`
      );
    return true;
  }

  /**
   * Xóa modifiers của nhiều order details
   */
  async deleteByOrderDetailIds(orderDetailIds) {
    if (orderDetailIds.length === 0) return true;

    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .in("order_detail_id", orderDetailIds);

    if (error)
      throw new Error(
        `[OrderItemModifiers] DeleteByOrderDetailIds failed: ${error.message}`
      );
    return true;
  }
}

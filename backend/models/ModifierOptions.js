// backend/models/ModifierOptions.js

/**
 * Model cho Modifier Options
 * Bảng: modifier_options
 * Các trường: id, group_id, name, price_adjustment, is_active, created_at
 */
export class ModifierOptions {
  constructor(data) {
    // Xử lý linh hoạt: data có thể đến từ DB (snake_case) hoặc từ Service (camelCase)
    this.id = data.id;
    this.groupId = data.group_id || data.groupId;
    this.name = data.name;
    this.price = data.price_adjustment !== undefined ? data.price_adjustment : (data.price !== undefined ? data.price : 0);
    this.isActive = data.is_active !== undefined ? data.is_active : (data.isActive !== undefined ? data.isActive : true);
    this.isDefault = data.is_default !== undefined ? data.is_default : (data.isDefault !== undefined ? data.isDefault : false);
    this.createdAt = data.created_at || data.createdAt;
  }

  /**
   * Mapping chiều vào (Service -> DB): camelCase -> snake_case
   */
  toPersistence() {
    return {
      group_id: this.groupId,
      name: this.name,
      price_adjustment: this.priceAdjustment ?? this.price,
      is_active: this.isActive,
    };
  }

  /**
   * Tạo response object cho API
   */
  toResponse() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      isActive: this.isActive,
      isDefault: this.isDefault,
    };
  }
}

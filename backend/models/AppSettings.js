// backend/models/AppSetting.js

export class AppSetting {
  constructor(data) {
    this.id = data.id;
    this.tenantId = data.tenant_id || data.tenantId;
    this.key = data.key;
    this.value = data.value;
    this.valueType = data.value_type || data.valueType; // Mapping: value_type
    this.category = data.category;
    this.description = data.description;
    
    // 2. Xử lý Boolean (is_system)
    // Logic: Nếu input có giá trị thì lấy, không thì lấy mặc định (false)
    if (data.is_system !== undefined) this.isSystem = data.is_system;
    else if (data.isSystem !== undefined) this.isSystem = data.isSystem;
    else this.isSystem = false; // Default DB là false
  }

  /**
   * Mapping chiều vào (Service -> DB): camelCase -> snake_case
   */
  toPersistence() {
    return {
      // id thường không cần map khi create/update
      tenant_id: this.tenantId,
      key: this.key,
      value: this.value,
      value_type: this.valueType,
      category: this.category,
      description: this.description,
      is_system: this.isSystem
    };
  }
}
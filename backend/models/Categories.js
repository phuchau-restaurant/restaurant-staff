// backend/models/Categories.js
export class Categories {
  constructor(data) {
    // Xử lý linh hoạt: data có thể đến từ DB (snake) hoặc từ Service (camel)
    this.id = data.id;
    this.tenantId = data.tenant_id || data.tenantId; 
    this.name = data.name;
    this.displayOrder = data.display_order || data.displayOrder;
    this.isActive = data.is_active !== undefined ? data.is_active : data.isActive;
    this.urlIcon = data.url_icon || data.urlIcon;

    // Đảm bảo isActive luôn là boolean hoặc undefined
    if (data.is_active !== undefined) this.isActive = data.is_active;
    else if (data.isActive !== undefined) this.isActive = data.isActive;
    else this.isActive = undefined;
  }

  /**
   * 2. Mapping chiều vào (Service -> DB): camelCase -> snake_case
   * Hàm này tạo ra object thuần để Supabase có thể insert/update
   */
  toPersistence() {
    return {
      // id thường do DB tự sinh nên có thể không cần map khi create
      tenant_id: this.tenantId,
      name: this.name,
      display_order: this.displayOrder,
      is_active: this.isActive,
      id: this.id,
    };
  }
}
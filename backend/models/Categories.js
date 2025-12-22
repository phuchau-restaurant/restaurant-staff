// backend/models/Categories.js
import { v7 as uuidv7 } from 'uuid';

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
    const payload = {
      // Generate UUID v7 nếu chưa có id (khi create mới)
      id: this.id || uuidv7(),
      tenant_id: this.tenantId,
      name: this.name,
    };

    // Chỉ thêm display_order nếu có giá trị
    if (this.displayOrder !== undefined && this.displayOrder !== null) {
      payload.display_order = this.displayOrder;
    }

    // Chỉ thêm is_active nếu có giá trị
    if (this.isActive !== undefined && this.isActive !== null) {
      payload.is_active = this.isActive;
    }

    return payload;
  }
}
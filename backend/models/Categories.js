// backend/models/Categories.js
import { v7 as uuidv7 } from "uuid";

export class Categories {
  constructor(data) {
    this.id = data.id || data.category_id || null;
    this.tenantId = data.tenant_id || data.tenantId;
    this.name = data.name;
    this.displayOrder = data.display_order || data.displayOrder;
    this.isActive =
      data.is_active !== undefined ? data.is_active : data.isActive;
    this.urlIcon = data.url_icon || data.urlIcon || "";
    this.description = data.description || data.desc || "";

    this.imageUrl = data.image_url || data.imageUrl || "";
    this.createdAt = (data.created_at ?? data.createdAt) ?? undefined;
    this.updatedAt = (data.updated_at ?? data.updatedAt) ?? undefined;
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
      tenant_id: this.tenantId,
      name: this.name,
    };
    // Thêm id nếu có (dùng cho update)
    if (this.id !== undefined && this.id !== null) {
      payload.id = this.id;
    }

    // Chỉ thêm display_order nếu có giá trị
    if (this.displayOrder !== undefined && this.displayOrder !== null) {
      payload.display_order = this.displayOrder;
    }

    // Chỉ thêm is_active nếu có giá trị
    if (this.isActive !== undefined && this.isActive !== null) {
      payload.is_active = this.isActive;
    }

    // Thêm description nếu có
    if (this.description !== undefined && this.description !== null) {
      payload.description = this.description;
    }

    // Thêm image_url nếu có
    if (this.imageUrl !== undefined && this.imageUrl !== null) {
      payload.image_url = this.imageUrl;
    }

    // Thêm url_icon nếu có
    if (this.urlIcon !== undefined && this.urlIcon !== null) {
      payload.url_icon = this.urlIcon;
    }

    // Thêm created_at nếu có
    if (this.createdAt !== undefined && this.createdAt !== null) {
      payload.created_at = this.createdAt;
    }
    //Thêm updated_at nếu có
    if (this.updatedAt !== undefined && this.updatedAt !== null){
      payload.updated_at = this.updatedAt;
    }

    return payload;
  }
}

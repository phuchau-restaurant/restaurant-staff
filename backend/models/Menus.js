// backend/models/Menus.js
export class Menus {
  constructor(data) {
    // Xử lý linh hoạt: data có thể đến từ DB (snake) hoặc từ Service (camel)
    this.id = data.id;
    this.tenantId = data.tenant_id || data.tenantId; 
    this.categoryId = data.category_id || data.categoryId;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.imgUrl = data.image_url || data.imageUrl;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at ?? data.updatedAt;
    this.prepTimeMinutes = (data.prep_time_minutes ?? data.prepTimeMinutes); 

    // Đảm bảo isAvailable luôn là boolean hoặc undefined
    if (data.is_available !== undefined) this.isAvailable = data.is_available;
    else if (data.isAvailable !== undefined) this.isAvailable = data.isAvailable;
    // Không set default ở đây để tránh ghi đè khi partial update

    // Đảm bảo isRecommended luôn là boolean hoặc undefined
    if (data.is_recommended !== undefined) this.isRecommended = data.is_recommended;
    else if (data.isRecommended !== undefined) this.isRecommended = data.isRecommended;
    // Không set default ở đây để tránh ghi đè khi partial update
  }

  /**
   * 2. Mapping chiều vào (Service -> DB): camelCase -> snake_case
   * Hàm này tạo ra object thuần để Supabase có thể insert/update
   */
  toPersistence() {
    const result = {
      // id thường do DB tự sinh nên có thể không cần map khi create
      tenant_id: this.tenantId,
      category_id: this.categoryId,
      name: this.name,
      description: this.description,
      price: this.price,
      image_url : this.imgUrl, 
      prep_time_minutes: this.prepTimeMinutes,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };

    // Chỉ include các boolean fields nếu chúng được set explicitly
    if (this.isAvailable !== undefined) {
      result.is_available = this.isAvailable;
    }
    if (this.isRecommended !== undefined) {
      result.is_recommended = this.isRecommended;
    }

    return result;
  }
}
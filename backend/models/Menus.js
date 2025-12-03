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

    // Đảm bảo isAvailable luôn là boolean hoặc undefined
    if (data.is_available !== undefined) this.isAvailable = data.is_available;
    else if (data.isAvailable !== undefined) this.isAvailable = data.isAvailable;
    else this.isAvailable = true;
  }

  /**
   * 2. Mapping chiều vào (Service -> DB): camelCase -> snake_case
   * Hàm này tạo ra object thuần để Supabase có thể insert/update
   */
  toPersistence() {
    return {
      // id thường do DB tự sinh nên có thể không cần map khi create
      tenant_id: this.tenantId,
      category_id: this.categoryId,
      name: this.name,
      description: this.description,
      price: this.price,
      image_url : this.imgUrl, // Đáng lẽ tên ở model sẽ là imageUrl nhưng để giữ consistency với các phần khác nên tạm dùng imgUrl
      is_available: this.isAvailable,
    };
  }
}
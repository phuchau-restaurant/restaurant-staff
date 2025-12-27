// restaurant-staff/backend/models/MenuItemPhotos.js
export class MenuItemPhoto {
  constructor(data) {
    this.id = data.id;
    this.dishId = data.dish_id || data.dishId;
    this.url = data.url;
    this.isPrimary = data.is_primary || data.isPrimary || false;
    this.createdAt = data.created_at || data.createdAt;
  }

  toPersistence() {
    return {
      dish_id: this.dishId,
      url: this.url,
      is_primary: this.isPrimary,
      created_at: this.createdAt
    };
  }
}
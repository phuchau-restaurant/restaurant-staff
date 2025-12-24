// backend/models/MenuItemModifierGroup.js

export class MenuItemModifierGroup {
  constructor(data) {
    this.dishId = data.dish_id || data.dishId;
    this.groupId = data.group_id || data.groupId;
  }

  // Chuyển sang dạng DB
  toPersistence() {
    return {
      dish_id: this.dishId,
      group_id: this.groupId,
    };
  }

  // Chuyển sang dạng trả về client
  toResponse() {
    return {
      dishId: this.dishId,
      groupId: this.groupId,
    };
  }
}

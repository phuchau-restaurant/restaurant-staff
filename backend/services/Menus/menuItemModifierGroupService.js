// backend/services/Menus/menuItemModifierGroupService.js
import { MenuItemModifierGroupRepository } from "../../repositories/implementation/MenuItemModifierGroupRepository.js";

class MenuItemModifierGroupService {
  constructor(menuItemModifierGroupRepo) {
    this.repo = menuItemModifierGroupRepo;
  }

  // Thêm liên kết món ăn - modifier group
  async addLink(dishId, groupId) {
    return await this.repo.add(dishId, groupId);
  }

  // Xóa liên kết món ăn - modifier group
  async removeLink(dishId, groupId) {
    return await this.repo.remove(dishId, groupId);
  }

  // Tìm kiếm liên kết cụ thể (theo dishId và groupId)
  async findLink(dishId, groupId) {
    return await this.repo.find(dishId, groupId);
  }

  // Tìm tất cả group liên quan đến dishId
  async findByDishId(dishId) {
    return await this.repo.findByDishId(dishId);
  }
}

export default MenuItemModifierGroupService;

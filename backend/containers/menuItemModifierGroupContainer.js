// backend/containers/menuItemModifierGroupContainer.js
import { MenuItemModifierGroupRepository } from "../repositories/implementation/MenuItemModifierGroupRepository.js";
import MenuItemModifierGroupService from "../services/Menus/menuItemModifierGroupService.js";
import MenuItemModifierGroupController from "../controllers/Menus/menuItemModifierGroupController.js";

// Khởi tạo repository
const menuItemModifierGroupRepo = new MenuItemModifierGroupRepository();
// Khởi tạo service
const menuItemModifierGroupService = new MenuItemModifierGroupService(
  menuItemModifierGroupRepo
);
// Khởi tạo controller
const menuItemModifierGroupController = new MenuItemModifierGroupController(
  menuItemModifierGroupService
);

export { menuItemModifierGroupController };

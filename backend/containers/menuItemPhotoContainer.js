import { MenuItemPhotoRepository } from "../repositories/implementation/MenuItemPhotoRepository.js";
import MenuItemPhotoService from "../services/Menus/menuItemPhotoService.js";
import MenuItemPhotoController from "../controllers/Menus/menuItemPhotoController.js";

// 1. Repo
const menuItemPhotoRepo = new MenuItemPhotoRepository();

// 2. Service (Repo đã được inject vào Service)
const menuItemPhotoService = new MenuItemPhotoService(menuItemPhotoRepo);

// 3. Controller
const menuItemPhotoController = new MenuItemPhotoController(menuItemPhotoService);

export { menuItemPhotoController };
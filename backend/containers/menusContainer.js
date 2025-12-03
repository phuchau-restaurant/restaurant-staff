// backend/containers/menusContainer.js
import { MenusRepository } from "../repositories/implementation/MenusRepository.js";
import MenusService from "../services/Menus/menusService.js";
import MenusController from "../controllers/Menus/menusController.js";

// 1. Tạo Repo
const menusRepo = new MenusRepository();

// 2. Tiêm Repo vào Service
const menusService = new MenusService(menusRepo);

// 3. Tiêm Service vào Controller
const menusController = new MenusController(menusService);

export { menusController };
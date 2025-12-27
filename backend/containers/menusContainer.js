// backend/containers/menusContainer.js
import { MenusRepository } from "../repositories/implementation/MenusRepository.js";
import MenusService from "../services/Menus/menusService.js";
import CategoriesService from "../services/Categories/categoriesService.js";
import {CategoryRepository} from "../repositories/implementation/CategoriesRepository.js";
import MenusController from "../controllers/Menus/menusController.js";

// 1. Tạo Repo
const menusRepo = new MenusRepository();
const categoriesRepo = new CategoryRepository();
// 2. Tiêm Repo vào Service
const menusService = new MenusService(menusRepo, categoriesRepo);
const categoriesService = new CategoriesService(categoriesRepo);

// 3. Tiêm Service vào Controller
const menusController = new MenusController(menusService, categoriesService);

export { menusController };
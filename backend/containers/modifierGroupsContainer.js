// backend/containers/modifierGroupsContainer.js
import { ModifierGroupsRepository } from "../repositories/implementation/ModifierGroupsRepository.js";
import { ModifierOptionsRepository } from "../repositories/implementation/ModifierOptionsRepository.js";
import ModifierGroupsService from "../services/Modifiers/modifierGroupsService.js";
import ModifierGroupsController from "../controllers/Modifiers/modifierGroupsController.js";

// 1. Tạo Repositories
const modifierGroupsRepo = new ModifierGroupsRepository();
const modifierOptionsRepo = new ModifierOptionsRepository();

// 2. Tiêm Repositories vào Service
const modifierGroupsService = new ModifierGroupsService(modifierGroupsRepo, modifierOptionsRepo);

// 3. Tiêm Service vào Controller
const modifierGroupsController = new ModifierGroupsController(modifierGroupsService);

export { modifierGroupsController };

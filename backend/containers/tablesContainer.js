// backend/containers/tablesContainer.js
import { TablesRepository } from "../repositories/implementation/TablesRepository.js";
import TablesService from "../services/Tables/tablesService.js";
import TablesController from "../controllers/Tables/tablesController.js";

// 1. Repo
const tablesRepo = new TablesRepository();

// 2. Service
const tablesService = new TablesService(tablesRepo);

// 3. Controller
const tablesController = new TablesController(tablesService);

export { tablesController };
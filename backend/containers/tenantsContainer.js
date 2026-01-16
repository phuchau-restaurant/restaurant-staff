// backend/containers/tenantsContainer.js
import { TenantsRepository } from "../repositories/implementation/TenantsRepository.js";
import TenantsService from "../services/Tenants/tenantsService.js";
import TenantsController from "../controllers/Tenants/TenantsController.js";

// Repository
const tenantsRepository = new TenantsRepository();

// Service
const tenantsService = new TenantsService(tenantsRepository);

// Controller
const tenantsController = new TenantsController(tenantsService);

export { tenantsController, tenantsService };

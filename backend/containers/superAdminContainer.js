// Dependency Injection Container for Super Admin
import { supabase } from "../configs/database.js";
import PlatformUsersRepository from "../repositories/PlatformUsersRepository.js";
import SuperAdminService from "../services/SuperAdmin/SuperAdminService.js";
import SuperAdminController from "../controllers/SuperAdmin/SuperAdminController.js";

// Initialize Repository
const platformUsersRepository = new PlatformUsersRepository(supabase);

// Initialize Service
const superAdminService = new SuperAdminService(platformUsersRepository);

// Initialize Controller
const superAdminController = new SuperAdminController(superAdminService);

// Export instances
export { platformUsersRepository, superAdminService, superAdminController };

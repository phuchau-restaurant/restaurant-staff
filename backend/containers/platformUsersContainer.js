// backend/containers/platformUsersContainer.js
import { PlatformUsersRepository } from "../repositories/implementation/PlatformUsersRepository.js";
import { TenantsRepository } from "../repositories/implementation/TenantsRepository.js";
import { UsersRepository } from "../repositories/implementation/UsersRepository.js";
import PlatformUsersService from "../services/PlatformUsers/PlatformUsersService.js";
import PlatformUsersController from "../controllers/PlatformUsers/PlatformUsersController.js";

// Repositories
const platformUsersRepository = new PlatformUsersRepository();
const tenantsRepository = new TenantsRepository();
const usersRepository = new UsersRepository();

// Services
const platformUsersService = new PlatformUsersService(
    platformUsersRepository,
    tenantsRepository,
    usersRepository
);

// Controllers
const platformUsersController = new PlatformUsersController(platformUsersService);

export { platformUsersController, platformUsersService };

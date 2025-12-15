import { TablesRepository } from "../repositories/implementation/TablesRepository.js";
import { UsersRepository } from "../repositories/implementation/UsersRepository.js";
import AdminService from "../services/Admin/adminService.js";
import AdminController from "../controllers/Admin/adminController.js";

const tablesRepo = new TablesRepository();
const usersRepo = new UsersRepository();

const adminService = new AdminService(tablesRepo, usersRepo);

const adminController = new AdminController(adminService);

export { adminController };

// backend/containers/customersContainer.js
import { CustomerRepository } from "../repositories/implementation/CustomersRepository.js";
import CustomersService from "../services/Customers/customersService.js";
import CustomersController from "../controllers/Customers/customersController.js";

// 1. Tạo Repo
const customersRepo = new CustomerRepository();

// 2. Tiêm Repo vào Service
const customersService = new CustomersService(customersRepo);

// 3. Tiêm Service vào Controller
const customersController = new CustomersController(customersService);

export { customersController };
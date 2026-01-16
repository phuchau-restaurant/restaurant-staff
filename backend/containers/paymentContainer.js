// backend/containers/paymentContainer.js
import { PaymentRepository } from "../repositories/implementation/PaymentRepository.js";
import { TenantsRepository } from "../repositories/implementation/TenantsRepository.js";
import { TablesRepository } from "../repositories/implementation/TablesRepository.js";
import PaymentService from "../services/Payment/PaymentService.js";
import PaymentController from "../controllers/Payment/PaymentController.js";

// Repositories
const paymentRepository = new PaymentRepository();
const tenantsRepository = new TenantsRepository();
const tablesRepository = new TablesRepository();

// Services
const paymentService = new PaymentService(paymentRepository, tenantsRepository, tablesRepository);

// Controllers
const paymentController = new PaymentController(paymentService);

export { paymentController, paymentService };


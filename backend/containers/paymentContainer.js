// backend/containers/paymentContainer.js
import { PaymentRepository } from "../repositories/implementation/PaymentRepository.js";
import { RestaurantInfoRepository } from "../repositories/implementation/RestaurantInfoRepository.js";
import PaymentService from "../services/Payment/PaymentService.js";
import PaymentController from "../controllers/Payment/PaymentController.js";

// Repositories
const paymentRepository = new PaymentRepository();
const restaurantInfoRepository = new RestaurantInfoRepository();

// Services
const paymentService = new PaymentService(paymentRepository, restaurantInfoRepository);

// Controllers
const paymentController = new PaymentController(paymentService);

export { paymentController, paymentService };

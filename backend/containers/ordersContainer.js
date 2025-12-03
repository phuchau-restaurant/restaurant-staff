import { OrdersRepository } from "../repositories/implementation/OrdersRepository.js";
import { OrderDetailsRepository } from "../repositories/implementation/OrderDetailsRepository.js";
import { MenusRepository } from "../repositories/implementation/MenusRepository.js"; // RE-USE
import OrdersService from "../services/Orders/ordersService.js";
import OrdersController from "../controllers/Orders/ordersController.js";

// 1. Khởi tạo Repos
const ordersRepo = new OrdersRepository();
const orderDetailsRepo = new OrderDetailsRepository();
const menusRepo = new MenusRepository(); 

// 2. Tiêm vào Service (Inject 3 cái)
const ordersService = new OrdersService(ordersRepo, orderDetailsRepo, menusRepo);

// 3. Tiêm vào Controller
const ordersController = new OrdersController(ordersService);

export { ordersController };
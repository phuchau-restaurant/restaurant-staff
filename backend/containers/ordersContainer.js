import { OrdersRepository } from "../repositories/implementation/OrdersRepository.js";
import { OrderDetailsRepository } from "../repositories/implementation/OrderDetailsRepository.js";
import { MenusRepository } from "../repositories/implementation/MenusRepository.js";
import { OrderItemModifiersRepository } from "../repositories/implementation/OrderItemModifiersRepository.js";
import { ModifierOptionsRepository } from "../repositories/implementation/ModifierOptionsRepository.js";
import { TablesRepository } from "../repositories/implementation/TablesRepository.js";
import OrdersService from "../services/Orders/ordersService.js";
import OrdersController from "../controllers/Orders/ordersController.js";

// Khởi tạo Repository
const ordersRepo = new OrdersRepository();
const orderDetailsRepo = new OrderDetailsRepository();
const menusRepo = new MenusRepository();
const orderItemModifiersRepo = new OrderItemModifiersRepository();
const modifierOptionsRepo = new ModifierOptionsRepository();
const tablesRepo = new TablesRepository();

// Khởi tạo Service với Dependency Injection
const ordersService = new OrdersService(
  ordersRepo,
  orderDetailsRepo,
  menusRepo,
  orderItemModifiersRepo,
  modifierOptionsRepo,
  tablesRepo
);

// 3. Tiêm vào Controller
const ordersController = new OrdersController(ordersService);

export { ordersController };
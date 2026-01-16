// backend/containers/restaurantInfoContainer.js
import { RestaurantInfoRepository } from "../repositories/implementation/RestaurantInfoRepository.js";
import RestaurantInfoService from "../services/RestaurantInfo/RestaurantInfoService.js";
import RestaurantInfoController from "../controllers/RestaurantInfo/RestaurantInfoController.js";

// Repository
const restaurantInfoRepository = new RestaurantInfoRepository();

// Service
const restaurantInfoService = new RestaurantInfoService(restaurantInfoRepository);

// Controller
const restaurantInfoController = new RestaurantInfoController(restaurantInfoService);

export { restaurantInfoController, restaurantInfoService };

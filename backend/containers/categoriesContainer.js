// backend/containers/categoriesContainer.js

//Đây là nơi lắp rắp từ Repository -> Service -> Controller cho Category. -- tiêm từng phần một (manual dependency injection).


// 1. Chọn linh kiện Database (Lúc này là Supabase, sau này đổi sang DB hay connect DB khác thì sửa ở đây)
import { CategoryRepository } from "../repositories/implementation/CategoriesRepository.js";

// 2. Import Service và Controller
import CategoriesService from "../services/Categories/categoriesService.js";
import CategoriesController from "../controllers/Categories/categoriesController.js";

// 3. Lắp ráp (Wiring)
// Tạo repo
const categoryRepo = new CategoryRepository();

// Tiêm Repo vào Service
const categoryService = new CategoriesService(categoryRepo);

// Tiêm Service vào Controller
const categoriesController = new CategoriesController(categoryService);

// 4. Export Controller đã được lắp ráp hoàn chỉnh để Router dùng
export {
  categoriesController
};
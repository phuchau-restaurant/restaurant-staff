// backend/containers/usersContainer.js

//Đây là nơi lắp rắp từ Repository -> Service -> Controller cho User. -- tiêm từng phần một (manual dependency injection).

// 1. Chọn linh kiện Database (Lúc này là Supabase, sau này đổi sang DB hay connect DB khác thì sửa ở đây)
import { UsersRepository } from "../repositories/implementation/UsersRepository.js";

// 2. Import Service và Controller
import UsersService from "../services/Users/UsersService.js";
import UsersController from "../controllers/Users/usersController.js";

// 3. Lắp ráp (Wiring)
// Tạo repo
const usersRepo = new UsersRepository();

// Tiêm Repo vào Service
const usersService = new UsersService(usersRepo);

// Tiêm Service vào Controller
const usersController = new UsersController(usersService);

// 4. Export Controller đã được lắp ráp hoàn chỉnh để Router dùng
export { usersController };

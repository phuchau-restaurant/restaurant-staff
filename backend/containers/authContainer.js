// backend/containers/authContainer.js

// Đây là nơi lắp rắp từ Repository -> Service -> Controller cho Auth.

// 1. Import Repository (được dùng bởi Auth Service)
import { UsersRepository } from "../repositories/implementation/UsersRepository.js";

// 2. Import Service và Controller
import AuthService from "../services/Auth/AuthService.js";
import AuthController from "../controllers/Auth/AuthController.js";

// 3. Lắp ráp (Wiring)
// Tạo repo
const usersRepo = new UsersRepository();

// Tiêm Repo vào AuthService
const authService = new AuthService(usersRepo);

// Tiêm Service vào Controller
const authController = new AuthController(authService);

// 4. Export Controller đã được lắp ráp hoàn chỉnh để Router dùng
export { authController };

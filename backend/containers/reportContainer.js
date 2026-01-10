// backend/containers/reportContainer.js
import { ReportRepository } from "../repositories/implementation/ReportRepository.js";
import { MenusRepository } from "../repositories/implementation/MenusRepository.js";
import ReportService from "../services/Report/reportService.js";
import ReportController from "../controllers/Report/reportController.js";

// Khởi tạo Repository
const reportRepo = new ReportRepository();
const menusRepo = new MenusRepository();

// Khởi tạo Service với Dependency Injection
const reportService = new ReportService(reportRepo, menusRepo);

// Tiêm vào Controller
const reportController = new ReportController(reportService);

export { reportController };

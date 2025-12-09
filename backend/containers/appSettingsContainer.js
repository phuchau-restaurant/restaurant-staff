// backend/containers/appSettingsContainer.js
import { AppSettingRepository } from "../repositories/implementation/AppSettingsRepository.js";
import AppSettingsService from "../services/AppSettings/appSettingsService.js";
import AppSettingsController from "../controllers/AppSettings/appSettingsController.js";

const appSettingsRepo = new AppSettingRepository();

const appSettingsService = new AppSettingsService(appSettingsRepo);

const appSettingsController = new AppSettingsController(appSettingsService);

export { appSettingsController };
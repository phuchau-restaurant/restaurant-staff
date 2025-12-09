// backend/services/AppSettings/appSettingsService.js

class AppSettingsService {
  constructor(appSettingRepository) {
    this.appSettingRepo = appSettingRepository;
  }

  /**
   * Lấy danh sách settings
   * Get/api/settings(?category=Printer)
   */
  async getSettingsByTenant(tenantId, category = null) {
    if (!tenantId) throw new Error("Tenant ID is required");
    if (category) {
      return await this.appSettingRepo.findByCategory(tenantId, category);
    }
    return await this.appSettingRepo.getAll({ tenant_id: tenantId });
  }

  async getSettingById(id, tenantId) {
    if (!id) throw new Error("ID is required");

    const setting = await this.appSettingRepo.getById(id);
    if (!setting) throw new Error("App setting not found");

    if (tenantId && setting.tenantId !== tenantId) {
      throw new Error("Access denied: Setting belongs to another tenant");
    }
    return setting;
  }

  /**
   * Tạo Setting mới
   * Rule: Key phải duy nhất trong Tenant
   */
  async createSetting(data) {
    const { tenantId, key, value, valueType, category, isSystem = false } = data;

    //  Validate 
    if (!tenantId) throw new Error("Tenant ID is required");
    if (!key || key.trim() === "") throw new Error("Key is required");
    if (!value) throw new Error("Value is required");
    if (!valueType) throw new Error("Value Type is required");
    if (!category) throw new Error("Category is required");

    //  Check same Key
    const existing = await this.appSettingRepo.findByKey(tenantId, key.trim());
    if (existing) {
      throw new Error(`Setting with key '${key}' already exists`);
    }

    //  Prepare data (camelCase)
    const newSettingData = {
      tenantId,
      key: key.trim(),
      value,
      valueType,
      category,
      description: data.description,
      isSystem
    };

    return await this.appSettingRepo.create(newSettingData);
  }

  /**
   * Update Setting
   * Rule: nếu đổi key, bắt buộc check trùng
   */
  async updateSetting(id, tenantId, updates) {
    // 1. Check ownership
    const currentSetting = await this.getSettingById(id, tenantId);

    // 2. Nếu User cố tình đổi Key -> Phải check trùng
    if (updates.key && updates.key !== currentSetting.key) {
        // Cấm đổi key của System Setting
        if (currentSetting.isSystem) throw new Error("Cannot change key of a system setting");

        const existing = await this.appSettingRepo.findByKey(tenantId, updates.key.trim());
        if (existing && existing.id !== id) {
            throw new Error(`Key '${updates.key}' is already used by another setting`);
        }
    }

    return await this.appSettingRepo.update(id, updates);
  }

  /**
   * Xóa Setting
   * Rule: Không được xóa Setting hệ thống (isSystem = true)
   */
  async deleteSetting(id, tenantId) {
    const setting = await this.getSettingById(id, tenantId);

    // Bảo vệ Setting hệ thống
    if (setting.isSystem) {
      throw new Error("Cannot delete a system setting. You can only update its value.");
    }

    return await this.appSettingRepo.delete(id);
  }
}

export default AppSettingsService;
// backend/services/Menus/menusService.js
class MenusService {
  constructor(menusRepository, categoryRepository) {
    this.menusRepo = menusRepository;
    this.categoryRepo = categoryRepository;
  }

  /**
   * Lấy danh sách Menu theo Tenant
   * Có thể lọc theo CategoryId nếu cần
   * @param {string} tenantId - ID của tenant
   * @param {string|null} categoryId - ID của category (optional)
   * @param {boolean} onlyAvailable - Chỉ lấy món đang bán
   * @param {object|null} pagination - { pageNumber, pageSize } (optional)
   */
  async getMenusByTenant(tenantId, categoryId = null, onlyAvailable = false, pagination = null) {
    if (!tenantId) throw new Error("Missing tenantId");

    const filters = { tenant_id: tenantId };
    
    // Nếu có lọc theo category
    if (categoryId) {
      filters.category_id = categoryId;
    }
    // Nếu chỉ lấy món đang bán
    if (onlyAvailable) {
      filters.is_available = true;
    }

    return await this.menusRepo.getAll(filters, pagination);
  }

  async getMenuById(id, tenantId) {
    if (!id) throw new Error("Menu ID is required");
    
    const menu = await this.menusRepo.getById(id);
    if (!menu) throw new Error("Menu item not found");

    // Security Check
    if (tenantId && menu.tenantId !== tenantId) {
      throw new Error("Access denied: Menu belongs to another tenant");
    }
    return menu;
  }

  async createMenu(menuData) {
    const { tenantId, name, price, categoryId,
             imgUrl, prepTimeMinutes, isAvailable } = menuData;

    // 1. Validation cơ bản
    if (!tenantId) throw new Error("Tenant ID is required");
    if (!categoryId) throw new Error("Category ID is required"); // Món ăn phải thuộc danh mục
    if (!name || name.trim() === "") throw new Error("Menu name is required");
    if (price === undefined || price < 0) throw new Error("Price must be a positive number");
    if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
        throw new Error("isAvailable must be a boolean");
    }
    if (imgUrl && typeof imgUrl !== 'string') {
        throw new Error("Image URL must be a string");
    }
    // business logic
    if (name.length > 80  || name.length < 2) {
      throw new Error("Menu name must be between 2 and 80 characters");
    }
    if (price < 0.01 || price > 999999) {
      throw new Error("Price must be between 0.01 and 999999");
    }
    if (prepTimeMinutes !== undefined && (prepTimeMinutes < 0 || prepTimeMinutes > 240)) {
      throw new Error("Preparation time must be between 0 and 240 minutes");
    }
    //Kiểm tra category tồn tại ?
     await this.categoryRepo.getById(categoryId);

    // 2. Check trùng tên (Optional - tùy logic nhà hàng có cho phép trùng tên ko)
    const existing = await this.menusRepo.findByName(tenantId, name.trim());
    if (existing && existing.length > 0) {
       const isExactMatch = existing.some(m => m.name.toLowerCase() === name.trim().toLowerCase());
       if (isExactMatch) throw new Error(`Menu '${name}' already exists`);
    }

    // 3. Gọi Repo (Data đã clean từ Controller -> CamelCase)
    return await this.menusRepo.create(menuData);
  }

  async updateMenu(id, tenantId, updates) {
    await this.getMenuById(id, tenantId); // Check quyền sở hữu
    // business logic
    if (updates.name && (updates.name.length > 80 || updates.name.length < 2)) {
      throw new Error("Menu name must be between 2 and 80 characters");
    }
    if (updates.price !== undefined && (updates.price < 0.01 || updates.price > 999999)) {
      throw new Error("Price must be between 0.01 and 999999");
    }
    if (updates.prepTimeMinutes !== undefined && (updates.prepTimeMinutes < 0 || updates.prepTimeMinutes > 240)) {
      throw new Error("Preparation time must be between 0 and 240 minutes");
    }
    updates.updatedAt = new Date(); // Cập nhật thời gian sửa đổi

    return await this.menusRepo.update(id, updates);
  }

  async deleteMenu(id, tenantId) {
    await this.getMenuById(id, tenantId); // Check quyền sở hữu
    return await this.menusRepo.delete(id);
  }
}

export default MenusService;
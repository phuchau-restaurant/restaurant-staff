// backend/services/Menus/menusService.js
class MenusService {
  constructor(menusRepository) {
    this.menusRepo = menusRepository;
  }

  /**
   * Lấy danh sách Menu theo Tenant
   * Có thể lọc theo CategoryId nếu cần
   */
  async getMenusByTenant(tenantId, categoryId = null, onlyAvailable = false) {
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

    return await this.menusRepo.getAll(filters);
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
    const { tenantId, name, price, categoryId } = menuData;

    // 1. Validation cơ bản
    if (!tenantId) throw new Error("Tenant ID is required");
    if (!categoryId) throw new Error("Category ID is required"); // Món ăn phải thuộc danh mục
    if (!name || name.trim() === "") throw new Error("Menu name is required");
    if (price === undefined || price < 0) throw new Error("Price must be a positive number");

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

    // Validate logic giá nếu có update giá
    if (updates.price !== undefined && updates.price < 0) {
      throw new Error("Price must be a positive number");
    }

    return await this.menusRepo.update(id, updates);
  }

  async deleteMenu(id, tenantId) {
    await this.getMenuById(id, tenantId); // Check quyền sở hữu
    return await this.menusRepo.delete(id);
  }
}

export default MenusService;
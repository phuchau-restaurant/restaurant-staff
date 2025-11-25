import CategoriesRepository from "../../repositories/CategoriesRepository.js";

class CategoriesService {
  
  /**
   * Lấy danh sách danh mục của một nhà hàng (Tenant)
   * @param {string} tenantId - ID của nhà hàng (Bắt buộc)
   * @param {boolean} onlyActive - Nếu true, chỉ lấy danh mục đang hoạt động
   */
  async getCategoriesByTenant(tenantId, onlyActive = false) {
    if (!tenantId) throw new Error("Missing tenantId");

    const filters = { tenant_id: tenantId };
    
    if (onlyActive) {
      filters.is_active = true;
    }

    // Gọi xuống Repository để lấy dữ liệu
    return await CategoriesRepository.getAll(filters);
  }

  /**
   * Tạo danh mục mới
   * - Rule 1: Tên không được để trống
   * - Rule 2: Tên không được trùng trong cùng 1 Tenant
   */
  async createCategory({ tenant_id, name, display_order = 0, is_active = true }) {
    // 1. Validate dữ liệu đầu vào
    if (!tenant_id) throw new Error("Tenant ID is required");
    if (!name || name.trim() === "") throw new Error("Category name is required");

    // 2. Business Logic: Kiểm tra trùng tên trong cùng tenant
    // Lưu ý: Hàm findByName trả về mảng, nên ta kiểm tra độ dài
    const existing = await CategoriesRepository.findByName(tenant_id, name.trim());
    if (existing && existing.length > 0) {
      // Kiểm tra kỹ hơn: Nếu có bản ghi trùng tên chính xác (findByName dùng ilike)
      const isExactMatch = existing
            .some(cat => cat.name.toLowerCase() === name.trim().toLowerCase());
      if (isExactMatch) {
        throw new Error(`Category '${name}' already exists in this tenant`);
      }
    }

    // Chuẩn bị dữ liệu để lưu
    const newCategoryData = {
      tenant_id,
      name: name.trim(),
      display_order,
      is_active
    };

    // Gọi Repository -> Lưu xuống DB
    return await CategoriesRepository.create(newCategoryData);
  }

  /**
   * Lấy chi tiết một danh mục
   * @param {string} id - ID danh mục
   * @param {string} tenantId - ID nhà hàng (Dùng để verify quyền sở hữu)
   */
  async getCategoryById(id, tenantId) {
    if (!id) throw new Error("Category ID is required");

    const category = await CategoriesRepository.getById(id);

    if (!category) {
      throw new Error("Category not found");
    }

    // Security Check: Đảm bảo user của tenant này không xem trộm data của tenant kia
    if (tenantId && category.tenant_id !== tenantId) {
      throw new Error("Access denied: Category belongs to another tenant");
    }

    return category;
  }

  /**
   * Cập nhật danh mục
   */
  async updateCategory(id, tenantId, updates) {
    // 1. Kiểm tra tồn tại và quyền sở hữu
    await this.getCategoryById(id, tenantId);

    // 2. Nếu cập nhật tên, cần check trùng lặp (Optional - tuỳ độ kỹ tính)
    if (updates.name) {
       const existing = await CategoriesRepository.findByName(tenantId, updates.name.trim());
       const isDuplicate = existing.some(cat => cat.id !== id && cat.name.toLowerCase() === updates.name.trim().toLowerCase());
       if (isDuplicate) {
         throw new Error(`Category name '${updates.name}' already exists`);
       }
    }

    // 3. Thực hiện update
    return await CategoriesRepository.update(id, updates);
  }

  /**
   * Xóa danh mục
   * (Lưu ý: Cân nhắc dùng Soft Delete (is_active=false) thay vì xóa hẳn nếu dữ liệu quan trọng)
   */
  async deleteCategory(id, tenantId) {
    // Kiểm tra quyền sở hữu trước khi xóa
    await this.getCategoryById(id, tenantId);
    //TODO: cân nhắc dùng soft delete
    //update is_active = false thay vì xóa hẳn
    //return await CategoriesRepository.update(id, { is_active: false });


    return await CategoriesRepository.delete(id);
  }
}

// Export Singleton
export default new CategoriesService();
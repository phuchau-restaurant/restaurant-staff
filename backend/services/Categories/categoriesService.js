// backend/services/Categories/categoriesService.js

//Ko cần import nữa mà nhận Repository thông qua constructor
//ko cần: import CategoriesRepository from "../repositories/implementation/CategoriesRepository.js";

class CategoriesService {
  // Constructor Injection: Nhận vào một cái gì đó tuân thủ ICategoryRepository
  constructor(categoryRepository) {
    this.categoryRepo = categoryRepository;
  }

  /**
   * Lấy danh sách danh mục của một nhà hàng (Tenant)
   * @param {string} tenantId - ID của nhà hàng (Bắt buộc)
   * @param {boolean} onlyActive - Nếu true, chỉ lấy danh mục đang hoạt động
   * @param {object|null} pagination - { pageNumber, pageSize } (optional)
   */
  async getCategoriesByTenant(tenantId, onlyActive = false, pagination = null) {
    if (!tenantId) throw new Error("Missing tenantId");

    const filters = { tenant_id: tenantId };

    if (onlyActive) {
      filters.is_active = true;
    }

    // Gọi xuống Repository để lấy dữ liệu
    return await this.categoryRepo.getAll(filters, pagination);
  }

  /**
   * Tạo danh mục mới
   * - Rule 1: Tên không được để trống
   * - Rule 2: Tên không được trùng trong cùng 1 Tenant
   */
  async createCategory({
    tenantId,
    name,
    description = "",
    imageUrl = "",
    urlIcon = "",
    displayOrder = 0,
    isActive = true,
  }) {
    // 1. Validate dữ liệu đầu vào
    if (!tenantId) throw new Error("Tenant ID is required");
    if (!name || name.trim() === "")
      throw new Error("Category name is required");
    // Optional: Validate description, imageUrl nếu cần

    // 2. Business Logic: Kiểm tra trùng tên trong cùng tenant
    const existing = await this.categoryRepo.findByName(tenantId, name.trim());
    if (existing && existing.length > 0) {
      const isExactMatch = existing.some(
        (cat) => cat.name.toLowerCase() === name.trim().toLowerCase()
      );
      if (isExactMatch) {
        throw new Error(`Category '${name}' already exists in this tenant`);
      }
    }

    // chuẩn bị dữ liệu
    const newCategoryData = {
      tenantId: tenantId,
      name: name.trim(),
      description: description,
      imageUrl: imageUrl,
      urlIcon: urlIcon,
      displayOrder: displayOrder,
      isActive: isActive,
    };

    // Gọi Repository -> Lưu xuống DB
    return await this.categoryRepo.create(newCategoryData);
  }

  /**
   * @param {string} id - ID danh mục
   * @param {string} tenantId - ID nhà hàng (Dùng để verify quyền sở hữu)
   */
  async getCategoryById(id, tenantId) {
    if (!id) throw new Error("Category ID is required");

    const category = await this.categoryRepo.getById(id);

    if (!category) {
      throw new Error("Category not found");
    }

    // Security Check: Đảm bảo user của tenant này không xem trộm data của tenant kia
    if (tenantId && category.tenantId !== tenantId) {
      //category bây giờ là Model nên thuộc tính là tenantId thay vì tenant_id
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
      const existing = await this.categoryRepo.findByName(
        tenantId,
        updates.name.trim()
      );
      const isDuplicate = existing.some(
        (cat) =>
          cat.id !== id &&
          cat.name.toLowerCase() === updates.name.trim().toLowerCase()
      );
      if (isDuplicate) {
        throw new Error(`Category name '${updates.name}' already exists`);
      }
    }

    // 3. Thực hiện update
    // <updates> là object từ Controller (VD: { name: "New Name", displayOrder: 5 })
    // Repository.update đã có logic new Category(updates) -> toPersistence() nên cứ truyền thẳng.
    return await this.categoryRepo.update(id, updates);
  }

  /**
   * Xóa danh mục
   * (Lưu ý: Cân nhắc dùng Soft Delete (is_active=false) thay vì xóa hẳn nếu dữ liệu quan trọng)
   */
  async deleteCategory(id, tenantId) {
    // Kiểm tra tồn tại
    await this.getCategoryById(id, tenantId);
    // Soft delete: cập nhật is_active = false
    return await this.categoryRepo.delete(id);
  }
}

//export default new CategoriesService(); - singleton: 3 lớp
export default CategoriesService; // Export class, KHÔNG export new instance

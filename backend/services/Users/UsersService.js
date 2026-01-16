// backend/services/Users/UsersService.js
import bcrypt from "bcryptjs";

//Ko cần import nữa mà nhận Repository thông qua constructor
//ko cần: import UsersRepository from "../repositories/implementation/UsersRepository.js";

class UsersService {
  // Constructor Injection: Nhận vào một cái gì đó tuân thủ IUsersRepository
  constructor(usersRepository) {
    this.usersRepo = usersRepository;
  }

  /**
   * Lấy danh sách người dùng của một nhà hàng (Tenant)
   * @param {string} tenantId - ID của nhà hàng (Bắt buộc)
   * @param {boolean} onlyActive - Nếu true, chỉ lấy người dùng đang hoạt động
   */
  async getUsersByTenant(tenantId, onlyActive = false) {
    if (!tenantId) throw new Error("Missing tenantId");

    const filters = { tenant_id: tenantId };

    if (onlyActive) {
      filters.is_active = true;
    }

    // Gọi xuống Repository để lấy dữ liệu
    return await this.usersRepo.getAll(filters);
  }

  /**
   * Tạo người dùng mới
   * - Rule 1: Email không được để trống
   * - Rule 2: Email không được trùng trong cùng 1 Tenant
   */
  async createUser({ tenantId, email, fullName, password, role, isActive }) {
    // 1. Validate dữ liệu đầu vào
    if (!tenantId) throw new Error("Tenant ID is required");
    if (!email || email.trim() === "")
      throw new Error("User email is required");
    if (!fullName || fullName.trim() === "")
      throw new Error("Full name is required");
    if (!password || password.trim() === "")
      throw new Error("Password is required");
    if (!role || role.trim() === "") throw new Error("Role is required");

    // 2. Business Logic: Kiểm tra trùng email trong cùng tenant
    // Lưu ý: Hàm findByEmail trả về mảng các Model

    // Gọi repo được inject vào -> cleaner
    const existing = await this.usersRepo.findByEmail(email.trim(), tenantId);

    if (existing && existing.length > 0) {
      // Kiểm tra kỹ hơn: Nếu có bản ghi trùng email chính xác (findByEmail dùng ilike)
      const isExactMatch = existing.some(
        (user) => user.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (isExactMatch) {
        throw new Error(
          `User with email '${email}' already exists in this tenant`
        );
      }
    }

    // chuẩn bị dữ liệu
    // Hash password trước khi lưu vào DB
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const newUserData = {
      tenantId: tenantId,
      email: email.trim(),
      fullName: fullName.trim(),
      role: role.trim(),
      passwordHash: hashedPassword,
      isActive: isActive,
    };

    // Gọi Repository -> Lưu xuống DB
    return await this.usersRepo.create(newUserData);
  }

  /**
   * @param {string} id - ID người dùng
   * @param {string} tenantId - ID nhà hàng (Dùng để verify quyền sở hữu)
   */
  async getUserById(id, tenantId) {
    if (!id) throw new Error("User ID is required");

    const user = await this.usersRepo.getById(id);

    if (!user) {
      throw new Error("User not found");
    }

    // Security Check: Đảm bảo user của tenant này không xem trộm data của tenant kia
    if (tenantId && user.tenantId !== tenantId) {
      //user bây giờ là Model nên thuộc tính là tenantId thay vì tenant_id
      throw new Error("Access denied: User belongs to another tenant");
    }

    return user;
  }

  /**
   * Cập nhật người dùng
   */
  async updateUser(id, tenantId, updates) {
    // 1. Kiểm tra tồn tại và quyền sở hữu
    await this.getUserById(id, tenantId);

    // 2. Nếu cập nhật email, cần check trùng lặp (Optional - tuỳ độ kỹ tính)
    if (updates.email) {
      const existing = await this.usersRepo.findByEmail(
        updates.email.trim(),
        tenantId
      );
      const isDuplicate = existing.some(
        (user) =>
          user.id !== id &&
          user.email.toLowerCase() === updates.email.trim().toLowerCase()
      );
      if (isDuplicate) {
        throw new Error(`User with email '${updates.email}' already exists`);
      }
    }

    // 3. Nếu có password trong updates, hash nó trước khi lưu
    if (updates.password) {
      // Validate password
      if (updates.password.trim().length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      // Hash password
      const hashedPassword = await bcrypt.hash(updates.password.trim(), 10);
      // Thay thế password bằng passwordHash
      delete updates.password;
      updates.passwordHash = hashedPassword;
    }

    // 4. Thực hiện update
    // <updates> là object từ Controller (VD: { name: "New Name", email: "new@example.com" })
    // Repository.update đã có logic new Users(updates) -> toPersistence() nên cứ truyền thẳng.
    return await this.usersRepo.update(id, updates);
  }

  /**
   * Xóa người dùng
   * (Lưu ý: Cân nhắc dùng Soft Delete (is_active=false) thay vì xóa hẳn nếu dữ liệu quan trọng)
   */
  async deleteUser(id, tenantId) {
    //ktra tồn tại không ?
    await this.getUserById(id, tenantId);
    //TODO: cân nhắc dùng soft delete
    //update is_active = false thay vì xóa hẳn
    //return await UsersRepository.update(id, { is_active: false });

    return await this.usersRepo.delete(id);
  }
}

//export default new UsersService(); - singleton: 3 lớp
export default UsersService; // Export class, KHÔNG export new instance


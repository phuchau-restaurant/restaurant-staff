// backend/models/Users.js
export class Users {
  constructor(data) {
    // Xử lý linh hoạt: data có thể đến từ DB (snake) hoặc từ Service (camel)
    this.id = data.id;
    this.tenantId = data.tenant_id || data.tenantId;
    this.email = data.email;
    this.fullName = data.full_name || data.fullName;
    this.role = data.role;
    this.passwordHash = data.password_hash || data.passwordHash;
    this.isActive = data.is_active !== undefined ? data.is_active : data.isActive;

  }

  /**
   * 2. Mapping chiều vào (Service -> DB): camelCase -> snake_case
   * Hàm này tạo ra object thuần để Supabase có thể insert/update
   */
  toPersistence() {
    return {
      // id thường do DB tự sinh nên có thể không cần map khi create
      tenant_id: this.tenantId,
      email: this.email,
      full_name: this.fullName,
      is_active: this.isActive,
      password_hash: this.passwordHash,
      role: this.role,
    };
  }
}

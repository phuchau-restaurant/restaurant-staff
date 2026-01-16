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
    this.isActive =
      data.is_active !== undefined ? data.is_active : data.isActive;
    this.refreshTokenHash = data.refresh_token_hash || data.refreshTokenHash;
    this.refreshTokenExpires =
      data.refresh_token_expires || data.refreshTokenExpires;

    // Profile fields
    this.phoneNumber = data.phone_number || data.phoneNumber || null;
    this.dateOfBirth = data.date_of_birth || data.dateOfBirth || null;
    this.hometown = data.hometown || null;
    this.avatarUrl = data.avatar_url || data.avatarUrl || null;
    this.avatarType = data.avatar_type || data.avatarType || 'default';
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
      refresh_token_hash: this.refreshTokenHash,
      refresh_token_expires: this.refreshTokenExpires,
      // Profile fields
      phone_number: this.phoneNumber,
      date_of_birth: this.dateOfBirth,
      hometown: this.hometown,
      avatar_url: this.avatarUrl,
      avatar_type: this.avatarType,
    };
  }
}

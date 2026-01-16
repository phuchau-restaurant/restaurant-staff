// Model for Platform Users (Super Admins)
class PlatformUser {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.passwordHash = data.password_hash;
    this.role = data.role; // 'super_admin'
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.refreshTokenHash = data.refresh_token_hash;
    this.refreshTokenExpires = data.refresh_token_expires;
  }

  // Convert to plain object (without sensitive data)
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default PlatformUser;

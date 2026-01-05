// backend/models/RefreshTokens.js
export class RefreshTokens {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id || data.userId;
    this.token = data.token;
    this.expiresAt = data.expires_at || data.expiresAt;
    this.createdAt = data.created_at || data.createdAt;
    this.revokedAt = data.revoked_at || data.revokedAt;
  }

  /**
   * Mapping chiều vào (Service -> DB): camelCase -> snake_case
   */
  toPersistence() {
    return {
      user_id: this.userId,
      token: this.token,
      expires_at: this.expiresAt,
      created_at: this.createdAt,
      revoked_at: this.revokedAt,
    };
  }
}

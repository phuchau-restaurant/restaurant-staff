// backend/models/Tables.js
export class Tables {
  constructor(data) {
    this.id = data.id;
    this.tenantId = data.tenant_id || data.tenantId;
    this.tableNumber = data.table_number || data.tableNumber;
    this.capacity = data.capacity;
    this.location = data.location;
    this.status = data.status || 'Active'; // Default Active
    this.description = data.description || null;
    
    // Các trường liên quan đến QR Code (Future proofing)
    this.qrToken = data.qr_token || data.qrToken || null;
    this.qrTokenCreatedAt = data.qr_token_created_at || data.qrTokenCreatedAt || null;
    
    // Trường logic nghiệp vụ
    this.currentOrderId = data.current_order_id || data.currentOrderId || null;
  }

  /**
   * Mapping Service (camelCase) -> DB (snake_case)
   */
  toPersistence() {
    return {
      tenant_id: this.tenantId,
      table_number: this.tableNumber,
      capacity: this.capacity,
      location: this.location,
      status: this.status,
      description: this.description,
      qr_token: this.qrToken,
      qr_token_created_at: this.qrTokenCreatedAt,
      current_order_id: this.currentOrderId
    };
  }
}

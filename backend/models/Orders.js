export class Orders {
  constructor(data) {
    this.id = data.id;
    this.tenantId = data.tenant_id || data.tenantId;
    this.tableId = data.table_id || data.tableId;
    this.customerId = data.customer_id || data.customerId;
    this.status = data.status || 'Unsubmit';
    this.totalAmount = data.total_amount || data.totalAmount || 0;
    this.createdAt = data.created_at || data.createdAt;
    this.completedAt = data.completed_at || data.completedAt;
  }

  toPersistence() {
    return {
      tenant_id: this.tenantId,
      table_id: this.tableId,
      customer_id: this.customerId,
      status: this.status,
      total_amount: this.totalAmount,
      created_at: this.createdAt,
      completed_at: this.completedAt
    };
  }
}
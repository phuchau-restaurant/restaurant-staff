export class Orders {
  constructor(data) {
    this.id = data.id;
    this.tenantId = data.tenant_id || data.tenantId;
    this.tableId = data.table_id || data.tableId;
    this.status = data.status || "Unsubmit";
    this.totalAmount = data.total_amount || data.totalAmount || 0;
    this.prepTimeOrder = data.prep_time_order || data.prepTimeOrder || 0;
    this.createdAt = data.created_at || data.createdAt;
    this.completedAt = data.completed_at || data.completedAt;
    this.waiterId = data.waiter_id || data.waiterId || null; // ID nhân viên phục vụ
  }

  toPersistence() {
    return {
      tenant_id: this.tenantId,
      table_id: this.tableId,
      status: this.status,
      total_amount: this.totalAmount,
      prep_time_order: this.prepTimeOrder,
      created_at: this.createdAt,
      completed_at: this.completedAt,
      waiter_id: this.waiterId,
    };
  }
}

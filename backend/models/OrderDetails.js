export class OrderDetails {
  constructor(data) {
    this.id = data.id;
    this.tenantId = data.tenant_id || data.tenantId;
    this.orderId = data.order_id || data.orderId;
    this.dishId = data.dish_id || data.dishId; 
    this.quantity = data.quantity;
    this.unitPrice = data.unit_price || data.unitPrice;
    this.note = data.note || data.description || ""; // API gửi description, nhưng DB lưu note
    this.status = data.status;
  }

  toPersistence() {
    return {
      tenant_id: this.tenantId,
      order_id: this.orderId,
      dish_id: this.dishId, 
      quantity: this.quantity,
      unit_price: this.unitPrice,
      note: this.note,
      status: this.status
    };
  }
}
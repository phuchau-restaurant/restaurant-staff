export class OrderItemModifier {
  constructor(data) {
    this.id = data.id;
    this.orderDetailId = data.order_detail_id || data.orderDetailId;
    this.modifierOptionId = data.modifier_option_id || data.modifierOptionId;
    this.optionName = data.option_name || data.optionName;
    this.createdAt = data.created_at || data.createdAt;
  }

  toPersistence() {
    return {
      order_detail_id: this.orderDetailId,
      modifier_option_id: this.modifierOptionId,
      option_name: this.optionName,
    };
  }

  toResponse() {
    return {
      id: this.id,
      orderDetailId: this.orderDetailId,
      optionId: this.modifierOptionId,
      optionName: this.optionName,
    };
  }
}

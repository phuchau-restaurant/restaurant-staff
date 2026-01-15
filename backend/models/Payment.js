// backend/models/Payment.js
export class Payment {
    constructor(data) {
        this.id = data.id;
        this.tenantId = data.tenant_id || data.tenantId;
        this.orderId = data.order_id || data.orderId;
        this.paymentMethod = data.payment_method || data.paymentMethod || 'Cash';

        // Payment details
        this.subtotal = parseFloat(data.subtotal) || 0;
        this.taxRate = parseFloat(data.tax_rate || data.taxRate) || 0;
        this.taxAmount = parseFloat(data.tax_amount || data.taxAmount) || 0;
        this.serviceChargeRate = parseFloat(data.service_charge_rate || data.serviceChargeRate) || 0;
        this.serviceChargeAmount = parseFloat(data.service_charge_amount || data.serviceChargeAmount) || 0;
        this.discountPercent = parseFloat(data.discount_percent || data.discountPercent) || 0;
        this.discountAmount = parseFloat(data.discount_amount || data.discountAmount) || 0;
        this.amount = parseFloat(data.amount) || 0;

        this.transactionId = data.transaction_id || data.transactionId || null;
        this.paidAt = data.paid_at || data.paidAt || null;
        this.createdAt = data.created_at || data.createdAt;
    }

    toPersistence() {
        return {
            tenant_id: this.tenantId,
            order_id: this.orderId,
            payment_method: this.paymentMethod,
            subtotal: this.subtotal,
            tax_rate: this.taxRate,
            tax_amount: this.taxAmount,
            service_charge_rate: this.serviceChargeRate,
            service_charge_amount: this.serviceChargeAmount,
            discount_percent: this.discountPercent,
            discount_amount: this.discountAmount,
            amount: this.amount,
            transaction_id: this.transactionId,
            paid_at: this.paidAt,
        };
    }
}

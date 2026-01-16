// backend/models/Tenants.js
export class Tenant {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.slug = data.slug;
        this.email = data.email;
        this.status = data.status || 'active';
        this.logoUrl = data.logo_url || data.logoUrl || null;
        this.address = data.address || null;
        this.phone = data.phone || null;

        // Payment settings
        this.taxRate = parseFloat(data.tax_rate || data.taxRate) || 5.0;
        this.serviceCharge = parseFloat(data.service_charge || data.serviceCharge) || 0.0;
        this.discountRules = data.discount_rules || data.discountRules || [];
        this.qrPayment = data.qr_payment || data.qrPayment || null;

        this.createdAt = data.created_at || data.createdAt;
        this.updatedAt = data.updated_at || data.updatedAt;
    }

    toPersistence() {
        return {
            name: this.name,
            slug: this.slug,
            email: this.email,
            status: this.status,
            logo_url: this.logoUrl,
            address: this.address,
            phone: this.phone,
            tax_rate: this.taxRate,
            service_charge: this.serviceCharge,
            discount_rules: this.discountRules,
            qr_payment: this.qrPayment,
        };
    }
}

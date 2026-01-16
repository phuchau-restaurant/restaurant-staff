// backend/models/RestaurantInfo.js
export class RestaurantInfo {
    constructor(data) {
        this.id = data.id;
        this.tenantId = data.tenant_id || data.tenantId;
        this.name = data.name;
        this.logoUrl = data.logo_url || data.logoUrl || null;
        this.address = data.address || null;
        this.email = data.email || null;
        this.phone = data.phone || null;

        // Payment settings
        this.taxRate = parseFloat(data.tax_rate || data.taxRate) || 5.0;
        this.serviceCharge = parseFloat(data.service_charge || data.serviceCharge) || 0.0;
        this.discountRules = data.discount_rules || data.discountRules || [];

        this.createdAt = data.created_at || data.createdAt;
        this.updatedAt = data.updated_at || data.updatedAt;
    }

    toPersistence() {
        return {
            tenant_id: this.tenantId,
            name: this.name,
            logo_url: this.logoUrl,
            address: this.address,
            email: this.email,
            phone: this.phone,
            tax_rate: this.taxRate,
            service_charge: this.serviceCharge,
            discount_rules: this.discountRules,
        };
    }
}


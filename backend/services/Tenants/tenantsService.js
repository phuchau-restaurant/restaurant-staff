// backend/services/Tenants/tenantsService.js

class TenantsService {
    constructor(tenantsRepository) {
        this.tenantsRepo = tenantsRepository;
    }

    /**
     * Get tenant info by ID
     */
    async getTenantInfo(tenantId) {
        if (!tenantId) throw new Error("Tenant ID is required");
        return await this.tenantsRepo.getById(tenantId);
    }

    /**
     * Update tenant info
     */
    async updateTenantInfo(tenantId, data) {
        if (!tenantId) throw new Error("Tenant ID is required");

        // Validate required field
        if (!data.name || data.name.trim() === "") {
            throw new Error("Restaurant name is required");
        }

        // Validate email format if provided
        if (data.email && !this.isValidEmail(data.email)) {
            throw new Error("Invalid email format");
        }

        // Validate phone format if provided
        if (data.phone && !this.isValidPhone(data.phone)) {
            throw new Error("Invalid phone number format");
        }

        const updateData = {
            name: data.name.trim(),
            logoUrl: data.logoUrl || null,
            address: data.address?.trim() || null,
            email: data.email?.trim() || null,
            phone: data.phone?.trim() || null,
            taxRate: data.taxRate,
            serviceCharge: data.serviceCharge,
            discountRules: data.discountRules,
            qrPayment: data.qrPayment || null,
        };

        return await this.tenantsRepo.updateById(tenantId, updateData);
    }

    /**
     * Update only logo URL
     */
    async updateLogo(tenantId, logoUrl) {
        if (!tenantId) throw new Error("Tenant ID is required");

        const existing = await this.tenantsRepo.getById(tenantId);
        if (!existing) {
            throw new Error("Tenant not found");
        }

        return await this.tenantsRepo.updateById(tenantId, { logoUrl });
    }

    // Helper: Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Helper: Phone validation
    isValidPhone(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/;
        return phoneRegex.test(phone);
    }
}

export default TenantsService;

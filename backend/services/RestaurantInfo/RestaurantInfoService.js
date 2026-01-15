// backend/services/RestaurantInfo/RestaurantInfoService.js

class RestaurantInfoService {
    constructor(restaurantInfoRepository) {
        this.restaurantInfoRepo = restaurantInfoRepository;
    }

    /**
     * Get restaurant info by tenant
     */
    async getRestaurantInfo(tenantId) {
        if (!tenantId) throw new Error("Tenant ID is required");
        return await this.restaurantInfoRepo.getByTenantId(tenantId);
    }

    /**
     * Update or create restaurant info
     */
    async updateRestaurantInfo(tenantId, data) {
        if (!tenantId) throw new Error("Tenant ID is required");

        // Validate required field
        if (!data.name || data.name.trim() === "") {
            throw new Error("Restaurant name is required");
        }

        // Validate email format if provided
        if (data.email && !this.isValidEmail(data.email)) {
            throw new Error("Invalid email format");
        }

        // Validate phone format if provided (basic validation)
        if (data.phone && !this.isValidPhone(data.phone)) {
            throw new Error("Invalid phone number format");
        }

        const updateData = {
            name: data.name.trim(),
            logoUrl: data.logoUrl || null,
            address: data.address?.trim() || null,
            email: data.email?.trim() || null,
            phone: data.phone?.trim() || null,
        };

        return await this.restaurantInfoRepo.upsert(tenantId, updateData);
    }

    /**
     * Update only logo URL
     */
    async updateLogo(tenantId, logoUrl) {
        if (!tenantId) throw new Error("Tenant ID is required");

        const existing = await this.restaurantInfoRepo.getByTenantId(tenantId);
        if (!existing) {
            throw new Error("Restaurant info not found. Please create it first.");
        }

        return await this.restaurantInfoRepo.updateByTenantId(tenantId, { logoUrl });
    }

    // Helper: Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Helper: Phone validation (accepts various formats)
    isValidPhone(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/;
        return phoneRegex.test(phone);
    }
}

export default RestaurantInfoService;

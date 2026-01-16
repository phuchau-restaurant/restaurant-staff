// backend/repositories/implementation/TenantsRepository.js
import { BaseRepository } from "./BaseRepository.js";
import { supabase } from "../../configs/database.js";
import { Tenant } from "../../models/Tenants.js";

export class TenantsRepository extends BaseRepository {
    constructor() {
        super("tenants", "id");
    }

    /**
     * Get tenant by ID
     */
    async getById(tenantId) {
        if (!tenantId) throw new Error("TenantID is required");

        const { data, error } = await supabase
            .from(this.tableName)
            .select("*")
            .eq("id", tenantId)
            .single();

        if (error && error.code !== "PGRST116") {
            throw new Error(`[Tenants] GetById failed: ${error.message}`);
        }

        return data ? new Tenant(data) : null;
    }

    /**
     * Update tenant by ID
     */
    async updateById(tenantId, updates) {
        const entity = new Tenant({ id: tenantId, ...updates });
        const dbPayload = entity.toPersistence();

        // Remove undefined values
        Object.keys(dbPayload).forEach((key) => {
            if (dbPayload[key] === undefined) {
                delete dbPayload[key];
            }
        });

        const { data, error } = await supabase
            .from(this.tableName)
            .update(dbPayload)
            .eq("id", tenantId)
            .select();

        if (error) throw new Error(`[Tenants] Update failed: ${error.message}`);

        return data?.[0] ? new Tenant(data[0]) : null;
    }
}

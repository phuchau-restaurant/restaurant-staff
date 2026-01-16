// backend/repositories/implementation/RestaurantInfoRepository.js
import { BaseRepository } from "./BaseRepository.js";
import { supabase } from "../../configs/database.js";
import { RestaurantInfo } from "../../models/RestaurantInfo.js";

export class RestaurantInfoRepository extends BaseRepository {
    constructor() {
        super("restaurant_info", "id");
    }

    /**
     * Get restaurant info by tenant ID
     * Each tenant has exactly one restaurant profile
     */
    async getByTenantId(tenantId) {
        if (!tenantId) throw new Error("TenantID is required");

        const { data, error } = await supabase
            .from(this.tableName)
            .select("*")
            .eq("tenant_id", tenantId)
            .single();

        if (error && error.code !== "PGRST116") {
            throw new Error(`[RestaurantInfo] GetByTenantId failed: ${error.message}`);
        }

        return data ? new RestaurantInfo(data) : null;
    }

    /**
     * Create new restaurant info
     */
    async create(data) {
        const entity = new RestaurantInfo(data);
        const dbPayload = entity.toPersistence();

        const { data: result, error } = await supabase
            .from(this.tableName)
            .insert([dbPayload])
            .select();

        if (error) throw new Error(`[RestaurantInfo] Create failed: ${error.message}`);

        return result?.[0] ? new RestaurantInfo(result[0]) : null;
    }

    /**
     * Update restaurant info by tenant ID
     */
    async updateByTenantId(tenantId, updates) {
        const entity = new RestaurantInfo(updates);
        const dbPayload = entity.toPersistence();

        // Remove undefined values
        Object.keys(dbPayload).forEach((key) => {
            if (dbPayload[key] === undefined) {
                delete dbPayload[key];
            }
        });

        // Remove tenant_id from update payload
        delete dbPayload.tenant_id;

        const { data, error } = await supabase
            .from(this.tableName)
            .update(dbPayload)
            .eq("tenant_id", tenantId)
            .select();

        if (error) throw new Error(`[RestaurantInfo] Update failed: ${error.message}`);

        return data?.[0] ? new RestaurantInfo(data[0]) : null;
    }

    /**
     * Upsert - Create or Update restaurant info
     */
    async upsert(tenantId, data) {
        const existing = await this.getByTenantId(tenantId);

        if (existing) {
            return await this.updateByTenantId(tenantId, data);
        } else {
            return await this.create({ ...data, tenantId });
        }
    }
}

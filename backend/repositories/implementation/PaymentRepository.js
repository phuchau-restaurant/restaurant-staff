// backend/repositories/implementation/PaymentRepository.js
import { BaseRepository } from "./BaseRepository.js";
import { supabase } from "../../configs/database.js";
import { Payment } from "../../models/Payment.js";

export class PaymentRepository extends BaseRepository {
    constructor() {
        super("payments", "id");
    }

    /**
     * Create a new payment record
     */
    async create(data) {
        const entity = new Payment(data);
        const dbPayload = entity.toPersistence();

        const { data: result, error } = await supabase
            .from(this.tableName)
            .insert([dbPayload])
            .select();

        if (error) throw new Error(`[Payment] Create failed: ${error.message}`);

        return result?.[0] ? new Payment(result[0]) : null;
    }

    /**
     * Get payment by ID
     */
    async getById(id, tenantId) {
        const { data, error } = await supabase
            .from(this.tableName)
            .select("*")
            .eq("id", id)
            .eq("tenant_id", tenantId)
            .single();

        if (error && error.code !== "PGRST116") {
            throw new Error(`[Payment] GetById failed: ${error.message}`);
        }

        return data ? new Payment(data) : null;
    }

    /**
     * Get payment by Order ID
     */
    async getByOrderId(orderId, tenantId) {
        const { data, error } = await supabase
            .from(this.tableName)
            .select("*")
            .eq("order_id", orderId)
            .eq("tenant_id", tenantId)
            .single();

        if (error && error.code !== "PGRST116") {
            throw new Error(`[Payment] GetByOrderId failed: ${error.message}`);
        }

        return data ? new Payment(data) : null;
    }

    /**
     * Update payment
     */
    async update(id, tenantId, updates) {
        const { data, error } = await supabase
            .from(this.tableName)
            .update(updates)
            .eq("id", id)
            .eq("tenant_id", tenantId)
            .select();

        if (error) throw new Error(`[Payment] Update failed: ${error.message}`);

        return data?.[0] ? new Payment(data[0]) : null;
    }
}


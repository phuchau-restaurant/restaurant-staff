// backend/repositories/implementation/PlatformUsersRepository.js
import { BaseRepository } from "./BaseRepository.js";
import { supabase } from "../../configs/database.js";

/**
 * Repository cho bảng platform_users (Super Admin)
 */
export class PlatformUsersRepository extends BaseRepository {
    constructor() {
        super("platform_users", "id");
    }

    /**
     * Tạo super admin mới
     * @param {Object} data - { email, password_hash, role, name }
     */
    async create(data) {
        const payload = {
            email: data.email,
            password_hash: data.passwordHash || data.password_hash,
            role: data.role || "super_admin",
            name: data.name || null,
        };

        const { data: result, error } = await supabase
            .from(this.tableName)
            .insert([payload])
            .select();

        if (error) throw new Error(`[PlatformUsers] Create failed: ${error.message}`);
        return result?.[0] || null;
    }

    /**
     * Lấy super admin theo email
     * @param {string} email
     */
    async getByEmail(email) {
        const { data, error } = await supabase
            .from(this.tableName)
            .select("*")
            .eq("email", email)
            .single();

        if (error && error.code !== "PGRST116") {
            throw new Error(`[PlatformUsers] GetByEmail failed: ${error.message}`);
        }
        return data || null;
    }

    /**
     * Lấy super admin theo ID
     * @param {number} id
     */
    async getById(id) {
        const { data, error } = await supabase
            .from(this.tableName)
            .select("*")
            .eq("id", id)
            .single();

        if (error && error.code !== "PGRST116") {
            throw new Error(`[PlatformUsers] GetById failed: ${error.message}`);
        }
        return data || null;
    }

    /**
     * Lấy tất cả super admin
     */
    async getAll() {
        const { data, error } = await supabase
            .from(this.tableName)
            .select("id, email, name, role, created_at")
            .order("created_at", { ascending: false });

        if (error) throw new Error(`[PlatformUsers] GetAll failed: ${error.message}`);
        return data || [];
    }

    /**
     * Cập nhật super admin
     * @param {number} id
     * @param {Object} updates
     */
    async update(id, updates) {
        const payload = {};
        if (updates.email) payload.email = updates.email;
        if (updates.passwordHash || updates.password_hash) {
            payload.password_hash = updates.passwordHash || updates.password_hash;
        }
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.refreshTokenHash) payload.refresh_token_hash = updates.refreshTokenHash;
        if (updates.refreshTokenExpires) payload.refresh_token_expires = updates.refreshTokenExpires;
        payload.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from(this.tableName)
            .update(payload)
            .eq("id", id)
            .select();

        if (error) throw new Error(`[PlatformUsers] Update failed: ${error.message}`);
        return data?.[0] || null;
    }

    /**
     * Xóa super admin
     * @param {number} id
     */
    async delete(id) {
        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq("id", id);

        if (error) throw new Error(`[PlatformUsers] Delete failed: ${error.message}`);
        return true;
    }
}

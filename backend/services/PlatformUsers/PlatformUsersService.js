// backend/services/PlatformUsers/PlatformUsersService.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-admin-secret-key";
const JWT_EXPIRES_IN = "8h";

class PlatformUsersService {
    constructor(platformUsersRepo, tenantsRepo, usersRepo) {
        this.platformUsersRepo = platformUsersRepo;
        this.tenantsRepo = tenantsRepo;
        this.usersRepo = usersRepo;
    }

    /**
     * Đăng nhập Super Admin
     * @param {string} email
     * @param {string} password
     */
    async login(email, password) {
        if (!email || !password) {
            throw new Error("Email và password là bắt buộc");
        }

        const user = await this.platformUsersRepo.getByEmail(email);
        if (!user) {
            throw new Error("Email hoặc mật khẩu không đúng");
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw new Error("Email hoặc mật khẩu không đúng");
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                type: "platform_admin",
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    /**
     * Tạo Super Admin mới
     * @param {Object} data - { email, password, name }
     */
    async createSuperAdmin(data) {
        if (!data.email || !data.password) {
            throw new Error("Email và password là bắt buộc");
        }

        // Check email exists
        const existing = await this.platformUsersRepo.getByEmail(data.email);
        if (existing) {
            throw new Error("Email đã tồn tại");
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 10);

        const newAdmin = await this.platformUsersRepo.create({
            email: data.email,
            passwordHash,
            name: data.name || null,
            role: "super_admin",
        });

        return {
            id: newAdmin.id,
            email: newAdmin.email,
            name: newAdmin.name,
            role: newAdmin.role,
        };
    }

    /**
     * Lấy danh sách Super Admin
     */
    async getAllSuperAdmins() {
        return await this.platformUsersRepo.getAll();
    }

    /**
     * Xóa Super Admin
     * @param {number} id
     */
    async deleteSuperAdmin(id) {
        const admin = await this.platformUsersRepo.getById(id);
        if (!admin) {
            throw new Error("Super Admin không tồn tại");
        }

        await this.platformUsersRepo.delete(id);
        return { message: "Đã xóa Super Admin" };
    }

    /**
     * Đổi mật khẩu Super Admin
     * @param {number} id - ID của super admin
     * @param {string} currentPassword - Mật khẩu hiện tại
     * @param {string} newPassword - Mật khẩu mới
     */
    async changePassword(id, currentPassword, newPassword) {
        if (!currentPassword || !newPassword) {
            throw new Error("Mật khẩu hiện tại và mật khẩu mới là bắt buộc");
        }

        if (newPassword.length < 6) {
            throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
        }

        const admin = await this.platformUsersRepo.getById(id);
        if (!admin) {
            throw new Error("Super Admin không tồn tại");
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, admin.password_hash);
        if (!isValid) {
            throw new Error("Mật khẩu hiện tại không đúng");
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        await this.platformUsersRepo.update(id, { passwordHash: newPasswordHash });

        return { message: "Đổi mật khẩu thành công" };
    }

    /**
     * Tạo Tenant mới
     * @param {Object} data - { name, slug, email }
     */
    async createTenant(data) {
        if (!data.name) {
            throw new Error("Tên nhà hàng là bắt buộc");
        }

        const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, "-");

        const tenant = await this.tenantsRepo.create({
            name: data.name,
            slug,
            email: data.ownerEmail || data.email || null,
            status: "active",
        });

        return tenant;
    }

    /**
     * Tạo Admin đầu tiên cho Tenant
     * @param {string} tenantId - ID tenant
     * @param {Object} adminData - { email, password, name }
     */
    async createFirstAdmin(tenantId, adminData) {
        if (!tenantId || !adminData.email || !adminData.password) {
            throw new Error("TenantId, email và password là bắt buộc");
        }

        // Check tenant exists
        const tenant = await this.tenantsRepo.getById(tenantId);
        if (!tenant) {
            throw new Error("Tenant không tồn tại");
        }

        // Check if admin already exists for this tenant
        const existingAdmin = await this.usersRepo.getByEmailAndTenant(
            adminData.email,
            tenantId
        );
        if (existingAdmin) {
            throw new Error("Admin với email này đã tồn tại trong tenant");
        }

        // Hash password
        const passwordHash = await bcrypt.hash(adminData.password, 10);

        // Create user with admin role
        const newAdmin = await this.usersRepo.create({
            tenantId,
            email: adminData.email,
            passwordHash,
            fullName: adminData.name || "Admin",
            role: "admin",
            isActive: true,
        });

        return {
            id: newAdmin.id,
            tenantId: newAdmin.tenantId,
            email: newAdmin.email,
            name: newAdmin.name,
            role: newAdmin.role,
        };
    }

    /**
     * Lấy danh sách tất cả Tenants
     */
    async getAllTenants() {
        return await this.tenantsRepo.getAll();
    }
}

export default PlatformUsersService;

// backend/controllers/PlatformUsers/PlatformUsersController.js

class PlatformUsersController {
    constructor(platformUsersService) {
        this.service = platformUsersService;
    }

    /**
     * POST /api/platform/auth/login
     * Đăng nhập Super Admin
     */
    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const result = await this.service.login(email, password);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/platform/admins
     * Lấy danh sách Super Admin
     */
    getAllSuperAdmins = async (req, res, next) => {
        try {
            const admins = await this.service.getAllSuperAdmins();
            res.json({ success: true, data: admins });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/platform/admins
     * Tạo Super Admin mới
     */
    createSuperAdmin = async (req, res, next) => {
        try {
            const { email, password, name } = req.body;
            const admin = await this.service.createSuperAdmin({ email, password, name });
            res.status(201).json({ success: true, data: admin });
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/platform/admins/:id
     * Xóa Super Admin
     */
    deleteSuperAdmin = async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await this.service.deleteSuperAdmin(parseInt(id));
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/platform/tenants
     * Lấy danh sách Tenants
     */
    getAllTenants = async (req, res, next) => {
        try {
            const tenants = await this.service.getAllTenants();
            res.json({ success: true, data: tenants });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/platform/tenants
     * Tạo Tenant mới
     */
    createTenant = async (req, res, next) => {
        try {
            const { name, slug, ownerEmail, subscriptionPlan } = req.body;
            const tenant = await this.service.createTenant({ name, slug, ownerEmail, subscriptionPlan });
            res.status(201).json({ success: true, data: tenant });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/platform/tenants/:tenantId/admin
     * Tạo Admin đầu tiên cho Tenant
     */
    createFirstAdmin = async (req, res, next) => {
        try {
            const { tenantId } = req.params;
            const { email, password, name } = req.body;
            const admin = await this.service.createFirstAdmin(tenantId, { email, password, name });
            res.status(201).json({ success: true, data: admin });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/platform/admins/password
     * Đổi mật khẩu Super Admin
     */
    changePassword = async (req, res, next) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id; // From superAdminMiddleware
            const result = await this.service.changePassword(userId, currentPassword, newPassword);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    };
}
export default PlatformUsersController;

// backend/controllers/Tenants/TenantsController.js

class TenantsController {
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }

    // [GET] /api/tenants
    get = async (req, res, next) => {
        try {
            const tenantId = req.tenantId;
            const data = await this.tenantsService.getTenantInfo(tenantId);

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Tenant info not found",
                    data: null,
                });
            }

            // Clean response - remove slug and status (internal fields)
            const { slug, status, ...returnData } = data;

            return res.status(200).json({
                success: true,
                message: "Tenant info fetched successfully",
                data: returnData,
            });
        } catch (error) {
            next(error);
        }
    };

    // [PUT] /api/tenants
    update = async (req, res, next) => {
        try {
            const tenantId = req.tenantId;
            const updatedInfo = await this.tenantsService.updateTenantInfo(
                tenantId,
                req.body
            );

            const { slug, status, ...returnData } = updatedInfo;

            return res.status(200).json({
                success: true,
                message: "Tenant info updated successfully",
                data: returnData,
            });
        } catch (error) {
            if (error.message.includes("required")) {
                error.statusCode = 400;
            }
            next(error);
        }
    };

    // [PATCH] /api/tenants/logo
    updateLogo = async (req, res, next) => {
        try {
            const tenantId = req.tenantId;
            const { logoUrl } = req.body;

            if (!logoUrl) {
                return res.status(400).json({
                    success: false,
                    message: "Logo URL is required",
                });
            }

            const updatedInfo = await this.tenantsService.updateLogo(
                tenantId,
                logoUrl
            );

            const { slug, status, ...returnData } = updatedInfo;

            return res.status(200).json({
                success: true,
                message: "Logo updated successfully",
                data: returnData,
            });
        } catch (error) {
            if (error.message.includes("not found")) {
                error.statusCode = 404;
            }
            next(error);
        }
    };
}

export default TenantsController;

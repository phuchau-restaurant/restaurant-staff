// backend/controllers/RestaurantInfo/RestaurantInfoController.js

class RestaurantInfoController {
    constructor(restaurantInfoService) {
        this.restaurantInfoService = restaurantInfoService;
    }

    // [GET] /api/restaurant
    get = async (req, res, next) => {
        try {
            const tenantId = req.tenantId;
            const data = await this.restaurantInfoService.getRestaurantInfo(tenantId);

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Restaurant info not found",
                    data: null,
                });
            }

            // Clean response - remove internal IDs
            const { id, tenantId: _tid, ...returnData } = data;

            return res.status(200).json({
                success: true,
                message: "Restaurant info fetched successfully",
                data: returnData,
            });
        } catch (error) {
            next(error);
        }
    };

    // [PUT] /api/restaurant
    update = async (req, res, next) => {
        try {
            const tenantId = req.tenantId;
            const updatedInfo = await this.restaurantInfoService.updateRestaurantInfo(
                tenantId,
                req.body
            );

            const { id, tenantId: _tid, ...returnData } = updatedInfo;

            return res.status(200).json({
                success: true,
                message: "Restaurant info updated successfully",
                data: returnData,
            });
        } catch (error) {
            if (error.message.includes("required")) {
                error.statusCode = 400;
            }
            next(error);
        }
    };

    // [PATCH] /api/restaurant/logo
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

            const updatedInfo = await this.restaurantInfoService.updateLogo(
                tenantId,
                logoUrl
            );

            const { id, tenantId: _tid, ...returnData } = updatedInfo;

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

export default RestaurantInfoController;

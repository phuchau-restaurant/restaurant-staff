// backend/controllers/Report/reportController.js

/**
 * ReportController - Handle HTTP requests cho báo cáo thống kê
 */
class ReportController {
  constructor(reportService) {
    this.reportService = reportService;
  }

  /**
   * GET /api/report/revenue?period=day|week|month|year
   * Lấy doanh thu theo khoảng thời gian
   */
  getRevenue = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { period = "week" } = req.query;

      const data = await this.reportService.getRevenueByPeriod(
        tenantId,
        period
      );

      return res.status(200).json({
        success: true,
        message: `Revenue report for ${period} fetched successfully`,
        data,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };

  /**
   * GET /api/report/revenue/range?from=&to=
   * Lấy doanh thu theo khoảng ngày tùy chọn
   */
  getRevenueRange = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { from, to } = req.query;

      if (!from || !to) {
        return res.status(400).json({
          success: false,
          message: "Missing required query params: from, to",
        });
      }

      const data = await this.reportService.getRevenueByDateRange(
        tenantId,
        from,
        to
      );

      return res.status(200).json({
        success: true,
        message: "Revenue range report fetched successfully",
        data,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };

  /**
   * GET /api/report/best-sellers?limit=10
   * Lấy danh sách món bán chạy nhất
   */
  getBestSellers = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { limit = 10 } = req.query;

      const data = await this.reportService.getBestSellers(
        tenantId,
        parseInt(limit)
      );

      return res.status(200).json({
        success: true,
        message: "Best sellers fetched successfully",
        total: data.length,
        data,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };

  /**
   * GET /api/report/summary?period=day|week|month|year&from=&to=
   * Lấy thống kê tổng quan cho dashboard
   */
  getSummary = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const { period, from, to } = req.query;

      const data = await this.reportService.getDashboardSummary(tenantId, {
        period,
        from,
        to,
      });

      return res.status(200).json({
        success: true,
        message: "Dashboard summary fetched successfully",
        data,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };

  /**
   * GET /api/report/peak-hours
   * Lấy thống kê giờ cao điểm
   */
  getPeakHours = async (req, res, next) => {
    try {
      const tenantId = req.tenantId;
      const data = await this.reportService.getPeakHours(tenantId);
      return res.status(200).json({
        success: true,
        message: "Peak hours report fetched successfully",
        data,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };
}

export default ReportController;

// backend/services/Report/reportService.js

/**
 * ReportService - Business logic cho báo cáo thống kê
 */
class ReportService {
  constructor(reportRepo, menusRepo) {
    this.reportRepo = reportRepo;
    this.menusRepo = menusRepo;
  }

  /**
   * Lấy doanh thu theo period (day, week, month, year)
   * @param {string} tenantId
   * @param {string} period - 'day' | 'week' | 'month' | 'year'
   * @returns {Promise<Object>} { period, labels, values, total }
   */
  async getRevenueByPeriod(tenantId, period = "week") {
    const now = new Date();
    let fromDate, toDate, labels, groupBy;

    switch (period) {
      case "day":
        // 24 giờ trong ngày hôm nay
        fromDate = new Date(now);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now);
        toDate.setHours(23, 59, 59, 999);
        labels = Array.from({ length: 24 }, (_, i) => `${i}h`);
        groupBy = "hour";
        break;

      case "week":
        // 7 ngày gần nhất
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 6);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now);
        toDate.setHours(23, 59, 59, 999);
        labels = this._getWeekLabels(fromDate);
        groupBy = "day";
        break;

      case "month":
        // 30 ngày gần nhất
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 29);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now);
        toDate.setHours(23, 59, 59, 999);
        labels = this._getMonthLabels(fromDate, 30);
        groupBy = "day";
        break;

      case "year":
        // 12 tháng gần nhất
        fromDate = new Date(now);
        fromDate.setMonth(now.getMonth() - 11);
        fromDate.setDate(1);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now);
        toDate.setHours(23, 59, 59, 999);
        labels = this._getYearLabels(fromDate);
        groupBy = "month";
        break;

      default:
        throw new Error(`Invalid period: ${period}`);
    }

    // Query raw data
    const rawData = await this.reportRepo.getRevenueByDateRange(
      tenantId,
      fromDate,
      toDate
    );

    // Aggregate by groupBy
    const values = this._aggregateRevenue(rawData, groupBy, labels, fromDate);
    const total = values.reduce((sum, v) => sum + v, 0);

    return { period, labels, values, total };
  }

  /**
   * Lấy doanh thu theo khoảng ngày tùy chọn
   */
  async getRevenueByDateRange(tenantId, fromDateStr, toDateStr) {
    const fromDate = new Date(fromDateStr);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(toDateStr);
    toDate.setHours(23, 59, 59, 999);

    // Tính số ngày
    const diffDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
    const labels = this._getMonthLabels(fromDate, diffDays);

    const rawData = await this.reportRepo.getRevenueByDateRange(
      tenantId,
      fromDate,
      toDate
    );

    const values = this._aggregateRevenue(rawData, "day", labels, fromDate);
    const total = values.reduce((sum, v) => sum + v, 0);

    return { fromDate: fromDateStr, toDate: toDateStr, labels, values, total };
  }

  /**
   * Lấy món bán chạy nhất
   */
  async getBestSellers(tenantId, limit = 10) {
    const rawData = await this.reportRepo.getBestSellingItems(tenantId, limit);

    // Enrich với dish name
    const dishIds = rawData.map((item) => item.dishId);
    const dishes = await this.menusRepo.getByIds(dishIds);

    const result = rawData.map((item) => {
      const dish = dishes.find((d) => d.id === item.dishId);
      return {
        dishId: item.dishId,
        dishName: dish?.name || "Unknown",
        imgUrl: dish?.imgUrl || null,
        totalQuantity: item.totalQuantity,
        totalRevenue: item.totalRevenue,
      };
    });

    return result;
  }

  /**
   * Lấy thống kê tổng quan cho dashboard
   */
  async getDashboardSummary(tenantId) {
    const summary = await this.reportRepo.getDashboardSummary(tenantId);
    const totalRevenue = await this.reportRepo.getTotalRevenue(tenantId);

    return {
      ...summary,
      totalRevenue,
    };
  }

  /**
   * Lấy thống kê giờ cao điểm
   * @param {string} tenantId
   * @returns {Promise<Object>} { labels, values }
   */
  async getPeakHours(tenantId) {
    // 30 ngày gần nhất
    const now = new Date();
    const fromDate = new Date(now);
    fromDate.setDate(now.getDate() - 30);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(now);
    toDate.setHours(23, 59, 59, 999);

    const rawData = await this.reportRepo.getRevenueByDateRange(
      tenantId,
      fromDate,
      toDate
    );

    const { labels, values } = this._aggregatePeakHours(rawData);
    return { labels, values };
  }

  // ==================== HELPER METHODS ====================

  _getWeekLabels(fromDate) {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const labels = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(fromDate);
      d.setDate(fromDate.getDate() + i);
      labels.push(days[d.getDay()]);
    }
    return labels;
  }

  _getMonthLabels(fromDate, numDays) {
    const labels = [];
    for (let i = 0; i < numDays; i++) {
      const d = new Date(fromDate);
      d.setDate(fromDate.getDate() + i);
      labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
    }
    return labels;
  }

  _getYearLabels(fromDate) {
    const months = [
      "T1", "T2", "T3", "T4", "T5", "T6",
      "T7", "T8", "T9", "T10", "T11", "T12",
    ];
    const labels = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(fromDate);
      d.setMonth(fromDate.getMonth() + i);
      labels.push(months[d.getMonth()]);
    }
    return labels;
  }

  _aggregateRevenue(rawData, groupBy, labels, fromDate) {
    const values = new Array(labels.length).fill(0);

    rawData.forEach((order) => {
      const orderDate = new Date(order.created_at);
      let index = -1;

      switch (groupBy) {
        case "hour":
          index = orderDate.getHours();
          break;
        case "day":
          // Số ngày từ fromDate
          index = Math.floor(
            (orderDate - fromDate) / (1000 * 60 * 60 * 24)
          );
          break;
        case "month":
          // Số tháng từ fromDate
          index =
            (orderDate.getFullYear() - fromDate.getFullYear()) * 12 +
            (orderDate.getMonth() - fromDate.getMonth());
          break;
      }

      if (index >= 0 && index < values.length) {
        values[index] += order.total_amount || 0;
      }
    });

    return values;
  }

  _aggregatePeakHours(rawData) {
    // 24 giờ
    const values = new Array(24).fill(0);
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

    rawData.forEach((order) => {
      const d = new Date(order.created_at);
      const h = d.getHours();
      if (h >= 0 && h < 24) {
        // Có thể đếm số đơn (orders) hoặc doanh thu. 
        // Peak hours thường nói về lượng khách/đơn hàng.
        values[h] += 1; 
      }
    });

    return { labels, values };
  }
}

export default ReportService;

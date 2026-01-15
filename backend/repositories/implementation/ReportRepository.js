// backend/repositories/implementation/ReportRepository.js
import { supabase } from "../../configs/database.js";

/**
 * ReportRepository - Query thống kê từ database
 * Sử dụng raw SQL queries cho các báo cáo phức tạp
 */
export class ReportRepository {
  /**
   * Lấy doanh thu theo ngày trong khoảng thời gian
   * @param {string} tenantId
   * @param {Date} fromDate
   * @param {Date} toDate
   * @returns {Promise<Array>} [{date, total_amount, order_count}]
   */
  async getRevenueByDateRange(tenantId, fromDate, toDate) {
    const { data, error } = await supabase
      .from("orders")
      .select("created_at, total_amount, status")
      .eq("tenant_id", tenantId)
      .eq("status", "Paid")
      .gte("created_at", fromDate.toISOString())
      .lte("created_at", toDate.toISOString())
      .order("created_at", { ascending: true });

    if (error)
      throw new Error(
        `[Report] GetRevenueByDateRange failed: ${error.message}`
      );
    return data || [];
  }

  /**
   * Lấy món bán chạy nhất
   * @param {string} tenantId
   * @param {number} limit
   * @param {Date} fromDate (optional)
   * @param {Date} toDate (optional)
   * @returns {Promise<Array>} [{dish_id, total_quantity}]
   */
  async getBestSellingItems(
    tenantId,
    limit = 10,
    fromDate = null,
    toDate = null
  ) {
    // Query order_details với join orders để lọc theo tenant và status
    let query = supabase
      .from("order_details")
      .select(
        `
        dish_id,
        quantity,
        unit_price,
        orders!inner(tenant_id, status, created_at)
      `
      )
      .eq("orders.tenant_id", tenantId)
      .eq("orders.status", "Paid");

    if (fromDate) {
      query = query.gte("orders.created_at", fromDate.toISOString());
    }
    if (toDate) {
      query = query.lte("orders.created_at", toDate.toISOString());
    }

    const { data, error } = await query;

    if (error)
      throw new Error(`[Report] GetBestSellingItems failed: ${error.message}`);

    // Aggregate by dish_id
    const dishMap = new Map();
    (data || []).forEach((item) => {
      const dishId = item.dish_id;
      if (!dishMap.has(dishId)) {
        dishMap.set(dishId, { dishId, totalQuantity: 0, totalRevenue: 0 });
      }
      const entry = dishMap.get(dishId);
      entry.totalQuantity += item.quantity;
      entry.totalRevenue += item.quantity * item.unit_price;
    });

    // Sort by totalQuantity desc and limit
    const result = Array.from(dishMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);

    return result;
  }

  /**
   * Lấy thống kê tổng quan cho dashboard
   * @param {string} tenantId
   * @returns {Promise<Object>}
   */
  async getDashboardSummary(tenantId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Query tất cả orders hôm nay
    const { data: todayOrders, error } = await supabase
      .from("orders")
      .select("id, status, total_amount")
      .eq("tenant_id", tenantId)
      .gte("created_at", today.toISOString())
      .lt("created_at", tomorrow.toISOString());

    if (error)
      throw new Error(`[Report] GetDashboardSummary failed: ${error.message}`);

    const orders = todayOrders || [];
    const summary = {
      todayOrders: orders.length,
      todayRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
    };

    orders.forEach((order) => {
      if (order.status === "Paid") {
        summary.completedOrders++;
        summary.todayRevenue += order.total_amount || 0;
      } else if (order.status === "Pending") {
        summary.pendingOrders++;
      } else if (order.status === "Cancelled") {
        summary.cancelledOrders++;
      }
    });

    return summary;
  }

  /**
   * Lấy tổng doanh thu tất cả thời gian
   * @param {string} tenantId
   * @returns {Promise<number>}
   */
  async getTotalRevenue(tenantId) {
    const { data, error } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("tenant_id", tenantId)
      .eq("status", "Paid");

    if (error)
      throw new Error(`[Report] GetTotalRevenue failed: ${error.message}`);

    const total = (data || []).reduce(
      (sum, order) => sum + (order.total_amount || 0),
      0
    );
    return total;
  }

  /**
   * Lấy số lượng user theo role
   * @param {string} tenantId
   * @returns {Promise<Object>} { staffCount, customerCount }
   */
  async getUserCountsByRole(tenantId) {
    // Đếm nhân viên từ bảng users
    const { count: staffCount, error: staffError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("is_active", true);

    if (staffError)
      throw new Error(`[Report] GetStaffCount failed: ${staffError.message}`);

    // Đếm khách hàng từ bảng customers
    const { count: customerCount, error: customerError } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("is_active", true);

    if (customerError)
      throw new Error(
        `[Report] GetCustomerCount failed: ${customerError.message}`
      );

    return {
      staffCount: staffCount || 0,
      customerCount: customerCount || 0,
    };
  }

  /**
   * Lấy doanh thu trong khoảng thời gian
   * @param {string} tenantId
   * @param {Date} fromDate
   * @param {Date} toDate
   * @returns {Promise<number>}
   */
  async getRevenueInRange(tenantId, fromDate, toDate) {
    const { data, error } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("tenant_id", tenantId)
      .eq("status", "Paid")
      .gte("created_at", fromDate.toISOString())
      .lte("created_at", toDate.toISOString());

    if (error)
      throw new Error(`[Report] GetRevenueInRange failed: ${error.message}`);

    const total = (data || []).reduce(
      (sum, order) => sum + (order.total_amount || 0),
      0
    );
    return total;
  }
}

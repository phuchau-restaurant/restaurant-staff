/**
 * Report Service - API calls cho báo cáo thống kê
 * Base: /api/report
 */

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/report`;
const HEADERS = {
  "Content-Type": "application/json",
  "x-tenant-id": import.meta.env.VITE_TENANT_ID,
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
};

/**
 * Lấy tổng quan dashboard (Total orders, revenue, pending...)
 * @returns {Promise<Object>}
 */
export const fetchDashboardSummary = async () => {
  try {
    const response = await fetch(`${BASE_URL}/summary`, { headers: HEADERS });
    const result = await response.json();
    if (result.success) return result.data;
    throw new Error(result.message);
  } catch (error) {
    console.error("Fetch summary error:", error);
    return null;
  }
};

/**
 * Lấy doanh thu theo period
 * @param {string} period - 'day' | 'week' | 'month' | 'year'
 * @returns {Promise<Object>} { period, labels, values, total }
 */
export const fetchRevenueByPeriod = async (period = "week") => {
  try {
    const response = await fetch(`${BASE_URL}/revenue?period=${period}`, {
      headers: HEADERS,
    });
    const result = await response.json();
    if (result.success) return result.data;
    throw new Error(result.message);
  } catch (error) {
    console.error("Fetch revenue error:", error);
    return null;
  }
};

/**
 * Lấy top món bán chạy
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export const fetchBestSellers = async (limit = 5) => {
  try {
    const response = await fetch(`${BASE_URL}/best-sellers?limit=${limit}`, {
      headers: HEADERS,
    });
    const result = await response.json();
    if (result.success) return result.data;
    throw new Error(result.message);
  } catch (error) {
    console.error("Fetch best sellers error:", error);
    return [];
  }
};

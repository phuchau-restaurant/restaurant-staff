import { getTenantId } from "../utils/auth";

/**
 * Report Service - API calls cho báo cáo thống kê
 * Base: /api/report
 */

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/report`;
const getHeaders = () => ({
  "Content-Type": "application/json",
  "x-tenant-id": getTenantId(),
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

// ==================== MOCK DATA GENERATORS ====================
// Sử dụng mock data để test UI khi backend chưa có đủ dữ liệu

const generateRevenueMock = (period) => {
  let labels = [];
  let values = [];
  let total = 0;

  if (period === "day") {
    labels = Array.from({ length: 24 }, (_, i) => `${i}h`);
    values = labels.map(() => Math.floor(Math.random() * 500000));
  } else if (period === "week") {
    labels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    values = labels.map(() => Math.floor(Math.random() * 5000000));
  } else if (period === "month") {
    labels = Array.from({ length: 30 }, (_, i) => `${i + 1}/5`);
    values = labels.map(() => Math.floor(Math.random() * 3000000));
  } else {
    labels = [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ];
    values = labels.map(() => Math.floor(Math.random() * 50000000));
  }

  total = values.reduce((sum, v) => sum + v, 0);
  return { period, labels, values, total };
};

const generateRevenueRangeMock = (from, to) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  // Calculate days diff
  const diffTime = Math.abs(toDate - fromDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive

  let labels = [];
  let values = [];

  for (let i = 0; i < diffDays; i++) {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + i);
    labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
    values.push(Math.floor(Math.random() * 4000000));
  }

  const total = values.reduce((sum, v) => sum + v, 0);
  return { from, to, labels, values, total };
};

const MOCK_SUMMARY = {
  todayOrders: 24,
  todayRevenue: 5400000,
  pendingOrders: 3,
  completedOrders: 20,
  cancelledOrders: 1,
  totalRevenue: 154000000,
};

const MOCK_BEST_SELLERS = [
  {
    dishId: "1",
    dishName: "Phở Bò Đặc Biệt",
    totalQuantity: 150,
    totalRevenue: 13500000,
    imgUrl:
      "https://images.unsplash.com/photo-1541095058489-41bc8be27525?auto=format&fit=crop&q=80&w=200",
  },
  {
    dishId: "2",
    dishName: "Bún Chả Hà Nội",
    totalQuantity: 120,
    totalRevenue: 7200000,
    imgUrl:
      "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=200",
  },
  {
    dishId: "3",
    dishName: "Cơm Tấm Sườn Bì",
    totalQuantity: 85,
    totalRevenue: 5525000,
    imgUrl:
      "https://images.unsplash.com/photo-1594834749740-74b3f6764be4?auto=format&fit=crop&q=80&w=200",
  },
  {
    dishId: "4",
    dishName: "Gỏi Cuốn Tôm Thịt",
    totalQuantity: 200,
    totalRevenue: 4000000,
    imgUrl:
      "https://images.unsplash.com/photo-1548599426-b8e7343e5900?auto=format&fit=crop&q=80&w=200",
  },
  {
    dishId: "5",
    dishName: "Trà Đào Cam Sả",
    totalQuantity: 300,
    totalRevenue: 10500000,
    imgUrl:
      "https://images.unsplash.com/photo-1525610819717-b64952044321?auto=format&fit=crop&q=80&w=200",
  },
];

const MOCK_PEAK_HOURS = {
  labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
  values: Array.from({ length: 24 }, (_, i) => {
    // Giả lập giờ cao điểm trưa (11-13h) và tối (18-20h)
    if ((i >= 11 && i <= 13) || (i >= 18 && i <= 20)) {
      return Math.floor(Math.random() * 50) + 30; // 30-80 orders
    }
    return Math.floor(Math.random() * 15); // 0-15 orders
  }),
};

// ==================== END MOCK DATA ====================

// Set TRUE để dùng Mock Data, FALSE để gọi API thật
const USE_MOCK_DATA = false;

/**
 * Lấy tổng quan dashboard (Total orders, revenue, pending...)
 * @param {Object} options - { period, from, to }
 * @returns {Promise<Object>}
 */
export const fetchDashboardSummary = async (options = {}) => {
  if (USE_MOCK_DATA)
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_SUMMARY), 500)
    );
  try {
    const { period, from, to } = options;
    const queryParams = new URLSearchParams();
    if (period) queryParams.append("period", period);
    if (from) queryParams.append("from", from);
    if (to) queryParams.append("to", to);

    const url = `${BASE_URL}/summary${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await fetch(url, { headers: getHeaders() });
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
  if (USE_MOCK_DATA)
    return new Promise((resolve) =>
      setTimeout(() => resolve(generateRevenueMock(period)), 600)
    );
  try {
    const response = await fetch(`${BASE_URL}/revenue?period=${period}`, {
      headers: getHeaders(),
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
 * Lấy doanh thu theo khoảng ngày tùy chọn
 * @param {string} from - Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} to - Ngày kết thúc (YYYY-MM-DD)
 * @returns {Promise<Object>} { from, to, labels, values, total }
 */
export const fetchRevenueByDateRange = async (from, to) => {
  if (USE_MOCK_DATA)
    return new Promise((resolve) =>
      setTimeout(() => resolve(generateRevenueRangeMock(from, to)), 600)
    );
  try {
    const response = await fetch(
      `${BASE_URL}/revenue/range?from=${from}&to=${to}`,
      { headers: getHeaders() }
    );
    const result = await response.json();
    if (result.success) return result.data;
    throw new Error(result.message);
  } catch (error) {
    console.error("Fetch revenue range error:", error);
    return null;
  }
};

/**
 * Lấy top món bán chạy
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export const fetchBestSellers = async (limit = 5) => {
  if (USE_MOCK_DATA)
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_BEST_SELLERS.slice(0, limit)), 700)
    );
  try {
    const response = await fetch(`${BASE_URL}/best-sellers?limit=${limit}`, {
      headers: getHeaders(),
    });
    const result = await response.json();
    if (result.success) return result.data;
    throw new Error(result.message);
  } catch (error) {
    console.error("Fetch best sellers error:", error);
    return [];
  }
};

/**
 * Lấy thống kê giờ cao điểm
 * @returns {Promise<Object>} { labels, values }
 */
export const fetchPeakHours = async () => {
  if (USE_MOCK_DATA)
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_PEAK_HOURS), 800)
    );
  try {
    const response = await fetch(`${BASE_URL}/peak-hours`, {
      headers: getHeaders(),
    });
    const result = await response.json();
    if (result.success) return result.data;
    throw new Error(result.message);
  } catch (error) {
    console.error("Fetch peak hours error:", error);
    return { labels: [], values: [] };
  }
};

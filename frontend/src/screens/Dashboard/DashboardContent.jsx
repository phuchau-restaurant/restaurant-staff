import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Package,
  MessageSquare,
  BarChart3,
  Calendar,
  ChevronDown,
  TrendingUp,
  DollarSign,
  Utensils,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import StatCard from "../../components/Dashboard/StatCard";
import * as reportService from "../../services/reportService";
import { formatPrice } from "../../utils/orderUtils";

const DashboardContent = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week"); // day, week, month, year
  const [summary, setSummary] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [peakHoursData, setPeakHoursData] = useState([]);
  const [dateError, setDateError] = useState("");

  // Custom Date Range State
  const [customRange, setCustomRange] = useState({
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch data

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let revenueResult;

        if (period === "custom") {
          // Fetch custom range
          revenueResult = await reportService.fetchRevenueByDateRange(
            customRange.from,
            customRange.to
          );
        } else {
          // Fetch standard period
          revenueResult = await reportService.fetchRevenueByPeriod(period);
        }

        const [summaryData, bestSellersData, peakHoursResult] =
          await Promise.all([
            reportService.fetchDashboardSummary(),
            reportService.fetchBestSellers(5),
            reportService.fetchPeakHours(),
          ]);

        if (summaryData) setSummary(summaryData);

        // Format revenue data for Recharts
        if (revenueResult) {
          const chartData = revenueResult.labels.map((label, index) => ({
            name: label,
            value: revenueResult.values[index],
          }));
          setRevenueData(chartData);
        }

        if (bestSellersData) setBestSellers(bestSellersData);

        if (peakHoursResult) {
          const pData = peakHoursResult.labels.map((label, index) => ({
            name: label,
            value: peakHoursResult.values[index],
          }));
          setPeakHoursData(pData);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]); // Note: For custom range, we might want to fetch only when user clicks "Apply", but for now simplest is fetching when period changes to other values.

  // Separate handler for applying custom range
  const handleApplyCustomRange = async () => {
    if (period !== "custom") return;

    // Validate dates
    if (new Date(customRange.to) < new Date(customRange.from)) {
      setDateError("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");
      return;
    }
    setDateError("");
    setLoading(true);
    try {
      const revenueResult = await reportService.fetchRevenueByDateRange(
        customRange.from,
        customRange.to
      );
      if (revenueResult) {
        const chartData = revenueResult.labels.map((label, index) => ({
          name: label,
          value: revenueResult.values[index],
        }));
        setRevenueData(chartData);
      }

      // Also refresh other data when applying custom range
      const [summaryData, bestSellersData, peakHoursResult] = await Promise.all(
        [
          reportService.fetchDashboardSummary(),
          reportService.fetchBestSellers(5),
          reportService.fetchPeakHours(),
        ]
      );

      if (summaryData) setSummary(summaryData);
      if (bestSellersData) setBestSellers(bestSellersData);
      if (peakHoursResult) {
        const pData = peakHoursResult.labels.map((label, index) => ({
          name: label,
          value: peakHoursResult.values[index],
        }));
        setPeakHoursData(pData);
      }
    } catch (error) {
      console.error("Custom range fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Hôm nay",
      value: summary.todayOrders,
      change: "Đơn hàng mới",
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Doanh thu hôm nay",
      value: formatPrice(summary.todayRevenue),
      change: "Revenue",
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Đang chờ xử lý",
      value: summary.pendingOrders,
      change: "Cần thao tác ngay",
      icon: MessageSquare,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Tổng doanh thu",
      value: formatPrice(summary.totalRevenue),
      change: "All time",
      icon: BarChart3,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const PERIOD_OPTIONS = [
    { value: "day", label: "Hôm nay" },
    { value: "week", label: "7 ngày qua" },
    { value: "month", label: "30 ngày qua" },
    { value: "year", label: "Năm nay" },
    { value: "custom", label: "Tùy chọn" },
  ];

  if (loading && !summary.totalRevenue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-500 mt-1">Tổng quan tình hình kinh doanh</p>
        </div>

        {/* Filter */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
          >
            <Calendar size={18} />
            <span className="font-medium text-sm">
              {PERIOD_OPTIONS.find((p) => p.value === period)?.label}
            </span>
            <ChevronDown size={16} />
          </button>

          {isFilterOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsFilterOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20 animate-in fade-in zoom-in-95 duration-200">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setPeriod(opt.value);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      period === opt.value
                        ? "text-blue-600 font-medium bg-blue-50"
                        : "text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Custom Range Picker */}
      {period === "custom" && (
        <div className="flex flex-wrap items-end gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              value={customRange.from}
              onChange={(e) =>
                setCustomRange({ ...customRange, from: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              value={customRange.to}
              onChange={(e) =>
                setCustomRange({ ...customRange, to: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            onClick={handleApplyCustomRange}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm h-[42px]"
          >
            Áp dụng
          </button>

          {dateError && (
            <div className="w-full text-red-500 text-sm mt-2 flex items-center gap-1">
              ⚠️ {dateError}
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-blue-500" size={20} />
              Biểu đồ doanh thu
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value) => formatPrice(value)}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
            <Utensils className="text-orange-500" size={20} />
            Món Bán Chạy
          </h3>
          <div className="space-y-4">
            {bestSellers.length > 0 ? (
              bestSellers.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.imgUrl ? (
                      <img
                        src={item.imgUrl}
                        alt={item.dishName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Utensils size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {item.dishName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.totalQuantity} đã bán
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">
                      {formatPrice(item.totalRevenue)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Peak Hours Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock className="text-purple-500" size={20} />
            Khung Giờ Cao Điểm
          </h3>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={peakHoursData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar
                dataKey="value"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;

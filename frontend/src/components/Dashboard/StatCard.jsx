import React from "react";
import useCountUp from "../../hooks/useCountUp";

const StatCard = ({
  label,
  value,
  change,
  icon: Icon,
  color = "bg-blue-50 text-blue-500",
}) => {
  // Xác định xem value có phải là số hay không
  const isNumeric = typeof value === "number";
  const isFormattedPrice = typeof value === "string" && value.includes("₫");

  // Lấy số từ chuỗi giá tiền nếu cần
  let numericValue = value;
  let suffix = "";

  if (isFormattedPrice) {
    // Tách số và ký tự ₫
    const match = value.match(/([\d,.]+)\s*₫/);
    if (match) {
      // Loại bỏ dấu chấm phân cách hàng nghìn
      numericValue = parseInt(match[1].replace(/\./g, ""), 10);
      suffix = " ₫";
    }
  }

  // Sử dụng count-up animation cho số
  const animatedValue = useCountUp(
    isNumeric || isFormattedPrice ? numericValue : 0,
    2000, // 2 giây
    0 // Không delay
  );

  // Format lại giá trị để hiển thị
  const displayValue = isNumeric
    ? animatedValue
    : isFormattedPrice
    ? animatedValue.toLocaleString("vi-VN") + suffix
    : value;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium mb-2">{label}</p>
          <h3 className="text-4xl font-bold text-gray-800 mb-1">
            {displayValue}
          </h3>
          <p className="text-xs text-gray-400">{change}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;

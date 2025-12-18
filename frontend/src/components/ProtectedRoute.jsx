import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Kiểm tra xem user đã đăng nhập chưa
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("authToken");

  // Nếu không có user hoặc token, redirect về login
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, render children
  return children;
};

export default ProtectedRoute;

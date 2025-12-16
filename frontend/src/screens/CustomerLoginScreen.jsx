import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomer } from "../contexts/CustomerContext";
import { motion } from "framer-motion";
import {
  Utensils,
  Phone,
  User,
  ArrowRight,
  Sparkles,
  Coffee,
  Cookie,
  UtensilsCrossed,
} from "lucide-react";

const CustomerLoginScreen = () => {
  const navigate = useNavigate();
  const { login, updateTable } = useCustomer();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tableInfo, setTableInfo] = useState(null);
  const [tokenVerified, setTokenVerified] = useState(false);

  // Verify QR token khi component mount (BẮT BUỘC PHẢI CÓ TOKEN)
  React.useEffect(() => {
    const verifyQRToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      // BẮT BUỘC phải có token trong URL - không cho phép truy cập trực tiếp
      if (!token) {
        alert("⚠️ Vui lòng quét mã QR để truy cập!");
        navigate("/");
        return;
      }

      // Nếu đã verify token này rồi, bỏ qua
      // const storedToken = localStorage.getItem("qrToken");
      // if (storedToken === token && tokenVerified) {
      //   return;
      // }

      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/qr/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "QR code không hợp lệ hoặc đã hết hạn!");
          navigate("/");
          return;
        }

        // Lưu thông tin bàn, token và tenantId
        setTableInfo(data.data);
        updateTable({
          id: data.data.tableId,
          number: data.data.tableNumber,
        });
        localStorage.setItem("qrToken", token);
        localStorage.setItem("tableInfo", JSON.stringify(data.data));
        localStorage.setItem("tenantId", data.data.tenantId); // Lưu tenantId để dùng cho các API call
        setTokenVerified(true);
      } catch (error) {
        console.error("QR verify error:", error);
        alert("Không thể xác thực QR code!");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    verifyQRToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // CHỈ CHẠY 1 LẦN khi mount

  // Hàm kiểm tra số điện thoại hợp lệ
  const isValidPhone = (value) => {
    const phoneRegex = /^0\d{9,10}$/;
    return phoneRegex.test(value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isValidPhone(phone)) {
      setError("Số điện thoại phải bắt đầu bằng 0 và dài 10 - 11 chữ số.");
      return;
    }

    if (!name.trim()) {
      setError("Vui lòng nhập tên.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Lấy tenantId từ localStorage (đã lưu khi verify QR)
      const tenantId = localStorage.getItem("tenantId");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/customers/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-id": tenantId || import.meta.env.VITE_TENANT_ID,
          },
          body: JSON.stringify({
            phoneNumber: phone,
            fullName: name,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Đăng nhập thất bại");
        setIsLoading(false);
        return;
      }

      // lưu thông tin customer vào context
      login(data.data);

      // chuyển sang menu với thông tin bàn đã verify
      navigate("/customer/menu");
    } catch (error) {
      console.error("Login error:", error);
      alert("Không thể kết nối server!");
    }

    setIsLoading(false);
  };

  // Hiển thị loading khi đang verify token
  if (!tokenVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Đang xác thực QR code...</p>
          {tableInfo && (
            <p className="text-sm mt-2">Bàn số: {tableInfo.tableNumber}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        exit={{ opacity: 0, scale: 1.5 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </motion.div>

      <div className="relative bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 transform hover:scale-[1.01] transition-transform duration-500">
        {/* LEFT - Pure Visual */}
        <motion.div
          className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 flex items-center justify-center p-12 overflow-hidden min-h-[500px]"
          exit={{ x: -800, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Animated circles background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 animate-pulse animation-delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse animation-delay-2000"></div>
          </div>

          {/* Floating food icons - tăng số lượng */}
          <motion.div
            className="absolute top-20 left-10 animate-float"
            exit={{ x: -300, y: -200, opacity: 0, rotate: -180 }}
            transition={{ duration: 0.6 }}
          >
            <Utensils className="text-white/30 w-16 h-16 drop-shadow-lg" />
          </motion.div>
          <motion.div
            className="absolute top-32 right-16 animate-float-delayed"
            exit={{ x: 300, y: -200, opacity: 0, rotate: 180 }}
            transition={{ duration: 0.6 }}
          >
            <Coffee className="text-white/25 w-14 h-14 drop-shadow-lg" />
          </motion.div>
          <motion.div
            className="absolute bottom-24 left-20 animate-float animation-delay-1000"
            exit={{ x: -300, y: 200, opacity: 0, rotate: -90 }}
            transition={{ duration: 0.6 }}
          >
            <Cookie className="text-white/30 w-12 h-12 drop-shadow-lg" />
          </motion.div>
          <motion.div
            className="absolute bottom-32 right-24 animate-float-delayed animation-delay-2000"
            exit={{ x: 300, y: 200, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.6 }}
          >
            <UtensilsCrossed className="text-white/25 w-16 h-16 drop-shadow-lg" />
          </motion.div>
          <motion.div
            className="absolute top-1/2 left-16 animate-float animation-delay-600"
            exit={{ x: -400, opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="text-white/20 w-10 h-10 drop-shadow-lg" />
          </motion.div>

          {/* Central logo with strong animation */}
          <motion.div className="relative z-10" layoutId="app-logo">
            <div className="relative inline-block">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl animate-pulse scale-150"></div>

              {/* Main icon container */}
              <div className="relative bg-white p-12 rounded-full shadow-2xl transform hover:rotate-12 hover:scale-110 transition-all duration-500">
                <Utensils className="w-32 h-32 text-orange-500 animate-bounce-slow" />
              </div>
            </div>

            {/* Decorative dots */}
            <div className="flex justify-center gap-4 mt-12">
              <div className="w-4 h-4 bg-white/80 rounded-full animate-ping"></div>
              <div className="w-4 h-4 bg-white/80 rounded-full animate-ping animation-delay-300"></div>
              <div className="w-4 h-4 bg-white/80 rounded-full animate-ping animation-delay-600"></div>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT - Login Form */}
        <div className="p-12 flex flex-col justify-center bg-gradient-to-br from-white to-orange-50">
          <div className="max-w-md mx-auto w-full space-y-8 animate-fade-in-right">
            {/* Header */}
            <motion.div
              className="text-center space-y-2 py-2"
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-4xl font-bold bg-gradient-to-r p-2 from-orange-600 to-red-600 bg-clip-text text-transparent">
                Nhập thông tin
              </h3>
              <p className="text-gray-600">
                Mời bạn nhập thông tin để bắt đầu đặt món
              </p>
              {tableInfo && (
                <div className="mt-3 inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                  🍽️ Bàn số: {tableInfo.tableNumber}
                </div>
              )}
            </motion.div>

            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Phone Input */}
              <motion.div
                className="space-y-2 group"
                exit={{ opacity: 0, x: -400, rotate: -15 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <label className="block text-md font-semibold text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-500" />
                  Số điện thoại
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 text-lg focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 outline-none group-hover:border-orange-300"
                    placeholder="0123 456 789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Phone className="w-5 h-5 text-gray-300 group-hover:text-orange-400 transition-colors" />
                  </div>
                </div>
              </motion.div>

              {/* Name Input */}
              <motion.div
                className="space-y-2 group"
                exit={{ opacity: 0, x: 400, rotate: 15 }}
                transition={{ duration: 0.5, delay: 0.05, ease: "easeInOut" }}
              >
                <label className="block text-md font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-500" />
                  Tên của bạn
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 text-lg focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 outline-none group-hover:border-orange-300"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <User className="w-5 h-5 text-gray-300 group-hover:text-orange-400 transition-colors" />
                  </div>
                </div>
              </motion.div>

              {/* ERROR MESSAGE */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-shake">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* BUTTON WITH LOADING */}
              <motion.button
                exit={{ opacity: 0, y: 200, scale: 0.5 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeInOut" }}
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group ${
                  isLoading ? "opacity-70 cursor-not-allowed scale-95" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <span>Bắt đầu đặt món</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <motion.div
              className="text-center pt-6 border-t border-gray-200"
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Restaurant Manager
              </p>
              <p className="text-orange-600 text-xs mt-2 font-medium">
                Powered by HDV Team
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite 1.5s;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </motion.div>
  );
};

export default CustomerLoginScreen;

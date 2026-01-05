import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Home, Eye, EyeOff } from "lucide-react";
import AuthContext from "../context/AuthContext";

// --- COMPONENT: HOMESCREEN ---
const HomeScreen = () => {
  const navigate = useNavigate();
  const {
    isLoading: authLoading,
    isAuthenticated,
    login,
  } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Nếu đã đăng nhập, redirect đến dashboard
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Nếu đang kiểm tra authentication, hiển thị loading
  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    // Reset errors
    setEmailError("");
    setPasswordError("");

    // Validate email
    if (!email.trim()) {
      setEmailError("Vui lòng nhập email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError("Email không đúng định dạng");
      return;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError("Vui lòng nhập mật khẩu");
      return;
    }

    setIsLoading(true);

    try {
      // Sử dụng login function từ AuthContext
      const result = await login(email.trim(), password);

      if (result.success && result.user) {
        const userRole = result.user.role;

        // Phân tách route theo role
        if (userRole === "admin") {
          navigate("/dashboard", { replace: true });
        } else if (userRole === "chef") {
          navigate("/kitchen", { replace: true });
        } else if (userRole === "waiter" || userRole === "staff") {
          navigate("/waiter", { replace: true });
        } else {
          // Default route nếu role không xác định
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg = err.message || "Không thể kết nối đến server";
      if (errorMsg.toLowerCase().includes("email")) {
        setEmailError(errorMsg);
      } else if (
        errorMsg.toLowerCase().includes("password") ||
        errorMsg.toLowerCase().includes("mật khẩu")
      ) {
        setPasswordError(errorMsg);
      } else {
        setPasswordError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-white overflow-hidden flex flex-col font-sans z-50 ">
      {/* --- TOP DECORATIVE WAVES --- */}
      <div className="absolute top-0 left-0 w-full pointer-events-none overflow-hidden z-0">
        {/* Light Blue Wave */}
        <svg
          viewBox="0 0 900 320"
          className="w-full h-auto fixed top-0 transform -translate-y-1/4 sm:-translate-y-1/2 opacity-80"
        >
          <path
            fill="#93C5FD"
            fillOpacity="1"
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
        {/* Dark Blue Wave */}
        <svg
          viewBox="0 0 1000 320"
          className="w-full h-auto fixed top-0 transform -translate-y-1/3 sm:-translate-y-1/2"
        >
          <path
            fill="#3B82F6"
            fillOpacity="1"
            d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 z-10 flex flex-col justify-center px-8 sm:px-12 md:px-24 lg:max-w-lg lg:mx-auto w-full pt-40 pb-40">
        {/* Header Text */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Đăng Nhập</h1>
          <p className="text-gray-500 font-medium">Hệ thống quản lý nhà hàng</p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-blue-500 text-sm font-semibold ml-1">
              EMAIL
            </label>
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                className={`w-full border-2 rounded-xl px-4 py-3 text-gray-700 focus:outline-none transition-all bg-white ${
                  emailError
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
                placeholder="Nhập email của bạn..."
              />
              <Mail
                className={`absolute right-4 top-3.5 w-5 h-5 ${
                  emailError ? "text-red-400" : "text-blue-300"
                }`}
              />
            </div>
            {emailError && (
              <p className="text-red-600 text-sm ml-1">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-blue-500 text-sm font-semibold ml-1">
              MẬT KHẨU
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                className={`w-full border-2 rounded-xl px-4 py-3 pr-12 text-gray-700 focus:outline-none transition-all bg-white ${
                  passwordError
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-blue-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-600 text-sm ml-1">{passwordError}</p>
            )}
          </div>

          {/* LOGIN + FORGOT IN 1 ROW */}
          <div className="flex justify-between items-center pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`
                bg-blue-600 text-white font-bold 
                py-3 px-8 rounded-xl 
                border-2 border-blue-600
                transition-all shadow-md active:scale-95
                hover:bg-white hover:text-blue-600
                ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
              `}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/verify-email")}
              className="text-sm text-blue-500 hover:text-blue-700 font-medium"
            >
              Quên mật khẩu?
            </button>
          </div>
        </form>
      </div>

      {/* --- BOTTOM WAVE & CTA --- */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none z-0">
        <svg
          viewBox="0 -110 900 320"
          className="w-full h-auto block align-bottom"
        >
          <path
            fill="#3B82F6"
            fillOpacity="1"
            d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,122.7C672,117,768,139,864,160C960,181,1056,203,1152,202.7C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default HomeScreen;

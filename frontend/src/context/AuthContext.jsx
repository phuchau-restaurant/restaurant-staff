// AuthContext.jsx - Context để quản lý authentication state
import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

// Helper function để xác định route dựa trên role
export const getRoleBasedRoute = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return '/dashboard';
    case 'chef':
      return '/kitchen';
    case 'waiter':
    case 'staff':
      return '/waiter';
    default:
      return '/dashboard'; // Fallback cho các role không xác định
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Auto-login: Gọi /api/auth/refresh khi app khởi động
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Gọi refresh endpoint để kiểm tra và làm mới token từ cookie
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`,
          {
            method: "POST",
            credentials: "include", // Gửi httpOnly cookie
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.accessToken && data.data?.user) {
            // Refresh thành công - đăng nhập tự động
            setUser(data.data.user);
            setAccessToken(data.data.accessToken);
            setIsAuthenticated(true);
            // Lưu vào localStorage
            localStorage.setItem("user", JSON.stringify(data.data.user));
            localStorage.setItem("accessToken", data.data.accessToken);
            console.log("✅ Auto-login successful");
          } else {
            throw new Error("Invalid response format");
          }
        } else {
          // Refresh thất bại - user chưa đăng nhập hoặc session hết
          console.log("⏸️ No active session - user needs to login");
          setUser(null);
          setAccessToken(null);
          setIsAuthenticated(false);
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("accessToken"); // Legacy token
        }
      } catch (error) {
        console.error("❌ Auto-login failed:", error);
        setUser(null);
        setAccessToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("accessToken");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`;
      console.log("Logging in to:", url);

      const response = await fetch(url, {
        method: "POST",
        credentials: "include", // Để nhận refresh cookie
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": import.meta.env.VITE_TENANT_ID,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      if (data.success && data.data?.user && data.data?.accessToken) {
        setUser(data.data.user);
        setAccessToken(data.data.accessToken);
        setIsAuthenticated(true);
        // Lưu vào localStorage
        localStorage.setItem("user", JSON.stringify(data.data.user));
        localStorage.setItem("accessToken", data.data.accessToken);
        return { success: true, user: data.data.user };
      } else {
        throw new Error(data.message || "Dữ liệu đăng nhập không hợp lệ");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Không thể kết nối đến server. Hãy kiểm tra backend có chạy không?"
        );
      }
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("accessToken"); // Legacy
    }
  };

  // Refresh token manually
  const refreshToken = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.accessToken && data.data?.user) {
          setAccessToken(data.data.accessToken);
          setUser(data.data.user);
          setIsAuthenticated(true);
          localStorage.setItem("accessToken", data.data.accessToken);
          localStorage.setItem("user", JSON.stringify(data.data.user));
          return data.data.accessToken;
        }
      }
      throw new Error("Refresh token failed");
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Logout nếu refresh thất bại
      await logout();
      throw error;
    }
  };

  // Update user data (e.g. after profile update)
  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    accessToken,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
    updateUser,
    getRoleBasedRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

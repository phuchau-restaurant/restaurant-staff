// frontend/src/screens/SuperAdmin/SuperAdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import {
    Building2,
    Users,
    LogOut,
    Menu,
    X,
    Shield,
    Key
} from "lucide-react";

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        // Check auth
        const token = localStorage.getItem("platform_token");
        const userData = localStorage.getItem("platform_user");

        if (!token || !userData) {
            navigate("/super-admin/login");
            return;
        }

        setUser(JSON.parse(userData));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("platform_token");
        localStorage.removeItem("platform_user");
        navigate("/super-admin/login");
    };

    const menuItems = [
        {
            path: "/super-admin/dashboard/tenants",
            icon: Building2,
            label: "Quản lý Nhà hàng"
        },
        {
            path: "/super-admin/dashboard/admins",
            icon: Shield,
            label: "Quản lý Super Admin"
        },
        {
            path: "/super-admin/dashboard/settings",
            icon: Key,
            label: "Đổi mật khẩu"
        },
    ];

    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col`}
            >
                {/* Logo */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    {sidebarOpen && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Shield className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-lg">Super Admin</span>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item.path, item.exact)
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && <span className="font-medium">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-white/10">
                    {sidebarOpen && (
                        <div className="mb-3 px-4">
                            <p className="text-sm text-gray-400">Đăng nhập với</p>
                            <p className="font-medium truncate">{user?.email}</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span>Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default SuperAdminDashboard;

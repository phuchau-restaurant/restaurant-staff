// frontend/src/screens/SuperAdmin/TenantManagement.jsx
import React, { useState, useEffect } from "react";
import {
    Building2,
    Plus,
    User,
    Mail,
    Lock,
    Loader2,
    CheckCircle,
    AlertCircle,
    Store
} from "lucide-react";
import * as platformService from "../../services/platformService";

const TenantManagement = () => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Form states
    const [tenantForm, setTenantForm] = useState({ name: "", slug: "", ownerEmail: "" });
    const [adminForm, setAdminForm] = useState({ email: "", password: "", name: "" });
    const [submitting, setSubmitting] = useState(false);

    const token = localStorage.getItem("platform_token");

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const data = await platformService.getAllTenants(token);
            setTenants(data || []);
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTenant = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const newTenant = await platformService.createTenant(token, tenantForm);
            setTenants([newTenant, ...tenants]);
            setShowCreateModal(false);
            setTenantForm({ name: "", slug: "", ownerEmail: "" });
            setMessage({ type: "success", text: "Tạo nhà hàng thành công!" });
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await platformService.createFirstAdmin(token, selectedTenant.id, adminForm);
            setShowAdminModal(false);
            setAdminForm({ email: "", password: "", name: "" });
            setMessage({ type: "success", text: `Tạo admin cho ${selectedTenant.name} thành công!` });
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const openAdminModal = (tenant) => {
        setSelectedTenant(tenant);
        setShowAdminModal(true);
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Nhà hàng</h1>
                    <p className="text-gray-500">Tạo và quản lý các tenant trong hệ thống</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Thêm nhà hàng
                </button>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`mb-4 p-4 rounded-xl flex items-center gap-2 ${message.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                    {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                    <button onClick={() => setMessage({ type: "", text: "" })} className="ml-auto text-lg">&times;</button>
                </div>
            )}

            {/* Tenant List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tenants.map((tenant) => (
                        <div key={tenant.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                    <Store className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800 truncate">{tenant.name}</h3>
                                    <p className="text-sm text-gray-500 truncate">{tenant.slug}</p>
                                    <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${tenant.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                        }`}>
                                        {tenant.status || "active"}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => openAdminModal(tenant)}
                                className="w-full mt-4 py-2 px-4 border-2 border-purple-200 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <User className="w-4 h-4" />
                                Tạo Admin
                            </button>
                        </div>
                    ))}

                    {tenants.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>Chưa có nhà hàng nào</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create Tenant Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Thêm nhà hàng mới</h2>
                        <form onSubmit={handleCreateTenant} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhà hàng *</label>
                                <input
                                    type="text"
                                    required
                                    value={tenantForm.name}
                                    onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Nhà hàng ABC"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                                <input
                                    type="text"
                                    value={tenantForm.slug}
                                    onChange={(e) => setTenantForm({ ...tenantForm, slug: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="nha-hang-abc"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email chủ sở hữu</label>
                                <input
                                    type="email"
                                    value={tenantForm.ownerEmail}
                                    onChange={(e) => setTenantForm({ ...tenantForm, ownerEmail: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="owner@example.com"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50">
                                    Hủy
                                </button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Tạo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Admin Modal */}
            {showAdminModal && selectedTenant && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-2">Tạo Admin cho nhà hàng</h2>
                        <p className="text-gray-500 mb-4">{selectedTenant.name}</p>
                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Admin</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={adminForm.name}
                                        onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        placeholder="Admin"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={adminForm.email}
                                        onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        placeholder="admin@restaurant.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={adminForm.password}
                                        onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAdminModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50">
                                    Hủy
                                </button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
                                    Tạo Admin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantManagement;

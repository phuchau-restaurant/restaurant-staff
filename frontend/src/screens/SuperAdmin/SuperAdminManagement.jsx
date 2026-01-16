// frontend/src/screens/SuperAdmin/SuperAdminManagement.jsx
import React, { useState, useEffect } from "react";
import {
    Shield,
    Plus,
    Trash2,
    Mail,
    Lock,
    User,
    Loader2,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import * as platformService from "../../services/platformService";

const SuperAdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Form states
    const [form, setForm] = useState({ email: "", password: "", name: "" });
    const [submitting, setSubmitting] = useState(false);

    const token = localStorage.getItem("platform_token");
    const currentUser = JSON.parse(localStorage.getItem("platform_user") || "{}");

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const data = await platformService.getAllSuperAdmins(token);
            setAdmins(data || []);
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const newAdmin = await platformService.createSuperAdmin(token, form);
            setAdmins([newAdmin, ...admins]);
            setShowCreateModal(false);
            setForm({ email: "", password: "", name: "" });
            setMessage({ type: "success", text: "Tạo Super Admin thành công!" });
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedAdmin) return;
        setSubmitting(true);
        try {
            await platformService.deleteSuperAdmin(token, selectedAdmin.id);
            setAdmins(admins.filter(a => a.id !== selectedAdmin.id));
            setShowDeleteModal(false);
            setSelectedAdmin(null);
            setMessage({ type: "success", text: "Đã xóa Super Admin!" });
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const openDeleteModal = (admin) => {
        setSelectedAdmin(admin);
        setShowDeleteModal(true);
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Super Admin</h1>
                    <p className="text-gray-500">Tạo và quản lý tài khoản Super Admin</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Thêm Super Admin
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

            {/* Admin List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">ID</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Tên</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {admins.map((admin) => (
                                <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500">#{admin.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                                                {(admin.name || admin.email)[0].toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-800">{admin.name || "-"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                            <Shield className="w-3 h-3" />
                                            {admin.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {admin.id !== currentUser.id ? (
                                            <button
                                                onClick={() => openDeleteModal(admin)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Bạn</span>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {admins.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>Chưa có Super Admin nào</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Thêm Super Admin mới</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        placeholder="Admin Name"
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
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        placeholder="admin@example.com"
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
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        placeholder="••••••••"
                                    />
                                </div>
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

            {/* Delete Confirm Modal */}
            {showDeleteModal && selectedAdmin && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Xác nhận xóa</h2>
                        <p className="text-gray-500 mb-6">
                            Bạn có chắc muốn xóa Super Admin <strong>{selectedAdmin.email}</strong>?
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50">
                                Hủy
                            </button>
                            <button onClick={handleDelete} disabled={submitting} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminManagement;

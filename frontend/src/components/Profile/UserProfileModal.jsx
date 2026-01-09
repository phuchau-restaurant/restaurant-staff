// frontend/src/components/Profile/UserProfileModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Save, User, Phone, MapPin, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AvatarSelector from "./AvatarSelector";
import * as profileService from "../../services/profileService";

/**
 * UserProfileModal - Modal chỉnh sửa thông tin cá nhân
 * Có thể drag và resize giống như ModifierGroupForm
 */
const UserProfileModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        dateOfBirth: "",
        hometown: "",
        avatarUrl: "",
        avatarType: "default",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");

    // Drag & resize state
    const modalRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [modalPos, setModalPos] = useState({
        x: window.innerWidth / 2 - 350,
        y: window.innerHeight / 2 - 300,
    });
    const [modalSize, setModalSize] = useState({ width: 700, height: 600 });
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStart, setResizeStart] = useState({
        x: 0,
        y: 0,
        width: 700,
        height: 600,
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || user.full_name || "",
                phoneNumber: user.phoneNumber || user.phone_number || "",
                dateOfBirth: user.dateOfBirth || user.date_of_birth || "",
                hometown: user.hometown || "",
                avatarUrl: user.avatarUrl || user.avatar_url || "",
                avatarType: user.avatarType || user.avatar_type || "default",
            });
        }
    }, [user]);

    // Drag handlers
    const onDragStart = (e) => {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - modalPos.x,
            y: e.clientY - modalPos.y,
        });
    };
    const onDrag = (e) => {
        if (!isDragging) return;
        setModalPos({
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y,
        });
    };
    const onDragEnd = () => setIsDragging(false);

    // Resize handlers
    const onResizeStart = (e) => {
        setIsResizing(true);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: modalSize.width,
            height: modalSize.height,
        });
        e.stopPropagation();
    };
    const onResize = (e) => {
        if (!isResizing) return;
        setModalSize({
            width: Math.max(400, resizeStart.width + (e.clientX - resizeStart.x)),
            height: Math.max(400, resizeStart.height + (e.clientY - resizeStart.y)),
        });
    };
    const onResizeEnd = () => setIsResizing(false);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", onDrag);
            window.addEventListener("mouseup", onDragEnd);
        } else {
            window.removeEventListener("mousemove", onDrag);
            window.removeEventListener("mouseup", onDragEnd);
        }
        return () => {
            window.removeEventListener("mousemove", onDrag);
            window.removeEventListener("mouseup", onDragEnd);
        };
    }, [isDragging, dragOffset, modalPos]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", onResize);
            window.addEventListener("mouseup", onResizeEnd);
        } else {
            window.removeEventListener("mousemove", onResize);
            window.removeEventListener("mouseup", onResizeEnd);
        }
        return () => {
            window.removeEventListener("mousemove", onResize);
            window.removeEventListener("mouseup", onResizeEnd);
        };
    }, [isResizing, resizeStart, modalSize]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectPreset = (avatarUrl) => {
        setFormData((prev) => ({
            ...prev,
            avatarUrl,
            avatarType: "preset",
        }));
    };

    const handleUploadAvatar = async (file) => {
        try {
            setIsUploading(true);
            setError("");
            const result = await profileService.uploadAvatar(file);
            setFormData((prev) => ({
                ...prev,
                avatarUrl: result.url,
                avatarType: "upload",
            }));
        } catch (err) {
            setError("Không thể tải ảnh lên. Vui lòng thử lại.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError("");
            await profileService.updateProfile(user.id, formData);
            onSave({ ...user, ...formData });
        } catch (err) {
            setError(err.message || "Có lỗi xảy ra khi cập nhật thông tin.");
        } finally {
            setIsLoading(false);
        }
    };

    const modalContent = (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 30 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                    ref={modalRef}
                    style={{
                        position: "absolute",
                        left: modalPos.x,
                        top: modalPos.y,
                        width: modalSize.width,
                        height: modalSize.height,
                        minWidth: 400,
                        minHeight: 400,
                        maxWidth: "100vw",
                        maxHeight: "100vh",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Header (drag handle) */}
                    <div
                        className="cursor-move bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between"
                        onMouseDown={onDragStart}
                        style={{ userSelect: "none" }}
                    >
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <User className="w-6 h-6" />
                            Thông tin cá nhân
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Body - Scrollable content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Error */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Avatar Selector */}
                            <AvatarSelector
                                selectedAvatar={formData.avatarUrl}
                                avatarType={formData.avatarType}
                                onSelectPreset={handleSelectPreset}
                                onUpload={handleUploadAvatar}
                                isUploading={isUploading}
                            />

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-base font-semibold text-gray-700 mb-2">
                                        <User className="w-5 h-5 inline mr-2" />
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="block text-base font-semibold text-gray-700 mb-2">
                                        <Phone className="w-5 h-5 inline mr-2" />
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="0123 456 789"
                                    />
                                </div>

                                {/* Date of Birth */}
                                <div>
                                    <label className="block text-base font-semibold text-gray-700 mb-2">
                                        <Calendar className="w-5 h-5 inline mr-2" />
                                        Ngày sinh
                                    </label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Hometown */}
                                <div>
                                    <label className="block text-base font-semibold text-gray-700 mb-2">
                                        <MapPin className="w-5 h-5 inline mr-2" />
                                        Quê quán
                                    </label>
                                    <input
                                        type="text"
                                        name="hometown"
                                        value={formData.hometown}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Thành phố, Tỉnh"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-4 text-base border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || isUploading}
                                    className="flex-1 px-6 py-4 text-base bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Lưu thay đổi
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Resize handle */}
                    <div
                        onMouseDown={onResizeStart}
                        className="absolute right-0 bottom-0 w-6 h-6 cursor-nwse-resize z-20 flex items-end justify-end"
                        style={{ userSelect: "none" }}
                    >
                        <div className="w-4 h-4 bg-gray-300 rounded-br-lg border-r-2 border-b-2 border-gray-400" />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default UserProfileModal;

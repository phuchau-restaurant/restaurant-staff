// frontend/src/screens/Dashboard/RestaurantSettingsContent.jsx
import React, { useState, useEffect, useRef } from "react";
import {
    Building2,
    Upload,
    Save,
    Loader2,
    CheckCircle,
    AlertCircle,
    Image,
    Mail,
    Phone,
    MapPin,
    X,
    Percent,
    DollarSign,
    Plus,
    Trash2,
} from "lucide-react";
import restaurantService from "../../services/restaurantService";

const RestaurantSettingsContent = () => {
    // Form state
    const [formData, setFormData] = useState({
        name: "",
        logoUrl: "",
        address: "",
        email: "",
        phone: "",
        // Payment settings
        taxRate: 10.0,
        serviceCharge: 0.0,
        discountRules: [],
        qrPayment: "",
    });

    // UI states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [hasChanges, setHasChanges] = useState(false);
    const [originalData, setOriginalData] = useState(null);

    const fileInputRef = useRef(null);
    const qrPaymentInputRef = useRef(null);
    const [uploadingQr, setUploadingQr] = useState(false);

    // Fetch restaurant info on mount
    useEffect(() => {
        fetchRestaurantInfo();
    }, []);

    // Track changes
    useEffect(() => {
        if (originalData) {
            const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
            setHasChanges(changed);
        }
    }, [formData, originalData]);

    const fetchRestaurantInfo = async () => {
        try {
            setLoading(true);
            const response = await restaurantService.getRestaurantInfo();
            if (response.success && response.data) {
                const data = {
                    name: response.data.name || "",
                    logoUrl: response.data.logoUrl || "",
                    address: response.data.address || "",
                    email: response.data.email || "",
                    phone: response.data.phone || "",
                    taxRate: response.data.taxRate ?? 10.0,
                    serviceCharge: response.data.serviceCharge ?? 0.0,
                    discountRules: response.data.discountRules || [],
                    qrPayment: response.data.qrPayment || "",
                };
                setFormData(data);
                setOriginalData(data);
            }
        } catch (error) {
            console.error("Error fetching restaurant info:", error);
            setMessage({
                type: "error",
                text: "Không thể tải thông tin nhà hàng",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "taxRate" || name === "serviceCharge"
                ? parseFloat(value) || 0
                : value,
        }));
        setMessage({ type: "", text: "" });
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setMessage({ type: "error", text: "Vui lòng chọn file hình ảnh" });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: "error", text: "File không được vượt quá 5MB" });
            return;
        }

        try {
            setUploading(true);
            const logoUrl = await restaurantService.uploadLogo(file);
            setFormData((prev) => ({ ...prev, logoUrl }));
            setMessage({ type: "success", text: "Logo đã được tải lên!" });
        } catch (error) {
            console.error("Error uploading logo:", error);
            setMessage({ type: "error", text: "Không thể tải lên logo" });
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveLogo = () => {
        setFormData((prev) => ({ ...prev, logoUrl: "" }));
    };

    // QR Payment upload handlers
    const handleQrPaymentUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setMessage({ type: "error", text: "Vui lòng chọn file hình ảnh" });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: "error", text: "File không được vượt quá 5MB" });
            return;
        }

        try {
            setUploadingQr(true);
            const qrPayment = await restaurantService.uploadQrPayment(file); // Use separate QR folder
            setFormData((prev) => ({ ...prev, qrPayment }));
            setMessage({ type: "success", text: "QR thanh toán đã được tải lên!" });
        } catch (error) {
            console.error("Error uploading QR payment:", error);
            setMessage({ type: "error", text: "Không thể tải lên QR thanh toán" });
        } finally {
            setUploadingQr(false);
        }
    };

    const handleRemoveQrPayment = () => {
        setFormData((prev) => ({ ...prev, qrPayment: "" }));
    };

    // Discount Rules handlers
    const handleAddDiscountRule = () => {
        setFormData((prev) => ({
            ...prev,
            discountRules: [
                ...prev.discountRules,
                { min_order: 0, discount_percent: 0 },
            ],
        }));
    };

    const handleUpdateDiscountRule = (index, field, value) => {
        setFormData((prev) => {
            const newRules = [...prev.discountRules];
            newRules[index] = {
                ...newRules[index],
                [field]: parseFloat(value) || 0,
            };
            return { ...prev, discountRules: newRules };
        });
    };

    const handleRemoveDiscountRule = (index) => {
        setFormData((prev) => ({
            ...prev,
            discountRules: prev.discountRules.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setMessage({ type: "error", text: "Tên nhà hàng là bắt buộc" });
            return;
        }

        try {
            setSaving(true);
            const response = await restaurantService.updateRestaurantInfo(formData);
            if (response.success) {
                setMessage({ type: "success", text: "Lưu thành công!" });
                setOriginalData(formData);
                setHasChanges(false);
            }
        } catch (error) {
            console.error("Error saving restaurant info:", error);
            const errorMsg = error.response?.data?.message || "Không thể lưu thông tin";
            setMessage({ type: "error", text: errorMsg });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-8 h-8 text-blue-500" />
                    <h1 className="text-2xl font-bold text-gray-800">
                        Thông tin nhà hàng
                    </h1>
                </div>
                <p className="text-gray-500">
                    Quản lý thông tin cơ bản và cài đặt thanh toán
                </p>
            </div>

            {/* Message */}
            {message.text && (
                <div
                    className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                >
                    {message.type === "success" ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Logo Section */}
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Logo</h2>
                        <div className="flex items-start gap-6">
                            <div className="relative">
                                {formData.logoUrl ? (
                                    <div className="relative group">
                                        <img
                                            src={formData.logoUrl}
                                            alt="Logo nhà hàng"
                                            className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveLogo}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                                        <Image className="w-10 h-10 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleLogoUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Đang tải...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            Tải lên logo
                                        </>
                                    )}
                                </button>
                                <p className="text-sm text-gray-500 mt-2">
                                    PNG, JPG hoặc GIF. Tối đa 5MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="p-6 space-y-6 border-b border-gray-100">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên nhà hàng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Nhập tên nhà hàng"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="contact@nhahang.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Phone className="w-4 h-4 inline mr-1" />
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="0901234567"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                Địa chỉ
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Payment Settings Section */}
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-500" />
                            Cài đặt thanh toán
                        </h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Percent className="w-4 h-4 inline mr-1" />
                                        Thuế VAT (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="taxRate"
                                        value={formData.taxRate}
                                        onChange={handleInputChange}
                                        onFocus={(e) => e.target.select()}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Ví dụ: 10 = 10% VAT</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Percent className="w-4 h-4 inline mr-1" />
                                        Phí dịch vụ (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="serviceCharge"
                                        value={formData.serviceCharge}
                                        onChange={handleInputChange}
                                        onFocus={(e) => e.target.select()}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Ví dụ: 5 = 5% phí dịch vụ</p>
                                </div>
                            </div>

                            {/* Discount Rules */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Quy tắc giảm giá theo hóa đơn
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddDiscountRule}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Thêm mức
                                    </button>
                                </div>

                                {formData.discountRules.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Chưa có quy tắc giảm giá nào.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {formData.discountRules.map((rule, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-500">Hóa đơn từ (VNĐ)</label>
                                                    <input
                                                        type="number"
                                                        value={rule.min_order}
                                                        onChange={(e) => handleUpdateDiscountRule(index, 'min_order', e.target.value)}
                                                        onFocus={(e) => e.target.select()}
                                                        min="0"
                                                        step="10000"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    />
                                                </div>
                                                <div className="w-28">
                                                    <label className="text-xs text-gray-500">Giảm (%)</label>
                                                    <input
                                                        type="number"
                                                        value={rule.discount_percent}
                                                        onChange={(e) => handleUpdateDiscountRule(index, 'discount_percent', e.target.value)}
                                                        onFocus={(e) => e.target.select()}
                                                        min="0"
                                                        max="100"
                                                        step="1"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDiscountRule(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-5"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    Giảm giá sẽ áp dụng theo mức hóa đơn cao nhất đạt được.
                                </p>
                            </div>
                        </div>

                        {/* QR Payment Section */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">QR Thanh toán (Ví điện tử)</h3>
                            <div className="flex items-start gap-6">
                                <div className="relative">
                                    {formData.qrPayment ? (
                                        <div className="relative group">
                                            <img
                                                src={formData.qrPayment}
                                                alt="QR thanh toán"
                                                className="w-40 h-40 object-cover rounded-xl border-2 border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveQrPayment}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                                            <Image className="w-10 h-10 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        ref={qrPaymentInputRef}
                                        onChange={handleQrPaymentUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => qrPaymentInputRef.current?.click()}
                                        disabled={uploadingQr}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                                    >
                                        {uploadingQr ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Đang tải...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                Tải lên mã QR
                                            </>
                                        )}
                                    </button>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Ảnh QR sẽ hiển thị khi thanh toán qua Ví điện tử.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-4">
                        {hasChanges && (
                            <span className="text-sm text-amber-600">
                                Có thay đổi chưa được lưu
                            </span>
                        )}
                        <button
                            type="submit"
                            disabled={saving || !hasChanges}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Lưu thay đổi
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RestaurantSettingsContent;

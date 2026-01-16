// frontend/src/components/Waiter/InvoiceModal.jsx
import React, { useState, useRef } from "react";
import {
    X,
    Printer,
    FileText,
    CreditCard,
    Wallet,
    Banknote,
    CheckCircle,
    Loader2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useRestaurant } from "../../context/RestaurantContext";

const PAYMENT_METHODS = [
    { id: "Cash", label: "Tiền mặt", icon: Banknote },
    { id: "Card", label: "Thẻ", icon: CreditCard },
    { id: "E-Wallet", label: "Ví điện tử", icon: Wallet },
];

const InvoiceModal = ({
    isOpen,
    onClose,
    order,
    onConfirmPayment,
    isConfirming = false,
}) => {
    const [selectedMethod, setSelectedMethod] = useState("Cash");
    const printRef = useRef(null);
    const { restaurantInfo } = useRestaurant();

    if (!isOpen || !order) return null;

    // Calculate payment from order and restaurantInfo
    const calculatePayment = () => {
        // Calculate subtotal including modifiers
        const subtotal = (order.items || []).reduce((sum, item) => {
            if (item.status === "Cancelled") return sum;
            const basePrice = parseFloat(item.unitPrice || item.unit_price) || 0;
            const quantity = parseInt(item.quantity) || 1;
            const modifierTotal = (item.modifiers || []).reduce((modSum, mod) => {
                return modSum + (parseFloat(mod.price) || 0);
            }, 0);
            return sum + (basePrice + modifierTotal) * quantity;
        }, 0);

        // Get rates from restaurant info (with defaults)
        const taxRate = restaurantInfo?.taxRate || 5;
        const serviceChargeRate = restaurantInfo?.serviceCharge || 0;
        const discountRules = restaurantInfo?.discountRules || [];

        // Find applicable discount
        const applicableRule = discountRules
            .filter(rule => subtotal >= (rule.min_order || 0))
            .sort((a, b) => b.min_order - a.min_order)[0];

        const discountPercent = applicableRule?.discount_percent || 0;

        // Calculate amounts (Discount BEFORE tax)
        const discountAmount = subtotal * (discountPercent / 100);
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = afterDiscount * (taxRate / 100);
        const serviceChargeAmount = afterDiscount * (serviceChargeRate / 100);
        const amount = afterDiscount + taxAmount + serviceChargeAmount;

        return {
            id: order.id,
            subtotal: Math.round(subtotal),
            taxRate,
            taxAmount: Math.round(taxAmount),
            serviceChargeRate,
            serviceChargeAmount: Math.round(serviceChargeAmount),
            discountPercent,
            discountAmount: Math.round(discountAmount),
            amount: Math.round(amount),
            isPaid: order.status === "Paid",
        };
    };

    const payment = calculatePayment();

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleString("vi-VN");
    };

    // Handle print
    const handlePrint = () => {
        const printWindow = window.open("", "_blank");

        // Build receipt HTML manually for better control
        const items = order?.items || [];
        let itemsHtml = items.map(item => {
            const modifierTotal = (item.modifiers || []).reduce((sum, mod) => sum + (parseFloat(mod.price) || 0), 0);
            const itemTotal = (parseFloat(item.unit_price || item.unitPrice) + modifierTotal) * item.quantity;
            // Use item.name from mapped order, fallback to other fields if necessary
            const dishName = item.name || item.dishes?.name || item.dishName || 'Món ăn';

            let modifiersHtml = '';
            if (item.modifiers && item.modifiers.length > 0) {
                modifiersHtml = item.modifiers.map(mod =>
                    `<div class="modifier">+ ${mod.optionName}${mod.price > 0 ? ` (+${formatCurrency(mod.price)})` : ''}</div>`
                ).join('');
            }

            return `
                <div class="item">
                    <span>${dishName} x${item.quantity}</span>
                    <span>${formatCurrency(itemTotal)}</span>
                </div>
                ${modifiersHtml}
            `;
        }).join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Hóa đơn - ${order?.id}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap');
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: 'Roboto Mono', 'Consolas', monospace; 
                            padding: 10px; 
                            max-width: 280px; 
                            margin: 0 auto;
                            font-size: 12px;
                            line-height: 1.4;
                        }
                        .header { text-align: center; margin-bottom: 15px; }
                        .header h1 { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
                        .header p { font-size: 11px; color: #333; }
                        .divider { border-top: 1px dashed #000; margin: 8px 0; }
                        .info { font-size: 11px; margin-bottom: 5px; }
                        .info span { font-weight: bold; }
                        .item { display: flex; justify-content: space-between; margin: 4px 0; font-size: 12px; }
                        .modifier { font-size: 10px; color: #555; margin-left: 10px; }
                        .totals { margin-top: 8px; }
                        .totals .row { display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px; }
                        .totals .discount { color: green; }
                        .totals .total { font-weight: bold; font-size: 14px; margin-top: 5px; }
                        .footer { text-align: center; margin-top: 15px; font-size: 11px; }
                        @media print {
                            body { width: 80mm; max-width: 80mm; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${restaurantInfo?.name || 'NHÀ HÀNG'}</h1>
                        ${restaurantInfo?.address ? `<p>${restaurantInfo.address}</p>` : ''}
                        ${restaurantInfo?.phone ? `<p>SĐT: ${restaurantInfo.phone}</p>` : ''}
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="info">Hóa đơn: <span>#${order?.orderNumber || order?.id || 'N/A'}</span></div>
                    <div class="info">Bàn: <span>${order?.tableNumber || order?.table?.table_number || 'N/A'}</span></div>
                    <div class="info">Ngày: <span>${formatDate(new Date())}</span></div>
                    
                    <div class="divider"></div>
                    
                    ${itemsHtml}
                    
                    <div class="divider"></div>
                    
                    <div class="totals">
                        <div class="row">
                            <span>Tạm tính:</span>
                            <span>${formatCurrency(payment.subtotal)}</span>
                        </div>
                        ${payment.discountAmount > 0 ? `
                            <div class="row discount">
                                <span>Giảm giá (${payment.discountPercent}%):</span>
                                <span>-${formatCurrency(payment.discountAmount)}</span>
                            </div>
                        ` : ''}
                        <div class="row">
                            <span>VAT (${payment.taxRate}%):</span>
                            <span>${formatCurrency(payment.taxAmount)}</span>
                        </div>
                        ${payment.serviceChargeAmount > 0 ? `
                            <div class="row">
                                <span>Phí DV (${payment.serviceChargeRate}%):</span>
                                <span>${formatCurrency(payment.serviceChargeAmount)}</span>
                            </div>
                        ` : ''}
                        <div class="divider"></div>
                        <div class="row total">
                            <span>TỔNG CỘNG:</span>
                            <span>${formatCurrency(payment.amount)}</span>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>Cảm ơn quý khách!</p>
                        <p>Hẹn gặp lại</p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();

        // Wait for font to load then print
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const handleDownloadPDF = async () => {
        try {
            const pdfContainer = document.createElement('div');
            pdfContainer.style.cssText = `
                position: absolute;
                left: -9999px;
                top: 0;
                width: 300px;
                padding: 20px;
                background: #ffffff;
                font-family: Arial, sans-serif;
                color: #000000;
            `;

            // Tạo nội dung HTML cho hóa đơn
            const items = order?.items || [];
            const itemsHtml = items
                .filter(item => item.status !== "Cancelled")
                .map(item => {
                    const unitPrice = parseFloat(item.unitPrice || item.unit_price) || 0;
                    const modifierTotal = (item.modifiers || []).reduce((sum, mod) => sum + (parseFloat(mod.price) || 0), 0);
                    const itemTotal = (unitPrice + modifierTotal) * item.quantity;
                    const dishName = item.name || item.dishes?.name || item.dishName || 'Món ăn';

                    let modifiersHtml = '';
                    if (item.modifiers && item.modifiers.length > 0) {
                        modifiersHtml = item.modifiers.map(mod =>
                            `<div style="font-size: 11px; color: #666666; margin-left: 10px;">+ ${mod.optionName}${mod.price > 0 ? ` (+${formatCurrency(mod.price)})` : ''}</div>`
                        ).join('');
                    }

                    return `
                        <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 12px;">
                            <span>${dishName} x${item.quantity}</span>
                            <span>${formatCurrency(itemTotal)}</span>
                        </div>
                        ${modifiersHtml}
                    `;
                }).join('');

            pdfContainer.innerHTML = `
                <div style="text-align: center; margin-bottom: 15px;">
                    <h1 style="font-size: 16px; font-weight: bold; margin: 0 0 5px 0; color: #000000;">${restaurantInfo?.name || 'NHÀ HÀNG'}</h1>
                    ${restaurantInfo?.address ? `<p style="font-size: 11px; color: #333333; margin: 2px 0;">${restaurantInfo.address}</p>` : ''}
                    ${restaurantInfo?.phone ? `<p style="font-size: 11px; color: #333333; margin: 2px 0;">SĐT: ${restaurantInfo.phone}</p>` : ''}
                </div>
                
                <div style="border-top: 1px dashed #000000; margin: 8px 0;"></div>
                
                <div style="font-size: 11px; margin-bottom: 5px;">Hóa đơn: <span style="font-weight: bold;">#${order?.orderNumber || order?.id || 'N/A'}</span></div>
                <div style="font-size: 11px; margin-bottom: 5px;">Bàn: <span style="font-weight: bold;">${order?.tableNumber || order?.table?.table_number || 'N/A'}</span></div>
                <div style="font-size: 11px; margin-bottom: 5px;">Ngày: <span style="font-weight: bold;">${formatDate(new Date())}</span></div>
                
                <div style="border-top: 1px dashed #000000; margin: 8px 0;"></div>
                
                ${itemsHtml}
                
                <div style="border-top: 1px dashed #000000; margin: 8px 0;"></div>
                
                <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px;">
                    <span>Tạm tính:</span>
                    <span>${formatCurrency(payment.subtotal)}</span>
                </div>
                ${payment.discountAmount > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px; color: #22c55e;">
                        <span>Giảm giá (${payment.discountPercent}%):</span>
                        <span>-${formatCurrency(payment.discountAmount)}</span>
                    </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px;">
                    <span>VAT (${payment.taxRate}%):</span>
                    <span>${formatCurrency(payment.taxAmount)}</span>
                </div>
                ${payment.serviceChargeAmount > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px;">
                        <span>Phí DV (${payment.serviceChargeRate}%):</span>
                        <span>${formatCurrency(payment.serviceChargeAmount)}</span>
                    </div>
                ` : ''}
                
                <div style="border-top: 1px solid #000000; margin: 8px 0;"></div>
                
                <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold;">
                    <span>TỔNG CỘNG:</span>
                    <span style="color: #2563eb;">${formatCurrency(payment.amount)}</span>
                </div>
                
                <div style="text-align: center; margin-top: 15px; font-size: 11px;">
                    <p style="margin: 2px 0;">Cảm ơn quý khách!</p>
                    <p style="margin: 2px 0;">Hẹn gặp lại</p>
                </div>
            `;

            document.body.appendChild(pdfContainer);

            // Capture thành canvas
            const canvas = await html2canvas(pdfContainer, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            // Xóa container tạm
            document.body.removeChild(pdfContainer);

            const imgData = canvas.toDataURL('image/png');

            // Tính toán kích thước PDF
            const imgWidth = 80; // mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [imgWidth, imgHeight + 10],
            });

            doc.addImage(imgData, 'PNG', 0, 5, imgWidth, imgHeight);
            doc.save(`hoa-don-${order.id}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Không thể tạo PDF. Vui lòng thử lại.');
        }
    };

    // Handle confirm payment
    const handleConfirm = () => {
        onConfirmPayment(order.id, selectedMethod);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-blue-500" />
                        Hóa đơn thanh toán
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]" ref={printRef}>
                    {/* Restaurant Info */}
                    <div className="text-center mb-4">
                        <h3 className="font-bold text-lg">{restaurantInfo.name}</h3>
                        {restaurantInfo.address && (
                            <p className="text-sm text-gray-500">{restaurantInfo.address}</p>
                        )}
                        {restaurantInfo.phone && (
                            <p className="text-sm text-gray-500">SĐT: {restaurantInfo.phone}</p>
                        )}
                    </div>

                    <div className="border-t border-dashed border-gray-300 my-3" />

                    {/* Order Info */}
                    <div className="text-sm text-gray-600 mb-3">
                        <p>Hóa đơn: <span className="font-medium">#{order?.orderNumber || order?.id}</span></p>
                        <p>Bàn: <span className="font-medium">{order?.tableNumber || order?.table?.table_number || "N/A"}</span></p>
                        <p>Ngày: <span className="font-medium">{formatDate(new Date())}</span></p>
                    </div>

                    <div className="border-t border-dashed border-gray-300 my-3" />

                    {/* Items */}
                    <div className="space-y-3">
                        {order?.items?.map((item, index) => {
                            const modifierTotal = (item.modifiers || []).reduce((sum, mod) => sum + (parseFloat(mod.price) || 0), 0);
                            const unitPrice = parseFloat(item.unit_price || item.unitPrice) || 0;
                            const itemTotal = (unitPrice + modifierTotal) * item.quantity;
                            const dishName = item.name || item.dishes?.name || item.dishName || 'Món ăn';

                            return (
                                <div key={index} className="text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-medium">
                                            {dishName} x{item.quantity}
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(itemTotal)}
                                        </span>
                                    </div>
                                    {/* Modifiers */}
                                    {item.modifiers && item.modifiers.length > 0 && (
                                        <div className="ml-4 text-sm text-gray-500">
                                            {item.modifiers.map((mod, modIdx) => (
                                                <div key={modIdx} className="flex justify-between">
                                                    <span>+ {mod.optionName}</span>
                                                    {mod.price > 0 && (
                                                        <span className="text-gray-600">+{formatCurrency(mod.price)}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="border-t border-dashed border-gray-300 my-3" />

                    {/* Totals */}
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Tạm tính:</span>
                            <span>{formatCurrency(payment.subtotal)}</span>
                        </div>
                        {payment.discountAmount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Giảm giá ({payment.discountPercent}%):</span>
                                <span>-{formatCurrency(payment.discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>VAT ({payment.taxRate}%):</span>
                            <span>{formatCurrency(payment.taxAmount)}</span>
                        </div>
                        {payment.serviceChargeAmount > 0 && (
                            <div className="flex justify-between">
                                <span>Phí dịch vụ ({payment.serviceChargeRate}%):</span>
                                <span>{formatCurrency(payment.serviceChargeAmount)}</span>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-300 my-3" />

                    <div className="flex justify-between text-lg font-bold">
                        <span>TỔNG CỘNG:</span>
                        <span className="text-blue-600">{formatCurrency(payment.amount)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t bg-gray-50 space-y-4">
                    {/* Print & PDF buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            In hóa đơn
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <FileText className="w-4 h-4" />
                            Tải PDF
                        </button>
                    </div>

                    {/* Payment method selection */}
                    {!payment.isPaid && (
                        <>
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Phương thức thanh toán:</p>
                                <div className="flex gap-2">
                                    {PAYMENT_METHODS.map((method) => {
                                        const Icon = method.icon;
                                        return (
                                            <button
                                                key={method.id}
                                                onClick={() => setSelectedMethod(method.id)}
                                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors ${selectedMethod === method.id
                                                    ? "border-blue-500 bg-blue-50 text-blue-600"
                                                    : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="text-sm">{method.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* QR Payment Image - Show when E-Wallet selected */}
                            {selectedMethod === "E-Wallet" && (
                                restaurantInfo?.qrPayment ? (
                                    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-sm text-gray-600 mb-3 font-medium">Quét mã QR để thanh toán:</p>
                                        <img
                                            src={restaurantInfo.qrPayment}
                                            alt="QR thanh toán"
                                            className="w-48 h-48 object-contain rounded-lg border-2 border-gray-300"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Vui lòng quét mã và xác nhận sau khi chuyển khoản</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                                        <p className="text-sm text-amber-700 font-medium">⚠️ Chưa cài đặt mã QR thanh toán</p>
                                        <p className="text-xs text-amber-600 mt-1">Vui lòng thêm mã QR trong phần Cài đặt nhà hàng</p>
                                    </div>
                                )
                            )}

                            {/* Confirm button */}
                            <button
                                onClick={handleConfirm}
                                disabled={isConfirming}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-600 rounded-lg transition-colors disabled:opacity-50 font-bold"
                            >
                                {isConfirming ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        Xác nhận đã thanh toán
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;

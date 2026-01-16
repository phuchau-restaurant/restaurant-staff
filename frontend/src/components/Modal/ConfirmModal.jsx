import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "danger", // danger, warning, info
  items = [], // Optional: list of items to display
}) => {
  const getColors = () => {
    switch (type) {
      case "danger":
        return {
          icon: "text-red-500",
          confirmButton: "bg-red-500 hover:bg-red-600",
          headerBg: "bg-red-50",
          headerBorder: "border-red-200",
          headerText: "text-red-800",
        };
      case "warning":
        return {
          icon: "text-yellow-500",
          confirmButton: "bg-yellow-500 hover:bg-yellow-600",
          headerBg: "bg-amber-50",
          headerBorder: "border-amber-200",
          headerText: "text-amber-800",
        };
      default:
        return {
          icon: "text-blue-500",
          confirmButton: "bg-blue-500 hover:bg-blue-600",
          headerBg: "bg-blue-50",
          headerBorder: "border-blue-200",
          headerText: "text-blue-800",
        };
    }
  };

  const colors = getColors();

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-6 relative flex flex-col items-center ${colors.headerBg} border-b ${colors.headerBorder}`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:scale-110 transition-transform"
              >
                <X className="w-6 h-6" />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              >
                <AlertTriangle className={`w-16 h-16 ${colors.icon}`} />
              </motion.div>

              {title && (
                <h3 className={`mt-4 text-2xl font-bold ${colors.headerText} text-center`}>
                  {title}
                </h3>
              )}
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Display items list if provided */}
              {items && items.length > 0 && (
                <>
                  <p className="text-gray-700 mb-4">
                    Đơn hàng có <span className="font-bold text-red-600">{items.length} món</span> cần xử lý:
                  </p>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4 max-h-40 overflow-y-auto">
                    {items.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="font-medium text-gray-800">{item.name || item.dishName}</span>
                        <span className="text-orange-600 font-bold">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-700 text-lg leading-relaxed whitespace-pre-line"
              >
                {message}
              </motion.p>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-lg transition-all"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 ${colors.confirmButton} text-white py-3 rounded-xl font-semibold text-lg shadow-lg transition-all`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;


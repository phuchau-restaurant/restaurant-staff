import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, RotateCcw, Info } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "danger", // danger, warning, info, success
}) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <RotateCcw className="w-16 h-16 text-green-500" />;
      case "danger":
        return <AlertTriangle className="w-16 h-16 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
      default:
        return <Info className="w-16 h-16 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          icon: "text-green-500",
          confirmButton: "bg-green-500 hover:bg-green-600",
        };
      case "danger":
        return {
          icon: "text-red-500",
          confirmButton: "bg-red-500 hover:bg-red-600",
        };
      case "warning":
        return {
          icon: "text-yellow-500",
          confirmButton: "bg-yellow-500 hover:bg-yellow-600",
        };
      default:
        return {
          icon: "text-blue-500",
          confirmButton: "bg-blue-500 hover:bg-blue-600",
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50"
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
            <div className="p-6 relative flex flex-col items-center bg-white">
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
                {getIcon()}
              </motion.div>

              {title && (
                <h3 className="mt-4 text-2xl font-bold text-gray-800 text-center">
                  {title}
                </h3>
              )}
            </div>

            {/* Body */}
            <div className="p-6 text-center">
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

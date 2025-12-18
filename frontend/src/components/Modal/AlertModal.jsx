import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

const AlertModal = ({ isOpen, onClose, title, message, type = "info" }) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case "error":
        return <XCircle className="w-16 h-16 text-red-500" />;
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
          button: "bg-green-500 hover:bg-green-600",
          xButton: "text-green-500 hover:text-green-700",
        };
      case "error":
        return {
          button: "bg-red-500 hover:bg-red-600",
          xButton: "text-red-500 hover:text-red-700",
        };
      case "warning":
        return {
          button: "bg-yellow-500 hover:bg-yellow-600",
          xButton: "text-yellow-500 hover:text-yellow-700",
        };
      default:
        return {
          button: "bg-blue-500 hover:bg-blue-600",
          xButton: "text-blue-500 hover:text-blue-700",
        };
    }
  };

  const colors = getColors();

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
                className={`absolute top-4 right-4 ${colors.xButton} hover:scale-110 transition-transform`}
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

              {title && <h3 className="mt-4 text-2xl font-bold text-gray-800 text-center">{title}</h3>}
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
            <div className="p-6 pt-0">
                <button
                    onClick={onClose}
                    className={`w-full ${colors.button} text-white py-3 rounded-xl font-semibold text-lg shadow-lg transition-all`}
                >
                    OK
                </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertModal;
